import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DockerBackend } from '../dist/docker.js';
import { prepared } from '../test/helpers.mjs';
import { selectProbe } from './probe-diagnostics.mjs';

// Observe the real fixture before the unchanged backend validates it.
class ObservedBackend extends DockerBackend {
  async observe(id, action) {
    const observation = await super.observe(id, action);
    if (action === 'probe') console.log(JSON.stringify({check:'native-isolation-probe',probe:selectProbe(observation)}));
    return observation;
  }
}

async function smoke() {
  const {dir,config} = await prepared('native-isolation-smoke');
  const backend = new ObservedBackend(config,dir);
  const id = randomUUID();
  try {
    await backend.provision(id, () => {});
  } finally {
    // Exact owned resource only; remove validates ownership and disappearance.
    await backend.remove(id);
    assert.equal(await backend.inspect(id), null);
    assert.deepEqual(await backend.owned(), []);
  }
}

try {
  await smoke();
  console.log(JSON.stringify({check:'native-isolation-smoke',status:'passed'}));
} catch {
  // Do not emit arbitrary error diagnostics, command output, IDs, or paths.
  console.error(JSON.stringify({check:'native-isolation-smoke',status:'failed'}));
  process.exitCode = 1;
}
