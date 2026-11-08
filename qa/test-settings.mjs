// Usage: node qa/test-settings.mjs index.html   -- Brief (c): Settings home, onboarding, Invitations/Players/Expenses/Rewards (WF59, 60, 78-85)
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
await send('Page.navigate', { url: base + '#workflow-60' }); await sleep(2500); await send('Page.reload'); await sleep(4200);
let pass = 0, fail = 0; const fails = [];
const check = (n, ok, d = '') => { ok ? pass++ : (fail++, fails.push(n)); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const go = async w => { await ev(`location.hash='workflow-${w}'`); for (let k = 0; k < 20; k++) { await sleep(500); const n = await ev(`document.querySelectorAll('.storyboard .stage .phone').length`); if (n > 0 && await ev(`!!document.querySelector('.storyboard .stage .ux-bottom, .storyboard .stage .ux-hamb')`)) break; } await sleep(900); };
const S = i => `document.querySelectorAll('.storyboard .stage')[${i}]`;
const J = async x => { const r = await ev(`JSON.stringify((()=>{${x}})())`); return typeof r === 'string' && r.startsWith('EXC:') ? { exc: r } : JSON.parse(r); };

const phoneTxt = i => J(`return ${S(i)}.querySelector('.phone').innerText.replace(/\\s+/g,' ')`);
const nStages = () => ev(`document.querySelectorAll('.storyboard>.stage').length`);
const allTxt = async () => { const n = await nStages(); const o = []; for (let i = 0; i < n; i++) o.push(await phoneTxt(i)); return o; };

// ---------- Brief (c) tests ----------
const WFN = await ev(`WORKFLOWS.length`);
check('1. Exactly 85 workflows; WF59-66 numbers kept; 78-85 added after WF77', WFN === 85 && (await ev(`[59,60,61,62,63,64,65,66,77,78,85].every(n=>WORKFLOWS.some(w=>w.id===n))`)) === true, 'n=' + WFN);
const steps = await ev(`JSON.stringify([59,60,61,62,63,64,65,66,78,79,80,81,82,83,84,85].map(n=>WORKFLOWS.find(w=>w.id===n).steps.length))`);
check('2. Step counts: WF59 6, WF60 8, WF78-85 = 3,2,2,5,4,4,2,1', steps === JSON.stringify([6, 8, 2, 4, 3, 5, 2, 5, 3, 2, 2, 5, 4, 4, 2, 1]), steps);

// Settings home: 8 modules in the required order
await go(60); const h0 = await J(`return [...${S(0)}.querySelectorAll('.s3-tile b')].map(b=>b.textContent)`);
check('3. Settings has exactly 8 modules in order GAME, INVITATIONS, PLAYERS, TEAM, ACCOUNTS, EXPENSES, INVENTORY, REWARDS', JSON.stringify(h0) === JSON.stringify(['GAME', 'INVITATIONS', 'PLAYERS', 'TEAM', 'ACCOUNTS', 'EXPENSES', 'INVENTORY', 'REWARDS']), h0.join(','));
const bar = await J(`return [...${S(0)}.querySelectorAll('.ux-bottom .s2-lbl')].map(b=>b.textContent)`);
check('4. Six bottom icons: GAME | INVITES | PLAYERS | TEAM | ACCOUNTS | MORE', JSON.stringify(bar) === JSON.stringify(['GAME', 'INVITES', 'PLAYERS', 'TEAM', 'ACCOUNTS', 'MORE']), bar.join(','));
await go(85); const m = await J(`return [...${S(0)}.querySelectorAll('.fb-li b')].map(b=>b.textContent)`);
check('5. MORE opens Expenses, Inventory and Rewards', JSON.stringify(m) === JSON.stringify(['EXPENSES', 'INVENTORY', 'REWARDS']), m.join(','));
await go(60); const route = await J(`return [...${S(0)}.querySelectorAll('.s3-tile')].map(b=>b.dataset.rnRoute)`);
check('6. Module tiles route to GAME 60:4, INVITATIONS 78:0, PLAYERS 79:0, TEAM 63:0, ACCOUNTS 61:0, EXPENSES 80:0, INVENTORY 64:1, REWARDS 81:0', JSON.stringify(route) === JSON.stringify(['60:4', '78:0', '79:0', '63:0', '61:0', '80:0', '64:1', '81:0']), route.join(','));

// avatar -> My Account / Subscription
await go(60); await ev(`${S(0)}.querySelector('.ux-hamb').click()`); await sleep(500);
const profGo = await J(`const b=${S(0)}.querySelector('.nn-profile');return b?b.dataset.nnGo:null`);
check('7. Avatar (drawer profile) opens My Account WF84', profGo === '84:0', String(profGo));
await go(84); const acc = (await allTxt()).join(' | ');
check('8. My Account lists Profile and Subscription; Subscription screen exists', /Subscription/.test(acc) && /Profile/.test(acc), acc.slice(0, 120));

// labels
await go(63); const t63 = (await allTxt()).join(' | ');
check('9. Settings TEAM uses PRIMARY GAME OWNER and GAME OWNERS', /Primary Game Owner/i.test(t63) && /Game Owners/i.test(t63) && !/\bPartners\b/.test(t63), t63.slice(0, 160));
await go(77); const t77 = (await allTxt()).join(' | ');
check('10. Team Access (WF77) uses the same owner labels', /Primary Game Owner/i.test(t77) && /Game Owners/i.test(t77), t77.slice(0, 120));

// GAME settings: no number of tables
await go(60); const gs = []; for (const i of [4, 5, 6]) gs.push(await phoneTxt(i)); const gtxt0 = gs.join(' | '); const gtxt = gtxt0.replace(/per table/gi, '');
check('11. GAME settings do not configure the number of tables (no "Tables" field, no "N table(s)")', !/\btables?\b/i.test(gtxt.replace(/Tables are/gi, '')) && /Seats per table/.test(gtxt0), ((gtxt.match(/.{0,30}tables?.{0,30}/i)||[''])[0]));

// WF59 onboarding
await go(59); const o = []; for (let i = 0; i < 6; i++) o.push(await phoneTxt(i)); const otxt = o.join(' | ');
const fields = await J(`return [...${S(1)}.querySelectorAll('.s3-fm small')].map(s=>s.textContent)`);
check('12. WF59 touch setup has exactly 5 fields: name, type, blinds, seats, rake', JSON.stringify(fields) === JSON.stringify(['Game name', 'Game type', 'Blinds', 'Seats per table', 'Rake']), fields.join(','));
check('13. WF59 offers voice (TELL NORA, mic per field, listening) and touch', /TELL NORA/.test(o[0]) && /USE TOUCH/.test(o[0]) && /LISTENING/.test(o[3]) && (await J(`return ${S(1)}.querySelectorAll('.s3-fm .st-micsm').length`)) === 5);
check('14. WF59 ends on a READY TO PLAY screen with Start first session', /READY TO PLAY/.test(o[2]) && /START FIRST SESSION/.test(o[2]));
check('15. WF59 never asks for the number of tables', !/tables? ·|2 × 10|\b2 tables\b|Tables ·/i.test(otxt.replace(/Tables are chosen/gi, '')), '');

// Rewards: four programs
await go(81); const r0 = await J(`return [...${S(0)}.querySelectorAll('.st-ar b')].map(b=>b.textContent)`);
check('16. Rewards shows exactly FOUR programs', JSON.stringify(r0) === JSON.stringify(['Referral Rewards', 'Loyalty Rewards', 'New Player Welcome Bonus', 'Rakeback']), r0.join(','));
const rt = (await allTxt()).join(' | ');
check('17. No "three programs" wording anywhere in Rewards', !/three programs|3 programs|of 3 programs/i.test(rt), '');
check('18. Rakeback is a fixed amount per hour, not a percentage of rake; no automatic round-up; frequency options present', /Fixed amount per hour, not a percentage of rake/.test(rt) && /no rounding up/i.test(rt) && /AFTER EACH SESSION/.test(rt) && /WEEKLY/.test(rt) && /MONTHLY/.test(rt) && /MANUAL/.test(rt));
check('19. Referral, Loyalty and Welcome Bonus requirements shown (hours, threshold, code, once-only, min buy-in, duplicates)', /Duplicate and self-referrals/.test(rt) && /Cycles/.test(rt) && /Valid referral code/.test(rt) && /Granted once/.test(rt) && /Minimum initial buy-in/.test(rt));
check('20. Unspecified rules are flagged PENDING OWNER APPROVAL, not invented', (rt.match(/PENDING OWNER APPROVAL/g) || []).length >= 3, String((rt.match(/PENDING OWNER APPROVAL/g) || []).length));

// currency is the game's configured currency
await ev(`window.NORA_ST.CFG.currency='EUR'`); await go(81); await go(83); const eur = (await allTxt()).join(' | ');
check('21. Amounts follow the configured game currency (EUR), never hard-coded COP', /EUR/.test(eur) && !/\bCOP\b/.test(eur), eur.slice(0, 120));
await ev(`delete window.NORA_ST.CFG.currency`);

// independent enable/disable
const setR = async (k, v) => { await ev(`window.NORA_ST.setP('rewards.${k}',${v})`); await ev(`show(current)`); await sleep(400); };
for (const k of ['referral', 'loyalty', 'welcome', 'rakeback']) await setR(k, true);
await go(82); const pAll = await J(`return [...${S(0)}.querySelectorAll('.fb-li b')].map(b=>b.textContent)`);
check('22. Player REWARDS subtab lists all four when all are enabled', pAll.length === 4, pAll.join(','));
await setR('loyalty', false); await setR('welcome', false); await go(82); const pTwo = await J(`return [...${S(0)}.querySelectorAll('.fb-li b')].map(b=>b.textContent)`);
check('23. Only enabled programs are shown (Referral + Rakeback left)', JSON.stringify(pTwo) === JSON.stringify(['Referral Rewards', 'Rakeback']), pTwo.join(','));
await go(80); const e2 = (await phoneTxt(0));
check('24. Expenses shows REWARDS with only enabled subtypes (REFERRAL, RAKEBACK)', /REWARDS/.test(e2) && /REFERRAL · RAKEBACK/.test(e2) && !/LOYALTY/.test(e2), e2.slice(0, 160));
await go(81); const r1 = await phoneTxt(0);
check('25. Rewards overview count reflects what is on (2 of 4)', /2 of 4 programs on/.test(r1), r1.slice(0, 60));
for (const k of ['referral', 'loyalty', 'welcome', 'rakeback']) await setR(k, false);
await go(82); const tabsOff = await J(`return {tabs:[...${S(0)}.querySelectorAll('.s3-tabs button')].map(b=>b.textContent),txt:${S(0)}.querySelector('.phone').innerText.replace(/\\s+/g,' ')}`);
check('26. REWARDS subtab is hidden when all programs are off', !tabsOff.tabs.includes('REWARDS') && /REWARDS HIDDEN/.test(tabsOff.txt), tabsOff.tabs.join(','));
await go(80); const eOff = await phoneTxt(0);
check('27. REWARDS category is hidden in Expenses when all are off', !/REFERRAL|RAKEBACK/.test(eOff) && /hidden because every rewards program is off/i.test(eOff), eOff.slice(0, 100));
await go(60); const hOff = await phoneTxt(0);
check('28. Settings home shows 0 of 4 programs on', /0 of 4 programs on/.test(hOff), hOff.slice(0, 40));
for (const k of ['referral', 'loyalty', 'welcome', 'rakeback']) await setR(k, true);

// toggling in the UI persists and refreshes
await go(81); await ev(`${S(0)}.querySelector('.st-tog[data-cfg="rewards.loyalty"]').click()`); await sleep(900);
const afterTog = await ev(`window.NORA_ST.getP('rewards.loyalty')`);
check('29. Tapping a program switch turns just that program off', afterTog === false && (await ev(`window.NORA_ST.getP('rewards.referral')`)) === true, String(afterTog));
await setR('loyalty', true);

// Rakeback settlement + accounting
await go(83); const st = (await allTxt()).join(' | ');
check('30. Settlement: partial amount, Account Balance, reference, operator, timestamp, no auto-payment', /Partial amounts are allowed/.test(st) && /Pay from Account Balance/.test(st) && /Transaction reference/.test(st) && /Operator/.test(st) && /Time/.test(st) && /does not send money/.test(st));
check('31. Accrued, Settled and Outstanding shown separately; REWARDS · RAKEBACK; not Team Compensation; in Net P/L, Snapshot, Daily Close, Reports', /Accrued/.test(st) && /Settled/.test(st) && /Outstanding/.test(st) && /REWARDS · RAKEBACK/.test(st) && /Not Team Compensation/.test(st) && /Net Profit\/Loss, Snapshot, Daily Close and Reports/.test(st));
check('32. Example figures are labelled EXAMPLE (no fabricated activity)', (st.match(/EXAMPLE/g) || []).length === 4);
check('33. Settlement arithmetic is consistent: 10.5 h × 5,000 = 52,500; − 20,000 settled = 32,500; partial 20,000 leaves 12,500', /52,500/.test(st) && /32,500/.test(st) && /12,500/.test(st) && /40,000/.test(st));
await go(80); const pcs = await phoneTxt(1);
check('34. Promo-chip rewards recorded once as Promo Chips in Chip Flow Reconciliation', /Promo Chips in Chip Flow Reconciliation/.test(pcs), pcs.slice(0, 80));

// navigation + layout
await go(81); const ctxs = await J(`return [...${S(0)}.querySelectorAll('.ux-bottom .ux-tab.chosen .s2-lbl')].map(x=>x.textContent)`);
check('35. Rewards screens highlight MORE in the bottom bar', JSON.stringify(ctxs) === JSON.stringify(['MORE']), ctxs.join(','));
await go(78); const c78 = await J(`return [...${S(0)}.querySelectorAll('.ux-bottom .ux-tab.chosen .s2-lbl')].map(x=>x.textContent)`);
check('36. Invitations settings highlight INVITES', JSON.stringify(c78) === JSON.stringify(['INVITES']), c78.join(','));
let ov = [];
for (const w of [59, 60, 78, 79, 80, 81, 82, 83, 84, 85]) { await go(w); const r = await J(`const o=[];document.querySelectorAll('.storyboard .stage').forEach((s,i)=>{const p=s.querySelector('.phone'),u=p.querySelector('.ux-content'),pr=p.getBoundingClientRect();let bad=u.scrollHeight>u.clientHeight+2||u.scrollWidth>u.clientWidth+2;u.querySelectorAll('*').forEach(e=>{const b=e.getBoundingClientRect();if(b.width&&b.bottom>pr.bottom+1||b.right>pr.right+1)bad=true});if(bad)o.push(i)});return o`); const rr = w === 60 ? r.filter(x => x !== 7) : r; if (rr.length) ov.push(w + ':' + rr.join('/')); }
check('37. No overflow or clipping on any changed screen (WF59, 60, 78-85; WF60 step 8 Invitations is a pre-existing overflow, identical on the backup branch, excluded and reported)', ov.length === 0, ov.join(' '));
let fl = [];
for (const w of [59, 60, 78, 79, 80, 81, 82, 83, 84, 85]) { await go(w); const r = await J(`const o=[];document.querySelectorAll('.storyboard .stage .ux-content *').forEach(e=>{if(e.children.length)return;const t=(e.textContent||'').trim();if(!t)return;const f=parseFloat(getComputedStyle(e).fontSize);if(f<13&&!e.closest('.ux-bottom')&&!e.classList.contains('s2-cop')&&!e.closest('.s2-cop'))o.push(t.slice(0,20)+'='+f)});return o.slice(0,4)`); if (r.length) fl.push(w + ':' + r.join(',')); }
check('38. No body text under 13px on changed screens', fl.length === 0, fl.join('; '));
let hs = [];
for (const w of [59, 60, 78, 80, 81, 82, 83]) { await go(w); const r = await J(`const h=[...document.querySelectorAll('.storyboard .stage .phone')].map(p=>Math.round(p.getBoundingClientRect().height));return h`); if (new Set(r).size > 1) hs.push(w + ':' + r.join('/')); }
check('39. Every screen of a workflow has the same frame height', hs.length === 0, hs.join(' '));
await go(78); const l78 = await J(`return [...${S(0)}.querySelectorAll('.fb-li')].map(b=>b.dataset.rnRoute)`);
check('39b. Invitations settings (WF78) links to Message & RSVP (60:7), Delivery (78:1) and Reminders (78:2)', l78.includes('60:7') && l78.includes('78:1') && l78.includes('78:2'), l78.join(','));
check('40. No JavaScript errors while loading and navigating', jsErrors.length === 0, jsErrors.slice(0, 2).join(' | '));
console.log(`\nSETTINGS TESTS: ${pass} passed, ${fail} failed`); if (fail) console.log('FAILED: ' + fails.join(' | '));
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
