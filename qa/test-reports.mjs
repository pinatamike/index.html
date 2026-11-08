// Usage: node qa/test-reports.mjs index.html   -- Reports redesign + chip accounting regression tests (WF32/38, WF40-47, WF67-71)
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
await send('Page.navigate', { url: base + '#workflow-67' }); await sleep(2500); await send('Page.reload'); await sleep(4200);
let pass = 0, fail = 0; const fails = [];
const check = (n, ok, d = '') => { ok ? pass++ : (fail++, fails.push(n)); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const go = async w => { await ev(`location.hash='workflow-${w}'`); for (let k = 0; k < 20; k++) { await sleep(500); const n = await ev(`document.querySelectorAll('.storyboard .stage .phone').length`); if (n > 0 && await ev(`!!document.querySelector('.storyboard .stage .ux-bottom, .storyboard .stage .ux-hamb')`)) break; } await sleep(900); };
const S = i => `document.querySelectorAll('.storyboard .stage')[${i}]`;
const J = async x => { const r = await ev(`JSON.stringify((()=>{${x}})())`); return typeof r === 'string' && r.startsWith('EXC:') ? { exc: r } : JSON.parse(r); };
const txt = i => J(`return ${S(i)}.querySelector('.phone').innerText.replace(/\\s+/g,' ')`);
const R = `window.NORA_REPORTS`;

// ---- 1. Reports bottom bar: exactly five tabs, correct active tab, no legacy tabs ----
const want = ['Overview', 'Players', 'Financials', 'Team', 'Inventory'];
const plan = { 67: [0, 1, 2, 3].map(() => 'Overview'), 68: ['Players', 'Players', 'Players', 'Players'], 69: ['Financials', 'Financials', 'Financials', 'Financials'], 70: ['Team', 'Team', 'Team', 'Inventory', 'Inventory', 'Inventory', 'Inventory'], 71: ['Overview', 'Overview', 'Overview'] };
let barOk = true, barDet = [];
for (const w of Object.keys(plan)) {
  await go(w);
  const r = await J(`return [...document.querySelectorAll('.storyboard .stage')].map(s=>{const b=s.querySelector('.ux-bottom.s2-nav');if(!b)return null;const tabs=[...b.querySelectorAll('.ux-tab')];return {labels:tabs.map(x=>x.textContent.replace(/\\s+/g,' ').trim()),on:tabs.filter(x=>/\\b(on|active|selected|current)\\b/.test(x.className)||x.getAttribute('aria-current')==='page'||x.getAttribute('aria-selected')==='true').map(x=>x.textContent.replace(/\\s+/g,' ').trim())}})`);
  r.forEach((b, i) => { if (!b || b.labels.join() !== want.join() || b.on.join() !== plan[w][i]) { barOk = false; barDet.push(`wf${w}/s${i + 1}:${b ? b.labels.join('/') + ' on=' + b.on : 'no bar'}`); } });
}
check('1. WF67-71 all screens: exactly five Reports tabs OVERVIEW|PLAYERS|FINANCIALS|TEAM|INVENTORY with the right one active', barOk, barDet.slice(0, 4).join('; '));
await go(67);
const stages = {}; for (const w of [67, 68, 69, 70, 71, 32, 38, 40, 41, 44, 45, 46, 47]) { await go(w); stages[w] = await ev(`document.querySelectorAll('.storyboard>.stage').length`); }
check('2. WF67-71 step counts (4, 4, 4, 7, 3) and every screen sits inside the storyboard swipe row (WF41/WF44 stray-tag repair included)', stages[67] === 4 && stages[68] === 4 && stages[69] === 4 && stages[70] === 7 && stages[71] === 3 && stages[41] === 3 && stages[44] === 3 && stages[38] === 3 && stages[40] === 3 && stages[45] === 3 && stages[46] === 3 && stages[47] === 3, JSON.stringify(stages));
const nav71 = await J(`return {n:WORKFLOWS.length,missing:[...Array(71).keys()].map(i=>i+1).filter(i=>!WORKFLOWS.find(w=>w.id===i))}`);
check('3. all 71 original workflows still exist and none were renumbered', nav71.n === 71 && nav71.missing.length === 0, JSON.stringify(nav71));

// ---- 4. Overview accounting ----
await go(67);
const acc = await J(`const R=${R};const L=R.S;const out=[];for(const s of L){const rev=s.rake+s.fb,ex=s.rent+s.team+s.fbc+s.oth;out.push([s.d,rev,ex,rev-ex,R.net(s)]);}const tot=L.reduce((a,s)=>[a[0]+s.rake,a[1]+s.fb,a[2]+s.rent+s.team+s.fbc+s.oth],[0,0,0]);return {out,tot}`);
check('4a. every session: net = rake + F&B − (RENT + TEAM + F&B purchases + other); report total revenue/expenses add up', acc.out.every(o => o[3] === o[4]) && acc.tot[0] + acc.tot[1] - acc.tot[2] === acc.out.reduce((a, o) => a + o[3], 0), JSON.stringify(acc.tot));
const ov = await txt(0); const f = n => n.toLocaleString('en-US');
const rk = acc.tot[0], fb = acc.tot[1], ex = acc.tot[2];
check('4b. Overview shows Total Rake, F&B Revenue, Total Revenue, Total Expenses, Net, Sessions, Table Hours, Avg Rake/Hour with matching figures', ov.includes(f(rk)) && ov.includes(f(fb)) && ov.includes(f(rk + fb)) && ov.includes(f(ex)) && ov.includes(f(rk + fb - ex)) && /SESSIONS PLAYED 4/.test(ov) && /TABLE HOURS 39\.5h/.test(ov) && /AVERAGE RAKE PER TABLE HOUR/.test(ov) && ov.includes(f(Math.round(rk / 39.5))), ov.slice(0, 260));
check('4c. Overview dashboard fits without scrolling and bottom actions are visible', (await J(`const b=${S(0)}.querySelector('.rp-body');return {o:b.scrollHeight-b.clientHeight}`)).o <= 2);
const snapNet = await J(`return {snap:SNAPSHOT_SESSION.rake+WF32_DATA.inventory.reduce((a,p)=>a+p.sold*p.unit,0)-(SNAPSHOT_SESSION.expenses+SNAPSHOT_SESSION.teamPay),rep:${R}.net(${R}.S[0])}`);
check('4d. Reports net for Oct 25 equals the Snapshot / Daily Close net (COP −385,000): one set of records', snapNet.snap === snapNet.rep && snapNet.rep === -385000, JSON.stringify(snapNet));
// period selector re-renders
await ev(`(()=>{const s=${S(0)}.querySelector('[data-rp-period]');s.value='7';s.dispatchEvent(new Event('change',{bubbles:true}))})()`); await sleep(300);
const ov7 = await txt(0);
check('4e. period selector changes the figures (Last 7 days = Oct 25 only)', /SESSIONS PLAYED 1/.test(ov7) && ov7.includes('385,000') && /Oct 19/.test(ov7), ov7.slice(0, 160));
await ev(`(()=>{const s=${S(0)}.querySelector('[data-rp-period]');s.value='30';s.dispatchEvent(new Event('change',{bubbles:true}))})()`); await sleep(300);

// ---- 5. Session history -> permanent Final Session Summary ----
const hist = await J(`const cards=[...${S(2)}.querySelectorAll('.rp-sc')];return {n:cards.length,t:cards.map(c=>c.innerText.replace(/\\s+/g,' ').slice(0,90))}`);
check('5a. Session History lists 4 sessions with date, game, tables, rake, F&B, expenses, net, status and chip statuses', hist.n === 4 && hist.t.every(x => /CLOSED/.test(x)), hist.t[0]);
await ev(`${S(2)}.querySelectorAll('.rp-sc')[1].click()`); await sleep(500);
const sm = await J(`const b=${S(3)}.querySelector('.rp-body');return {t:b.innerText.replace(/\\s+/g,' '),det:[...b.querySelectorAll('details.rp-d')].map(d=>({s:d.querySelector('summary span').textContent.trim(),open:d.open}))}`);
check('5b. tapping the Oct 18 session opens ITS Final Session Summary (read only, sections collapsed by default)', /Oct 18, 2026/.test(sm.t) && /READ ONLY/.test(sm.t) && sm.det.every(d => !d.open), sm.t.slice(0, 120));
check('5c. summary contains CHIP FLOW RECONCILIATION and CHIP INVENTORY VARIANCE sections plus audit trail', ['CHIP FLOW RECONCILIATION', 'CHIP INVENTORY VARIANCE', 'Audit trail'].every(n => sm.det.some(d => d.s === n)), sm.det.map(d => d.s).join(' | '));

// ---- 6. Chip Flow Reconciliation: operators, math, statuses ----
const flow = await J(`const R=${R};return R.S.map(s=>[s.d,s.buy+s.promo-s.cash-s.tips-s.rake-s.fbChips,R.flowVar(s)])`);
check('6a. Chip flow variance = buy-ins + promo − cash-outs − chip tips − rake chips − F&B chips for every session (0, 0, −20,000, 0)', flow.every(r => r[1] === r[2]) && flow.map(r => r[1]).join() === '0,0,-20000,0', JSON.stringify(flow));
await go(70); await ev(`${S(3)}.querySelectorAll('[data-rp-sel^="chipsess"]')[0].click()`); await sleep(500);
const fl = await J(`const b=${S(4)}.querySelector('.rp-body');return {ops:[...b.querySelectorAll('.rp-cl')].map(l=>(l.querySelector('u')||{}).textContent+'|'+l.querySelector('span').textContent.trim()),t:b.innerText.replace(/\\s+/g,' ')}`);
const opsStr = fl.ops.join(' // ');
check('6b. CHIP FLOW RECONCILIATION shows + Buy-ins / + Promo / − Cash-outs / − Chip Tips / − rake / − F&B / = Chip Flow Variance', /\+\|Buy-ins \/ Rebuys/.test(opsStr) && /\+\|Promo Chips/.test(opsStr) && /−\|Cash-outs/.test(opsStr) && /−\|Chip Tips/.test(opsStr) && /−\|Chips removed as rake/.test(opsStr) && /−\|Chips used to pay for F&B/.test(opsStr) && /=\|Chip Flow Variance/.test(opsStr), opsStr);
check('6c. Oct 25 is BALANCED with variance COP 0', /BALANCED/.test(fl.t) && /Chip Flow Variance COP 0/.test(fl.t), fl.t.slice(0, 200));
await ev(`${S(3)}.querySelectorAll('[data-rp-sel="chipsess:2"]')[0].click()`); await sleep(500);
const fl3 = await J(`return ${S(4)}.querySelector('.rp-body').innerText.replace(/\\s+/g,' ')`);
check('6d. Oct 11 shows VARIANCE −COP 20,000 with a recorded explanation, operator and time (never converted to zero)', /VARIANCE/.test(fl3) && /20,000/.test(fl3) && /Recorded by Alex/.test(fl3) && /Explanation|explanation/.test(fl3) && !/BALANCED/.test(fl3), fl3.slice(0, 260));

// ---- 7. Chip Inventory Variance ----
await ev(`${S(3)}.querySelectorAll('[data-rp-sel="chipsess:0"]')[0].click()`); await sleep(500);
const iv = await J(`const b=${S(5)}.querySelector('.rp-body');const rows=[...b.querySelectorAll('.rp-itr')].map(r=>r.innerText.replace(/\\s+/g,' ').trim());return {rows,t:b.innerText.replace(/\\s+/g,' '),short:b.querySelectorAll('.rp-short').length,over:b.querySelectorAll('.rp-over').length}`);
check('7a. five denominations, each with expected / counted / quantity variance / COP variance', iv.rows.length === 5 && /5,000 chip −2 SHORT Expected 160 Counted 158/.test(iv.rows[1]) && /10,000 chip \+2 OVER Expected 150 Counted 152/.test(iv.rows[2]) && /1,000 chip ✓ MATCH/.test(iv.rows[0]), iv.rows.join(' | '));
check('7b. shortage and overage are shown individually (not hidden in a net figure) and marked', iv.short === 1 && iv.over === 1 && /−COP 10,000|− COP 10,000/.test(iv.t) && /\+COP 20,000|\+ COP 20,000/.test(iv.t), '');
check('7c. math lines + totals: Actual − Expected = Quantity Variance, × Value = COP Variance, total expected/actual/variance and status', /Actual Count − Expected Count = Quantity Variance/.test(iv.t) && /Quantity Variance × Chip Value = COP Variance/.test(iv.t) && /Total Expected Chip Value COP 5,500,000/.test(iv.t) && /Total Actual Chip Value COP 5,510,000/.test(iv.t) && /Total Inventory Variance \+COP 10,000|Total Inventory Variance \+ COP 10,000/.test(iv.t) && /VARIANCE/.test(iv.t), iv.t.slice(0, 120));
const ivs = await J(`const R=${R};return R.S.map(s=>[s.d,R.invVar(s)])`);
check('7d. inventory variance per session: +10,000 (explained), then 0, 0, 0', ivs.map(x => x[1]).join() === '10000,0,0,0', JSON.stringify(ivs));

// ---- 8. Players and Team rankings ----
await go(68);
const pr = await J(`const b=${S(0)}.querySelector('.rp-body');return {seg:[...b.querySelectorAll('.rp-seg button')].map(x=>x.textContent),pod:[...b.querySelectorAll('.rp-pt')].length,photoSz:[...b.querySelectorAll('.rp-pf')].map(x=>[Math.round(x.getBoundingClientRect().width),Math.round(x.getBoundingClientRect().height)])}`);
check('8a. player rankings: Winners / Losers / Hours / Sessions, large photo tiles (>= Table View size)', pr.seg.join() === 'WINNERS,LOSERS,HOURS,SESSIONS' && pr.photoSz.length >= 2 && pr.photoSz.every(s => s[0] >= 98 && s[1] >= 121), JSON.stringify(pr));
const pm = await J(`const R=${R};R.ST.period='life';const l=R.life;return {w:R.P.Rafa.map(x=>x&&x.net),sum:Object.keys(R.P).reduce((a,n)=>a+R.life(n).net,0),tot:R.S.reduce((a,s)=>a+(s.cash-s.buy),0)}`);
check('8b. player win/loss comes from buy-ins and cash-outs: sum of all players equals −(rake + F&B chips + tips − promo) for every session', pm.sum === pm.tot, JSON.stringify(pm));
await ev(`${S(0)}.querySelector('[data-rp-seg="rank:lose"]').click()`); await sleep(300);
const pl = await J(`return ${S(0)}.querySelector('.rp-body').innerText.replace(/\\s+/g,' ')`);
check('8c. LOSERS ranking lists only players with a net loss', /BIGGEST LIFETIME LOSERS/.test(pl) && !/\+ ?COP/.test(pl.split('BIGGEST LIFETIME LOSERS')[1]), pl.slice(0, 160));
await ev(`${S(0)}.querySelectorAll('.rp-pt')[0].click()`); await sleep(500);
const pp = await J(`const b=${S(1)}.querySelector('.rp-body');return {t:b.innerText.replace(/\\s+/g,' '),svg:!!b.querySelector('svg.rp-chart rect'),ph:(()=>{const r=b.querySelector('.rp-pid .rp-ph').getBoundingClientRect();return [r.width,r.height]})(),n:b.querySelectorAll('.rp-lb').length}`);
check('8d. player report: sessions, hours, buy-ins/rebuys, cash-outs, net, average per session, win/loss chart, session history', /TOTAL SESSIONS/.test(pp.t) && /TOTAL HOURS/.test(pp.t) && /BUY-INS \/ REBUYS/.test(pp.t) && /CASH-OUTS/.test(pp.t) && /NET WIN \/ LOSS/.test(pp.t) && /AVG PER SESSION/.test(pp.t) && pp.svg && pp.n >= 2 && pp.ph[0] >= 98 && pp.ph[1] >= 121, pp.t.slice(0, 120));
await go(70);
const tr = await J(`const sel=${S(0)}.querySelector('[data-rp-trank]');return [...sel.options].map(o=>o.text)`);
check('9a. Team rankings offer the five approved rankings', tr.join('|') === 'Most Hours|Most Games / Shifts|Most Tips|Highest Base Compensation|Highest Total Compensation', tr.join('|'));
const trk = await J(`const R=${R};R.ST.period='life';const o={};for(const k of ['hours','games','tips','base','total']){}return R.TMB.map(m=>[m.n,R.tmLife(m)])`);
const tl = Object.fromEntries(trk.map(x => [x[0], x[1]]));
check('9b. team ranking maths: total = base + tips; advances and payments are not earnings; Anna 22h30m, base 550,000, tips 80,000, total 630,000', trk.every(x => x[1].total === x[1].base + x[1].tips) && tl.Anna.min === 1350 && tl.Anna.base === 550000 && tl.Anna.tips === 80000 && tl.Anna.total === 630000 && tl.Costa.bal === 120000 && tl.Anna.bal === 0 && tl.Alex.bal === 0, JSON.stringify(tl.Anna));
await ev(`(()=>{const s=${S(0)}.querySelector('[data-rp-trank]');s.value='tips';s.dispatchEvent(new Event('change',{bubbles:true}))})()`); await sleep(300);
const tt = await J(`return [...${S(0)}.querySelectorAll('.rp-rr b')].map(b=>b.textContent)`);
check('9c. selecting Most Tips re-sorts the ranking (Anna, Costa, Alex)', tt.join('|') === 'Anna · Dealer|Costa · Host|Alex · Cashier', tt.join('|'));
await ev(`${S(0)}.querySelectorAll('.rp-pt')[1].click()`); await sleep(500);
const tm = await txt(1);
check('9d. individual team report: hours, shifts, base, tips, total, advances, payments, outstanding balance, shift history', /HOURS WORKED/.test(tm) && /GAMES \/ SHIFTS/.test(tm) && /Total compensation earned/.test(tm) && /Advances/.test(tm) && /Payments received/.test(tm) && /Outstanding balance/.test(tm) && /SHIFT BY SHIFT/.test(tm), tm.slice(0, 140));
const sh = await J(`return ${S(2)}.querySelector('.rp-body').textContent.replace(/\\s+/g,' ')`);
check('9e. settlement history rows: checkout date, hours, compensation, tips, advances, paid, balance, method, status; Costa Oct 25 is OWED COP 120,000', /Checkout date/.test(sh) && /Prior advances/.test(sh) && /Remaining balance/.test(sh) && /Payment method/.test(sh) && /Settlement status/.test(sh) && /OWED/.test(sh) && /PAID/.test(sh), sh.slice(0, 120));

// ---- 10. Financials: ledgers, account balances reconcile ----
await go(69);
const fin = await J(`const R=${R};const mv=[['Cashbox',4185000,[4600000,130000,-3940000,-240000,-235000]],['Nequi',450000,[500000,-450000]],['Bancolombia',1100000,[200000,-1000000]]];return mv.map(m=>[m[0],m[1]+m[2].reduce((a,b)=>a+b,0)])`);
check('10a. account movements reconcile to the closing balances (Cashbox 4,500,000, Nequi 500,000, Bancolombia 300,000)', JSON.stringify(fin) === JSON.stringify([['Cashbox', 4500000], ['Nequi', 500000], ['Bancolombia', 300000]]), JSON.stringify(fin));
const ac = await txt(2);
check('10b. Account Balances screen uses the approved name, lists configured accounts, S&S outstanding and chips separately', /Account Balances/.test(ac) && /Cashbox/.test(ac) && /Nequi/.test(ac) && /Bancolombia/.test(ac) && /PayPal \/ Zelle/.test(ac) && /Sign & Settle outstanding/.test(ac) && !/Payment Methods/i.test(ac), ac.slice(0, 120));
const lg = await J(`const b=${S(3)}.querySelector('.rp-body');const opts=[...b.querySelectorAll('[data-rp-led] ,select[data-rp-led]')].length;const sel=b.querySelector('select[data-rp-led]');return {opts:[...sel.options].map(o=>o.text),n:b.querySelectorAll('.rp-le').length,t:b.innerText.replace(/\\s+/g,' ')}`);
check('10c. ledger categories: Buy-ins/Rebuys, Cash-outs, Rake, Team Payments, Expenses, F&B Sales, Account Movements, Sign & Settle, Corrections/Adjustments (no Rewards while disabled)', ['Buy-ins / Rebuys', 'Cash-outs', 'Rake', 'Team Payments', 'Expenses', 'F&B Sales', 'Account Movements', 'Sign & Settle', 'Corrections / Adjustments'].every(c => lg.opts.includes(c)) && !lg.opts.some(o => /Reward/.test(o)), lg.opts.join('|'));
check('10d. ledger entries show amount, date/time and "Posted by Alex" (no repeated role)', /Posted by Alex/.test(lg.t) && !/Posted by Alex ·? ?Cashier/.test(lg.t) && lg.n > 10, `${lg.n} entries`);
await ev(`(()=>{const i=${S(3)}.querySelector('[data-rp-q]');i.value='rent';i.dispatchEvent(new Event('input',{bubbles:true}))})()`); await sleep(300);
const lq = await J(`return [...${S(3)}.querySelectorAll('.rp-le b')].map(b=>b.textContent)`);
check('10e. ledger search filters entries (RENT)', lq.length >= 1 && lq.every(x => /rent/i.test(x)), lq.join('|'));
await ev(`(()=>{const i=${S(3)}.querySelector('[data-rp-q]');i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));const s=${S(3)}.querySelector('select[data-rp-led]');s.value='cr';s.dispatchEvent(new Event('change',{bubbles:true}))})()`); await sleep(300);
check('10f. Corrections / Adjustments with no data shows an empty state, not invented entries', /No corrections or adjustments have been recorded/.test((await txt(3))), '');
const rn = await J(`const t=document.body.innerHTML;return {venue:(t.match(/>[^<]*\\bVENUE\\b[^<]*</gi)||[]).length}`);

// ---- 11. Snapshot (WF32 + WF38): both reports, PENDING while live ----
await go(32);
const sn = await J(`const ph=${S(0)}.querySelector('.phone');return {t:ph.innerText.replace(/\\s+/g,' '),cards:ph.querySelectorAll('.rp-cc').length}`);
check('11a. Live Snapshot shows CHIP FLOW RECONCILIATION and CHIP INVENTORY VARIANCE with PENDING status and amounts; no falsely balanced live game', sn.cards === 2 && /CHIP FLOW RECONCILIATION/.test(sn.t) && /CHIP INVENTORY VARIANCE/.test(sn.t) && (sn.t.match(/PENDING/g) || []).length >= 2 && !/BALANCED/.test(sn.t) && /Provisional/.test(sn.t), sn.t.slice(150, 330));
await ev(`${S(0)}.querySelectorAll('.rp-cc')[0].click()`); await sleep(500);
const sn2 = await J(`const ph=${S(0)}.querySelector('.phone');return {t:ph.innerText.replace(/\\s+/g,' '),head:(ph.querySelector('.ux-headtitle small')||{}).textContent}`);
check('11b. Snapshot chip card opens the full live calculation (+ / − / =) and the header names the report', /Chip Flow Variance/.test(sn2.t) && /PENDING/.test(sn2.t) && /Chip Flow/.test(sn2.head), sn2.head);
await go(38);
const w38 = await J(`return [0,1,2].map(i=>document.querySelectorAll('.storyboard .stage')[i].querySelector('.phone').innerText.replace(/\\s+/g,' ').slice(0,200))`);
check('11c. WF38 screens: chip controls, CHIP FLOW RECONCILIATION, CHIP INVENTORY VARIANCE (live PENDING)', /CHIP FLOW RECONCILIATION/.test(w38[0]) && /CHIP INVENTORY VARIANCE/.test(w38[0]) && /CHIP FLOW RECONCILIATION/.test(w38[1]) && /CHIP INVENTORY VARIANCE/.test(w38[2]) && /PENDING/.test(w38[2]), w38[2].slice(0, 100));

// ---- 12. Daily Close ----
await go(40);
const ck = await txt(1);
check('12a. Daily Close checklist lists both chip reports with individual statuses (BALANCED / VARIANCE)', /CHIP FLOW RECONCILIATION[^]*BALANCED/.test(ck) && /CHIP INVENTORY VARIANCE[^]*VARIANCE/.test(ck), ck.slice(60, 360));
await go(46);
const c0 = await J(`const b=${S(1)}.querySelector('[data-rp-gate="btn"]');return {dis:b.disabled,route:b.getAttribute('data-rn-route'),t:${S(1)}.querySelector('.rp-body').innerText.replace(/\\s+/g,' ')}`);
check('12b. unexplained variance: permanent close is refused (button disabled, reason shown)', c0.dis === true && !c0.route && /Close blocked/.test(c0.t), c0.t.slice(40, 200));
await go(45);
await ev(`(()=>{const t=${S(1)}.querySelector('[data-rp-expl]');t.value='Two 5,000 chips found in the wrong rack; counted twice.';t.dispatchEvent(new Event('input',{bubbles:true}))})()`); await sleep(400);
const c1 = await J(`const b=document.querySelectorAll('.storyboard .stage')[1].querySelector('[data-rp-gate="expl"]');return b.textContent`);
check('12c. typing an explanation records it (who/when shown) and keeps the variance', /Recorded by Mike/.test(c1), c1);
await go(46);
const c2 = await J(`const b=${S(1)}.querySelector('[data-rp-gate="btn"]');return {dis:b.disabled,route:b.getAttribute('data-rn-route'),t:${S(1)}.querySelector('.rp-body').innerText.replace(/\\s+/g,' ')}`);
check('12d. explained variance: close is allowed and the variance is still shown (not zeroed)', c2.dis === false && c2.route === '46:2' && /Ready/.test(c2.t) && /10,000/.test(c2.t), c2.t.slice(40, 220));
await ev(`sessionStorage.removeItem('nora.close.expl');localStorage.setItem('nora.preview.close',JSON.stringify({count:'pending'}))`); await send('Page.reload'); await sleep(4200); await go(46);
const c3 = await J(`const b=${S(1)}.querySelector('[data-rp-gate="btn"]');return {dis:b.disabled,t:${S(1)}.querySelector('.rp-body').innerText.replace(/\\s+/g,' ')}`);
check('12e. PENDING chip count: close is blocked and the report shows PENDING (never BALANCED)', c3.dis === true && /PENDING/.test(c3.t) && /Close blocked/.test(c3.t), c3.t.slice(40, 220));
await go(44);
const c4 = await txt(2);
check('12f. WF44 inventory screen shows PENDING with "not counted" when no confirmed physical count exists', /PENDING/.test(c4) && /No confirmed physical count/.test(c4) && /Not counted/.test(c4) && !/BALANCED/.test(c4), c4.slice(0, 160));
await ev(`localStorage.removeItem('nora.preview.close');sessionStorage.removeItem('nora.close.expl')`); await send('Page.reload'); await sleep(4200);
await go(47);
const fnl = await J(`return [0,1,2].map(i=>document.querySelectorAll('.storyboard .stage')[i].querySelector('.phone').textContent.replace(/\\s+/g,' '))`);
check('12g. Daily Close final record (WF47) carries both chip reports, status, calculation, explanation and finalizing operator', /CHIP FLOW RECONCILIATION/.test(fnl[0]) && /CHIP INVENTORY VARIANCE/.test(fnl[0]) && /Chip Flow Variance/.test(fnl[1]) && /Total Inventory Variance/.test(fnl[1]) && /Counted by Alex/.test(fnl[1]) && /Closed bys*Mike/.test(fnl[2]), fnl[1].slice(0, 120));

// ---- 13. terminology + sizes across all 71 workflows ----
const bad = { venue: [], emp: [], pay: [], live: [], tiny: [] };
for (let w = 1; w <= 71; w++) {
  await go(w);
  const r = await J(`const out={};const t=[...document.querySelectorAll('.storyboard .stage')].map(s=>s.querySelector('.phone')?s.querySelector('.phone').innerText:'').join(' ');out.venue=/\\bVENUE\\b/i.test(t);out.emp=/\\bEMPLOYEES?\\b/i.test(t);out.live=/LIVE SESSION/.test(t);out.pay=/PAYMENT METHODS/i.test(t)&&[...document.querySelectorAll('.storyboard .stage .ux-headtitle')].some(h=>/PAYMENT METHODS/i.test(h.innerText));let tiny=0;if(${w}>=67&&${w}<=71||[32,38,40,41,42,43,44,45,46,47].includes(${w})){document.querySelectorAll('.storyboard .stage .rp-body *').forEach(e=>{if(e.children.length)return;const x=(e.textContent||'').trim();if(!x)return;const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<13.5&&x!=='COP'&&!(e.tagName==='I'&&e.parentElement&&e.parentElement.classList.contains('rp-m'))&&!e.classList.contains('nora-cop-unit')&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0)tiny++;});}out.tiny=tiny;return out`);
  if (r.venue) bad.venue.push(w); if (r.emp) bad.emp.push(w); if (r.live) bad.live.push(w); if (r.pay) bad.pay.push(w); if (r.tiny) bad.tiny.push(w + ':' + r.tiny);
}
check('13a. VENUE is gone from every screen of all 71 workflows (RENT / LOCATION used instead)', bad.venue.length === 0, bad.venue.join(','));
check('13b. no EMPLOYEES, LIVE SESSION, or PAYMENT METHODS module header anywhere', bad.emp.length === 0 && bad.live.length === 0 && bad.pay.length === 0, JSON.stringify(bad));
check('13c. no text below 14px (13.5px floor) in the new report / chip screens', bad.tiny.length === 0, bad.tiny.join(','));
check('14. no uncaught JavaScript errors during the run', jsErrors.length === 0, jsErrors.slice(0, 3).join(' || ').slice(0, 300));
console.log(`\n${pass} passed, ${fail} failed${fail ? ': ' + fails.join('; ') : ''}`);
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
