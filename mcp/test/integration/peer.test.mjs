import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prepared, save, pause } from '../helpers.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { INITIAL } from '../../dist/evidence.js';

test('A7: an actual loopback receiver is reachable only in its own experiment', async () => {
  const {dir,config}=await prepared('peer');
  const backend=new DockerBackend(config,dir),a=randomUUID(),b=randomUUID();
  let listening;
  try {
    const one=await backend.provision(a,()=>{}),two=await backend.provision(b,()=>{});
    assert.notEqual(one.inspection.NetworkSettings.SandboxKey,two.inspection.NetworkSettings.SandboxKey);
    listening=backend.observe(b,'peer-listen').catch(error=>({error:error.reason}));
    await pause(250);
    const own=await backend.observe(b,'peer-check').catch(error=>({error:error.reason}));
    const cross=await backend.observe(a,'peer-check').catch(error=>({error:error.reason}));
    save('peer-probes',{a,b,own,cross,namespaceA:one.inspection.NetworkSettings,namespaceB:two.inspection.NetworkSettings});
    assert.equal(own.connected,true,'The fixed peer receiver must be observed through actual HTTP');
    assert.equal(own.observation.response.body.experimentId,b);
    assert.equal(cross.connected,false);assert.equal(cross.code,'ECONNREFUSED');
    await backend.observe(a,'input-validation');
    const other=await backend.observe(b,'state');save('peer-state',other);
    for(const version of ['vulnerable','fixed'])assert.deepEqual(other[version].response.body,INITIAL);
  } finally {
    await listening;await backend.remove(a);await backend.remove(b);
    assert.deepEqual(await backend.owned(),[]);
  }
});
