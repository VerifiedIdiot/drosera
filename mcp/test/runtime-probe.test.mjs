import test from 'node:test';
import assert from 'node:assert/strict';
import { enforceProbe } from '../dist/docker.js';
import { BUDGET } from '../dist/policy.js';
import { configuration, inspection, probe, hostEvidence } from './runtime-helpers.mjs';

const id='ed775a7d-1eb9-46b6-81c1-cecb9503eff9';

test('G06: runc retains every existing guest isolation check', () => {
  enforceProbe(probe());
  for(const patch of [{uid:0},{capEff:'1'},{noNewPrivs:0},{seccomp:0},{rootWrite:'unexpected-success'},{tmpWrite:false},{interfaces:['lo','eth0']},{memoryMax:'max'},{pidsMax:'max'},{cpuMax:'max 100000'},{tmpMount:'tmpfs /tmp tmpfs rw,size=8m'},{egress4:{connected:true}},{egress6:{connected:true}},{dockerSocket:{connected:true}},{alternateSocket:{connected:true}},{dockerSocket:{connected:false,code:'EACCES'}},{alternateSocket:{connected:false,code:'EACCES'}}]) assert.throws(()=>enforceProbe(probe(patch)));
});

test('G06: runsc uses bound native host controls, not virtual guest cgroups or seccomp', () => {
  const config=configuration({runtime:'runsc'}),actual=inspection(config,id),evidence=hostEvidence(config,actual);
  const virtual=probe({seccomp:0,noNewPrivs:0,memoryMax:null,pidsMax:null,cpuMax:null,tmpMount:'none /tmp tmpfs rw 0 0',tmpLimit:{error:'ENOSPC',bytes:BUDGET.tmpfs}});
  assert.doesNotThrow(()=>enforceProbe(virtual,config,evidence,actual));
  assert.throws(()=>enforceProbe(virtual));
  for(const missing of [undefined,null,{}, {...evidence,source:'guest'}]) assert.throws(()=>enforceProbe(virtual,config,missing,actual));
  for(const patch of [{runtime:'runc'},{runtimeConfigHash:'e'.repeat(64)},{platform:'linux/amd64'},{containerId:'e'.repeat(64)},{pid:124},{members:[]},{cgroupPath:'/system.slice/other.scope'},{memoryMax:'max'},{memorySwapMax:'max'},{pidsMax:'max'},{cpuMax:'max 100000'},{seccomp:0},{noNewPrivs:0}]) assert.throws(()=>enforceProbe(virtual,config,{...evidence,...patch},actual));
  for(const patch of [{uid:0},{capEff:'1'},{rootWrite:'unexpected-success'},{tmpWrite:false},{interfaces:['lo','eth0']},{egress4:{connected:true}},{egress6:{connected:true}},{dockerSocket:{connected:false,code:'EACCES'}},{alternateSocket:{connected:true}},{tmpLimit:{error:'unexpected-success',bytes:BUDGET.tmpfs+1}},{tmpLimit:{error:'ENOSPC',bytes:BUDGET.tmpfs+1}}]) assert.throws(()=>enforceProbe({...virtual,...patch},config,evidence,actual));
});
