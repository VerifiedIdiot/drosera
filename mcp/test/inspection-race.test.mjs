import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DockerBackend, CommandFailure } from '../dist/docker.js';
import { Controller } from '../dist/controller.js';
import { Store } from '../dist/store.js';
import { Approval, BUDGET, digest } from '../dist/policy.js';
import { INITIAL } from '../dist/evidence.js';
import { configuration, host, inspection, probe, socketFixture } from './runtime-helpers.mjs';

const gate=()=>Promise.withResolvers();
const id='ed775a7d-1eb9-46b6-81c1-cecb9503eff9';
async function scripted(t,replies) {
  const {root,endpoint}=await socketFixture(t),config=configuration({endpoint}),calls=[];
  class ScriptedDocker extends DockerBackend {
    async command(args,limit=BUDGET.commandMs) {
      calls.push({args,limit});assert.ok(replies.length,'No unbounded retry or unexpected command');
      const reply=replies.shift();if(reply instanceof Error)throw reply;return reply;
    }
  }
  return {backend:new ScriptedDocker(config,root),config,calls};
}

test('A10: inspection confirms absence when output-error cleanup removes a listed container', {timeout:3000}, async t => {
  const {root,endpoint}=await socketFixture(t),config=configuration({endpoint}),store=new Store(root);
  store.write('policy.json',config);
  const cleanupStarted=gate(),pollListed=gate(),removed=gate();
  let overflow=false,cleanupWaiting=false,pollWaiting=false;
  const calls=[];
  class RacingDocker extends DockerBackend {
    current=null;
    async preflight() {return host();}
    async owned() {return this.current?[this.current.Name.slice(1)]:[];}
    async provision(id,checkpoint) {
      this.current=inspection(config,id);checkpoint();
      const state={request:{method:'GET',path:'/state',headers:{}},response:{status:200,body:INITIAL}};
      return {host:host(),inspection:this.current,probe:probe(),hostControls:null,states:{vulnerable:state,fixed:state}};
    }
    async observe(_id,action) {
      if(action==='probe')return probe();
      assert.equal(action,'authorization');overflow=true;
      throw new CommandFailure('output-truncated',null);
    }
    async command(args) {
      calls.push(args);
      if(args[0]==='container' && args[1]==='ls') {
        assert.deepEqual(args,['container','ls','-a','--filter',`name=^/${this.name(credentials.experimentId)}$`,'--format','{{.ID}}']);
        const snapshot=this.current?.Id ?? '';
        if(overflow && !cleanupWaiting) {
          cleanupWaiting=true;cleanupStarted.resolve();await pollListed.promise;
        } else if(overflow && !pollWaiting) {
          pollWaiting=true;pollListed.resolve();await removed.promise;
        }
        return snapshot;
      }
      if(args[0]==='container' && args[1]==='inspect') {
        if(!this.current)throw new CommandFailure('docker-command-failed',1,`Error response from daemon: No such container: ${args[2]}\n`);
        return JSON.stringify([this.current]);
      }
      if(args[0]==='container' && args[1]==='rm') {
        assert.deepEqual(args,['container','rm','--force',this.current.Id]);
        this.current=null;removed.resolve();return '';
      }
      throw new Error('unexpected-command');
    }
  }
  const backend=new RacingDocker(config,root),controller=await Controller.open(root,backend);
  const grantId=randomUUID(),token='c'.repeat(64);
  store.write(`grant-${grantId}.json`,Approval.parse({version:2,runtime:config.runtime,runtimeConfigHash:config.runtimeConfigHash,platform:config.platform,id:grantId,reportId:'report-1',itemId:'auth-1',target:'synthetic-http-v1',scenario:'authorization',fixtureRevision:config.fixtureRevision,imageId:config.imageId,budget:BUDGET,expiresAt:new Date(Date.now()+60_000).toISOString(),claimHash:digest(token)}));
  const created=controller.create({approvalId:grantId,claimToken:token});
  const credentials={experimentId:created.experimentId,accessToken:created.accessToken};
  try {
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(controller.status(credentials).status,'ready');
    controller.run({...credentials,scenario:'authorization'});
    await cleanupStarted.promise;
    assert.equal(controller.status(credentials).status,'error');
    const report=controller.evidence(credentials);
    assert.equal(report.reason,'output-truncated');
    assert.equal(report.attempts[0].state,'unverified');
    assert.equal(report.attempts[0].verdict.fixVerified,false);
    assert.equal(report.attempts[0].exitStatus,null);
    assert.equal(await backend.inspect(credentials.experimentId),null);
    assert.equal(calls.filter(args=>args[1]==='rm').length,1);
  } finally {pollListed.resolve();removed.resolve();await controller.close();}
});

