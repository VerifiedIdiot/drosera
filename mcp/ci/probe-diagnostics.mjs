// CI-only projection: fixed keys and bounded primitives; no raw evidence.
const invalid = '[invalid]';
const codes = new Set(['EROFS','EACCES','EPERM','ENOENT','ENOSPC','ENETUNREACH','EHOSTUNREACH','ECONNREFUSED','ECONNRESET','ETIMEDOUT','EAFNOSUPPORT','EINVAL','unexpected-success']);
const boolean = value => typeof value === 'boolean' ? value : invalid;
const code = value => typeof value === 'string' && codes.has(value) ? value : invalid;
export function selectProbe(input) {
  const p = input && typeof input === 'object' ? input : {};
  const result = {
    uid:Number.isInteger(p.uid) && p.uid >= 0 && p.uid <= 4294967295 ? p.uid : invalid,
    capEff:typeof p.capEff === 'string' && /^[a-fA-F0-9]{1,16}$/.test(p.capEff) ? p.capEff : invalid,
    rootWrite:code(p.rootWrite),
    tmpWrite:boolean(p.tmpWrite),
    interfaces:Array.isArray(p.interfaces) && p.interfaces.length <= 8 ? p.interfaces.map(value => value === 'lo' ? 'lo' : '[non-loopback]') : [invalid],
  };
  for (const key of ['egress4','egress6','dockerSocket','alternateSocket']) {
    const socket = p[key];
    result[key] = {connected:boolean(socket?.connected)};
    if (socket?.code !== undefined) result[key].code = code(socket.code);
  }
  return result;
}
