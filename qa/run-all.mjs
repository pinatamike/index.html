// Usage: node qa/run-all.mjs <index.html>   -- runs every suite in order and prints a one-screen summary
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const html = process.argv[2] || 'index.html'; const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const suites = [['test-nav.mjs', [html, '71']], ['test-wf48sweep.mjs', [html]], ['test-task002.mjs', [html]], ['test-fixes123.mjs', [html]], ['test-items45.mjs', [html]], ['test-s1align.mjs', [html]]];
const out = [];
for (const [s, a] of suites) { const r = spawnSync(process.execPath, [path.join(here, s), ...a], { encoding: 'utf8', timeout: 3600000 }); const line = (r.stdout || '').split('\n').filter(l => /SUMMARY/.test(l)).pop() || ('NO SUMMARY (exit ' + r.status + ')'); out.push(`${r.status === 0 ? 'PASS' : 'FAIL'}  ${s.padEnd(22)} ${line.trim()}`); console.log(out[out.length - 1]); }
process.exit(out.some(l => l.startsWith('FAIL')) ? 1 : 0);