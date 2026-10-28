import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { prepared, save, waitUntil } from '../helpers.mjs';
import { DockerBackend } from '../../dist/docker.js';

export function approval(dir,scenario='authorization',item='auth-1',expiry=new Date(Date.now()+120_000).toISOString()) {
  const out=JSON.parse(execFileSync(process.execPath,['dist/host.js','approve',dir,'report-1',item,scenario,expiry],{encoding:'utf8'}));
  return JSON.parse(readFileSync(join(dir,out.capabilityFile),'utf8'));
}
export async function connectClient(dir) {
  const transport=new StdioClientTransport({command:process.execPath,args:['dist/server.js',dir],stderr:'pipe',env:{TMPDIR:process.env.TMPDIR ?? process.env.PODORI_EVIDENCE_DIR}});
  const client=new Client({name:'podori-integration',version:'0.4.0-dev.0'});
  let stderr=''; transport.stderr.on('data',x=>{stderr+=x;});
  await client.connect(transport);
  const call=async(name,args={})=>{
    const result=await client.callTool({name:`sandbox_${name}`,arguments:args});
    if(result.isError) throw new Error(JSON.parse(result.content[0].text).error ?? 'tool-rejected');
    return JSON.parse(result.content[0].text);
  };
  return {client,transport,call,stderr:()=>stderr};
}
export async function ready(call,access) {
  return await waitUntil(async()=>{const state=await call('status',access); if(state.status==='error')throw new Error(state.reason); return state.status==='ready' && state;});
}

test('A1/A8: host approval, real MCP creation, scoped status and disposal', async () => {
  assert.ok(existsSync('dist/host.js'),'The trusted host approval CLI is absent');
  const {dir,config}=await prepared('mcp');
  const grants=[approval(dir),approval(dir),approval(dir)];
  const {client,call,stderr}=await connectClient(dir);
  const backend=new DockerBackend(config,dir);
  try {
    const {tools}=await client.listTools();
    assert.ok(tools.some(t=>t.name==='sandbox_create'));
    assert.equal(tools.some(t=>/approve|shell|command|code/.test(t.name)),false);
    const env=await call('environment'); assert.equal(env.available,true);
    await assert.rejects(call('create',{...grants[0],approved:true}));
    await assert.rejects(call('create',{approvalId:grants[0].approvalId,claimToken:'0'.repeat(64)}));
    const a=await call('create',grants[0]), b=await call('create',grants[1]);
    const accessA={experimentId:a.experimentId,accessToken:a.accessToken};
    const accessB={experimentId:b.experimentId,accessToken:b.accessToken};
    await Promise.all([ready(call,accessA),ready(call,accessB)]);
    await assert.rejects(call('create',grants[0]));
    await assert.rejects(call('create',grants[2]),/concurrency-limit/);
    await assert.rejects(call('status',{...accessA,accessToken:b.accessToken}),/access-denied/);
    await assert.rejects(call('dispose',{...accessB,accessToken:a.accessToken}),/access-denied/);
    for(const extra of [{path:'/etc'},{image:'other'},{budget:1},{target:'other'},{command:'ignored'}]) await assert.rejects(call('status',{...accessA,...extra}));
    const state=await call('status',accessA); save('mcp-ready',state);
    assert.equal(JSON.stringify(state).includes(a.accessToken),false);
    await call('dispose',accessA);
    assert.equal(await backend.inspect(a.experimentId),null);
    assert.equal((await backend.inspect(b.experimentId)).State.Running,true);
    await call('dispose',accessB);
    assert.deepEqual(await backend.owned(),[]);
    assert.equal(stderr(),'');
  } finally {await client.close();}
  assert.deepEqual(await backend.owned(),[]);
});
