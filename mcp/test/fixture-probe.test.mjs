import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BUDGET } from '../dist/policy.js';
import { fixtureRevision } from '../dist/docker.js';
import { objectHash } from '../dist/policy.js';

test('G06: fixed fixture probes report virtual cgroup absence and test the unchanged tmpfs cap', async () => {
  assert.ok(existsSync('fixture/probe.mjs'),'The fixed virtual-control probe is absent');
  const { readGuestControls, probeTmpLimit, TMPFS_BYTES }=await import('../fixture/probe.mjs');
  assert.equal(TMPFS_BYTES,BUDGET.tmpfs);
  const files=new Map([['/sys/fs/cgroup/memory.max',String(BUDGET.memory)],['/sys/fs/cgroup/pids.max',String(BUDGET.pids)],['/sys/fs/cgroup/cpu.max','50000 100000']]);
  assert.deepEqual(await readGuestControls(async path=>files.get(path)),{memoryMax:String(BUDGET.memory),pidsMax:String(BUDGET.pids),cpuMax:'50000 100000',virtualErrors:{}});
  const absent=await readGuestControls(async()=>{throw Object.assign(new Error('virtual'),{code:'ENOENT'});});
  assert.deepEqual(absent,{memoryMax:null,pidsMax:null,cpuMax:null,virtualErrors:{memoryMax:'ENOENT',pidsMax:'ENOENT',cpuMax:'ENOENT'}});
  await assert.rejects(readGuestControls(async()=>{throw Object.assign(new Error('read-failed'),{code:'EIO'});}),/read-failed/);
  for(const capacity of [BUDGET.tmpfs,BUDGET.tmpfs+1]) {
    let bytes=0,closed=false,removed=false,writeCalls=0;
    const result=await probeTmpLimit({open:async(path,flags)=>{
      assert.equal(path,'/tmp/podori-limit-probe');assert.equal(flags,'wx');
      return {write:async(_buffer,_offset,length)=>{
        writeCalls++;assert.ok(writeCalls<100);
        if(bytes>=capacity)throw Object.assign(new Error('full'),{code:'ENOSPC'});
        const bytesWritten=Math.min(length,capacity-bytes);bytes+=bytesWritten;return {bytesWritten};
      },close:async()=>{closed=true;}};
    },unlink:async path=>{assert.equal(path,'/tmp/podori-limit-probe');removed=true;}});
    assert.equal(result.error,capacity===BUDGET.tmpfs?'ENOSPC':'unexpected-success');
    assert.equal(result.bytes,capacity);assert.equal(closed,true);assert.equal(removed,true);
  }
  const names=['Dockerfile','.dockerignore','app.mjs','driver.mjs','probe.mjs'];
  assert.equal(fixtureRevision(),objectHash(names.map(name=>({name,content:readFileSync(`fixture/${name}`,'utf8')}))));
  assert.match(readFileSync('fixture/Dockerfile','utf8'),/COPY --chown=0:0 app\.mjs driver\.mjs probe\.mjs \/fixture\//);
});

test('G02/G06: the fixture build context includes every fixed probe source', () => {
  const allowed=readFileSync('fixture/.dockerignore','utf8').trim().split('\n');
  for(const name of ['Dockerfile','app.mjs','driver.mjs','probe.mjs','.dockerignore']) assert.ok(allowed.includes(`!${name}`),`The immutable fixture cannot build without ${name}`);
  assert.equal(allowed[0],'*','Keep unrelated files outside the build context');
});
