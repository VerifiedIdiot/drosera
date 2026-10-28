import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save, waitUntil, pause } from '../helpers.mjs';
import { approval, access } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';
import { Controller } from '../../dist/controller.js';
import { Store } from '../../dist/store.js';

test('A4/A9: unconfirmed cleanup blocks new work until the owned resource is recovered', async () => {
  const {dir,config}=await prepared('cleanup-failure');
  const grants=[approval(dir),approval(dir)];
  class CleanupUnavailable extends DockerBackend {
    fail=false;
    async remove(id) {if(this.fail)throw new Error('injected-cleanup-unavailable');return await super.remove(id);}
  }
  const backend=new CleanupUnavailable(config,dir),controller=await Controller.open(dir,backend);
  try {
    const credentials=access(controller.create(grants[0]));await waitUntil(()=>controller.status(credentials).status==='ready');
    backend.fail=true;
    await assert.rejects(controller.cancel(credentials));
    const live=await backend.inspect(credentials.experimentId);save('cleanup-failure-live',live);
    assert.equal(live.State.Running,true);
    assert.equal(controller.status(credentials).reason,'cleanup-not-confirmed');
    assert.throws(()=>controller.create(grants[1]),/controls-unverified/);
    backend.fail=false;
    await controller.dispose(credentials);
    assert.equal(await backend.inspect(credentials.experimentId),null);
    save('cleanup-recovered',controller.evidence(credentials));
  } finally {backend.fail=false;await controller.close();}
  assert.deepEqual(await backend.owned(),[]);
});

test('A9: shutdown waits for error cleanup before release of the controller lock', async () => {
  const {dir,config}=await prepared('shutdown-error');
  const grant=approval(dir);
  class LateCleanup extends DockerBackend {
    entered=false;finished=false;
    async observe(id,action) {
      if(action==='authorization')throw new Error('injected-observation-failure');
      return await super.observe(id,action);
    }
    async remove(id) {
      if(!this.entered) {this.entered=true;await pause(700);await super.remove(id);this.finished=true;return;}
      return await super.remove(id);
    }
  }
  const backend=new LateCleanup(config,dir),controller=await Controller.open(dir,backend);
  try {
    const credentials=access(controller.create(grant));await waitUntil(()=>controller.status(credentials).status==='ready');
    controller.run({...credentials,scenario:'authorization'});await waitUntil(()=>backend.entered);
    await controller.close();
    assert.equal(backend.finished,true,'Shutdown must await the in-flight error cleanup');
    assert.equal(controller.status(credentials).status,'disposed');
    save('shutdown-error-evidence',controller.evidence(credentials));
    assert.deepEqual(await backend.owned(),[]);
  } finally {await pause(750);await controller.close();}
});

test('A9: parallel shutdown retains the lock until all cleanup settles after a failure', async () => {
  const {dir,config}=await prepared('parallel-shutdown');
  const grants=[approval(dir),approval(dir)];
  let releaseGate;
  const gate=new Promise(resolve=>{releaseGate=resolve;});
  class SplitCleanup extends DockerBackend {
    failId=null;delayId=null;failures=0;entered=false;finished=false;
    failure=new Error('injected-cleanup-unavailable');
    async remove(id) {
      if(id===this.failId) {this.failures++;throw this.failure;}
      if(id===this.delayId && !this.entered) {
        this.entered=true;await gate;await super.remove(id);this.finished=true;return;
      }
      return await super.remove(id);
    }
  }
  const backend=new SplitCleanup(config,dir),controller=await Controller.open(dir,backend);
  const credentials=[];
  let slowStop,closeOutcome,extraRelease,recovered,closeSettled=false,extraLockAcquired=false;
  try {
    for(const grant of grants)credentials.push(access(controller.create(grant)));
    const [a,b]=credentials;
    await Promise.all(credentials.map(c=>waitUntil(()=>controller.status(c).status==='ready')));
    backend.failId=a.experimentId;backend.delayId=b.experimentId;
    slowStop=controller.dispose(b);
    closeOutcome=controller.close().then(
      ()=>{closeSettled=true;return {status:'fulfilled'};},
      error=>{closeSettled=true;return {status:'rejected',error};},
    );
    await waitUntil(()=>backend.entered && controller.status(a).reason==='cleanup-not-confirmed');
    await pause(100);
    let lockError=null;
    try {extraRelease=new Store(dir).lock();extraLockAcquired=true;} catch(error) {lockError=error.message;}
    const boundary={closeSettled,lockError,delayedCleanupEntered:backend.entered,delayedCleanupFinished:backend.finished,failedRemoveCalls:backend.failures};
    save('parallel-shutdown-boundary',boundary);
    extraRelease?.();extraRelease=undefined;
    releaseGate();
    const [outcome]=await Promise.all([closeOutcome,slowStop]);
    const retainedFailure=outcome.error===backend.failure || (outcome.error instanceof AggregateError && outcome.error.errors.includes(backend.failure));
    const failedInspection=await backend.inspect(a.experimentId),delayedInspection=await backend.inspect(b.experimentId);
    save('parallel-shutdown-outcome',{status:outcome.status,error:outcome.error && {name:outcome.error.name,message:outcome.error.message,causes:outcome.error.errors?.map(error=>error.message)},retainedFailure,delayedCleanupFinished:backend.finished,failedInspection,delayedInspection,failedEvidence:controller.evidence(a),delayedEvidence:controller.evidence(b)});
    assert.equal(outcome.status,'rejected');assert.equal(retainedFailure,true,'Shutdown must preserve the injected removal failure');
    assert.equal(backend.finished,true);assert.equal(delayedInspection,null);
    assert.equal(controller.status(b).status,'disposed');
    assert.equal(controller.status(a).reason,'cleanup-not-confirmed');
    assert.equal(failedInspection.State.Running,true);
    assert.deepEqual(await backend.owned(),[backend.name(a.experimentId)]);
    backend.failId=null;
    recovered=await Controller.open(dir);
    assert.deepEqual(await recovered.backend.owned(),[],'Restart must recover the failed owned resource');
    await recovered.close();recovered=undefined;
    assert.equal(boundary.delayedCleanupFinished,false);
    assert.ok(boundary.failedRemoveCalls>=2);
    assert.deepEqual({closeSettled:boundary.closeSettled,lockError:boundary.lockError},{closeSettled:false,lockError:'controller-active'},'Shutdown must remain pending and reject another controller lock while a cleanup is delayed');
  } finally {
    extraRelease?.();releaseGate();backend.failId=null;
    await Promise.allSettled([controller.close(),...(slowStop?[slowStop]:[])]);
    if(recovered)await recovered.close();
    for(const c of credentials)await backend.remove(c.experimentId);
    const owned=await backend.owned(),release=new Store(dir).lock();release();
    save('parallel-shutdown-cleanup',{owned,extraLockAcquired,probeLockReleased:true,delayedCleanupFinished:backend.finished});
    assert.deepEqual(owned,[]);
  }
});
