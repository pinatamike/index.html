// Usage: node qa.mjs <html-path> <workflow-number> <out-dir>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const [htmlPath, wf = '48', outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`,
  `--user-data-dir=${prof}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50; i++) {
  try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); target = l.find(t => t.type === 'page'); if (target) break; } catch {}
  await sleep(300);
}
if (!target) { edge.kill(); throw new Error('Edge CDP did not start'); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result)); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront');
await send('Emulation.setDeviceMetricsOverride', { width: Number(process.env.QA_W||390), height: Number(process.env.QA_H||844), deviceScaleFactor: 2, mobile: true });
const url = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + `#workflow-${wf}`;
await send('Page.navigate', { url });
await sleep(2200); await send('Page.reload'); await sleep(4200);   // reload: the navigation layer must start from a clean load

const sel = process.env.QA_SEL || `.storyboard .st-phone`;
const info = await ev(`(() => {
  const ph = [...document.querySelectorAll('${sel}')];
  return ph.map((p, i) => {
    const r = p.getBoundingClientRect();
    const content = p.querySelector('.ux-content') || p;
    const bad = [];
    p.querySelectorAll('*').forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) return;
      if (b.right > r.right + 1 || b.left < r.left - 1 || b.bottom > r.bottom + 1) bad.push((el.className && el.className.toString().slice(0, 40)) || el.tagName);
    });
    return { i: i + 1, w: Math.round(r.width), h: Math.round(r.height), contentScroll: content.scrollHeight - content.clientHeight, overflowEls: [...new Set(bad)].slice(0, 6), title: (p.querySelector('.ux-title,.screen-title,h2,h3') || {}).textContent || '' };
  });
})()`);
console.log(JSON.stringify(info, null, 1));

for (const p of info) {
  await ev(`document.querySelectorAll('${sel}')[${p.i - 1}].scrollIntoView({inline:'center',block:'start'})`);
  await sleep(700);
  const r = await ev(`(() => { const b = document.querySelectorAll('${sel}')[${p.i - 1}].getBoundingClientRect(); return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}; })()`);
  // Stable capture: take two shots 450ms apart and accept only when they are identical (guards against the occasional tiled/partially-painted CDP frame).
  const grab = async () => (await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } })).data;
  let data = await grab(), stable = false;
  for (let k = 0; k < 8 && !stable; k++) { await sleep(450); const again = await grab(); if (again === data) stable = true; else data = again; }
  if (!stable) console.log(`WARNING: screen ${p.i} never produced two identical captures (UNSTABLE)`);
  fs.writeFileSync(path.join(outDir, `wf${wf}-screen${p.i}.png`), Buffer.from(data, 'base64'));
}
ws.close(); edge.kill();
console.log('done', info.length, 'screens ->', outDir);

