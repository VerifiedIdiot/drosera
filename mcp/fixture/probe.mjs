import { readFile, open, unlink } from 'node:fs/promises';

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
