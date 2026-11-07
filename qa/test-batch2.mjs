// Usage: node qa/test-batch2.mjs index.html   -- batch 2 regression tests: terminology, WF19-24 team flow, WF54 profile + rewards, icons, thumbnails, drawer avatar
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

// ---- 1. terminology: studio chrome + every app header (all 71 workflows) ----
const studio = await J(`const t=[...document.querySelectorAll('#nav .navtitle')].map(e=>e.textContent.replace(/\\s+/g,' ').trim());return {titles:t,crumb:document.getElementById('breadcrumb').textContent}`);
check('1a. Workflow Studio sidebar groups say Live Game / Schedule (never Live Session / Scheduled)', studio.titles.some(x => /^Live Game\b/.test(x)) && studio.titles.some(x => /^Schedule\b/.test(x)) && !studio.titles.some(x => /Live Session|^Scheduled/.test(x)), studio.titles.join(' | '));
check('1b. studio breadcrumb uses Live Game', /Live Game/.test(studio.crumb) && !/Live Session/.test(studio.crumb), studio.crumb);
const hdr = { ls: [], sched: [], meta: [] };
for (let w = 1; w <= 71; w++) {
  await go(w);
  const r = await J(`const crumb=document.getElementById('breadcrumb').textContent;const meta=[...document.querySelectorAll('#content .meta span')].map(e=>e.textContent);return {crumb,meta,heads:[...document.querySelectorAll('.storyboard .stage .ux-head')].map(h=>(h.innerText||'').replace(/\\s+/g,' ').trim())}`);
  if (/Live Session|Scheduled/.test(r.crumb) || r.meta.some(x => /Live Session|^Scheduled$/.test(x))) hdr.meta.push(`wf${w}`);
  r.heads.forEach((h, i) => { if (/LIVE SESSION/.test(h)) hdr.ls.push(`wf${w}/s${i + 1}`); if (/\bSCHEDULED\b/.test(h)) hdr.sched.push(`wf${w}/s${i + 1}`); });
}
check('1c. no app header says LIVE SESSION or SCHEDULED (all 71 workflows)', hdr.ls.length === 0 && hdr.sched.length === 0, hdr.ls.concat(hdr.sched).slice(0, 6).join(', '));
check('1d. no studio breadcrumb / meta chip says Live Session or Scheduled (all 71 workflows)', hdr.meta.length === 0, hdr.meta.slice(0, 6).join(', '));
await go(48); const h48 = await J(`return (${S(0)}.querySelector('.ux-head')||{}).innerText||''`);
check('1e. Schedule module headers read SCHEDULE', /SCHEDULE/.test(String(h48)), String(h48).replace(/\s+/g, ' '));

