import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

test('A1: real stdio client initializes, discovers and calls a strict tool', async () => {
  assert.ok(existsSync('dist/server.js'), 'The stdio server implementation is absent');
  const transport = new StdioClientTransport({ command: process.execPath, args: ['dist/server.js'], stderr: 'pipe' });
  let errors = '';
  transport.stderr?.on('data', (x) => { errors += x; });
  const client = new Client({ name: 'podori-regression', version: '0.4.0-dev.0' });
  try {
    await client.connect(transport);
    assert.equal(client.getServerVersion().name, 'podori-sandbox');
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(x => x.name), ['sandbox_environment']);
    const result = await client.callTool({ name: 'sandbox_environment', arguments: {} });
    assert.equal(result.isError, undefined);
    assert.equal(JSON.parse(result.content[0].text).configured, false);
    const bad = await client.callTool({ name: 'sandbox_environment', arguments: { approved: true, command: 'ignored' } });
    assert.equal(bad.isError, true);
    assert.equal(errors, '');
  } finally { await client.close(); }
});

test('V01: real stdio initialization reports 0.5.0 for the private package', async () => {
  assert.ok(existsSync('dist/server.js'), 'The stdio server implementation is absent');
  const transport = new StdioClientTransport({ command: process.execPath, args: ['dist/server.js'], stderr: 'pipe' });
  const client = new Client({ name: 'podori-version-regression', version: '0.0.0-test' });
  try {
    await client.connect(transport);
    assert.deepEqual(client.getServerVersion(), { name: 'podori-sandbox', version: '0.5.0' });
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
    assert.equal(pkg.private, true);
    assert.equal(pkg.version, '0.5.0');
    assert.equal(lock.version, pkg.version);
    assert.equal(lock.packages[''].version, pkg.version);
  } finally { await client.close(); }
});
