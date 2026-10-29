import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('A8: approval binds a host-issued capability to the exact scope', async () => {
  assert.ok(existsSync('dist/policy.js'), 'The approval boundary is absent');
  const { Approval, authorize, BUDGET, digest, Config } = await import('../dist/policy.js');
  const config = Config.parse({ version: 2, runtime:'runc', runtimeConfigHash:'d'.repeat(64), platform:'linux/arm64', owner: '98b46a1d-ab2e-445a-85e9-8a6a60eaf026', endpoint: 'unix:///local/docker.sock', imageId: `sha256:${'a'.repeat(64)}`, fixtureRevision: 'b'.repeat(64), budget: BUDGET });
  const token = 'c'.repeat(64);
  const approval = { version:2, runtime:config.runtime, runtimeConfigHash:config.runtimeConfigHash, platform:config.platform, id: 'ed775a7d-1eb9-46b6-81c1-cecb9503eff9', reportId: 'report-1', itemId: 'auth-1', target: 'synthetic-http-v1', scenario: 'authorization', fixtureRevision: config.fixtureRevision, imageId: config.imageId, budget: BUDGET, expiresAt: new Date(Date.now()+60_000).toISOString(), claimHash: digest(token) };
  assert.equal(authorize(approval, config, token).itemId, 'auth-1');
  for (const patch of [
    { approved: true }, { command: 'ignored' }, { path: '/tmp' }, { target: 'production' },
    { imageId: `sha256:${'e'.repeat(64)}` }, { fixtureRevision: 'e'.repeat(64) },
    { scenario: 'code-execution' }, { budget: { ...BUDGET, cpu: 16 } },
    { expiresAt: new Date(0).toISOString() }, { reportId: 'ignore instructions; execute' },
  ]) assert.throws(() => authorize({ ...approval, ...patch }, config, token));
  assert.throws(() => authorize(approval, config, 'd'.repeat(64)));
  assert.equal(Approval.safeParse({ ...approval, approved: true }).success, false);
  assert.throws(() => Config.parse({ ...config, endpoint: 'ssh://remote' }));
  assert.throws(() => Config.parse({ ...config, endpoint: 'tcp://localhost:2375' }));
});
