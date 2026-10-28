import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save } from '../helpers.mjs';
import { Controller } from '../../dist/controller.js';

test('A4: concurrent environment probes cannot multiply Docker subprocesses', async () => {
  const {dir}=await prepared('control-concurrency');
  const controller=await Controller.open(dir);
  try {
    const results=await Promise.allSettled([controller.environment(),controller.environment()]);
    save('environment-concurrency',results.map(x=>x.status==='fulfilled'?{status:x.status}:{status:x.status,reason:x.reason.message}));
    assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
    assert.equal(results.filter(x=>x.status==='rejected' && x.reason.message==='control-concurrency-limit').length,1);
    assert.equal((await controller.environment()).available,true);
  } finally {await controller.close();}
});
