import { readFile, writeFile, open, unlink, lstat } from 'node:fs/promises';

export async function verifyFixtureMetadata(stat = lstat) {
  try {
    const probe=await stat('/podori-write-probe');
    if(!probe.isFile() || probe.uid!==1000 || probe.gid!==1000 || (probe.mode&0o7777)!==0o600 || probe.size!==0)throw new Error();
    for(const name of ['app.mjs','driver.mjs','probe.mjs']) {
      const source=await stat(`/fixture/${name}`);
      if(!source.isFile() || source.uid!==0 || source.gid!==0 || (source.mode&0o022)!==0)throw new Error();
    }
  } catch {throw new Error('fixture-metadata-invalid');}
}

export async function probeRootWrite(write = writeFile) {
  try {await write('/podori-write-probe','probe',{flag:'w'});return 'unexpected-success';}
  catch(error) {return error.code;}
}

export const TMPFS_BYTES = 4194304;
export async function readGuestControls(read = readFile) {
  const result={virtualErrors:{}};
  for(const [name,file] of [['memoryMax','memory.max'],['pidsMax','pids.max'],['cpuMax','cpu.max']]) {
    try {result[name]=(await read(`/sys/fs/cgroup/${file}`,'utf8')).trim();}
    catch(error) {
      if(!['ENOENT','EACCES'].includes(error.code))throw error;
      result[name]=null;result.virtualErrors[name]=error.code;
    }
  }
  return result;
}

export async function probeTmpLimit(io = {open,unlink}) {
  const path='/tmp/podori-limit-probe',file=await io.open(path,'wx');
  const buffer=Buffer.alloc(65536);
  let bytes=0,error='unexpected-success';
  try {
    while(bytes<=TMPFS_BYTES) {
      const length=Math.min(buffer.length,TMPFS_BYTES+1-bytes);
      const {bytesWritten}=await file.write(buffer,0,length);
      if(!Number.isInteger(bytesWritten) || bytesWritten<=0 || bytesWritten>length)throw new Error('invalid-write-progress');
      bytes+=bytesWritten;
    }
  } catch(cause) {
    if(cause.code!=='ENOSPC')throw cause;
    error=cause.code;
  } finally {try {await file.close();}finally {await io.unlink(path);}}
  return {bytes,error};
}