// ---- 2. WF19 four screens ----
await go(19);
const t1 = await J(`const ph=${S(0)}.querySelector('.phone');const st=[...ph.querySelectorAll('.b2-stat b')].map(b=>+b.textContent);const tiles=[...ph.querySelectorAll('.b2-tm')].map(t=>({n:t.querySelector('.b2-nm').textContent,st:t.querySelector('.b2-st').textContent,w:t.getBoundingClientRect().width,h:t.getBoundingClientRect().height,face:t.querySelector('.b2-face').getBoundingClientRect().height,img:!!t.querySelector('img'),ini:(t.querySelector('.b2-ini')||{}).textContent,inifs:t.querySelector('.b2-ini')?parseFloat(getComputedStyle(t.querySelector('.b2-ini')).fontSize):0,nameFs:parseFloat(getComputedStyle(t.querySelector('.b2-nm')).fontSize),bar:getComputedStyle(t.querySelector('.b2-nm')).backgroundColor}));return {st,tiles,btn:(ph.querySelector('.b2-btn')||{}).textContent,ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`);
const onN = t1.tiles.filter(x => x.st === 'ON SHIFT').length;
check('2a. WF19 S1 team overview: ON SHIFT count equals the tiles actually on shift', t1.st[0] === onN && onN === 2, `stat=${t1.st[0]} tiles=${onN}`);
check('2b. WF19 S1 photo tiles >= Table View size (98 wide, face >= 121 tall), white names, no name bars, initials large', t1.tiles.every(x => x.w >= 98 && x.face >= 121 && x.nameFs >= 18 && x.bar === 'rgba(0, 0, 0, 0)' && (x.img || x.inifs >= 60)), JSON.stringify(t1.tiles.map(x => [x.n, Math.round(x.w), Math.round(x.face)])));
check('2c. WF19 S1 ASSIGN TEAM is prominent and nothing scrolls', /ASSIGN TEAM/.test(t1.btn) && t1.ovf <= 2, `${t1.btn} ovf=${t1.ovf}`);
const t2 = await J(`const ph=${S(1)}.querySelector('.phone');const tx=ph.querySelector('.ux-content').innerText;return {add:(ph.querySelector('.seat-roster-add-toggle')||{}).ariaLabel||ph.querySelector('.seat-roster-add-toggle').getAttribute('aria-label'),sea:ph.querySelector('.seat-roster-search-toggle').getAttribute('aria-label'),ph:(ph.querySelector('input')||{}).placeholder,player:/player/i.test(tx)||/player/i.test(ph.querySelector('.seat-roster-add-toggle').getAttribute('aria-label')),n:ph.querySelectorAll('.b2-tm').length,sel:ph.querySelectorAll('.b2-tm.selected').length,faces:[...ph.querySelectorAll('.b2-tm .b2-face')].map(f=>f.getBoundingClientRect().width),ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`);
check('2d. WF19 S2: "Add Team Member" / "Search Team Members" wording, no player wording', /Add team member/i.test(t2.add) && /Search team members/i.test(t2.sea) && /team member/i.test(t2.ph) && !t2.player, JSON.stringify([t2.add, t2.sea, t2.ph, t2.player]));
check('2e. WF19 S2: 3 x 4 grid of 12 team tiles, one clearly selected, full-bleed faces', t2.n === 12 && t2.sel === 1 && t2.faces.every(w => w >= 90) && t2.ovf <= 2, JSON.stringify([t2.n, t2.sel, t2.ovf]));
const t3 = await J(`const ph=${S(2)}.querySelector('.phone');const tx=ph.innerText.replace(/\\s+/g,' ');return {tx,sels:ph.querySelectorAll('.b2-sel').length,photo:ph.querySelector('.b2-photo .b2-face').getBoundingClientRect(),btn:(ph.querySelector('.b2-btn')||{}).textContent,btnBottom:ph.querySelector('.b2-btn').getBoundingClientRect().bottom,contentBottom:ph.querySelector('.ux-content').getBoundingClientRect().bottom,contradict:/ON SHIFT/.test(tx)&&/Not checked in/i.test(tx)}`);
check('2f. WF19 S3: role / table / pay-arrangement selectors, large photo, ONE confirm action fully visible, no contradictory status', t3.sels === 3 && t3.photo.width >= 98 && t3.photo.height >= 121 && /ASSIGN ANNA/.test(t3.btn) && t3.btnBottom <= t3.contentBottom + 1 && !t3.contradict && /NOT ASSIGNED/.test(t3.tx) && /Assigning does not check in or pay/.test(t3.tx), t3.tx.slice(0, 160));
await ev(`${S(2)}.querySelectorAll('.b2-sel')[2].click()`); await sleep(400);
await ev(`${S(2)}.querySelectorAll('.b1-sheet .b1-opt')[1].click()`); await sleep(500);
const t3b = await J(`const ph=${S(2)}.querySelector('.phone');return {pay:ph.querySelectorAll('.b2-sel')[2].innerText.trim(),rate:document.getElementById('b2rate').textContent}`);
check('2g. WF19 S3: pay arrangement selector offers hourly pay and updates the rate line', /Hourly pay/.test(t3b.pay) && /Hourly rate/.test(t3b.rate), JSON.stringify(t3b));
const t4 = await J(`const ph=${S(3)}.querySelector('.phone');const tx=ph.innerText.replace(/\\s+/g,' ');return {tx,face:ph.querySelector('.b2-photo .b2-face').getBoundingClientRect(),btn:(ph.querySelector('.b2-btn')||{}).textContent,btnBottom:ph.querySelector('.b2-btn').getBoundingClientRect().bottom,cb:ph.querySelector('.ux-content').getBoundingClientRect().bottom}`);
check('2h. WF19 S4: assignment confirmation (not a copy of S1): photo, name, role/table, ASSIGNED status, pay arrangement, "Successfully posted by Nora", BACK TO TEAM', /ANNA ASSIGNED/.test(t4.tx) && /Dealer · Table 1/.test(t4.tx) && /ASSIGNED · NOT CHECKED IN/.test(t4.tx) && /Fixed shift pay/.test(t4.tx) && /Successfully posted by Nora/.test(t4.tx) && /2 on shift · 1 assigned/.test(t4.tx) && /BACK TO TEAM/.test(t4.btn) && t4.face.width >= 98 && t4.face.height >= 121 && t4.btnBottom <= t4.cb + 1, t4.tx.slice(0, 200));

