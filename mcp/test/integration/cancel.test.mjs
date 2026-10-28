import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save, pause, waitUntil } from '../helpers.mjs';
import { approval, connectClient, ready, access } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { Controller } from '../../dist/controller.js';

test('A9: MCP cancellation reclaims only its experiment', async () => {
  const {dir,config}=await prepared('cancel-mcp');
  const grants=[approval(dir),approval(dir)];
  const {client,call}=await connectClient(dir), backend=new DockerBackend(config,dir);
  try {
    const {tools}=await client.listTools();assert.ok(tools.some(x=>x.name==='sandbox_cancel'),'The cancellation tool is absent');
    const a=access(await call('create',grants[0])), b=access(await call('create',grants[1]));
    await Promise.all([ready(call,a),ready(call,b)]);
    await call('run',{...a,scenario:'authorization'});
    await call('cancel',a);
    const report=await call('evidence',a);save('cancelled-evidence',report);
    assert.equal(report.status,'cancelled');assert.equal(report.attempts[0].state,'unverified');
    assert.equal(report.attempts[0].verdict.fixVerified,false);
    assert.equal(await backend.inspect(a.experimentId),null);
    assert.equal((await backend.inspect(b.experimentId)).State.Running,true);
    await pause(500);assert.equal((await call('status',a)).status,'cancelled');
    await call('dispose',b);await call('dispose',a);
  } finally {await client.close();}
  assert.deepEqual(await backend.owned(),[]);
});

test('A9: late real create and HTTP completion cannot resurrect a cancelled experiment', async () => {
  assert.equal(typeof Controller.prototype.cancel,'function','The controller cancellation boundary is absent');
  const {dir,config}=await prepared('late');
  const grants=[approval(dir),approval(dir)];
  class DelayedBackend extends DockerBackend {
    created=false;observed=false;
    async command(args,...rest) {
      const result=await super.command(args,...rest);
      if(args[0]==='container' && args[1]==='create'){this.created=true;await pause(700);}
      return result;
    }
    async observe(id,action) {
      const result=await super.observe(id,action);
      if(action==='authorization'){this.observed=true;await pause(700);}
      return result;
    }
  }
  const backend=new DelayedBackend(config,dir),controller=await Controller.open(dir,backend);
  try {
    const a=access(controller.create(grants[0]));
    await waitUntil(()=>backend.created);
    save('late-created-container',await backend.inspect(a.experimentId));
    await controller.cancel(a);await pause(800);
    assert.equal(controller.status(a).status,'cancelled');assert.equal(await backend.inspect(a.experimentId),null);
    const b=access(controller.create(grants[1]));
    await waitUntil(()=>controller.status(b).status==='ready');
    controller.run({...b,scenario:'authorization'});
    await waitUntil(()=>backend.observed);
    await controller.cancel(b);await pause(800);
    const report=controller.evidence(b);save('late-observation-evidence',report);
    assert.equal(report.status,'cancelled');assert.equal(report.attempts[0].state,'unverified');
    assert.equal(report.attempts[0].observations,null);assert.equal(report.attempts[0].verdict.fixVerified,false);
    assert.equal(await backend.inspect(b.experimentId),null);
  } finally {await controller.close();}
  assert.deepEqual(await backend.owned(),[]);
});
