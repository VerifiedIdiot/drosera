import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

export const evidenceRoot = process.env.PODORI_EVIDENCE_DIR;
assert.ok(evidenceRoot, 'Set PODORI_EVIDENCE_DIR to a private artifact directory');
assert.ok(!resolve(evidenceRoot).startsWith(resolve('.')+'/'), 'Keep evidence outside the package');
export const artifacts = mkdtempSync(join(evidenceRoot, `${process.env.PODORI_TEST_RUN ?? 'test'}-`));
export function save(name, value) { writeFileSync(join(artifacts, name+'.json'), JSON.stringify(value,null,2), {mode:0o600}); }
export function endpoint() {
  const context = JSON.parse(execFileSync('docker',['context','inspect'],{encoding:'utf8'}));
  const socket = context[0].Endpoints.docker.Host;
  assert.match(socket, /^unix:\/\//, 'Only the approved local socket is allowed');
  return socket;
}
export async function prepared(label = 'state') {
  const { prepare } = await import('../dist/docker.js');
  const dir=join(artifacts,label); mkdirSync(dir,{mode:0o700});
  const config=await prepare(dir,endpoint());
  save(`${label}-policy`, config);
  return {dir,config};
}
export const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
export async function waitUntil(fn, ms=20000) {
  const deadline=Date.now()+ms;
  while (Date.now()<deadline) { const result=await fn(); if(result) return result; await pause(100); }
  throw new Error('Condition did not become true within the test deadline');
}
