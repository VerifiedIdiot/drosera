import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Controller } from '../dist/controller.js';
import { DockerBackend } from '../dist/docker.js';
import { Store } from '../dist/store.js';
import { Approval, BUDGET, digest, objectHash } from '../dist/policy.js';
import { INITIAL } from '../dist/evidence.js';
import { configuration, host, image, inspection, probe, hostEvidence, socketFixture } from './runtime-helpers.mjs';

const observation=(path,status,body,method='GET')=>({request:{method,path,headers:{'content-type':'application/json',...(path.startsWith('/documents/')?{'x-account':'alice'}:{})}},response:{status,body}});
const state=()=>({vulnerable:observation('/state',200,INITIAL),fixed:observation('/state',200,INITIAL)});
const row=status=>({before:observation('/reset',200,INITIAL,'POST'),normal:observation('/documents/doc-a',200,INITIAL.documents[0]),check:observation('/documents/doc-b',status,status===200?INITIAL.documents[1]:{error:'not-owner'}),after:observation('/state',200,INITIAL)});
async function settled(controller,credentials) {
  for(let i=0;i<100;i++) {const status=controller.status(credentials);if(!['creating','running'].includes(status.status))return status;await new Promise(resolve=>setTimeout(resolve,10));}
  throw new Error('synthetic-controller-timeout');
}
async function setup(t,runtime='runsc') {
  const {root,endpoint}=await socketFixture(t),config=configuration({endpoint,runtime}),store=new Store(root);
  store.write('policy.json',config);
  class RecordedDocker extends DockerBackend {
    current=null;info=host();probePatch={};hostPatch={};actions=[];hostReads=0;
    async command(args) {
      if(args[0]==='info')return JSON.stringify(this.info);
      if(args[0]==='image')return JSON.stringify([image(config)]);
      if(args[0]==='stats')return JSON.stringify({synthetic:true});
      if(args[0]==='container' && args[1]==='create') {
        const name=args[args.indexOf('--name')+1],id=name.slice(`podori-${config.owner}-`.length);
        this.current=inspection(config,id,false);return this.current.Id;
      }
      if(args[0]==='container' && args[1]==='start') {this.current.State.Running=true;this.current.State.Status='running';return '';}
      throw new Error('unexpected-command');
    }
    async inspect() {return this.current?structuredClone(this.current):null;}
    async owned() {return this.current?[this.current.Name.slice(1)]:[];}
    async remove() {this.current=null;}
    hostControls(actual) {this.hostReads++;return runtime==='runsc'?{...hostEvidence(config,actual),...this.hostPatch}:null;}
    async observe(_id,action) {
      this.actions.push(action);
      if(action==='probe')return probe({...runtime==='runsc'?{seccomp:0,memoryMax:null,pidsMax:null,cpuMax:null}:{},...this.probePatch});
      if(action==='state')return state();
      if(action==='authorization')return {vulnerable:row(200),fixed:row(403)};
      if(action==='reset') {const reset={before:observation('/state',200,INITIAL),reset:observation('/reset',200,INITIAL,'POST'),after:observation('/state',200,INITIAL)};return {vulnerable:reset,fixed:reset};}
      throw new Error('unexpected-fixed-action');
    }
  }
  const backend=new RecordedDocker(config,root),controller=await Controller.open(root,backend);
  t.after(()=>controller.close());
  function claim(patch={}) {
    const id=randomUUID(),token='c'.repeat(64);
    const grant=Approval.parse({version:2,runtime:config.runtime,runtimeConfigHash:config.runtimeConfigHash,platform:config.platform,id,reportId:'report-1',itemId:'auth-1',target:'synthetic-http-v1',scenario:'authorization',fixtureRevision:config.fixtureRevision,imageId:config.imageId,budget:BUDGET,expiresAt:new Date(Date.now()+60_000).toISOString(),claimHash:digest(token),...patch});
    store.write(`grant-${id}.json`,grant);
    return {approvalId:id,claimToken:token};
  }
  return {root,config,store,backend,controller,claim};
}
const access=value=>({experimentId:value.experimentId,accessToken:value.accessToken});

