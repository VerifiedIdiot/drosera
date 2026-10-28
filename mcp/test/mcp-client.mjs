import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { waitUntil } from './helpers.mjs';

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
    if(result.isError) {
      let error='invalid-input';
      try {error=JSON.parse(result.content[0].text).error ?? error;} catch {}
      throw new Error(error);
    }
    return JSON.parse(result.content[0].text);
  };
  return {client,transport,call,stderr:()=>stderr};
}
export async function ready(call,access) {
  return await waitUntil(async()=>{const state=await call('status',access); if(state.status==='error')throw new Error(state.reason); return state.status==='ready' && state;});
}
export function access(value) {return {experimentId:value.experimentId,accessToken:value.accessToken};}
export async function completed(call,credentials) {
  return await waitUntil(async()=>{const state=await call('status',credentials); if(['error','timed_out'].includes(state.status))throw new Error(state.reason); return state.status==='completed' && state;});
}
