import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('A10: verdicts require observations, not success flags or incomplete responses', async () => {
  assert.ok(existsSync('dist/evidence.js'), 'The observation evaluator is absent');
  const { evaluate, INITIAL }=await import('../dist/evidence.js');
  const response=(status,body)=>({status,body});
  const observation=(path,status,body,method='GET',input)=>({request:{method,path,headers:{'content-type':'application/json',...(path.startsWith('/documents/')?{'x-account':'alice'}:{})},...(input===undefined?{}:{body:input})},response:response(status,body)});
  const row=status=>({before:observation('/reset',200,INITIAL,'POST'),normal:observation('/documents/doc-a',200,INITIAL.documents[0]),check:observation('/documents/doc-b',status,status===200?INITIAL.documents[1]:{error:'not-owner'}),after:observation('/state',200,INITIAL)});
  const data={vulnerable:row(200),fixed:row(403)};
  assert.deepEqual(evaluate('authorization',data),{original:'reproduced',fixed:'not-reproduced',normal:true,fixVerified:true});
  assert.equal(evaluate('authorization',{success:true}).original,'unverified');
  const missing=structuredClone(data); delete missing.fixed.normal;
  assert.equal(evaluate('authorization',missing).fixVerified,false);
  const altered=structuredClone(data); altered.fixed.before.response.body.quantity=7;
  assert.equal(evaluate('authorization',altered).fixed,'unverified');
  const extra=structuredClone(data); extra.fixed.check.request.path='/other';
  assert.equal(evaluate('authorization',extra).fixed,'unverified');
  const notReproduced={vulnerable:row(403),fixed:row(403)};
  assert.equal(evaluate('authorization',notReproduced).original,'not-reproduced');
  const inputRow=status=>({before:observation('/reset',200,INITIAL,'POST'),normal:observation('/quantity',200,{quantity:2},'POST',{quantity:2}),check:observation('/quantity',status,status===200?{quantity:-1}:{error:'invalid-quantity'},'POST',{quantity:-1}),after:observation('/state',200,{...INITIAL,quantity:status===200?-1:2})});
  assert.deepEqual(evaluate('input-validation',{vulnerable:inputRow(200),fixed:inputRow(400)}),{original:'reproduced',fixed:'not-reproduced',normal:true,fixVerified:true});
});