// ---- 3. WF20-24 consistency ----
const num = s => Number(String(s).replace(/[^0-9]/g, ''));
await go(20);
const w20 = await J(`const g=i=>document.querySelectorAll('.storyboard .stage')[i];const stats=i=>[...g(i).querySelectorAll('.b2-stat b')].map(b=>+b.textContent);return {s1:stats(0),s4:g(3).innerText.replace(/\\s+/g,' '),s1asg:[...g(0).querySelectorAll('.b2-tm')].filter(t=>/ASSIGNED/.test(t.innerText)).map(t=>t.querySelector('.b2-nm').textContent)}`);
check('3a. WF20: Anna is ASSIGNED (not on shift) before check-in; ON SHIFT count only rises after check-in (2 -> 3)', w20.s1[0] === 2 && w20.s1[1] === 1 && w20.s1asg.join() === 'Anna' && /3 on shift · 0 assigned/.test(w20.s4) && /ANNA CHECKED IN/.test(w20.s4), JSON.stringify([w20.s1, w20.s1asg]) + w20.s4.slice(0, 120));
await go(23);
const w23 = await J(`const ph=document.querySelectorAll('.storyboard .stage')[2].querySelector('.phone');const rows=[...ph.querySelectorAll('.b2-row')].map(r=>[r.querySelector('span').textContent.trim(),r.querySelector('b').textContent.replace(/[^0-9−-]/g,'')]);return {rows,btn:ph.querySelector('.b2-btn').getBoundingClientRect().bottom,cb:ph.querySelector('.ux-content').getBoundingClientRect().bottom,tx:ph.innerText.replace(/\\s+/g,' '),s4:document.querySelectorAll('.storyboard .stage')[3].innerText.replace(/\\s+/g,' ')}`);
const R = Object.fromEntries(w23.rows.map(r => [r[0], num(r[1])]));
check('3b. WF23 checkout math: compensation + tips = total due; total due - paid before checkout = balance to pay; pay-now equals the balance', R['COMPENSATION'] + R['TIPS'] === R['TOTAL DUE'] && R['TOTAL DUE'] - R['PAID BEFORE'] === R['BALANCE TO PAY'] && new RegExp('COP\s*' + R['BALANCE TO PAY'].toLocaleString('en-US')).test(w23.tx) && w23.btn <= w23.cb + 1, JSON.stringify(R));
check('3c. WF23 S4 separates closing the shift from paying: SHIFT CLOSED, paid amount, OUTSTANDING 0 shown explicitly', /SHIFT CLOSED/.test(w23.s4) && /PAID · CASHBOX/.test(w23.s4) && /OUTSTANDING/.test(w23.s4) && /Successfully posted by Nora/.test(w23.s4), w23.s4.slice(0, 140));
await go(24);
const w24 = await J(`const ph=document.querySelectorAll('.storyboard .stage')[2].querySelector('.phone');return {tx:ph.innerText.replace(/\\s+/g,' '),faces:[...ph.querySelectorAll('.b2-lp')].map(f=>[f.getBoundingClientRect().width,f.getBoundingClientRect().height]),ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight,s1:[...document.querySelectorAll('.storyboard .stage')[0].querySelectorAll('.b2-stat b')].map(b=>+b.textContent)}`);
check('3d. WF24 ledger agrees with the Snapshot staff data (360,000 earned, 120,000 unpaid) and nothing scrolls', /360,000/.test(w24.tx) && /120,000/.test(w24.tx) && w24.ovf <= 2 && w24.s1[0] === 2 && w24.s1[2] === 1, w24.tx.slice(0, 120) + JSON.stringify(w24.s1));
const posted = [];
for (const [w, i] of [[21, 3], [22, 3], [23, 3], [19, 3], [20, 3]]) { await go(w); const x = await J(`return /Successfully posted by Nora/.test(document.querySelectorAll('.storyboard .stage')[${i}].innerText)`); if (!x) posted.push(`wf${w}`); }
check('3e. every WF19-23 confirmation says "Successfully posted by Nora"', posted.length === 0, posted.join(','));

