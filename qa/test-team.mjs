// Usage: node qa/test-team.mjs index.html   -- TEAM main tab (WF72-77), Team terminology/status simplification, Team screen quick fixes
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 6600 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
if (!t || !t.webSocketDebuggerUrl) { console.log('FAIL  edge did not start'); process.exit(1); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) return 'EXC:' + (r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text); return r.result.value; };
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const base = 'file:///' + path.resolve(htmlPath).split(String.fromCharCode(92)).join('/');
await send('Page.navigate', { url: base + '#workflow-72' }); await sleep(2500); await send('Page.reload'); await sleep(4200);
let pass = 0, fail = 0; const fails = [];
const check = (n, ok, d = '') => { ok ? pass++ : (fail++, fails.push(n)); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const go = async w => { await ev(`location.hash='workflow-${w}'`); for (let k = 0; k < 20; k++) { await sleep(500); const n = await ev(`document.querySelectorAll('.storyboard .stage .phone').length`); if (n > 0 && await ev(`!!document.querySelector('.storyboard .stage .ux-bottom, .storyboard .stage .ux-hamb')`)) break; } await sleep(900); };
const S = i => `document.querySelectorAll('.storyboard .stage')[${i}]`;
const J = async x => { const r = await ev(`JSON.stringify((()=>{${x}})())`); return typeof r === 'string' && r.startsWith('EXC:') ? { exc: r } : JSON.parse(r); };

const phoneTxt = i => J(`return ${S(i)}.querySelector('.phone').innerText.replace(/\\s+/g,' ')`);
const nStages = () => ev(`document.querySelectorAll('.storyboard>.stage').length`);
const allTxt = async () => { const n = await nStages(); const o = []; for (let i = 0; i < n; i++) o.push(await phoneTxt(i)); return o; };

// 1. structure: step counts, total workflows, no renumbering of WF19-24
const want = { 19: 4, 20: 4, 21: 4, 22: 4, 23: 4, 24: 3, 72: 2, 73: 5, 74: 2, 75: 3, 76: 3, 77: 5 };
let cntOk = true, cntDet = [];
for (const [w, n] of Object.entries(want)) { await go(w); const got = await nStages(); if (got !== n) { cntOk = false; cntDet.push(`wf${w}:${got}/${n}`); } }
check('1. Step counts WF19-24 unchanged (4,4,4,4,4,3) and WF72-77 = 2,5,2,3,3,5; every screen inside the swipe row', cntOk, cntDet.join('; '));
const total = await ev(`WORKFLOWS.length`);
check('2. 85 workflows (WF78-85 added by Brief c); WF1-71 ids intact', total === 85 && (await ev(`WORKFLOWS.slice(0,71).every((w,i)=>w.id===i+1)`)) === true, 'total=' + total);

// 3. terminology
let termBad = [];
for (const w of [19, 20, 21, 22, 23, 24, 72, 73, 74, 75, 76, 77]) { await go(w); const t = (await allTxt()).join(' | '); for (const re of [/shift/i, /assigned/i, /expected/i, /available/i, /on duty/i]) if (re.test(t)) termBad.push(`wf${w}:${re}`); }
check('3. No SHIFT / ASSIGNED / EXPECTED / AVAILABLE wording in WF19-24 or WF72-77', termBad.length === 0, termBad.join('; '));
await go(70); const t70 = (await allTxt()).join(' | ');
await go(40); const t40 = (await allTxt()).join(' | ');
check('4. Reports Team (WF70) and Daily Close (WF40-47) never say Shift; WF70 says Sessions Worked', !/shift/i.test(t70) && !/shift/i.test(t40) && /SESSIONS WORKED/i.test(t70), '');
let snapBad = [];
for (const w of [32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 67, 68, 69, 71]) { await go(w); const t = (await allTxt()).join(' | '); if (/shift/i.test(t)) snapBad.push(w); }
check('5. Snapshot, Daily Close and Reports workflows contain no Shift wording', snapBad.length === 0, snapBad.join(','));

// 6-8. Live Game Team dashboard
await go(19);
const dash = await J(`const s=${S(0)};return {counters:[...s.querySelectorAll('.b2-stat span')].map(e=>e.textContent.trim()),labels:[...s.querySelectorAll('.b2-tm .b2-st')].map(e=>e.textContent.trim()),tiles:s.querySelectorAll('.b2-tm').length,sec:s.querySelector('.ux-headtitle b').textContent.trim()}`);
check('6. WF19 dashboard: two counters WORKING + FINISHED, tile labels only WORKING, 6 photo tiles, header LIVE GAME', dash.counters.join() === 'WORKING,FINISHED' && dash.labels.every(x => x === 'WORKING') && dash.tiles === 6 && dash.sec === 'LIVE GAME', JSON.stringify(dash));
await go(20); const ci = (await allTxt()).join(' | ');
await go(23); const co = (await allTxt()).join(' | ');
check('7. WF20 uses Check In / WORKING; WF23 uses Check Out / CHECKED OUT / FINISHED', /CHECK IN/i.test(ci) && /WORKING/.test(ci) && /CHECK OUT/i.test(co) && /FINISHED/.test(co) && /CHECKED OUT/.test(co), '');
await go(24); const t24 = (await allTxt()).join(' | ');
check('8. WF24 financial figures unchanged (150,000 / 120,000 / 90,000 / total 360,000) and Outstanding stays separate from checkout', ['150,000', '120,000', '90,000', '360,000'].every(x => t24.includes(x)) && /OUTSTANDING/.test(t24), '');

// 9-10. frame height and overflow
let hOk = true, hDet = [];
for (const w of [19, 20, 21, 22, 23, 24, 72, 73, 74, 75, 76, 77]) { await go(w); const hs = await J(`return [...document.querySelectorAll('.storyboard .stage .phone')].map(p=>Math.round(p.getBoundingClientRect().height))`); if (new Set(hs).size !== 1) { hOk = false; hDet.push(`wf${w}:${hs}`); } }
check('9. Every screen of each Team workflow has the same phone frame height', hOk, hDet.join('; '));
let ovOk = true, ovDet = [];
for (const w of [19, 20, 21, 22, 23, 24, 72, 73, 74, 75, 76, 77]) { await go(w); const r = await J(`return [...document.querySelectorAll('.storyboard .stage')].map((s,i)=>{const c=s.querySelector('.ux-content'),p=s.querySelector('.phone');return {i,sv:c.scrollHeight-c.clientHeight,sh:c.scrollWidth-c.clientWidth,pv:p.scrollHeight-p.clientHeight}}).filter(x=>x.sv>2||x.sh>2||x.pv>2)`); if (r.length) { ovOk = false; ovDet.push(`wf${w}:` + JSON.stringify(r)); } }
check('10. No vertical/horizontal overflow or clipped content inside any Team phone', ovOk, ovDet.join('; ').slice(0, 300));

// 11-13. tiles
let inOk = true, inDet = [];
for (const [w, i] of [[19, 0], [19, 1], [72, 0], [72, 1], [77, 2]]) { await go(w); const r = await J(`const s=${S(i)};const bad=[];s.querySelectorAll('.b2-tm').forEach(t=>{const ini=t.querySelector('.b2-ini');if(!ini)return;const a=ini.getBoundingClientRect();t.querySelectorAll('.b2-nm,.b2-rl,.b2-tt,.b2-st').forEach(n=>{const b=n.getBoundingClientRect();if(a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom)bad.push(t.querySelector('.b2-nm').textContent+'/'+n.className)})});return bad`); if (r.length) { inOk = false; inDet.push(`wf${w}s${i}:${r}`); } }
check('11. Initials do not overlap names, roles, times or status labels (WF19 s1-2, WF72 s1-2, WF77 s3)', inOk, inDet.join('; '));
let stOk = true, stDet = [];
for (const [w, i] of [[19, 0], [19, 1], [24, 2], [72, 0], [72, 1], [76, 1], [77, 2]]) { await go(w); const r = await J(`const s=${S(i)};return [...s.querySelectorAll('.b2-face img')].map(m=>{const cs=getComputedStyle(m);return {fit:cs.objectFit,nat:m.naturalWidth/m.naturalHeight}}).filter(x=>x.fit!=='cover'||!(x.nat>0))`); if (r.length) { stOk = false; stDet.push(`wf${w}s${i}`); } }
check('12. Team thumbnails use object-fit:cover (portrait crop, never stretched) on roster and ledger tiles', stOk, stDet.join('; '));
await go(72); const sz = await J(`const t=[...${S(0)}.querySelectorAll('.b2-tm')];const r=t.map(x=>x.getBoundingClientRect());const nm=t[0].querySelector('.b2-nm'),rl=t[0].querySelector('.b2-rl');return {n:t.length,minW:Math.min(...r.map(x=>x.width)),minH:Math.min(...r.map(x=>x.height)),nf:parseFloat(getComputedStyle(nm).fontSize),rf:parseFloat(getComputedStyle(rl).fontSize),cols:new Set(r.map(x=>Math.round(x.left))).size,rows:new Set(r.map(x=>Math.round(x.top))).size}`);
check('13. WF72 overview: 12 photo-fill tiles in a 3x4 grid, each at least 98x121, name larger than role', sz.n === 12 && sz.cols === 3 && sz.rows === 4 && sz.minW >= 98 && sz.minH >= 121 && sz.nf > sz.rf, JSON.stringify(sz));

// 14-18. contexts and navigation
const hdr = async (w, i = 0) => { await go(w); return ev(`document.querySelectorAll('.storyboard .stage')[${i}].querySelector('.ux-headtitle b').textContent.trim()`); };
const heads = [await hdr(19), await hdr(72), await hdr(70)];
check('14. Header labels distinguish LIVE GAME (WF19) / TEAM (WF72) / REPORTS (WF70)', heads.join() === 'LIVE GAME,TEAM,REPORTS', heads.join());
const grp = await ev(`(()=>{const g={};WORKFLOWS.forEach(w=>{const k=MAINLBL(w.main)+' / '+w.sub;(g[k]=g[k]||[]).push(w.id)});return JSON.stringify(g)})()`);
const G = JSON.parse(grp);
check('15. Workflow index: Live Game / Team = WF19-24, Team / Team Management = WF72-77, Reporting group still holds WF70', G['Live Game / Team'] && G['Live Game / Team'].join() === '19,20,21,22,23,24' && G['Team / Team Management'] && G['Team / Team Management'].join() === '72,73,74,75,76,77' && Object.entries(G).some(([k, v]) => /^Reporting/.test(k) && v.includes(70)), grp.slice(0, 400));
await go(72); await ev(`document.querySelector('.storyboard .stage .ux-hamb').click()`); await sleep(500);
const dr = await J(`const a=document.querySelector('.storyboard .stage .nn-drawer .nn-active');return {on:a?a.textContent.trim():null,n:document.querySelectorAll('.storyboard .stage .nn-drawer .nn-sh').length,home:a?a.dataset.nnGo:null}`);
check('16. Hamburger on WF72: six tabs, Team active, Team home = 72:0', dr.n === 6 && /Team/i.test(dr.on || '') && dr.home === '72:0', JSON.stringify(dr));
await go(19); await ev(`document.querySelector('.storyboard .stage .ux-hamb').click()`); await sleep(500);
const dr2 = await J(`const a=document.querySelector('.storyboard .stage .nn-drawer .nn-active');return {on:a?a.textContent.trim():null}`);
check('17. Hamburger on WF19 still highlights LIVE GAME (Live Game > Team is separate from the TEAM tab)', /LIVE GAME/i.test(dr2.on || ''), JSON.stringify(dr2));
await go(19); const bar19 = await J(`const b=${S(0)}.querySelector('.ux-bottom.s2-nav');return b?[...b.querySelectorAll('.ux-tab')].map(x=>x.textContent.trim()):null`);
await go(72); const nb72 = await ev(`document.querySelectorAll('.storyboard .ux-bottom.s2-nav').length`);
check('18. WF19 keeps the Live Game bar (Table, Players, Team, Expenses, Snapshot, Close); TEAM-tab screens carry no Live Game bar', bar19 && bar19.join() === 'Table,Players,Team,Expenses,Snapshot,Close' && nb72 === 0, JSON.stringify(bar19) + ' ' + nb72);

// 19-22. interactions
await go(72); await ev(`document.querySelector('.storyboard .stage .b2-tm').click()`); await sleep(1500);
const h1 = await ev(`location.hash`);
await go(72); await ev(`[...document.querySelectorAll('.storyboard .stage .b2-btn')][0].click()`); await sleep(1500);
const h2 = await ev(`location.hash`);
check('19. Tapping a member tile opens Team Member Profile (WF74); ADD TEAM MEMBER opens WF73', h1 === '#workflow-74' && h2 === '#workflow-73', h1 + ' ' + h2);
await go(77); const tg0 = await J(`return {n:${S(1)}.querySelectorAll('.b2-tg').length}`);
await ev(`${S(1)}.querySelector('.b2-tg').click()`); await sleep(300);
const tg1 = await J(`const t=${S(1)}.querySelector('.b2-tg');return {on:t.classList.contains('on'),a:t.getAttribute('aria-checked')}`);
check('20. WF77 permission toggles render (10 preset toggles) and flip on tap with aria-checked', tg0.n === 10 && tg1.on === true && tg1.a === 'true', JSON.stringify([tg0, tg1]));
await ev(`show(77)`); await sleep(800);
const nxt = await ev(`document.getElementById('next').disabled`);
const lbl = await ev(`document.body.innerText.includes('Workflow 77 of 85')&&document.getElementById('progressText').textContent`);
check('21. Studio: Next enabled on WF77; Workflow 77 of 85; progress counter /85', nxt === false && /\/ 85/.test(String(lbl)), nxt + ' ' + lbl);
await go(63); const s63 = (await allTxt()).join(' | '); await go(77); const s77 = (await allTxt()).join(' | ');
check('22. WF77 reuses the Settings role/permission wording (same roles, access summaries and role-preset permission copy as WF63)', ['Everything · protected', 'Buy-ins · cash-outs · expenses', 'Seating · table actions', 'Sales · comps', 'Food orders · counts', 'Service access never grants reports'].every(x => s63.includes(x) && s77.includes(x)), ['Everything · protected', 'Buy-ins · cash-outs · expenses', 'Seating · table actions', 'Sales · comps', 'Food orders · counts', 'Service access never grants reports'].filter(x => !s63.includes(x) || !s77.includes(x)).map(x => x + (s63.includes(x) ? '' : '[no63]') + (s77.includes(x) ? '' : '[no77]')).join(' | ') + ' len ' + s63.length + '/' + s77.length);

// 23-24. currency ratio and type floor
await go(76); const cop = await J(`const o=[];${S(1)}.querySelectorAll('.b1-cop').forEach(c=>{const n=c.parentElement;o.push(parseFloat(getComputedStyle(c).fontSize)/parseFloat(getComputedStyle(n).fontSize))});return o`);
check('23. COP label is about 65% of the amount on Team History', cop.length > 0 && cop.every(r => r > 0.55 && r < 0.75), cop.map(x => x.toFixed(2)).join(','));
let fl = [];
for (const w of [72, 73, 74, 75, 76, 77]) { await go(w); const r = await J(`const o=[];document.querySelectorAll('.storyboard .stage .ux-content *').forEach(e=>{if(e.children.length)return;const t=(e.textContent||'').trim();if(!t||t==='COP')return;const f=parseFloat(getComputedStyle(e).fontSize);if(f<13&&!e.closest('.b2-lr'))o.push(t.slice(0,20)+':'+f)});return o`); if (r.length) fl.push(`wf${w}:${r.slice(0, 3)}`); }
check('24. No body text under 13px on WF72-77 (ledger micro-labels exempt, matching WF24)', fl.length === 0, fl.join('; '));
check('25. No JavaScript errors while loading and navigating', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));
console.log(`\nTEAM TESTS: ${pass} passed, ${fail} failed`); if (fail) console.log('FAILED: ' + fails.join(' | '));
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
