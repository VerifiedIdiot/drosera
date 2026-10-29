import { readFile, writeFile, unlink } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { connect } from 'node:net';
import { createServer } from 'node:http';
import { readGuestControls, probeTmpLimit } from './probe.mjs';

const action = process.argv[2];
const variants = [['vulnerable',3000],['fixed',3001]];
async function request(port, method, path, body, account) {
  const headers = { 'content-type': 'application/json', ...(account ? {'x-account':account} : {}) };
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { method, headers, ...(body === undefined ? {} : {body:JSON.stringify(body)}), signal:AbortSignal.timeout(1000) });
  const text = await response.text();
  if (Buffer.byteLength(text)>4096) throw new Error('response-limit');
  return {request:{ method, path, headers, ...(body === undefined ? {} : {body}) },response:{ status:response.status,body:JSON.parse(text) }};
}
function attempt(options) {
  return new Promise(resolve => {
    const socket=connect(options);
    let done=false;
    const finish=result => { if(done) return; done=true; socket.destroy(); resolve(result); };
    socket.once('connect',()=>finish({connected:true}));
    socket.once('error',error=>finish({connected:false,code:error.code}));
    socket.setTimeout(400,()=>finish({connected:false,code:'TIMEOUT'}));
  });
}
async function probe() {
  const status=await readFile('/proc/self/status','utf8');
  const field=name=>status.split('\n').find(x=>x.startsWith(name+':'))?.split(':')[1].trim();
  let rootWrite='unexpected-success';
  try { await writeFile('/podori-write-probe','probe',{flag:'wx'}); } catch(error) {rootWrite=error.code;}
  await writeFile('/tmp/probe','synthetic'); await unlink('/tmp/probe');
  const mounts=await readFile('/proc/mounts','utf8');
  return {
    uid:process.getuid(),capEff:field('CapEff'),noNewPrivs:Number(field('NoNewPrivs')),seccomp:Number(field('Seccomp')),
    rootWrite,tmpWrite:true,interfaces:Object.keys(networkInterfaces()).sort(),
    ...await readGuestControls(),
    tmpLimit:await probeTmpLimit(),
    tmpMount:mounts.split('\n').find(x=>x.split(' ')[1]==='/tmp'),
    egress4:await attempt({host:'192.0.2.1',port:443}),
    egress6:await attempt({host:'2001:db8::1',port:443}),
    dockerSocket:await attempt({path:'/var/run/docker.sock'}),
    alternateSocket:await attempt({path:'/run/docker.sock'}),
  };
}
let result;
if (action === 'peer-listen') {
  const server=createServer((req,res)=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({experimentId:process.env.PODORI_EXPERIMENT_ID}));});
  server.maxConnections=2;
  await new Promise(resolve=>server.listen(3999,'127.0.0.1',resolve));
  await new Promise(resolve=>setTimeout(resolve,3000));
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  result={closed:true};
} else if (action === 'peer-check') {
  try {result={connected:true,observation:await request(3999,'GET','/')};}
  catch(error) {result={connected:false,code:error.cause?.code ?? 'REQUEST_FAILED'};}
} else if (action === 'probe') result=await probe();
else if (action === 'state') {
  result={};
  for(const [variant,port] of variants) result[variant]=await request(port,'GET','/state');
} else if (action === 'reset') {
  result={};
  for(const [variant,port] of variants) {
    const before=await request(port,'GET','/state');
    const reset=await request(port,'POST','/reset');
    const after=await request(port,'GET','/state');
    result[variant]={before,reset,after};
  }
} else if (action === 'authorization') {
  result={};
  for(const [variant,port] of variants) {
    const before=await request(port,'POST','/reset');
    const normal=await request(port,'GET','/documents/doc-a',undefined,'alice');
    const check=await request(port,'GET','/documents/doc-b',undefined,'alice');
    const after=await request(port,'GET','/state');
    result[variant]={before,normal,check,after};
  }
} else if (action === 'input-validation') {
  result={};
  for(const [variant,port] of variants) {
    const before=await request(port,'POST','/reset');
    const normal=await request(port,'POST','/quantity',{quantity:2});
    const check=await request(port,'POST','/quantity',{quantity:-1});
    const after=await request(port,'GET','/state');
    result[variant]={before,normal,check,after};
  }
} else throw new Error('unknown-fixed-action');
process.stdout.write(JSON.stringify(result)+'\n');
