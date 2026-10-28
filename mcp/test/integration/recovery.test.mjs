import test from 'node:test';
import assert from 'node:assert/strict';
import { prepared, save, pause, waitUntil } from '../helpers.mjs';
import { approval, connectClient, ready, access } from '../mcp-client.mjs';
import { DockerBackend } from '../../dist/docker.js';

const dead=pid=>{try{process.kill(pid,0);return false;}catch(error){return error.code==='ESRCH';}};

test('A9: an actual target crash is reaped without removal of its sibling', async () => {
  const {dir,config}=await prepared('target-crash');
  const grants=[approval(dir),approval(dir)];
  const {client,call}=await connectClient(dir),backend=new DockerBackend(config,dir);
  try {
    const a=access(await call('create',grants[0])),b=access(await call('create',grants[1]));
    await Promise.all([ready(call,a),ready(call,b)]);
    const target=await backend.inspect(a.experimentId);
    await backend.command(['container','kill','--signal','KILL',target.Id]);
    await pause(2000);
    const report=await call('evidence',a);save('target-crash-evidence',report);
    assert.equal(report.status,'error','An idle target crash must not remain ready');
    assert.equal(report.reason,'target-exited');
    assert.equal(report.termination.before.ExitCode,137);
    assert.equal(await backend.inspect(a.experimentId),null);
    assert.equal((await backend.inspect(b.experimentId)).State.Running,true);
  } finally {await client.close();}
  assert.deepEqual(await backend.owned(),[]);
});

test('A9: SIGKILL and restart recover actual resources and invalidate an incomplete attempt', async () => {
  const {dir,config}=await prepared('server-restart');
  const grant=approval(dir);
  let connection=await connectClient(dir);
  const backend=new DockerBackend(config,dir);
  let credentials;
  try {
    credentials=access(await connection.call('create',grant));await ready(connection.call,credentials);
    await connection.call('run',{...credentials,scenario:'authorization'});
    const pid=connection.transport.pid;
    process.kill(pid,'SIGKILL');await waitUntil(()=>dead(pid));
    await connection.client.close();
    const before=await backend.inspect(credentials.experimentId);save('restart-before',before);
    assert.ok(before);
    connection=await connectClient(dir);
    const report=await connection.call('evidence',credentials);save('restart-after',report);
    assert.equal(report.status,'recovered');assert.equal(report.reason,'server-restart');
    assert.equal(report.attempts[0].state,'unverified');
    assert.equal(report.attempts[0].reason,'server-restart');
    assert.equal(report.attempts[0].verdict.fixVerified,false);
    assert.equal(await backend.inspect(credentials.experimentId),null);
    await assert.rejects(connection.call('run',{...credentials,scenario:'authorization'}));
    await connection.call('dispose',credentials);
  } finally {
    await connection.client.close();
    if(credentials)await backend.remove(credentials.experimentId);
  }
  assert.deepEqual(await backend.owned(),[]);
});
