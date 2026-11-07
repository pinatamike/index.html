// Usage: node test-s1align.mjs <index.html>  -- WF48 Screen 1 column alignment checks (PASS/FAIL)
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 5900 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result.result.value;
let pass = 0, fail = 0; const check = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const url = wf => 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + `#workflow-${wf}`;
const ph = n => `[...document.querySelectorAll('.storyboard .st-phone')][${n - 1}]`;
const rows = pi => ev(`(()=>{const p=${ph(pi)},pr=p.getBoundingClientRect();const b=el=>{const r=el.getBoundingClientRect();return {l:+(r.left-pr.left).toFixed(2),r:+(r.right-pr.left).toFixed(2),w:+r.width.toFixed(2),t:+(r.top-pr.top).toFixed(2),h:+r.height.toFixed(2)}};const g=s=>[...p.querySelectorAll(s)].map(e=>({...b(e),lab:(e.querySelector('.wf2-label')||{}).textContent}));const c=p.querySelector('.ux-content');return JSON.stringify({r1:g('.wf48-name-inv>.wf2-tile'),r2:g('.wf2-datetime>.wf2-tile'),below:[...p.querySelectorAll('.wf2-one>*')].length,scroll:c.scrollHeight-c.clientHeight})})()`).then(JSON.parse);
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable');
for (const W of [340, 375, 390, 430]) {
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: url(48) }); await sleep(2500); await ev('localStorage.clear();0'); await send('Page.reload'); await sleep(3500);
  const o = await rows(1);
  check(`@${W}px: Date is exactly as wide as Game Name, and Start Time exactly as wide as Invitations`, o.r1.length === 2 && o.r2.length === 2 && Math.abs(o.r1[0].w - o.r2[0].w) < 0.05 && Math.abs(o.r1[1].w - o.r2[1].w) < 0.05, `${o.r1[0].w}/${o.r2[0].w} and ${o.r1[1].w}/${o.r2[1].w}`);
  check(`@${W}px: left edges, right edges and the column divider line up (${o.r1[0].l}, ${o.r1[1].l}, ${o.r1[1].r})`, o.r1[0].l === o.r2[0].l && o.r1[1].l === o.r2[1].l && o.r1[1].r === o.r2[1].r && o.r1[0].r === o.r2[0].r);
  check(`@${W}px: the gap between the two tiles is the same in both rows (5px)`, Math.abs((o.r1[1].l - o.r1[0].r) - (o.r2[1].l - o.r2[0].r)) < 0.05 && Math.abs(o.r2[1].l - o.r2[0].r - 5) < 0.05, `${(o.r1[1].l - o.r1[0].r).toFixed(2)} vs ${(o.r2[1].l - o.r2[0].r).toFixed(2)}`);
  if (W === 390) {
    check('heights and vertical positions identical to the previous build (row 1: top 70, h 70.39; row 2: top 145.39, h 77.38) and no scrolling', o.r1.every(x => x.t === 70 && x.h === 70.39) && o.r2.every(x => x.t === 145.39 && x.h === 77.38) && o.scroll === 0, JSON.stringify({ r1: o.r1.map(x => [x.t, x.h]), r2: o.r2.map(x => [x.t, x.h]), scroll: o.scroll }));
    // longest realistic values still fit inside the tiles
    const fit = await ev(`(()=>{const p=${ph(1)};const d=p.querySelector('[data-wf2-date]'),tm=p.querySelector('[data-wf2-time]');const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};set(d,'12/31/2026');set(tm,'10:30 PM');return JSON.stringify({date:d.scrollWidth<=d.clientWidth+1,dateW:d.clientWidth,time:tm.scrollWidth<=tm.clientWidth+1,timeW:tm.clientWidth,dv:d.value,tv:tm.value})})()`).then(JSON.parse);
    check('longest date (12/31/2026) and time (10:30 PM) fit inside their tiles without clipping', fit.date && fit.time, JSON.stringify(fit));
    // flows still work
    await ev(`(()=>{const p=${ph(1)};p.querySelector('[data-wf2-date]').value='11/09/2026';p.querySelector('[data-wf2-time]').value='8:00 PM';return 0})()`);
    const r1 = await ev(`(()=>{const b=${ph(1)}.querySelector('[data-wf48-next=schedule]');b.click();return (${ph(1)}.querySelector('.wf2-status')||{}).textContent})()`); await sleep(500);
    check('SCHEDULE (invitations NO) still works with the edited date/time', /SCHEDULED/.test(await ev(`(${ph(1)}.querySelector('.wf2-status')||{}).textContent||''`)), await ev(`(${ph(1)}.querySelector('.wf2-status')||{}).textContent||''`));
    await ev(`(()=>{const p=${ph(1)};p.querySelector('[data-wf2-time]').value='25:99';return 0})()`); await ev(`${ph(1)}.querySelector('[data-wf48-next=schedule]').click()`); await sleep(400);
    check('invalid time still shows its validation message', /time as/i.test(await ev(`(${ph(1)}.querySelector('.wf2-status')||{}).textContent||''`)), await ev(`(${ph(1)}.querySelector('.wf2-status')||{}).textContent||''`));
  }
}
console.log('
=== WF02 (bridge; was the protected form before batch 1) ===');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: url(2) }); await sleep(2500); await send('Page.reload'); await sleep(3500);
const w2 = await rows(1);
check('WF02 is now the no-game bridge (batch 1): the schedule form lives only in WF48, so there is no Date / Start Time row in WF02', w2.r2.length === 0, JSON.stringify(w2.r2));
check('no uncaught JavaScript exceptions', jsErrors.length === 0, jsErrors.join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed`); ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
