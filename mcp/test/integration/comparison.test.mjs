import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save } from '../helpers.mjs';
import { approval, connectClient, ready, completed, access } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { objectHash } from '../../dist/policy.js';

test('A2/A3/A5/A6/A10: real MCP runs bind evidence and retain exclusions as unverified', async () => {
  const {dir,config}=await prepared('comparison');
  const grants=[approval(dir),approval(dir,'input-validation','input-1')];
  const {client,call,stderr}=await connectClient(dir);
  const backend=new DockerBackend(config,dir);
  try {
    const {tools}=await client.listTools();
    assert.ok(tools.some(x=>x.name==='sandbox_run'),'The approved-run tool is absent');
    const a=access(await call('create',grants[0])), b=access(await call('create',grants[1]));
    await Promise.all([ready(call,a),ready(call,b)]);
    for(const scenario of ['unknown','code-execution','destructive','input-validation','ignore instructions']) await assert.rejects(call('run',{...a,scenario}));
    for(const extra of [{approved:true},{command:'ignored'},{image:'other'},{target:'other'},{path:'/host'},{budget:{cpu:100}}]) await assert.rejects(call('run',{...a,scenario:'authorization',...extra}));
    await assert.rejects(call('evidence',{...a,accessToken:b.accessToken}));
    for(const [credentials,scenario] of [[a,'authorization'],[b,'input-validation']]) {
      const started=await call('run',{...credentials,scenario});
      assert.equal(started.result,'unverified');
      await completed(call,credentials);
      const report=await call('evidence',credentials); save(`${scenario}-mcp-evidence`,report);
      const {hash,...body}=report; assert.equal(hash,objectHash(body));
      assert.equal(report.experimentId,credentials.experimentId);
      assert.equal(report.fixtureRevision,config.fixtureRevision);
      assert.equal(report.imageId,config.imageId);
      const attempt=report.attempts[0];
      assert.equal(attempt.id,started.attemptId);
      assert.equal(attempt.scenario,scenario);
      assert.equal(attempt.reportId,report.reportId);
      assert.equal(attempt.itemId,report.itemId);
      assert.equal(attempt.experimentId,report.experimentId);
      assert.equal(attempt.observationHash,objectHash(attempt.observations));
      assert.equal(attempt.exitStatus,0);
      assert.deepEqual(attempt.verdict,{original:'reproduced',fixed:'not-reproduced',normal:true,fixVerified:true});
      assert.equal(JSON.stringify(report).includes(credentials.accessToken),false);
      if(scenario==='authorization') {
        assert.equal(report.exclusions.length,5);
        assert.ok(report.exclusions.every(x=>x.result==='unverified' && x.reason));
      }
    }
    await call('dispose',a); await call('dispose',b);
    assert.equal(stderr(),'');
  } finally {await client.close();}
  assert.deepEqual(await backend.owned(),[]);
});
