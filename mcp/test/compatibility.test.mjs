import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

function documents(root) {
  return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?documents(join(root,entry.name)):entry.name.endsWith('.md')?[join(root,entry.name)]:[]);
}
test('A11: each existing skill remains self-contained without MCP and doubt remains non-executing', () => {
  const names=['podori','podori-egov','podori-doubt','podori-trap'];
  for(const name of names) {
    const root=resolve('..','skills',name), skill=readFileSync(join(root,'SKILL.md'),'utf8');
    assert.match(skill,new RegExp(`^name: ${name}$`,'m'));
    assert.match(skill,/^version: \d+\.\d+\.\d+(?:[-+][\w.-]+)?$/m);
    assert.match(skill,/No other podori skill is required or invoked\./);
    for(const file of documents(root))for(const match of readFileSync(file,'utf8').matchAll(/\]\(([^)]+)\)/g)) {
      const target=match[1].split('#')[0];
      if(target && !/^[a-z]+:/.test(target)) {
        const destination=resolve(dirname(file),target);
        assert.ok(destination.startsWith(root+'/'),`A packaged reference leaves ${name}: ${target}`);
        assert.ok(existsSync(destination),`Missing packaged reference in ${name}: ${target}`);
      }
    }
  }
  const doubt=readFileSync('../skills/podori-doubt/SKILL.md','utf8');
  assert.match(doubt,/Never install, import, build, or execute suspect/);
  assert.match(doubt,/read-only dependency and image inspection/);
});
