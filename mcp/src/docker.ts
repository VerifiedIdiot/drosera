import { spawn } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { BUDGET, BASE_IMAGE, Config, Id, objectHash, type Configuration, type ScenarioId } from './policy.js';
import { Store } from './store.js';

const fixture = fileURLToPath(new URL('../fixture/', import.meta.url));
const OWNER = 'io.podori.controller';
const EXPERIMENT = 'io.podori.experiment';
const REVISION = 'io.podori.fixture';
const Host = z.looseObject({ OSType:z.literal('linux'), Architecture:z.string(), CgroupVersion:z.string(), MemoryLimit:z.boolean(), PidsLimit:z.boolean(), CpuCfsQuota:z.boolean(), SecurityOptions:z.array(z.string()) });
const Inspection = z.looseObject({
  Id:z.string(), Name:z.string(), Image:z.string(),
  Config:z.looseObject({ User:z.string(), Env:z.array(z.string()), Labels:z.record(z.string(),z.string()), Entrypoint:z.array(z.string()), Cmd:z.array(z.string()).nullable() }),
  HostConfig:z.looseObject({ NetworkMode:z.string(), ReadonlyRootfs:z.boolean(), Privileged:z.boolean(), CapDrop:z.array(z.string()), CapAdd:z.array(z.string()).nullable(), SecurityOpt:z.array(z.string()), Memory:z.number(), MemorySwap:z.number(), NanoCpus:z.number(), PidsLimit:z.number(), Tmpfs:z.record(z.string(),z.string()), Binds:z.array(z.string()).nullable(), RestartPolicy:z.looseObject({Name:z.string()}), PortBindings:z.unknown(), LogConfig:z.looseObject({Type:z.string()}) }),
  Mounts:z.array(z.looseObject({Type:z.string(), Destination:z.string()})),
  State:z.looseObject({Running:z.boolean(),ExitCode:z.number(),OOMKilled:z.boolean(),Status:z.string()}),
});
export type ContainerInspection = z.infer<typeof Inspection>;
const Probe = z.looseObject({uid:z.number(),capEff:z.string(),noNewPrivs:z.number(),seccomp:z.number(),rootWrite:z.string(),tmpWrite:z.boolean(),interfaces:z.array(z.string()),memoryMax:z.string(),pidsMax:z.string(),cpuMax:z.string(),tmpMount:z.string(),egress4:z.looseObject({connected:z.boolean(),code:z.string().optional()}),egress6:z.looseObject({connected:z.boolean(),code:z.string().optional()}),dockerSocket:z.looseObject({connected:z.boolean(),code:z.string().optional()}),alternateSocket:z.looseObject({connected:z.boolean(),code:z.string().optional()})});

