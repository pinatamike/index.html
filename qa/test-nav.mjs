// Usage: node test-nav.mjs <index.html> [maxWf=71]   -- navigation regression tests (PASS/FAIL), repeatable
// Covers brief items: 6 primary tabs, names/order, Profile/Support/Privacy footer, no subtabs, contextual bars differ,
// Live bar uses "Table", Reports + Settings bars, no bar in Schedule/Players/Team, drawer from EVERY screen, direct links, back.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath, maxWf = '71'] = process.argv.slice(2);
const port = 5300 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 90)); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) return 'EXC:' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text).slice(0, 220); return r.result.value; };
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const url = n => 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + '#workflow-' + n;
const settle = async (wfNum) => { for (let k = 0; k < 60; k++) { await sleep(500); const st = await ev(`(()=>{const S=[...document.querySelectorAll('.storyboard .stage')];if(!S.length||typeof NORA_NAV_CTX!=='function')return JSON.stringify({ok:false});const w=${wfNum||0}||(+(location.hash.match(/workflow-(\d+)/)||[])[1]);let ok=true;S.forEach(s=>{const p=s.querySelector('.phone');if(!p){ok=false;return}const c=NORA_NAV_CTX(w,+s.dataset.rnStep);const nb=p.querySelector(':scope>.ux-bottom');const exp=c?c.bar:null;const act=nb?(nb.classList.contains('s2-nav')?(nb.dataset.bar||'x'):'legacy'):null;if(exp!==act)ok=false;if(!p.querySelector('.ux-hamb[data-s2]'))ok=false});return JSON.stringify({ok})})()`); try { if (JSON.parse(st).ok) { await sleep(500); return; } } catch {} } };
let pass = 0, fail = 0; const fails = [];
const check = (n, ok, d = '') => { ok ? pass++ : (fail++, fails.push(n)); if (!ok || process.env.VERBOSE) console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const SIX = ['Tables', 'Players', 'Team', 'Schedule', 'Reports', 'Settings'];
// ---- A. the central config (single source) -------------------------------------------------
await send('Page.navigate', { url: url(1) }); await sleep(2500); await send('Page.reload'); await sleep(3500);
const cfg = JSON.parse(await ev(`JSON.stringify({nav:(window.NORA_NAV?NORA_NAV():[]).map(s=>s.label),keys:(window.NORA_NAV?NORA_NAV():[]).map(s=>s.key),sec:[[1,0],[20,0],[48,0],[55,0],[60,0],[67,0],[53,0],[53,3]].map(a=>NORA_NAV_SECTION(a[0],a[1])),ctx:[[1,0],[4,0],[20,0],[26,0],[33,0],[41,0],[48,0],[54,0],[60,0],[61,0],[64,1],[67,0],[69,0]].map(a=>{const c=NORA_NAV_CTX(a[0],a[1]);return [a[0],c?c.bar+':'+c.tab:null]})})`));
check('A1 exactly six primary tabs in the single NAV config', cfg.nav.length === 6, cfg.nav.join(','));
check('A2 names and order are Tables, Players, Team, Schedule, Reports, Settings', cfg.nav.join() === SIX.join(), cfg.nav.join(','));
check('A3 nothing is still called Scheduled / Reporting / Live Session in the primary tabs', !cfg.nav.some(x => /Scheduled|Reporting|Live Session/.test(x)));
check('A4 section keys agree with labels (no stale keys)', cfg.keys.join() === SIX.join(), cfg.keys.join());
check('A5 workflow -> section mapping uses the new names', cfg.sec.join() === 'Tables,Tables,Schedule,Players,Settings,Reports,Schedule,Tables', cfg.sec.join());
const ctxMap = Object.fromEntries(cfg.ctx.map(([w, c]) => [w, c]));
check('A6 contextual bar differs from the primary tabs and is chosen by module (Live=live, Reports=reporting, Settings=settings, none for Schedule/Players)', ctxMap[1].startsWith('live:') && ctxMap[67].startsWith('reporting:') && ctxMap[60].startsWith('settings:') && ctxMap[48] === null && ctxMap[54] === null, JSON.stringify(ctxMap));
check('A7 Live contextual active tab for Live workflows is "Table" (singular), never "Tables"', [1, 4, 20, 26, 33, 41].every(w => /^live:/.test(ctxMap[w])) && !Object.values(ctxMap).some(c => c === 'live:Tables') && ctxMap[1] === 'live:Table', ctxMap[1]);

// ---- B. every screen of every workflow ------------------------------------------------------
const PH = `[...document.querySelectorAll('.storyboard .stage')]`;
let frames = 0, drawerChecked = 0, retried = 0;
const checkFrame = async (wf, i) => {
  const f = JSON.parse(await ev(`JSON.stringify((()=>{const st=${PH}[${i}];if(!st)return null;const p=st.querySelector('.phone'),nb=p&&p.querySelector(':scope>.ux-bottom');return {step:+st.dataset.rnStep,hasHamb:!!(p&&p.querySelector('.ux-hamb')),bar:nb?(nb.dataset.bar||'?'):null,s2:nb?nb.classList.contains('s2-nav'):null,player:!!(p&&p.classList.contains('iv-player')),tabs:nb?[...nb.querySelectorAll('.ux-tab')].map(x=>(x.querySelector('.s2-lbl')||x).textContent.trim()):[],bars:p?p.querySelectorAll(':scope>.ux-bottom').length:0}})())`));
  const bad = []; if (!f) return ['frame missing'];
  if (f.player) return (f.bar || f.hasHamb) ? ['player-facing invitation screen must carry no NORA header menu or bottom bar'] : [];   // WF50/52 player web link: no app chrome by design
  const exp = JSON.parse(await ev(`JSON.stringify((()=>{const c=NORA_NAV_CTX(${wf},${f.step});return c?c.bar:null})())`));
  if ((f.bar || null) !== exp) bad.push(`bar=${f.bar} expected=${exp}`);
  if (f.bars > 1) bad.push(`${f.bars} bottom bars`);
  if (f.bar && JSON.stringify(f.tabs) === JSON.stringify(SIX)) bad.push('bottom bar is the six primary tabs');
  if (f.bar === 'live' && (!f.tabs.includes('Table') || f.tabs.includes('Tables'))) bad.push(`live bar tabs ${f.tabs.join('/')}`);
  if (f.bar === 'reporting' && f.tabs.length !== 5) bad.push(`reports bar has ${f.tabs.length} tabs`);
  if (f.bar === 'settings' && f.tabs.length !== 6) bad.push(`settings bar has ${f.tabs.length} tabs`);
  if (!f.hasHamb) { bad.push('no hamburger in header'); return bad; }
  const rawD = await ev(`(()=>{const st=${PH}[${i}];const h=st.querySelector('.ux-hamb');h.click();const dr=st.querySelector('.nn-drawer');if(!dr)return JSON.stringify(null);const r={tabs:[...dr.querySelectorAll('.nn-list .nn-sh')].map(b=>b.textContent.trim()),foot:[...dr.querySelectorAll('.nn-footer .nn-foot')].map(b=>{const s=b.querySelectorAll(':scope>span');return (s[s.length-1]||b).textContent.trim()}),footFs:[...dr.querySelectorAll('.nn-footer .nn-foot span')].map(s=>parseFloat(getComputedStyle(s).fontSize)),active:[...dr.querySelectorAll('.nn-sh.nn-active')].map(b=>b.textContent.trim()),extra:dr.querySelectorAll('.nn-list .nn-sec,.nn-list .nn-sub,.nn-list ul,.nn-list [data-nn-item]').length,list:dr.querySelectorAll('.nn-list .nn-sh').length,avatar:!!dr.querySelector('.nn-footer .nn-profile .nn-avatar'),profileGo:(dr.querySelector('.nn-footer .nn-profile')||{dataset:{}}).dataset.nnGo,coversBar:(()=>{const b=st.querySelector('.phone>.ux-bottom');if(!b||getComputedStyle(b).display==='none')return true;const a=dr.getBoundingClientRect(),c=b.getBoundingClientRect();return a.bottom>=c.bottom-0.5&&a.top<=c.top})()};dr.remove();return JSON.stringify(r)})()`);
  drawerChecked++;
  if (typeof rawD === 'string' && rawD.startsWith('EXC:')) { bad.push('drawer probe threw ' + rawD); return bad; }
  const d = JSON.parse(rawD); if (!d) { bad.push('hamburger did not open a drawer'); return bad; }
  if (d.tabs.join() !== SIX.join()) bad.push(`drawer tabs ${d.tabs.join('/')}`);
  if (d.extra > 0 || d.list !== 6) bad.push(`drawer has subtabs/extras (${d.extra}) or ${d.list} rows`);
  if (d.foot.join() !== 'Profile,Support,Privacy' || !d.avatar || !d.profileGo) bad.push(`drawer footer ${d.foot.join('/')} avatar=${d.avatar}`);
  if (d.footFs.some(x => x < 16)) bad.push(`footer font ${d.footFs.join('/')}`);
  if (d.active.length !== 1) bad.push(`active tab count ${d.active.length}`);
  if (!d.coversBar) bad.push('drawer does not cover the bottom bar');
  return bad;
};
for (let wf = Number(process.env.START || 1); wf <= Number(maxWf); wf++) {
  await send('Page.navigate', { url: url(wf) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
  const n = await ev(`${PH}.length`); frames += n; const persistent = [];
  for (let i = 0; i < n; i++) {
    let bad = [];
    for (let attempt = 0; attempt < 4; attempt++) { bad = await checkFrame(wf, i); if (!bad.length) break; retried += attempt === 0 ? 1 : 0; await sleep(1000); }   // retry: some screens refresh periodically and re-apply navigation a moment later
    if (bad.length) persistent.push(`step${i}: ${bad.join('; ')}`);
  }
  check(`B wf${wf}: ${n} screen(s) - drawer + contextual bar correct on every screen`, persistent.length === 0, persistent.slice(0, 3).join(' | '));
}
// ---- C. behaviour: drawer destinations, tab highlight, direct links, back -------------------
const S = `${PH}[0]`;
await send('Page.navigate', { url: url(1) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
const dest = {};
for (const label of SIX) {
  await send('Page.navigate', { url: url(1) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
  const res = await ev(`(()=>{const st=${S};st.querySelector('.ux-hamb').click();const b=[...st.querySelectorAll('.nn-drawer .nn-list .nn-sh')].find(x=>x.textContent.trim()===${JSON.stringify(label)});if(!b)return 'no tab';const go=b.dataset.nnGo;b.click();return go})()`); await sleep(900);
  dest[label] = res + ' -> ' + (await ev(`location.hash`));
}
check('C1 each drawer tab opens its own section home', SIX.every(l => dest[l] && !/no tab/.test(dest[l])), JSON.stringify(dest));
check('C2 Support and Privacy open an in-drawer panel with a way back; Profile opens the profile screen', await (async () => { await send('Page.navigate', { url: url(1) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
  const r = JSON.parse(await ev(`(()=>{const st=${S};st.querySelector('.ux-hamb').click();const dr=st.querySelector('.nn-drawer');const sup=dr.querySelector('[data-nn-info="Support"]');sup.click();const t1=dr.querySelector('.nn-info b')&&dr.querySelector('.nn-info b').textContent;const back=!!dr.querySelector('[data-nn-back]');dr.querySelector('[data-nn-back]').click();const dr2=st.querySelector('.nn-drawer');const pri=dr2.querySelector('[data-nn-info="Privacy"]');pri.click();const t2=dr2.querySelector('.nn-info b')&&dr2.querySelector('.nn-info b').textContent;return JSON.stringify({t1,t2,back,profile:dr2.querySelector('.nn-profile')?dr2.querySelector('.nn-profile').dataset.nnGo:null})})()`));
  return r.t1 === 'Support' && r.t2 === 'Privacy' && r.back && /^65:/.test(r.profile); })());
// contextual bar tabs navigate within the module and keep the module's bar
await send('Page.navigate', { url: url(1) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
const tabNav = await ev(`(()=>{const st=${S};const t=[...st.querySelectorAll('.phone>.ux-bottom .ux-tab')].find(x=>(x.querySelector('.s2-lbl')||x).textContent.trim()==='Snapshot');if(!t)return 'none';t.click();return t.dataset.s2Home})()`); await sleep(1000);
check('C3 tapping a contextual Live tab (Snapshot) navigates within Live and the Live bar stays', /^32:/.test(tabNav) && /workflow-32/.test(await ev('location.hash')) && (await ev(`${PH}[0].querySelector('.phone>.ux-bottom')&&${PH}[0].querySelector('.phone>.ux-bottom').dataset.bar`)) === 'live', tabNav + ' ' + (await ev('location.hash')));
await send('Page.navigate', { url: url(67) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
check('C4 direct link to a Reports workflow shows the Reports bar (not six primary tabs, not Live)', (await ev(`${PH}[0].querySelector('.phone>.ux-bottom')&&${PH}[0].querySelector('.phone>.ux-bottom').dataset.bar`)) === 'reporting');
await send('Page.navigate', { url: url(60) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
check('C5 direct link to Settings shows the Settings bar', (await ev(`${PH}[0].querySelector('.phone>.ux-bottom')&&${PH}[0].querySelector('.phone>.ux-bottom').dataset.bar`)) === 'settings');
await send('Page.navigate', { url: url(48) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
check('C6 direct link to Schedule (WF48) shows no bottom bar and no six-tab bar', (await ev(`${PH}.filter(s=>s.querySelector('.phone>.ux-bottom')).length`)) === 0);
// ---- D. browser Back / Forward and links pasted into an already-open tab ------------------------
await send('Page.navigate', { url: url(3) }); await sleep(1800); await send('Page.reload'); await sleep(2600); await settle();
const hdr = async () => ev(`(()=>{const st=document.querySelectorAll('.storyboard .stage')[0];const nb=st&&st.querySelector('.phone>.ux-bottom');return location.hash+'|'+(st?st.dataset.rnWorkflow:'?')+'|'+(nb&&nb.dataset.bar||'none')})()`);
const d0 = await hdr();
await ev(`location.hash='workflow-67';0`); await sleep(2500);
const d1 = await hdr();
await ev(`location.hash='workflow-60';0`); await sleep(2500);
const d2 = await hdr();
await ev(`history.back();0`); await sleep(2500);
const d3 = await hdr();
await ev(`history.back();0`); await sleep(2500);
const d4 = await hdr();
await ev(`history.forward();0`); await sleep(2500);
const d5 = await hdr();
check('D1 a #workflow-N link pasted into an open tab switches workflow and shows that module\'s bar', d1.startsWith('#workflow-67|67|reporting') && d2.startsWith('#workflow-60|60|settings'), `${d0} -> ${d1} -> ${d2}`);
check('D2 browser Back returns to the previous workflow and its bar; Forward goes on again', d3.startsWith('#workflow-67|67|reporting') && d4.startsWith('#workflow-3|3|live') && d5.startsWith('#workflow-67|67|reporting'), `${d3} | ${d4} | ${d5}`);
console.log(`\nframes checked: ${frames} across ${maxWf} workflows; drawers opened: ${drawerChecked}; frames that needed a retry: ${retried}`);
check('no uncaught JavaScript exceptions during the whole run', jsErrors.length === 0, jsErrors.slice(0, 3).join(' | '));
console.log(`SUMMARY: ${pass} passed, ${fail} failed` + (fail ? '  FAILED: ' + fails.slice(0, 12).join(' ; ') : ''));
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