// ---- 4. WF54 ----
await go(54);
const p2 = await J(`const ph=${S(1)}.querySelector('.phone');const tx=ph.innerText.replace(/\\s+/g,' ');return {tx,tabs:ph.querySelectorAll('[data-b2-subtab]').length,face:ph.querySelector('.b2-cphoto').getBoundingClientRect(),app:!!ph.querySelector('.b2-app'),ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`);
check('4a. WF54 S2: LAST ACTIVE (date/time) and a concise APP USER chip, large photo, no scrolling', /LAST ACTIVE/.test(p2.tx) && /Oct 25, 2026 · 10:20 PM/.test(p2.tx) && p2.app && p2.face.width >= 98 && p2.face.height >= 121 && p2.ovf <= 2, p2.tx.slice(0, 140));
check('4b. WF54 S2: REWARDS subtab is hidden while the owner has rewards disabled (default)', p2.tabs === 0 && !/REWARDS/.test(p2.tx), String(p2.tabs));
const t4h = await J(`const tx=${S(3)}.querySelector('.phone').innerText;return {t:tx.replace(/\\s+/g,' '),role:[...${S(3)}.querySelectorAll('[data-operator-role]')].map(e=>e.dataset.operatorRole)}`);
check('4c. WF54 S4: "Posted by Alex" (no role shown); role kept on the underlying record', /Posted by Alex/.test(t4h.t) && !/Posted by Alex ·/.test(t4h.t) && !/Cashier/.test(t4h.t) && t4h.role.length === 4 && t4h.role.every(x => x === 'Cashier'), t4h.t.slice(0, 120));
for (const [mode, flags, expect] of [['both', { on: true, referral: true, hours: true }, ['REFERRAL REWARDS', 'PLAY-HOURS BONUS']], ['referral', { on: true, referral: true, hours: false }, ['REFERRAL REWARDS']], ['hours', { on: true, referral: false, hours: true }, ['PLAY-HOURS BONUS']], ['on but no program', { on: true, referral: false, hours: false }, null]]) {
  await ev(`localStorage.setItem('nora.preview.rewards',${JSON.stringify(JSON.stringify(flags))})`); await send('Page.reload'); await sleep(4200); await go(54);
  const r = await J(`const ph=${S(1)}.querySelector('.phone');const tab=ph.querySelector('[data-b2-subtab=rewards]');if(tab)tab.click();const panel=ph.querySelector('[data-b2-panel=rewards]');return {tab:!!tab,shown:panel?!panel.hidden:false,progs:panel?[...panel.querySelectorAll('.b2-prog>b')].map(b=>b.textContent):[],profileHidden:ph.querySelector('[data-b2-panel=profile]')?ph.querySelector('[data-b2-panel=profile]').hidden:null,nums:panel?/[0-9]/.test(panel.innerText.replace(/[^0-9]/g,'')):false,ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight}`);
  check(`4d. rewards ${mode}: ${expect ? 'subtab shows only ' + expect.join(' + ') : 'subtab stays hidden when no program is enabled'}; no invented balances; no scrolling`, expect ? (r.tab && r.shown && r.progs.join() === expect.join() && r.profileHidden === true && !r.nums && r.ovf <= 2) : !r.tab, JSON.stringify(r));
}
await ev(`localStorage.removeItem('nora.preview.rewards')`);

// ---- 5. WF4 / WF5 / WF7 ----
await send('Page.reload'); await sleep(4200);
for (const [w, i, who] of [[4, 3, 'Sofia Alvarez'], [5, 3, 'Diego Restrepo'], [3, 3, 'Rafa']]) {
  await go(w); const r = await J(`const ph=${S(i)}.querySelector('.phone');const th=ph.querySelector('.b1-thumb'),nm=ph.querySelector('.nora-confirm-summary>strong'),sc=ph.querySelector('.nora-confirm-summary>span');const a=th.getBoundingClientRect(),n=nm.getBoundingClientRect(),s=sc.getBoundingClientRect();return {w:a.width-6,h:a.height-6,nameFs:parseFloat(getComputedStyle(nm).fontSize),seatFs:parseFloat(getComputedStyle(sc).fontSize),stacked:s.top>=n.bottom-2&&Math.abs(s.left-n.left)<4,name:nm.textContent,ovf:ph.querySelector('.ux-content').scrollHeight-ph.querySelector('.ux-content').clientHeight,btn:ph.querySelector('.nora-confirm-next').getBoundingClientRect().bottom<=ph.querySelector('.ux-content').getBoundingClientRect().bottom+1}`);
  check(`5. WF${w} Screen ${i + 1}: photo >= Table View (98 x 121), name above seat (name larger), footer not clipped`, r.w >= 98 && r.h >= 121 && r.nameFs > r.seatFs && r.stacked && r.name === who && r.ovf <= 2 && r.btn, JSON.stringify(r)); }
