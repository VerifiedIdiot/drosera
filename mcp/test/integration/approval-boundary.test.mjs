import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save, pause, waitUntil } from '../helpers.mjs';
import { approval, access, connectClient, ready } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { Controller } from '../../dist/controller.js';
import { Store } from '../../dist/store.js';

test('A8: approval expiry during real preflight prevents container creation', async () => {
  const {dir,config}=await prepared('preflight-expiry');
  const expires=Date.now()+2000,grant=approval(dir,'authorization','preflight-expiry',new Date(expires).toISOString());
  class DelayedPreflight extends DockerBackend {
    created=false;
    async preflight() {const actual=await super.preflight();await pause(Math.max(0,expires-Date.now())+100);return actual;}
    async command(args,...rest) {if(args[0]==='container' && args[1]==='create')this.created=true;return await super.command(args,...rest);}
  }
  const backend=new DelayedPreflight(config,dir),controller=await Controller.open(dir,backend);
  try {
    const credentials=access(controller.create(grant));
    await waitUntil(()=>controller.status(credentials).status!=='creating');
    const report=controller.evidence(credentials);save('preflight-expiry-result',report);
    assert.equal(backend.created,false,'An expired grant must not create a target after delayed preflight');
    assert.equal(report.status,'error');assert.equal(report.reason,'approval-expired');
    assert.deepEqual(await backend.owned(),[]);
  } finally {await controller.close();}
});

test('A8: approval expiry during post-create inspect prevents container start', async () => {
  const {dir,config}=await prepared('post-create-expiry');
  const expires=Date.now()+4000,grant=approval(dir,'authorization','post-create-expiry',new Date(expires).toISOString());
  class DelayedInspection extends DockerBackend {
    createdAt=null;inspectedAt=null;releasedAt=null;actualInspection=null;startCalls=[];
    async command(args,...rest) {
      if(args[0]==='container' && args[1]==='start')this.startCalls.push({name:args[2],at:Date.now()});
      const actual=await super.command(args,...rest);
      if(args[0]==='container' && args[1]==='create')this.createdAt=Date.now();
      return actual;
    }
    async inspect(id) {
      const actual=await super.inspect(id);
      if(actual?.State.Status==='created' && this.actualInspection===null) {
        this.actualInspection=actual;this.inspectedAt=Date.now();
        await pause(Math.max(0,expires-Date.now())+100);this.releasedAt=Date.now();
      }
      return actual;
    }
  }
  const backend=new DelayedInspection(config,dir),controller=await Controller.open(dir,backend);
  let credentials;
  try {
    credentials=access(controller.create(grant));
    await waitUntil(()=>controller.status(credentials).status!=='creating');
    await waitUntil(async()=>(await backend.owned()).length===0);
    const report=controller.evidence(credentials),ownedAfter=await backend.owned();
    save('post-create-expiry-boundary',{expires,createdAt:backend.createdAt,inspectedAt:backend.inspectedAt,releasedAt:backend.releasedAt,actualInspection:backend.actualInspection,startCalls:backend.startCalls,ownedAfter,report});
    assert.ok(backend.createdAt!==null && backend.createdAt<expires,'The real container must be created before expiry');
    assert.ok(backend.inspectedAt!==null && backend.inspectedAt<expires,'The real post-create inspection must begin before expiry');
    assert.equal(backend.actualInspection.State.Status,'created');
    assert.equal(backend.actualInspection.State.Running,false);
    assert.ok(backend.releasedAt>expires,'The actual inspection result must return after expiry');
    assert.equal(report.status,'error');assert.equal(report.reason,'approval-expired');
    assert.equal(report.isolation,null);assert.deepEqual(report.attempts,[]);
    assert.throws(()=>controller.run({...credentials,scenario:'authorization'}),/approval-expired/);
    assert.deepEqual(ownedAfter,[]);
    assert.deepEqual(backend.startCalls,[],'An expired grant must not start a target after delayed post-create inspect');
  } finally {
    await controller.close();
    const owned=await backend.owned(),inspection=credentials?await backend.inspect(credentials.experimentId):null;
    save('post-create-expiry-cleanup',{owned,inspection});
    assert.deepEqual(owned,[]);assert.equal(inspection,null);
  }
});

test('A8: changed server-side approval fails and foreign tokens fail for every control', async () => {
  const {dir,config}=await prepared('approval-changes');
  const grants=[approval(dir),approval(dir)];
  const store=new Store(dir),backend=new DockerBackend(config,dir);
  const {client,call,stderr}=await connectClient(dir);
  try {
    const a=access(await call('create',grants[0])),b=access(await call('create',grants[1]));
    await Promise.all([ready(call,a),ready(call,b)]);
    for(const name of ['status','evidence','reset','cancel','dispose','run']) {
      const input={...a,accessToken:b.accessToken,...(name==='run'?{scenario:'authorization'}:{})};
      await assert.rejects(call(name,input),/access-denied/);
    }
    const original=store.read(`grant-${grants[0].approvalId}.json`);
    for(const patch of [{reportId:'other'},{itemId:'other'},{scenario:'input-validation'},{imageId:`sha256:${'0'.repeat(64)}`},{fixtureRevision:'0'.repeat(64)},{budget:{...config.budget,cpu:10}},{approved:true},{path:'/host'}]) {
      store.write(`grant-${grants[0].approvalId}.json`,{...original,...patch});
      await assert.rejects(call('run',{...a,scenario:'authorization'}));
    }
    store.write(`grant-${grants[0].approvalId}.json`,original);
    assert.equal((await call('evidence',a)).attempts.length,0);
    await call('dispose',a);await call('dispose',b);
    assert.equal(stderr(),'');
  } finally {await client.close();}
  assert.deepEqual(await backend.owned(),[]);
});
