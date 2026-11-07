// Usage: node qa/test-batch1.mjs index.html      -- follow-up batch 1 regression tests (PASS/FAIL per rule)
// Drawer single close, LIVE GAME rename + emphasis, WF2 bridge, WF3 cashbox, icons, "posted" wording, tagline,
// WF4/WF55 photo tile, selector (bottom-sheet) pattern, WF6 WON/LOST sizing.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 6100 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) return 'EXC:' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text); return r.result.value; };
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const base = 'file:///' + path.resolve(htmlPath).split(String.fromCharCode(92)).join('/');
await send('Page.navigate', { url: base + '#workflow-1' }); await sleep(2500); await send('Page.reload'); await sleep(4200);
let pass = 0, fail = 0; const fails = [];
const check = (n, ok, d = '') => { ok ? pass++ : (fail++, fails.push(n)); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const go = async w => { await ev(`location.hash='workflow-${w}'`); for (let k = 0; k < 20; k++) { await sleep(500); const n = await ev(`document.querySelectorAll('.storyboard .stage .phone').length`); if (n > 0 && await ev(`!!document.querySelector('.storyboard .stage .ux-bottom, .storyboard .stage .ux-hamb')`)) break; } await sleep(900); };
const S = i => `document.querySelectorAll('.storyboard .stage')[${i}]`;
const J = async x => { const r = await ev(`JSON.stringify((()=>{${x}})())`); return typeof r === 'string' && r.startsWith('EXC:') ? { exc: r } : JSON.parse(r); };
const vis = `const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};`;

// ---- 1. drawer: exactly one close control, on every screen where the drawer appears ----
const WFS = [1, 3, 4, 5, 6, 7, 8, 20, 26, 48, 55, 60, 67, 69];
let drawers = 0, badClose = [];
for (const w of WFS) {
  await go(w);
  const n = await ev(`document.querySelectorAll('.storyboard .stage').length`);
  for (let i = 0; i < n; i++) {
    const r = await J(`${vis}const st=${S(i)},ph=st.querySelector('.phone'),h=ph&&ph.querySelector('.ux-hamb');if(!h)return {skip:1};const before=[...ph.querySelectorAll('.ux-close')].filter(vis).length;h.click();const dr=ph.querySelector('.nn-drawer');if(!dr)return {nodrawer:1};const open=[...ph.querySelectorAll('.ux-close,.nn-x')].filter(vis).length;const x=dr.querySelector('.nn-x');x.click();const after=[...ph.querySelectorAll('.ux-close')].filter(vis).length;return {open,closed:!ph.querySelector('.nn-drawer'),after,before}`);
    if (r.skip) continue; drawers++;
    if (r.nodrawer || r.open !== 1 || !r.closed || r.after !== r.before) badClose.push(`wf${w}/s${i + 1}:${JSON.stringify(r)}`);
  }
}
check(`1. drawer shows exactly one close control (and the header X returns after closing) - ${drawers} drawers opened across ${WFS.length} workflows`, drawers > 40 && badClose.length === 0, badClose.slice(0, 4).join(' | '));

// ---- 2. LIVE GAME row ----
await go(3);
const d2 = await J(`const st=${S(2)},ph=st.querySelector('.phone');ph.querySelector('.ux-hamb').click();const rows=[...ph.querySelectorAll('.nn-list .nn-sh')];const fs=rows.map(b=>parseFloat(getComputedStyle(b.querySelector('span')).fontSize));const live=rows[0];return {labels:rows.map(b=>b.textContent.trim()),fs,bg:getComputedStyle(live).backgroundImage,bg2:getComputedStyle(rows[1]).backgroundColor,h:rows.map(b=>Math.round(b.getBoundingClientRect().height))}`);
check('2a. drawer tabs are LIVE GAME, Players, Team, Schedule, Reports, Settings', d2.labels && d2.labels.join() === 'LIVE GAME,Players,Team,Schedule,Reports,Settings', (d2.labels || []).join());
check('2b. LIVE GAME label is ~30% larger than the other five (1.25x - 1.35x)', d2.fs && d2.fs.slice(1).every(x => x === d2.fs[1]) && d2.fs[0] / d2.fs[1] >= 1.25 && d2.fs[0] / d2.fs[1] <= 1.35, (d2.fs || []).join('/'));
check('2c. LIVE GAME row has its own distinct background (gradient) and is taller', /gradient/.test(d2.bg || '') && d2.h[0] > d2.h[1], `${d2.bg} h=${(d2.h || []).join('/')}`);

// ---- 3. no LIVE SESSION header anywhere; tagline; posted wording (all workflows) ----
const sweep = { liveSessionHeads: [], tagline: [], recorded: [] };
for (let w = 1; w <= 71; w++) {
  await go(w);
  const r = await J(`return [...document.querySelectorAll('.storyboard .stage')].map((st,i)=>{const p=st.querySelector('.phone');if(!p)return null;const head=((p.querySelector('.ux-head')||{}).innerText||'');const tx=p.innerText||'';return {i,ls:/LIVE SESSION/.test(head),tg:/PRIVATE GAME MANAGER/i.test(tx),rec:/(successfully )?recorded by nora/i.test(tx)}})`);
  (r || []).forEach(s => { if (!s) return; if (s.ls) sweep.liveSessionHeads.push(`wf${w}/s${s.i + 1}`); if (s.tg) sweep.tagline.push(`wf${w}/s${s.i + 1}`); if (s.rec) sweep.recorded.push(`wf${w}/s${s.i + 1}`); });
}
check('3a. no header anywhere still says LIVE SESSION (all 71 workflows)', sweep.liveSessionHeads.length === 0, sweep.liveSessionHeads.slice(0, 6).join(', '));
check('3b. old tagline "YOUR PRIVATE GAME MANAGER" appears nowhere (all 71 workflows)', sweep.tagline.length === 0, sweep.tagline.slice(0, 6).join(', '));
check('3c. no posting confirmation says "recorded by Nora" (all 71 workflows)', sweep.recorded.length === 0, sweep.recorded.slice(0, 6).join(', '));

// ---- 4. WF2 bridge into WF48 ----
await go(2);
const w2 = await J(`const st=${S(0)},ph=st.querySelector('.phone');const b=ph.querySelector('.b1-bridge');return {n:document.querySelectorAll('.storyboard .stage').length,text:b?b.innerText.replace(/\\s+/g,' '):'',route:[...ph.querySelectorAll('.b1-bridge-actions [data-rn-route]')].map(x=>x.dataset.rnRoute),form:!!ph.querySelector('.wf2-one,[data-wf2-commit]'),head:(ph.querySelector('.ux-head')||{}).innerText}`);
check('4a. WF2 is one screen with the "no live game" entry (no duplicated schedule form)', w2.n === 1 && /NO LIVE GAME YET/.test(w2.text) && !w2.form, w2.text.slice(0, 80));
check('4b. WF2 primary action routes to WF48 (existing scheduling flow)', (w2.route || []).includes('48:0'), (w2.route || []).join());
await ev(`${S(0)}.querySelector('.b1-bridge-actions .primary').click()`); await sleep(2200);
const after = await J(`const h=location.hash;const st=document.querySelectorAll('.storyboard .stage');return {h,n:st.length,form:!!st[0].querySelector('.wf48-schedule'),ones:document.querySelectorAll('.wf48-schedule').length}`);
check('4c. tapping it opens WF48 Screen 1 (the shared schedule form with SCHEDULE / START NOW)', /workflow-48/.test(after.h) && after.n === 7 && after.form, JSON.stringify(after));
await go(48);
const f48 = await J(`const p=${S(0)}.querySelector('.phone');return [...p.querySelectorAll('.wf2-actions button')].map(b=>b.textContent.trim())`);
check('4d. WF48 Screen 1 still offers CANCEL / SCHEDULE / START NOW', f48.join() === 'CANCEL,SCHEDULE,START NOW', f48.join());

// ---- 5. WF3 screen 3: cashbox tile fully visible; amount selector; sheet pick ----
await go(3);
const w3 = await J(`${vis}const ph=${S(2)}.querySelector('.phone');const card=ph.querySelector('.screen-card'),pay=ph.querySelector('.rebuy-payment-choice');const cr=card.getBoundingClientRect(),pr=pay.getBoundingClientRect();return {payBottom:pr.bottom,cardBottom:cr.bottom,chips:[...ph.querySelectorAll('[data-rn-route^="amount:"]')].filter(vis).length,tile:!!ph.querySelector('.b1-seltile[data-b1="amount"]'),ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`);
check('5a. WF3 Screen 3: whole CASHBOX tile (including bottom frame) sits inside its card', w3.payBottom <= w3.cardBottom - 1, `tile bottom ${w3.payBottom.toFixed(1)} card bottom ${w3.cardBottom.toFixed(1)}`);
check('5b. WF3 Screen 3: amount chips replaced by one selector tile; no scrolling', w3.chips === 0 && w3.tile && w3.ovf <= 2, JSON.stringify(w3));
await ev(`${S(2)}.querySelector('.b1-seltile[data-b1="amount"]').click()`); await sleep(400);
const sh = await J(`const ph=${S(2)}.querySelector('.phone');const o=[...ph.querySelectorAll('.b1-sheet .b1-opt')].map(b=>b.innerText.replace(/\\s+/g,' ').trim());const r=ph.getBoundingClientRect(),w=ph.querySelector('.b1-sheet-wrap').getBoundingClientRect();return {o,inside:Math.abs(w.left-r.left)<=4&&Math.abs(w.right-r.right)<=4&&w.width>r.width-10}`);
check('5c. tapping the selector opens a sheet with 500,000 / 1,000,000 / 2,000,000 / CUSTOM, inside the phone', sh.o && sh.o.length === 4 && /500,000/.test(sh.o[0]) && /CUSTOM/.test(sh.o[3]) && sh.inside, JSON.stringify(sh));
await ev(`${S(2)}.querySelectorAll('.b1-sheet .b1-opt')[1].click()`); await sleep(600);
const am = await J(`const ph=${S(2)}.querySelector('.phone');return {t:ph.querySelector('.b1-seltile[data-b1="amount"]').innerText.replace(/\\s+/g,' '),sheet:!!ph.querySelector('.b1-sheet-wrap')}`);
check('5d. choosing 1,000,000 updates the amount and closes the sheet', /1,000,000/.test(am.t) && !am.sheet, JSON.stringify(am));

// ---- 6. roster icons ----
const iconProbe = `${vis}const tg=document.querySelector.bind(document);const st=[...document.querySelectorAll('.storyboard .stage')].find(s=>s.querySelector('.seat-roster-toolbar'));if(!st)return {none:1};const a=st.querySelector('.seat-roster-add-toggle'),s=st.querySelector('.seat-roster-search-toggle'),ra=a.getBoundingClientRect(),rs=s.getBoundingClientRect();const ia=getComputedStyle(a.querySelector('.roster-icon-center')),is=getComputedStyle(s.querySelector('.roster-icon-center'));return {aw:ra.width,ah:ra.height,sw:rs.width,sh:rs.height,aimg:/svg/.test(ia.backgroundImage),simg:/svg/.test(is.backgroundImage),asz:ia.backgroundSize,vis:vis(a)&&vis(s)}`;
for (const w of [3, 4, 19, 54, 55]) { await go(w); const r = await J(iconProbe); check(`6. WF${w}: add-player and search icons are larger, vector and visible (>=50x44 tiles, 32px glyph)`, !r.none && r.aw >= 50 && r.ah >= 44 && r.sw >= 50 && r.aimg && r.simg && r.vis, JSON.stringify(r)); }

// ---- 7. confirmations: no brand tile, thumbnail, posted ----
for (const [w, i, who] of [[3, 3, 'Rafa'], [4, 3, 'Sofia Alvarez'], [5, 3, 'Diego Restrepo']]) {
  await go(w); const r = await J(`const ph=${S(i)}.querySelector('.phone');const th=ph.querySelector('.b1-thumb');const sm=ph.querySelector('.nora-confirm-summary');return {brand:!!ph.querySelector('.nora-confirm-brand'),thumb:!!th,tw:th?th.getBoundingClientRect().width:0,name:(sm.querySelector('strong')||{}).textContent,posted:/Successfully posted by Nora/.test(ph.innerText),over:th&&sm?th.getBoundingClientRect().bottom<=sm.getBoundingClientRect().bottom:false,ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`);
  check(`7. WF${w} Screen ${i + 1}: brand tile removed, ${who} thumbnail shown, "Successfully posted by Nora", no scroll`, !r.brand && r.thumb && r.tw > 40 && r.name === who && r.posted && r.over && r.ovf <= 2, JSON.stringify(r)); }

// ---- 8. photo tile pattern (WF4 s3, WF55 s2) ----
for (const [w, i, av, ic] of [[4, 2, '.np4-avatar', '.np4-photo-actions label'], [55, 1, '.crm-new-tile .person-face', '.crm-new-tile .crm-photo-btn']]) {
  await go(w); const r = await J(`const ph=${S(i)}.querySelector('.phone');const a=ph.querySelector('${av}').getBoundingClientRect();const l=[...ph.querySelectorAll('${ic}')].map(e=>e.getBoundingClientRect());return {n:l.length,left:l[0]?l[0].left-a.left:null,bottom:l[0]?a.bottom-l[0].bottom:null,w:l[0]?l[0].width:0,h:l[0]?l[0].height:0,right2:l[1]?(l[1].right<=a.right):false}`);
  check(`8. WF${w} photo tile: camera + upload sit at the bottom-left of the photo, 30px (+10%)`, r.n === 2 && r.left >= 0 && r.left <= 16 && r.bottom >= 0 && r.bottom <= 16 && Math.abs(r.w - 30) <= 1 && r.right2, JSON.stringify(r)); }
await go(4); const np = await J(`const ph=${S(2)}.querySelector('.phone');const sp=ph.querySelector('.np4-person-details>span');return {label:sp?getComputedStyle(sp).display:'none',txt:sp?sp.textContent:'',phoneOvf:(()=>{const p=ph.querySelector('.np4-phone-number');return p.scrollWidth-p.clientWidth})()}`);
check('8b. WF4 Screen 3 details follow the WF6 layout (name, SEAT, PHONE label, number) with no overflow', np.label === 'block' && np.txt === 'PHONE' && np.phoneOvf <= 1, JSON.stringify(np));

// ---- 9. seat / table selectors ----
await go(7);
const m3 = await J(`${vis}const ph=${S(2)}.querySelector('.phone');return {tiles:ph.querySelectorAll('.b1-pick').length,rawVisible:[...ph.querySelectorAll('.move7-seats>*')].filter(vis).length,txt:(ph.querySelector('.b1-pick')||{innerText:''}).innerText.replace(/\\s+/g,' ')}`);
check('9a. WF7 Move to Open Seat: seat tiles replaced by one selector', m3.tiles === 1 && m3.rawVisible === 0, JSON.stringify(m3));
await ev(`${S(2)}.querySelector('.b1-pick').click()`); await sleep(400); await ev(`${S(2)}.querySelectorAll('.b1-sheet .b1-opt')[1].click()`); await sleep(700);
const m3b = await J(`const ph=${S(2)}.querySelector('.phone');return {txt:ph.querySelector('.b1-pick').innerText.replace(/\\s+/g,' '),sel:[...ph.querySelectorAll('.move7-seats>*')].map(e=>/\\bselected\\b/.test(e.className))}`);
check('9b. choosing seat 10 updates the tile and the underlying selection', /SEAT 10/.test(m3b.txt) && m3b.sel.join() === 'false,true', JSON.stringify(m3b));
const m4 = await J(`const ph=${S(3)}.querySelector('.phone');const pn=ph.querySelector('.move7-panel').getBoundingClientRect(),rt=ph.querySelector('.move7-route').getBoundingClientRect(),cf=ph.querySelector('.move7-confirm').getBoundingClientRect();return {tiles:ph.querySelectorAll('.b1-pick').length,routeBottom:rt.bottom,panelBottom:pn.bottom,confirmTop:cf.top}`);
check('9c. WF7 Move between Tables: two selectors; FROM/TO summary no longer spills over CONFIRM MOVE', m4.tiles === 2 && m4.routeBottom <= m4.panelBottom && m4.routeBottom <= m4.confirmTop, JSON.stringify(m4));
for (const [w, i, n] of [[5, 2, 'WF5 rebuy'], [4, 2, 'WF4 add player'], [8, 2, 'WF8 wait-list seat'], [7, 4, 'WF7 swap seats'], [7, 5, 'WF7 swap tables']]) { await go(w); const r = await J(`const ph=${S(i)}.querySelector('.phone');return {tiles:ph.querySelectorAll('.b1-seltile').length,ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`); check(`9d. ${n}: option tiles replaced by selector tile(s), no scrolling`, r.tiles >= 1 && r.ovf <= 2, JSON.stringify(r)); }

// ---- 10. WF6 WON / LOST ----
await go(6);
const w6 = await J(`const q=(i,sel)=>{const e=${'document.querySelectorAll(\'.storyboard .stage\')'}[i].querySelector(sel);return e?{t:e.textContent.trim(),fs:parseFloat(getComputedStyle(e).fontSize)}:null};return {s3:q(2,'.co6-wl'),s4:q(3,'.co6-done-detail>.co6-done-win>span'),s5:q(4,'.co6-done-detail>.co6-done-win>span'),s6:q(5,'.co6-done-detail>.co6-done-win>span'),s7:q(6,'.co6-b1-won>span'),tag:[3,4,5,6].map(i=>/YOUR CASH GAME MANAGER/.test(${'document.querySelectorAll(\'.storyboard .stage\')'}[i].innerText))}`);
check('10a. WF6 Screens 4-6: WON / LOST text is the same size as WON on Screen 3', w6.s3 && [w6.s4, w6.s5, w6.s6].every(x => x && /^(WON|LOST)$/.test(x.t) && x.fs === w6.s3.fs), JSON.stringify(w6));
check('10b. WF6 Screen 7 shows WON (same size) next to the Sign & Settle amount', w6.s7 && w6.s7.t === 'WON' && w6.s7.fs === w6.s3.fs, JSON.stringify(w6.s7));
check('10c. WF6 Screens 4-7 carry the NORA YOUR CASH GAME MANAGER tagline', w6.tag.every(Boolean), w6.tag.join());
const ov6 = await J(`return [...document.querySelectorAll('.storyboard .stage')].map(st=>{const c=st.querySelector('.phone .ux-content');return c.scrollHeight-c.clientHeight})`);
check('10d. no WF6 screen scrolls', ov6.every(x => x <= 2), ov6.join());

check('no JavaScript errors during the run', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed${fail ? '  FAILED: ' + fails.join(' ; ') : ''}`);
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