await go(5); const a5 = await J(`const ph=${S(2)}.querySelector('.phone');const tile=ph.querySelector('.b1-seltile[data-b1="amount"]');return {t:tile.innerText.replace(/\\s+/g,' ').trim(),heading:(ph.querySelector('.screen-card-title')||{}).textContent,vis:[...tile.children].filter(c=>getComputedStyle(c).display!=='none').map(c=>c.textContent.trim())}`);
check('5b. WF5 Screen 3: AMOUNT is not repeated inside the entry tile (heading above only)', !/AMOUNT/i.test(a5.vis.join(' ')) && /REBUY AMOUNT/.test(a5.heading), JSON.stringify(a5));
await go(7); const s7 = await J(`return ${S(6)}.innerText`);
check('5c. WF7 Screen 7 says NEW SEATS (not NEW LOCATIONS)', /NEW SEATS/.test(s7) && !/NEW LOCATIONS/.test(s7));

// ---- 6. drawer avatar ----
await go(3);
const dv = await J(`const ph=${S(2)}.querySelector('.phone');ph.querySelector('.ux-hamb').click();const d=ph.querySelector('.nn-drawer'),last=[...d.querySelectorAll('.nn-list .nn-sh')].pop().getBoundingClientRect(),pr=d.querySelector('.nn-profile'),pa=d.querySelector('.nn-avatar'),a=pa.getBoundingClientRect(),f=d.querySelector('.nn-footer').getBoundingClientRect();const nm=pr.querySelector('.nn-pn').getBoundingClientRect(),role=pr.querySelector('small').getBoundingClientRect();return {img:!!pa.querySelector('img'),w:a.width,h:a.height,radius:getComputedStyle(pa).borderRadius,gap:f.top-last.bottom,rows:d.querySelectorAll('.nn-list .nn-sh').length,settingsVisible:last.bottom<=f.top,txt:pr.innerText.replace(/\\s+/g,' '),aligned:Math.abs(nm.left-role.left)<2&&nm.top<role.top&&a.top<=nm.top&&a.bottom>=role.bottom,foot:[...d.querySelectorAll('.nn-foot')].map(x=>x.innerText.replace(/\\s+/g,' ').trim())}`);
check('6. drawer user area: square photo (no circular halo) larger than before (>=52x62), clear gap under SETTINGS, name and role aligned', dv.img && dv.w >= 52 && dv.h >= 62 && dv.radius.startsWith('0') && dv.gap >= 8 && dv.settingsVisible && dv.rows === 6 && /Mike · Owner/.test(dv.txt) && dv.aligned, JSON.stringify(dv));

