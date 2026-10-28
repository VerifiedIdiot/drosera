import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save, pause, waitUntil } from '../helpers.mjs';
import { approval, access } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { Controller } from '../../dist/controller.js';
import { BUDGET } from '../../dist/policy.js';

test('A9: the deadline removes the actual container and rejects late HTTP completion', async () => {
  const {dir,config}=await prepared('timeout');
  const grant=approval(dir);
  class SlowObservation extends DockerBackend {
    async observe(id,action) {
      const actual=await super.observe(id,action);
      if(action==='authorization')await pause(BUDGET.runMs+1200);
      return actual;
    }
  }
  const backend=new SlowObservation(config,dir),controller=await Controller.open(dir,backend);
  try {
    const credentials=access(controller.create(grant));
    await waitUntil(()=>controller.status(credentials).status==='ready');
    controller.run({...credentials,scenario:'authorization'});
    await pause(BUDGET.runMs+600);
    const atDeadline=await backend.inspect(credentials.experimentId);save('deadline-container',{inspection:atDeadline});
    assert.equal(atDeadline,null,'The container must be absent at the run deadline');
    await waitUntil(()=>controller.status(credentials).status==='timed_out',4000);
    await pause(1500);
    const report=controller.evidence(credentials);save('timeout-evidence',report);
    assert.equal(report.status,'timed_out');assert.equal(report.attempts[0].state,'unverified');
    assert.equal(report.attempts[0].observations,null);assert.equal(report.attempts[0].verdict.fixVerified,false);
    assert.equal(report.attempts[0].reason,'run-timeout');
    assert.deepEqual(await backend.owned(),[]);
  } finally {await controller.close();}
});
