import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save } from '../helpers.mjs';
import { approval, connectClient, ready, completed, access } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { INITIAL } from '../../dist/evidence.js';
import { objectHash } from '../../dist/policy.js';

test('A9: reset restores actual initial HTTP data and preserves comparison evidence', async () => {
  const {dir,config}=await prepared('reset');
  const grant=approval(dir,'input-validation','input-reset');
  const {client,call}=await connectClient(dir);
  const backend=new DockerBackend(config,dir);
  try {
    const {tools}=await client.listTools();assert.ok(tools.some(x=>x.name==='sandbox_reset'),'The data-reset tool is absent');
    const credentials=access(await call('create',grant));await ready(call,credentials);
    await call('run',{...credentials,scenario:'input-validation'});await completed(call,credentials);
    const changed=await backend.observe(credentials.experimentId,'state');save('state-before-reset',changed);
    assert.equal(changed.vulnerable.response.body.quantity,-1);
    assert.equal(changed.fixed.response.body.quantity,2);
    const result=await call('reset',credentials);assert.equal(result.restored,true);
    const actual=await backend.observe(credentials.experimentId,'state');save('state-after-reset',actual);
    for(const version of ['vulnerable','fixed'])assert.deepEqual(actual[version].response.body,INITIAL);
    const report=await call('evidence',credentials);save('reset-evidence',report);
    assert.equal(report.attempts.length,1);assert.equal(report.resets.length,1);
    assert.equal(report.resets[0].initialHash,objectHash(INITIAL));
    assert.equal(report.resets[0].observations.vulnerable.before.response.body.quantity,-1);
    assert.deepEqual(report.resets[0].observations.fixed.after.response.body,INITIAL);
    await call('dispose',credentials);
  } finally {await client.close();}
  assert.deepEqual(await backend.owned(),[]);
});
