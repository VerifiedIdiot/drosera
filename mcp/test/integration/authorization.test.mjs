import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prepared, save } from '../helpers.mjs';
import { DockerBackend } from '../../dist/docker.js';

test('A2/A6: the fixed HTTP app rejects the same cross-account request', async () => {
  const {dir,config}=await prepared('authorization');
  const backend=new DockerBackend(config,dir), id=randomUUID();
  try {
    await backend.provision(id,()=>{});
    const result=await backend.observe(id,'authorization'); save('authorization-observations',result);
    assert.deepEqual(result.vulnerable.before.response.body,result.fixed.before.response.body);
    assert.deepEqual(result.vulnerable.check.request,result.fixed.check.request);
    assert.equal(result.vulnerable.check.response.status,200);
    assert.equal(result.vulnerable.check.response.body.owner,'bob');
    assert.equal(result.fixed.check.response.status,403);
    for(const version of ['vulnerable','fixed']) {
      assert.equal(result[version].normal.response.status,200);
      assert.equal(result[version].normal.response.body.owner,'alice');
      assert.deepEqual(result[version].after.response.body,result[version].before.response.body);
    }
  } finally {await backend.remove(id); assert.equal(await backend.inspect(id),null);}
});
