import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, lstat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as probes from '../fixture/probe.mjs';

test('native fixed metadata check rejects actual invalid local fixture metadata', async () => {
  assert.equal(typeof probes.verifyFixtureMetadata,'function');
  const dir=await mkdtemp(join(tmpdir(),'podori-metadata-'));
  const file=join(dir,'probe');
  try {
    await writeFile(file,'not-empty',{mode:0o600});
    await assert.rejects(probes.verifyFixtureMetadata(async path=>{
      assert.equal(path,'/podori-write-probe');
      return lstat(file);
    }),/^Error: fixture-metadata-invalid$/);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('image precreates only the fixed empty owner-writable probe', async () => {
  const dockerfile=await readFile(new URL('../fixture/Dockerfile',import.meta.url),'utf8');
  assert.match(dockerfile,/RUN touch \/podori-write-probe && chown 1000:1000 \/podori-write-probe && chmod 0600 \/podori-write-probe/);
  assert.match(dockerfile,/COPY --chown=0:0 app\.mjs driver\.mjs probe\.mjs \/fixture\//);
});

test('fixed root probe writes a real existing writable file and reports unexpected-success', async () => {
  assert.equal(typeof probes.probeRootWrite,'function');
  const dir=await mkdtemp(join(tmpdir(),'podori-root-probe-'));
  const file=join(dir,'probe');
  try {
    await writeFile(file,'',{mode:0o600});
    const result=await probes.probeRootWrite(async(path,data,options)=>{
      assert.equal(path,'/podori-write-probe');
      return writeFile(file,data,options);
    });
    assert.equal(result,'unexpected-success');
    assert.equal(await readFile(file,'utf8'),'probe');
  } finally {await rm(dir,{recursive:true,force:true});}
});