test('G03/G05/G06: controller binds runtime identity and observed isolation to create, run and reset evidence', async t => {
  for(const runtime of ['runc','runsc']) {
    const {controller,config,claim,backend}=await setup(t,runtime);
    backend.info.HTTPProxy='http://synthetic-secret@proxy.invalid';
    backend.info.DockerRootDir='/private/host-location';
    const environment=await controller.environment();assert.equal(environment.runtime,runtime);assert.equal(environment.platform,config.platform);
    const grant=claim(),credentials=access(controller.create(grant));
    assert.equal((await settled(controller,credentials)).status,'ready');
    assert.throws(()=>controller.create(grant),/approval-already-used/);
    const initial=controller.evidence(credentials);
    assert.equal(initial.runtime,runtime);assert.equal(initial.runtimeConfigHash,config.runtimeConfigHash);assert.equal(initial.platform,config.platform);
    assert.equal(initial.isolation.host.OSType,'linux');
    assert.equal(JSON.stringify(initial).includes('synthetic-secret'),false,'Do not expose unrelated Docker host configuration');
    assert.equal(JSON.stringify(initial).includes('/private/host-location'),false);
    assert.equal(initial.isolation.hostControls?.source ?? null,runtime==='runsc'?'native-linux-cgroup-v2':null);
    controller.run({...credentials,scenario:'authorization'});
    assert.equal((await settled(controller,credentials)).status,'completed');
    const report=controller.evidence(credentials),attempt=report.attempts[0];
    assert.equal(attempt.verdict.fixVerified,true);
    assert.equal(attempt.runtime,runtime);assert.equal(attempt.runtimeConfigHash,config.runtimeConfigHash);assert.equal(attempt.platform,config.platform);
    assert.equal(attempt.isolation.inspection.HostConfig.Runtime,runtime);
    assert.equal(attempt.isolation.hostControls?.source ?? null,runtime==='runsc'?'native-linux-cgroup-v2':null);
    await controller.reset(credentials);
    const resetReport=controller.evidence(credentials);
    assert.equal(resetReport.resets[0].isolation.inspection.HostConfig.Runtime,runtime);
    assert.ok(backend.hostReads>=3);
    const {hash,...body}=resetReport;assert.equal(hash,objectHash(body));
    await controller.dispose(credentials);assert.deepEqual(await backend.owned(),[]);
  }
});

test('G04/G05/G06: runtime drift, actual-runtime mismatch and failed probes stop run or reset and clean up', async t => {
  for(const operation of ['run','reset']) for(const fault of ['registration','actual-runtime','guest','host']) {
    const {controller,claim,backend}=await setup(t),credentials=access(controller.create(claim()));
    assert.equal((await settled(controller,credentials)).status,'ready');
    if(fault==='registration')backend.info.Runtimes.runsc.runtimeArgs=['--changed'];
    if(fault==='actual-runtime')backend.current.HostConfig.Runtime='runc';
    if(fault==='guest')backend.probePatch={rootWrite:'unexpected-success'};
    if(fault==='host')backend.hostPatch={memoryMax:'max'};
    if(operation==='run')controller.run({...credentials,scenario:'authorization'});
    else await assert.rejects(controller.reset(credentials));
    assert.equal((await settled(controller,credentials)).status,'error');
    assert.deepEqual(await backend.owned(),[]);
    assert.equal(backend.actions.includes('authorization'),false);assert.equal(backend.actions.includes('reset'),false);
    const report=controller.evidence(credentials);
    assert.equal(report.attempts.some(attempt=>attempt.verdict.fixVerified),false);
    assert.equal(report.resets.length,0);
    await controller.dispose(credentials);
  }
});

test('G03/G04/G05: mismatched grants cannot create and host-probe failures cannot reach ready', async t => {
  const {controller,claim,backend,config,store}=await setup(t);
  for(const patch of [{runtime:'runc'},{platform:'linux/amd64'},{runtimeConfigHash:'e'.repeat(64)}]) assert.throws(()=>controller.create(claim(patch)),/access-denied/);
  const legacy=claim();const original=store.read(`grant-${legacy.approvalId}.json`);
  store.write(`grant-${legacy.approvalId}.json`,{...original,version:1});
  assert.throws(()=>controller.create(legacy),/invalid-approval/);
  assert.deepEqual(await backend.owned(),[]);
  backend.hostPatch={pidsMax:'max'};
  const credentials=access(controller.create(claim()));
  assert.equal((await settled(controller,credentials)).status,'error');
  const report=controller.evidence(credentials);
  assert.equal(report.reason,'host-controls-mismatch');assert.equal(report.isolation,null);
  assert.deepEqual(report.attempts,[]);assert.deepEqual(await backend.owned(),[]);
  assert.equal(report.runtimeConfigHash,config.runtimeConfigHash);
  await controller.dispose(credentials);
});