export function fixtureRevision(): string {
  return objectHash(['Dockerfile','.dockerignore','app.mjs','driver.mjs'].map(name => ({name,content:readFileSync(new URL(name, new URL('../fixture/', import.meta.url)),'utf8')})));
}
export function enforceHost(input:unknown): void {
  const h=Host.parse(input);
  if (h.Architecture!=='aarch64' || h.CgroupVersion!=='2' || !h.MemoryLimit || !h.PidsLimit || !h.CpuCfsQuota || !h.SecurityOptions.includes('name=seccomp,profile=builtin')) throw new Error('required-host-controls-unavailable');
}
export function enforceContainer(input:unknown, config:Configuration, name:string): void {
  const c=Inspection.parse(input), h=c.HostConfig;
  const expected=['/usr/bin/timeout','--signal=KILL',String(BUDGET.lifetimeSeconds),'/usr/local/bin/node','/fixture/app.mjs'];
  if (c.Name!==`/${name}` || c.Image!==config.imageId || c.Config.User!=='1000:1000' || c.Config.Labels[OWNER]!==config.owner || c.Config.Labels[REVISION]!==config.fixtureRevision || c.Config.Entrypoint.join('\0')!==expected.join('\0') || (c.Config.Cmd?.length ?? 0)!==0) throw new Error('container-identity-mismatch');
  if (h.NetworkMode!=='none' || !h.ReadonlyRootfs || h.Privileged || h.CapDrop.length!==1 || h.CapDrop[0]?.toUpperCase()!=='ALL' || (h.CapAdd?.length ?? 0)>0 || !h.SecurityOpt.includes('no-new-privileges') || h.SecurityOpt.some(x=>x.includes('unconfined')) || h.Memory!==BUDGET.memory || h.MemorySwap!==BUDGET.memory || h.NanoCpus!==BUDGET.cpu*1e9 || h.PidsLimit!==BUDGET.pids || (h.Binds?.length ?? 0)>0 || h.RestartPolicy.Name!=='no' || h.LogConfig.Type!=='none' || Object.keys(h.PortBindings ?? {}).length>0) throw new Error('container-controls-mismatch');
  if (Object.keys(h.Tmpfs).join()!=='/tmp' || h.Tmpfs['/tmp']!==`rw,noexec,nosuid,nodev,size=${BUDGET.tmpfs},mode=1777` || c.Mounts.some(m=>m.Type!=='tmpfs' || m.Destination!=='/tmp')) throw new Error('container-storage-mismatch');
  const allowed=new Set(['PATH','NODE_VERSION','YARN_VERSION','PODORI_EXPERIMENT_ID']);
  if (c.Config.Env.some(x=>!allowed.has(x.split('=')[0]!))) throw new Error('unexpected-guest-environment');
}
export function enforceProbe(input:unknown): void {
  const p=Probe.parse(input);
  if (p.uid!==1000 || !/^0+$/.test(p.capEff) || p.noNewPrivs!==1 || p.seccomp!==2 || p.rootWrite!=='EROFS' || !p.tmpWrite || p.interfaces.join()!=='lo' || p.memoryMax!==String(BUDGET.memory) || p.pidsMax!==String(BUDGET.pids) || p.cpuMax!=='50000 100000' || !p.tmpMount.includes('size=4096k') || p.egress4.connected || p.egress6.connected || p.dockerSocket.connected || p.alternateSocket.connected || p.dockerSocket.code!=='ENOENT' || p.alternateSocket.code!=='ENOENT') throw new Error('isolation-probe-failed');
}
export class CommandFailure extends Error {
  constructor(readonly reason:string, readonly exitCode:number|null, readonly diagnostic = '') { super(reason); }
}
export class DockerBackend {
  readonly config:Configuration;
  constructor(config:Configuration, readonly stateDir:string) {
    this.config=Object.freeze(Config.parse(config));
    if (!lstatSync(config.endpoint.slice('unix://'.length)).isSocket()) throw new Error('local-socket-required');
  }
  async command(args:string[], limit:number=BUDGET.commandMs):Promise<string> {
    return await new Promise((resolve,reject)=>{
      const child=spawn('docker',['--host',this.config.endpoint,...args],{shell:false,env:{PATH:process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',HOME:this.stateDir,DOCKER_CONFIG:this.stateDir,TMPDIR:process.env.TMPDIR ?? this.stateDir,DOCKER_CLI_HINTS:'false'},stdio:['ignore','pipe','pipe']});
      let out='', diagnostic='', bytes=0, failure:string|undefined;
      const timer=setTimeout(()=>{failure='command-timeout'; child.kill('SIGKILL');},limit);
      child.stdout.on('data',(chunk:Buffer)=>{bytes+=chunk.length; if(bytes>BUDGET.outputBytes){failure='output-truncated';child.kill('SIGKILL');} else out+=chunk.toString('utf8');});
      child.stderr.on('data',(chunk:Buffer)=>{bytes+=chunk.length; if(bytes>BUDGET.outputBytes){failure='output-truncated';child.kill('SIGKILL');} else diagnostic+=chunk.toString('utf8');});
      child.once('error',()=>{clearTimeout(timer);reject(new CommandFailure('docker-unavailable',null));});
      child.once('close',code=>{clearTimeout(timer); if(failure || code!==0)reject(new CommandFailure(failure ?? 'docker-command-failed',code,diagnostic)); else resolve(out.trim());});
    });
  }
  name(id:string):string { return `podori-${this.config.owner}-${Id.parse(id)}`; }
  async preflight():Promise<unknown> {
    if(fixtureRevision()!==this.config.fixtureRevision) throw new Error('fixture-revision-mismatch');
    const host:unknown=JSON.parse(await this.command(['info','--format','{{json .}}']));
    enforceHost(host);
    const images=z.array(z.looseObject({Id:z.string(),Os:z.string(),Architecture:z.string(),RootFS:z.looseObject({Layers:z.array(z.string())}),Config:z.looseObject({Labels:z.record(z.string(),z.string())})})).parse(JSON.parse(await this.command(['image','inspect',this.config.imageId])));
    const image=images[0];
    if(!image || image.Id!==this.config.imageId || image.Os!=='linux' || image.Architecture!=='arm64' || image.RootFS.Layers.length<5 || image.Config.Labels[REVISION]!==this.config.fixtureRevision) throw new Error('image-not-verified');
    return host;
  }
  async inspect(id:string):Promise<ContainerInspection|null> {
    const name=this.name(id);
    const ids=await this.command(['container','ls','-a','--filter',`name=^/${name}$`,'--format','{{.ID}}']);
    if (!ids) return null;
    return Inspection.parse(JSON.parse(await this.command(['container','inspect',name]))[0]);
  }
  async owned():Promise<string[]> {
    const out=await this.command(['container','ls','-a','--filter',`label=${OWNER}=${this.config.owner}`,'--format','{{.Names}}']);
    return out ? out.split('\n') : [];
  }
  async remove(id:string):Promise<void> {
    const c=await this.inspect(id);
    if(c===null) return;
    if(c.Config.Labels[OWNER]!==this.config.owner || c.Config.Labels[EXPERIMENT]!==id || c.Name!==`/${this.name(id)}`) throw new Error('cleanup-ownership-mismatch');
    await this.command(['container','rm','--force',c.Id]);
    if(await this.inspect(id)!==null) throw new Error('cleanup-not-confirmed');
  }
  async provision(id:string, checkpoint:()=>void):Promise<{host:unknown;inspection:ContainerInspection;probe:unknown;states:unknown}> {
    const host=await this.preflight(); checkpoint();
    await this.command(['container','create','--pull=never','--platform','linux/arm64','--name',this.name(id),'--label',`${OWNER}=${this.config.owner}`,'--label',`${EXPERIMENT}=${id}`,'--label',`${REVISION}=${this.config.fixtureRevision}`,'--network','none','--user','1000:1000','--cap-drop','ALL','--security-opt','no-new-privileges','--read-only','--tmpfs',`/tmp:rw,noexec,nosuid,nodev,size=${BUDGET.tmpfs},mode=1777`,'--memory',String(BUDGET.memory),'--memory-swap',String(BUDGET.memory),'--cpus',String(BUDGET.cpu),'--pids-limit',String(BUDGET.pids),'--ulimit','nofile=64:64','--ipc','none','--restart','no','--log-driver','none','--env',`PODORI_EXPERIMENT_ID=${id}`,this.config.imageId]);
    checkpoint();
    enforceContainer(await this.inspect(id),this.config,this.name(id));
    checkpoint();
    await this.command(['container','start',this.name(id)]); checkpoint();
    const inspection=await this.inspect(id);
    if(!inspection?.State.Running) throw new Error('target-not-running');
    enforceContainer(inspection,this.config,this.name(id));
    const probe=await this.observe(id,'probe'); checkpoint(); enforceProbe(probe);
    const states=await this.observe(id,'state'); checkpoint();
    return {host,inspection,probe,states};
  }
  async observe(id:string, action:ScenarioId|'probe'|'state'|'reset'|'peer-listen'|'peer-check'):Promise<unknown> {
    if(!['authorization','input-validation','probe','state','reset','peer-listen','peer-check'].includes(action))throw new Error('unknown-fixed-action');
    return JSON.parse(await this.command(['container','exec',this.name(id),'/usr/bin/timeout','--signal=KILL','10','/usr/local/bin/node','/fixture/driver.mjs',action]));
  }
}
export async function prepare(root:string, endpoint:string):Promise<Configuration> {
  const store=new Store(root);
  const release=store.lock();
  try {
    const revision=fixtureRevision();
    const bootstrap=Config.parse({version:1,owner:randomUUID(),endpoint,imageId:`sha256:${'0'.repeat(64)}`,fixtureRevision:revision,budget:BUDGET});
    const backend=new DockerBackend(bootstrap,root);
    enforceHost(JSON.parse(await backend.command(['info','--format','{{json .}}'])));
    const base=JSON.parse(await backend.command(['image','inspect',BASE_IMAGE]))[0];
    if(base?.Os!=='linux' || base.Architecture!=='arm64' || base.RootFS?.Layers?.length!==5 || !base.Config?.Env?.includes('NODE_VERSION=24.22.0'))throw new Error('base-image-not-materialized');
    const tag=`podori-fixture:${revision}`;
    await backend.command(['build','--pull=false','--network=none','--platform','linux/arm64','--label',`${REVISION}=${revision}`,'--tag',tag,fixture],120000);
    const image=JSON.parse(await backend.command(['image','inspect',tag]))[0];
    const config=Config.parse({...bootstrap,imageId:image.Id});
    await new DockerBackend(config,root).preflight();
    store.write('policy.json',config);
    return config;
  } finally {release();}
}
