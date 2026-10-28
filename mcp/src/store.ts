import { constants, closeSync, existsSync, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const LIMIT = 1_048_576;
export class Store {
  readonly root: string;
  constructor(root: string, create = false) {
    if (!isAbsolute(root)) throw new Error('absolute-state-directory-required');
    if (create && !existsSync(root)) mkdirSync(root, { mode: 0o700 });
    this.root = resolve(root);
    const stat = lstatSync(this.root);
    if (realpathSync(this.root) !== this.root || !stat.isDirectory() || stat.uid !== process.getuid?.() || (stat.mode & 0o077) !== 0) throw new Error('private-state-directory-required');
  }
  private path(name: string): string {
    if (!/^[a-z0-9][a-z0-9.-]{0,100}$/.test(name) || name.includes('..')) throw new Error('invalid-state-name');
    return join(this.root, name);
  }
  read(name: string): unknown {
    const fd = openSync(this.path(name), constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = fstatSync(fd);
      if (!stat.isFile() || stat.nlink !== 1 || stat.uid !== process.getuid?.() || (stat.mode & 0o077) !== 0 || stat.size > LIMIT) throw new Error('unsafe-state-file');
      return JSON.parse(readFileSync(fd, 'utf8')) as unknown;
    } finally { closeSync(fd); }
  }
  write(name: string, data: unknown): void {
    const target = this.path(name);
    if (existsSync(target) || (() => { try { lstatSync(target); return true; } catch { return false; } })()) this.read(name);
    const value = JSON.stringify(data);
    if (Buffer.byteLength(value) > LIMIT) throw new Error('state-size-limit');
    const temporary = this.path(`pending-${randomUUID()}.json`);
    const fd = openSync(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    try { writeFileSync(fd, value); fsyncSync(fd); } finally { closeSync(fd); }
    renameSync(temporary, target);
    const dir = openSync(this.root, constants.O_RDONLY);
    try { fsyncSync(dir); } finally { closeSync(dir); }
  }
  names(prefix: string): string[] {
    return readdirSync(this.root).filter(x => x.startsWith(prefix) && /^[a-z0-9.-]+\.json$/.test(x)).sort();
  }
  lock(): () => void {
    const file = this.path('server.lock');
    const guard = this.path('server.guard');
    let guardFd: number;
    try { guardFd = openSync(guard, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600); }
    catch { throw new Error('controller-lock-busy'); }
    try {
      writeFileSync(guardFd, JSON.stringify({ pid: process.pid })); fsyncSync(guardFd);
      if (existsSync(file)) {
        const previous = this.read('server.lock') as { pid?: unknown };
        if (!Number.isSafeInteger(previous.pid) || Number(previous.pid) <= 1) throw new Error('invalid-controller-lock');
        try { process.kill(Number(previous.pid), 0); throw new Error('controller-active'); }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
        unlinkSync(file);
      }
      const nonce = randomUUID();
      const fd = openSync(file, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
      try { writeFileSync(fd, JSON.stringify({ pid: process.pid, nonce })); fsyncSync(fd); } finally { closeSync(fd); }
      return () => {
        if (existsSync(file) && (this.read('server.lock') as { nonce: string }).nonce === nonce) unlinkSync(file);
      };
    } finally { closeSync(guardFd); unlinkSync(guard); }
  }
}
