// Usage: node test-items45.mjs <index.html>
// Audit items 4 (names) and 5 (baked-in rank badge) on WF48 Screens 6 and 7. PASS/FAIL per assertion.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 6700 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result.result.value;
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const url = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + '#workflow-48'; const KEY = 'nora.wf48.invites.preview.v2';
let pass = 0, fail = 0; const check = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const load = async seed => { await send('Page.navigate', { url }); await sleep(2500); await ev(`localStorage.clear(); ${seed ? `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(seed))});` : ''} 0`); await send('Page.reload'); await sleep(3500); };
const ph = n => `[...document.querySelectorAll('.storyboard .st-phone')][${n - 1}]`;
const click = (n, sel) => ev(`(()=>{const b=${ph(n)}.querySelector(${JSON.stringify(sel)});if(!b)return 'NOT FOUND';if(b.disabled)return 'DISABLED';b.click();return 'ok'})()`);
const FULL = { 7: 'Luka D.', 9: 'Macaulay C.', 1: 'Miguel B.', 3: 'Paul Smith', 5: 'Nora A.' }, FIRST = { 7: 'Luka', 9: 'Macaulay', 1: 'Miguel', 3: 'Paul', 5: 'Nora' };

// pixel scan: screenshot the phone, then count yellow badge pixels inside each reserved seat tile's top-left 34x30 css px region
const badgePixels = async n => {
  await ev(`${ph(n)}.scrollIntoView({inline:'center',block:'start'})`); await sleep(700);
  const info = JSON.parse(await ev(`(()=>{const p=${ph(n)},pr=p.getBoundingClientRect();return JSON.stringify({x:pr.left+scrollX,y:pr.top+scrollY,w:pr.width,h:pr.height,tiles:[...p.querySelectorAll('.wf48-seat')].map(s=>{const r=s.getBoundingClientRect();return {id:s.dataset.wf48Seat,res:s.classList.contains('reserved'),l:r.left-pr.left,t:r.top-pr.top}})})})()`));
  const grab = async () => (await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, clip: { x: info.x, y: info.y, width: info.w, height: info.h, scale: 1 } })).result.data;
  let d = await grab(), ok = false; for (let k = 0; k < 8 && !ok; k++) { await sleep(450); const a = await grab(); ok = a === d; d = a; }
  const counts = JSON.parse(await ev(`(async()=>{const i=new Image();i.src='data:image/png;base64,${d}';await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);const tiles=${JSON.stringify(info.tiles)};const out={};for(const t of tiles){if(!t.res)continue;let nY=0,nO=0;const X0=Math.round(t.l*2),Y0=Math.round(t.t*2);const d=x.getImageData(X0+8,Y0+6,60,54).data;for(let k=0;k<d.length;k+=4){const R=d[k],G=d[k+1],B=d[k+2];if(R>235&&G>170&&G<208&&B<45)nY++;if(R>150&&R>B+70&&G>90&&G<215&&B<60)nO++}out[t.id]={yellow:nY,amber:nO}}return JSON.stringify(out)})()`));
  return counts;
};

console.log('=== ITEM 4: names on seat tiles ===');
await load(null);
for (const scr of [6, 7]) {
  const rows = JSON.parse(await ev(`JSON.stringify([...${ph(scr)}.querySelectorAll('.wf48-seat.reserved')].map(s=>{const b=s.querySelector('b'),r=b.getBoundingClientRect(),t=s.getBoundingClientRect();return {id:Number(s.dataset.wf48Seat),text:b.textContent.trim(),clipped:b.scrollWidth>b.clientWidth+0.5,title:s.title,aria:s.getAttribute('aria-label'),insideTile:r.left>=t.left&&r.right<=t.right,fs:parseFloat(getComputedStyle(b).fontSize),visibleEllipsis:getComputedStyle(b).textOverflow==='ellipsis'&&b.scrollWidth>b.clientWidth}}))`));
  check(`S${scr}: 5 reserved tiles show first names ${Object.values(FIRST).join(', ')}`, rows.length === 5 && rows.every(x => x.text === FIRST[x.id]), rows.map(x => x.text).join(','));
  check(`S${scr}: no name is truncated (no ellipsis) and each name stays inside its tile`, rows.every(x => !x.clipped && x.insideTile), rows.filter(x => x.clipped || !x.insideTile).map(x => x.text).join(','));
  check(`S${scr}: full name kept in tooltip and accessible label ("Seat n, Full Name")`, rows.every(x => x.title === FULL[x.id] && x.aria === `Seat ${x.id}, ${FULL[x.id]}`), rows.map(x => x.aria).join(' | '));
  check(`S${scr}: name font stays at least 14px`, rows.every(x => x.fs >= 14), rows.map(x => x.fs).join(','));
  const others = JSON.parse(await ev(`JSON.stringify([...${ph(scr)}.querySelectorAll('.wf48-seat:not(.reserved) b')].map(b=>b.textContent.trim()))`));
  check(`S${scr}: open seats still read OPEN`, others.length === 5 && others.every(x => x === 'OPEN'), others.join(','));
}
// own seat label
await click(5, '[data-wf48-rsvp="YES"]'); await sleep(300); await click(5, '[data-wf48-choose-seat]'); await sleep(500); await click(6, '[data-wf48-seat="4"]'); await sleep(500);
check('S6: your own selected seat still reads YOU (initials tile)', (await ev(`${ph(6)}.querySelector('.wf48-seat.mine b').textContent.trim()`)) === 'YOU');
await load(null);