test('inspection only accepts one successful exact-name absence confirmation', async t => {
  const replies=[],{backend,calls}=await scripted(t,replies),name=backend.name(id);
  const missing=new CommandFailure('docker-command-failed',1,`Error response from daemon: No such container: ${name}\n`);
  replies.push('f'.repeat(12),missing,'');
  assert.equal(await backend.inspect(id),null);
  const list=['container','ls','-a','--filter',`name=^/${name}$`,'--format','{{.ID}}'];
  assert.deepEqual(calls.map(call=>call.args),[list,['container','inspect',name],list]);
  assert.ok(calls.every(call=>call.limit===BUDGET.commandMs));
  assert.equal(replies.length,0);
});

test('inspection preserves daemon, permission, transport and wrong-target errors without retry', async t => {
  const replies=[],{backend,calls}=await scripted(t,replies),name=backend.name(id);
  const diagnostic=`Error response from daemon: No such container: ${name}`;
  for(const error of [
    new CommandFailure('docker-command-failed',1,'Cannot connect to the Docker daemon'),
    new CommandFailure('docker-command-failed',1,'permission denied'),
    new CommandFailure('docker-command-failed',1,diagnostic+'-other'),
    new CommandFailure('docker-command-failed',1,diagnostic+'\npermission denied'),
    new CommandFailure('docker-command-failed',2,diagnostic),
    new CommandFailure('command-timeout',null,diagnostic),
    new CommandFailure('output-truncated',null,diagnostic),
    new Error(diagnostic),
  ]) {
    calls.length=0;replies.push('listed',error);
    await assert.rejects(backend.inspect(id),actual=>actual===error);
    assert.equal(calls.length,2);assert.equal(replies.length,0);
  }
  const failure=new CommandFailure('docker-unavailable',null);
  calls.length=0;replies.push(failure);
  await assert.rejects(backend.inspect(id),actual=>actual===failure);
  assert.equal(calls.length,1);
});

test('inspection preserves errors when absence confirmation fails or a resource still exists', async t => {
  const replies=[],{backend,calls}=await scripted(t,replies),name=backend.name(id);
  const missing=new CommandFailure('docker-command-failed',1,`Error response from daemon: No such container: ${name}`);
  for(const confirmation of ['f'.repeat(12),'malformed-response','[]',new CommandFailure('docker-command-failed',1,'permission denied'),new CommandFailure('command-timeout',null)]) {
    calls.length=0;replies.push('listed',missing,confirmation);
    await assert.rejects(backend.inspect(id),actual=>actual===(confirmation instanceof Error?confirmation:missing));
    assert.equal(calls.length,3);assert.equal(replies.length,0);
  }
});

test('inspection preserves malformed-response rejection and valid inspection results', async t => {
  const replies=[],{backend,config,calls}=await scripted(t,replies);
  for(const invalid of ['not-json','[]','[{}]','null','{}']) {
    calls.length=0;replies.push('listed',invalid);
    await assert.rejects(backend.inspect(id));assert.equal(calls.length,2);
  }
  const actual=inspection(config,id);replies.push('listed',JSON.stringify([actual]));
  assert.deepEqual(await backend.inspect(id),actual);
  calls.length=0;replies.push('');assert.equal(await backend.inspect(id),null);assert.equal(calls.length,1);
});

test('inspection scope and removal ownership checks remain fail-closed', async t => {
  const replies=[],{backend,config,calls}=await scripted(t,replies);
  await assert.rejects(backend.inspect('../foreign'));assert.equal(calls.length,0);
  for(const field of ['owner','experiment','name']) {
    const actual=inspection(config,id);
    if(field==='name')actual.Name='/foreign';
    else actual.Config.Labels[field==='owner'?'io.podori.controller':'io.podori.experiment']='foreign';
    calls.length=0;replies.push('listed',JSON.stringify([actual]));
    await assert.rejects(backend.remove(id),/cleanup-ownership-mismatch/);
    assert.equal(calls.length,2);assert.equal(calls.some(call=>call.args[1]==='rm'),false);
  }
});
