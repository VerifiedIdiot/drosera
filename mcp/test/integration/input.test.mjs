import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prepared, save } from '../helpers.mjs';
import { DockerBackend } from '../../dist/docker.js';

test('A3/A6: bounded input comparison returns real normal HTTP observations', async () => {
  const {dir,config}=await prepared('input');
  const backend=new DockerBackend(config,dir), id=randomUUID();
  try {
    await backend.provision(id,()=>{});
    let result;
    try { result=await backend.observe(id,'input-validation'); }
    catch(error) { save('input-driver-error',{reason:error.reason,diagnostic:error.diagnostic}); }
    assert.ok(result, 'The fixed input-validation driver must return HTTP observations');
    save('input-observations',result);
    assert.deepEqual(result.vulnerable.before.response.body,result.fixed.before.response.body);
    assert.deepEqual(result.vulnerable.check.request,result.fixed.check.request);
    assert.equal(result.vulnerable.check.response.status,200);
    assert.equal(result.vulnerable.after.response.body.quantity,-1);
    assert.equal(result.fixed.check.response.status,400);
    assert.equal(result.fixed.after.response.body.quantity,2);
    for(const version of ['vulnerable','fixed']) {
      assert.equal(result[version].normal.response.status,200);
      assert.equal(result[version].normal.response.body.quantity,2);
    }
  } finally {await backend.remove(id); assert.equal(await backend.inspect(id),null);}
});