console.log('\n=== ITEM 5 (revised): no corner number on occupied seats; baked-in badge/caption cropped out of the photo ===');
for (const scr of [6, 7]) {
  const rows = JSON.parse(await ev(`JSON.stringify([...${ph(scr)}.querySelectorAll('.wf48-seat')].map(s=>{const n=s.querySelector('.wf48-seat-number'),cs=getComputedStyle(n),r=n.getBoundingClientRect();return {id:Number(s.dataset.wf48Seat),res:s.classList.contains('reserved'),shown:cs.display!=='none'&&r.width>0,text:n.textContent.trim(),fs:parseFloat(cs.fontSize),w:r.width}}))`));
  check(`S${scr}: the 5 occupied (photo) tiles show NO corner seat number`, rows.filter(x => x.res).length === 5 && rows.filter(x => x.res).every(x => !x.shown), rows.filter(x => x.res && x.shown).map(x => x.id).join(','));
  check(`S${scr}: the 5 open seats keep their number (2,4,6,8,10) in the original small box (not the large chip)`, rows.filter(x => !x.res).length === 5 && rows.filter(x => !x.res).every(x => x.shown && String(x.id) === x.text && x.w <= 16.5), rows.filter(x => !x.res).map(x => x.text + '@' + x.fs).join(' '));
  check(`S${scr}: occupied tiles still know their seat id (data attribute + accessible label)`, (await ev(`[...${ph(scr)}.querySelectorAll('.wf48-seat.reserved')].every(s=>s.dataset.wf48Seat&&/^Seat \\d+, /.test(s.getAttribute('aria-label')))`)) === true);
  const win = JSON.parse(await ev(`JSON.stringify([...${ph(scr)}.querySelectorAll('.wf48-seat.reserved')].map(s=>{const f=s.querySelector('.wf48-seat-face'),im=s.querySelector('img'),fr=f.getBoundingClientRect();const cs=getComputedStyle(im);const tr=new DOMMatrix(cs.transform);const bw=parseFloat(cs.width),bh=parseFloat(cs.height);const sc=Math.max(bw/im.naturalWidth,bh/im.naturalHeight);const shift=-tr.m41;return {name:s.querySelector('b').textContent.trim(),faceW:+fr.width.toFixed(1),faceH:+fr.height.toFixed(1),leftCropPct:+(100*shift/sc/im.naturalWidth).toFixed(1),visibleBottomPct:+(100*fr.height/(sc*im.naturalHeight)).toFixed(1),coversRight:bw-shift>=fr.width-0.2}}))`));
  check(`S${scr}: photo area is 51 x 49.8 (width unchanged; uses the extra tile height)`, win.every(w => w.faceW === 51 && w.faceH === 49.8), JSON.stringify(win.map(w => [w.faceW, w.faceH])));
  check(`S${scr}: crop hides the badge (left crop >= 26% of the photo; badge ends at ~25%) without shifting past the photo (no empty strip on the right)`, win.every(w => w.leftCropPct >= 26 && w.leftCropPct <= 31 && w.coversRight), win.map(w => `${w.name}:${w.leftCropPct}%`).join(' '));
  check(`S${scr}: crop hides the sign/caption (visible window ends at <= 70% of the photo; they start at ~71%)`, win.every(w => w.visibleBottomPct <= 70), win.map(w => `${w.name}:${w.visibleBottomPct}%`).join(' '));
  const px = await badgePixels(scr); const worst = Object.entries(px).map(([k, v]) => `${k}:${v.yellow}`).join(' ');
  check(`S${scr}: ZERO yellow badge pixels in the badge corner of all 5 photos (pixel scan of the rendered screen, tile x 4-34, y 3-30)`, Object.values(px).every(v => v.yellow === 0), worst);
}
console.log('\n=== Regression: tile geometry and layout ===');
for (const scr of [6, 7]) {
  const g = JSON.parse(await ev(`JSON.stringify({tiles:[...${ph(scr)}.querySelectorAll('.wf48-seat')].map(s=>{const r=s.getBoundingClientRect();return [+r.width.toFixed(1),+r.height.toFixed(1)]}),face:[...${ph(scr)}.querySelectorAll('.wf48-seat-face')].map(f=>{const r=f.getBoundingClientRect();return [+r.width.toFixed(1),+r.height.toFixed(1)]}),nameInside:[...${ph(scr)}.querySelectorAll('.wf48-seat')].every(s=>{const b=s.querySelector('b').getBoundingClientRect(),t=s.getBoundingClientRect();return b.bottom<=t.bottom+0.5&&b.top>=s.querySelector('.wf48-seat-face').getBoundingClientRect().bottom-0.5}),scroll:(()=>{const c=${ph(scr)}.querySelector('.ux-content');return c.scrollHeight-c.clientHeight})()})`));
  check(`S${scr}: all 10 tiles still 68 x 74.8; all photo areas 51 x 49.8; names sit below the photos and inside the tiles; no scrolling`, g.tiles.every(t => t[0] === 68 && t[1] === 74.8) && g.face.every(f => f[0] === 51 && f[1] === 49.8) && g.nameInside && g.scroll === 0, JSON.stringify({ nameInside: g.nameInside, scroll: g.scroll }));
}console.log('\n=== JavaScript errors ==='); check('no uncaught JavaScript exceptions', jsErrors.length === 0, jsErrors.join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed`); ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