// ---- 7. icons: counts across all 71 workflows, no legacy glyph icons left ----
const ic = { plus: 0, search: 0, cam: 0, upload: 0, userplus: 0, bgPlus: 0, bgSearch: 0, bgCam: 0, bgUp: 0, legacy: [] };
for (let w = 1; w <= 71; w++) {
  await go(w);
  const r = await J(`const o={plus:0,search:0,cam:0,upload:0,userplus:0,bgPlus:0,bgSearch:0,bgCam:0,bgUp:0,legacy:[]};document.querySelectorAll('.storyboard .stage .phone').forEach((ph,i)=>{ph.querySelectorAll('svg.b1-lu').forEach(s=>{const k=s.dataset.lu;if(o[k]!==undefined&&s.getBoundingClientRect().width>0)o[k]++});ph.querySelectorAll('.seat-roster-add-toggle .roster-icon-center').forEach(e=>{if(/svg/.test(getComputedStyle(e).backgroundImage))o.bgPlus++});ph.querySelectorAll('.seat-roster-search-toggle .roster-icon-center').forEach(e=>{if(/svg/.test(getComputedStyle(e).backgroundImage))o.bgSearch++});ph.querySelectorAll('.np4-photo-actions label:first-child,.crm-photo-btn:first-of-type').forEach(e=>{if(/svg/.test(getComputedStyle(e).backgroundImage))o.bgCam++});ph.querySelectorAll('.np4-photo-actions label:last-of-type,.crm-photo-btn:nth-of-type(2)').forEach(e=>{if(/svg/.test(getComputedStyle(e).backgroundImage))o.bgUp++});const txt=[...ph.querySelectorAll('button,.screen-button,label,.fb-wide,.b2-btn')].filter(e=>e.getBoundingClientRect().width>0&&/^[\\s]*(＋|⌕|🔎|📷|⇧|📤)/.test(e.textContent)).length;if(txt)o.legacy.push('wf${w}/s'+(i+1))});return o`);
  for (const k of ['plus', 'search', 'cam', 'upload', 'userplus', 'bgPlus', 'bgSearch', 'bgCam', 'bgUp']) ic[k] += r[k]; ic.legacy.push(...r.legacy);
}
console.log('ICON COUNTS', JSON.stringify(ic));
check('7a. every plus / search / camera / upload icon is the new vector family (no legacy glyphs left in buttons or tiles)', ic.legacy.length === 0, ic.legacy.slice(0, 6).join(', '));
check('7b. icon instances found in all 71 workflows (rendered state): plus, search, camera, upload', ic.bgPlus > 0 && ic.bgSearch > 0 && ic.bgCam > 0 && ic.bgUp > 0, JSON.stringify(ic));

// ---- 8. global player / team / user thumbnail minimum ----
const MIN_W = 98, MIN_H = 121;
const viol = [], exempt = {};
for (let w = 1; w <= 71; w++) {
  await go(w);
  const r = await J(`const out=[];document.querySelectorAll('.storyboard .stage').forEach((st,i)=>{const p=st.querySelector('.phone');if(!p)return;const pr=p.getBoundingClientRect();const RX=/(^|[ _-])(person-face|seat-roster-photo|avatar|portrait|thumb|face|photo)($|[ _-])/i;const seen=new Set();p.querySelectorAll('*').forEach(e=>{if(e.closest('.nn-drawer'))return;const cn=typeof e.className==='string'?e.className:'';if(/photo-action|photo-btn|photo-opt|crm-note|b2-photo$|b2-lp$|b2-cphoto$/.test(cn))return;if(!(e.tagName==='IMG'||RX.test(cn)))return;const par=e.parentElement&&typeof e.parentElement.className==='string'?e.parentElement.className:'';if(e.tagName==='IMG'&&RX.test(par))return;const r=e.getBoundingClientRect();if(r.width<12||r.height<12)return;if(r.top-pr.top<66)return;const k=Math.round(r.left)+'/'+Math.round(r.top)+'/'+Math.round(r.width);if(seen.has(k))return;seen.add(k);out.push({s:i+1,c:cn.split(' ').slice(0,2).join('.'),w:r.width,h:r.height,nora:!!e.closest('.st-face,.st-meet,.st-nrow>.st-face'),grid:!!e.closest('.seat-roster-card,.wf48-player,.ux-seat,.wf48-seat,.b2-sel12')})})});return out`);
  (r || []).forEach(x => { const ok = x.w >= MIN_W - 0.5 && x.h >= MIN_H - 0.5; if (ok) return; if (x.nora) { exempt.nora = (exempt.nora || 0) + 1; return; } if (x.grid) { exempt.grid = (exempt.grid || 0) + 1; return; } viol.push(`wf${w}/s${x.s} ${x.c} ${Math.round(x.w)}x${Math.round(x.h)}`); });
}
console.log('THUMB EXEMPTIONS', JSON.stringify(exempt));
check(`8. global thumbnail rule: every player / team / user photo surface on all 71 workflows is >= ${MIN_W} x ${MIN_H} (Table View) - except the 3x4 selection grids and Nora's own portrait`, viol.length === 0, viol.slice(0, 8).join(' | '));

check('no JavaScript errors during the run', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed${fail ? '  FAILED: ' + fails.join(' ; ') : ''}`);
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);

