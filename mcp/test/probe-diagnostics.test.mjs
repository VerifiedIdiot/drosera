import test from 'node:test';
import assert from 'node:assert/strict';

const diagnostics = await import('../ci/probe-diagnostics.mjs').catch(error => {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  return {};
});

test('selects only guest isolation fields, excluding unrelated evidence', () => {
  assert.equal(typeof diagnostics.selectProbe, 'function', 'probe selector must exist');
  const selected = {uid:1000,capEff:'0000000000000000',rootWrite:'EACCES',tmpWrite:true,interfaces:['lo'],egress4:{connected:false,code:'ENETUNREACH'},egress6:{connected:false},dockerSocket:{connected:false,code:'ENOENT'},alternateSocket:{connected:false,code:'ENOENT'}};
  const actual = {...selected,token:'secret',approval:{secret:true},id:'private',pid:123,path:'/private',hostControls:{private:true},body:'private',egress4:{...selected.egress4,body:'private'}};
  assert.deepEqual(diagnostics.selectProbe(actual), selected);
  assert.equal(actual.egress4.body, 'private');
});

test('bounds malformed selected values without leaking strings or nested data', () => {
  const secret = '/private/token\n::warning::' + 'x'.repeat(10000);
  const input = {uid:secret,capEff:secret,rootWrite:secret,tmpWrite:{token:secret},interfaces:Array(1000).fill(secret),egress4:{connected:secret,code:secret},egress6:{connected:true,code:'ECONNREFUSED'},dockerSocket:{},alternateSocket:{connected:false,code:'EACCES'}};
  const selected = diagnostics.selectProbe(input);
  assert.equal(selected.uid, '[invalid]');
  assert.equal(selected.capEff, '[invalid]');
  assert.equal(selected.rootWrite, '[invalid]');
  assert.equal(selected.tmpWrite, '[invalid]');
  assert.deepEqual(selected.interfaces, ['[invalid]']);
  assert.deepEqual(selected.egress4, {connected:'[invalid]',code:'[invalid]'});
  assert.deepEqual(selected.egress6, {connected:true,code:'ECONNREFUSED'});
  assert.deepEqual(selected.dockerSocket, {connected:'[invalid]'});
  assert.deepEqual(selected.alternateSocket, {connected:false,code:'EACCES'});
  assert.ok(JSON.stringify(selected).length < 1024);
  assert.ok(!JSON.stringify(selected).includes('private'));
  assert.doesNotThrow(() => diagnostics.selectProbe(null));
});
