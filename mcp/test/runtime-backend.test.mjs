import test from 'node:test';
import assert from 'node:assert/strict';
import { DockerBackend, enforceContainer } from '../dist/docker.js';
import { configuration, host, image, inspection, probe, socketFixture, hostEvidence } from './runtime-helpers.mjs';

test('G02/G04: preflight rejects selected runtime drift and non-native fixture images before create', async t => {
  const {root,endpoint}=await socketFixture(t);
  for(const runtime of ['runc','runsc']) for(const [architecture,platform] of [['aarch64','linux/arm64'],['x86_64','linux/amd64']]) {
    const config=configuration({endpoint,runtime,platform});
    let info=host({Architecture:architecture}),actualImage=image(config);
    const calls=[];
    class RecordedDocker extends DockerBackend {
      async command(args) {
        calls.push(args);
        if(args[0]==='info')return JSON.stringify(info);
        if(args[0]==='image' && args[1]==='inspect')return JSON.stringify([actualImage]);
        throw new Error('unexpected-command');
      }
    }
    const backend=new RecordedDocker(config,root);
    await backend.preflight();
    info=host({Architecture:architecture});delete info.Runtimes[runtime];
    await assert.rejects(backend.preflight(),/runtime-unavailable/);
    info=host({Architecture:architecture});info.Runtimes[runtime]={...info.Runtimes[runtime],runtimeArgs:['--changed']};
    await assert.rejects(backend.preflight(),/runtime-configuration-changed/);
    info=host({Architecture:architecture==='aarch64'?'x86_64':'aarch64'});
    await assert.rejects(backend.preflight(),/host-platform-changed/);
    info=host({Architecture:architecture});
    for(const patch of [{Architecture:platform==='linux/arm64'?'amd64':'arm64'},{Os:'windows'},{Id:`sha256:${'e'.repeat(64)}`},{Config:{Labels:{'io.podori.fixture':'e'.repeat(64)}}}]) {
      actualImage=image(config,patch);
      await assert.rejects(backend.preflight(),/image-not-verified/);
    }
    assert.equal(calls.some(args=>args[0]==='container'),false);
  }
});

test('G01/G02/G04: create uses the policy runtime and platform and rejects a different actual runtime', async t => {
  const {root,endpoint}=await socketFixture(t),id='ed775a7d-1eb9-46b6-81c1-cecb9503eff9';
  for(const runtime of ['runc','runsc']) for(const platform of ['linux/arm64','linux/amd64']) {
    const config=configuration({endpoint,runtime,platform}),actual=inspection(config,id),calls=[];
    enforceContainer(actual,config,actual.Name.slice(1));
    for(const value of [runtime==='runc'?'runsc':'runc','',undefined]) {
      assert.throws(()=>enforceContainer({...actual,HostConfig:{...actual.HostConfig,Runtime:value}},config,actual.Name.slice(1)));
    }
    class RecordedDocker extends DockerBackend {
      async preflight() {return host({Architecture:platform==='linux/arm64'?'aarch64':'x86_64'});}
      async command(args) {calls.push(args);return '';}
      async inspect() {return actual;}
      async observe(_id,action) {return action==='probe'?probe():{};}
      hostControls() {return config.runtime==='runsc'?hostEvidence(config,actual):null;}
    }
    const backend=new RecordedDocker(config,root);
    await backend.provision(id,()=>{});
    const args=calls.find(args=>args[0]==='container' && args[1]==='create');
    assert.equal(args[args.indexOf('--runtime')+1],runtime);
    assert.equal(args[args.indexOf('--platform')+1],platform);
    assert.ok(args.includes('--pull=never'));assert.equal(args.at(-1),config.imageId);
    assert.equal(args[args.indexOf('--network')+1],'none');
    assert.equal(args[args.indexOf('--memory')+1],String(config.budget.memory));
  }
});

test('G06: provision requires fresh host evidence before accepting a runsc guest probe', async t => {
  const {root,endpoint}=await socketFixture(t),id='ed775a7d-1eb9-46b6-81c1-cecb9503eff9';
  const config=configuration({endpoint,runtime:'runsc'}),actual=inspection(config,id);
  let evidence=hostEvidence(config,actual),reads=0;
  class RecordedDocker extends DockerBackend {
    async preflight() {return host();}
    async command() {return '';}
    async inspect() {return actual;}
    async observe(_id,action) {return action==='probe'?probe({seccomp:0,memoryMax:null,pidsMax:null,cpuMax:null}):{};}
    hostControls() {reads++;return evidence;}
  }
  const backend=new RecordedDocker(config,root);
  const result=await backend.provision(id,()=>{});
  assert.deepEqual(result.hostControls,evidence);assert.equal(reads,1);
  evidence=null;
  await assert.rejects(backend.provision(id,()=>{}));
  evidence={...hostEvidence(config,actual),memoryMax:'max'};
  await assert.rejects(backend.provision(id,()=>{}),/host-controls-mismatch/);
});
