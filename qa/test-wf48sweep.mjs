// Usage: node test-wf48sweep.mjs <index.html>
// Global sweep, WF48 items 6/7/9 + Settings > Invitations integration. PASS/FAIL per assertion.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 3700 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 100)); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) return 'EXC:' + ((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text).slice(0, 200); return r.result.value; };
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const url = n => 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + '#workflow-' + n;
let pass = 0, fail = 0; const check = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const load = async (wf, seedKeys) => { await send('Page.navigate', { url: url(wf) }); await sleep(2200); if (seedKeys !== 'keep') { await ev('localStorage.clear();0'); if (seedKeys) for (const [k, v] of Object.entries(seedKeys)) await ev(`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(JSON.stringify(v))});0`); } await send('Page.reload'); await sleep(4200); };
const ph = n => `[...document.querySelectorAll('.storyboard .st-phone')][${n - 1}]`;
const click = (n, sel) => ev(`(()=>{const b=${ph(n)}.querySelector(${JSON.stringify(sel)});if(!b)return 'NOT FOUND';if(b.disabled)return 'DISABLED';b.click();return 'ok'})()`);
const setVal = (n, sel, v) => ev(`(()=>{const b=${ph(n)}.querySelector(${JSON.stringify(sel)});if(!b)return 'NOT FOUND';b.value=${JSON.stringify(v)};b.dispatchEvent(new Event('input',{bubbles:true}));return 'ok'})()`);
const txt = (n, sel) => ev(`((${ph(n)}.querySelector(${JSON.stringify(sel)})||{}).textContent||'(none)').replace(/\\s+/g,' ').trim()`);
const has = (n, sel) => ev(`!!${ph(n)}.querySelector(${JSON.stringify(sel)})`);
const IV = 'nora.wf48.invites.preview.v2', CFGK = 'nora.cfg.v2';
const base = { send: true, audience: 'PICK', selected: [], seatScheme: 2, table: 1, arrival: '7:00 PM', response: '', confirmed: false, rsvpLog: {} };

console.log('=== ITEM 6: frames refresh live from saved state (no page reload) ===');
await load(48, { [IV]: base });
await click(1, '[data-wf48-next=schedule]'); await sleep(300);   // keeps invite flow state; S3 is reachable directly below
for (const k of [0, 2, 5, 8]) await click(3, `[data-wf48-player="${k}"]`); await sleep(500);
check('S3 -> S4: choosing 4 players updates "N INVITEES" on Screen 4 immediately', (await txt(4, '.wf48-message-facts b')) === '4 INVITEES', await txt(4, '.wf48-message-facts b'));
await setVal(4, '[data-wf48-owner-note]', 'Bring your lucky chips!'); await sleep(500);
check('S4 -> S5: the note typed on Screen 4 appears on Screen 5 immediately (before any response is tapped)', (await txt(5, '.wf48-guest-note')).includes('Bring your lucky chips!'), await txt(5, '.wf48-guest-note'));
check('typing keeps the text box and cursor on Screen 4 (not re-rendered under the user)', (await ev(`${ph(4)}.querySelector('[data-wf48-owner-note]').value`)) === 'Bring your lucky chips!');
await click(5, '[data-wf48-rsvp="YES"]'); await sleep(500);
check('S5: tapping YES leaves Screen 6 and 7 consistent (no seat chosen yet)', (await txt(6, '.wf48-seat-hint')) === 'TAP AN OPEN SEAT TO CHOOSE' && (await txt(7, '.wf48-confirm-top')).endsWith('SEAT —'));
await click(5, '[data-wf48-choose-seat]'); await sleep(500); await click(6, '[data-wf48-seat="4"]'); await sleep(500); await click(6, '[data-wf48-reserve]'); await sleep(700);
check('S6 RESERVE -> S7 updates immediately: banner shows SEAT 4 and count is 6', (await txt(7, '.wf48-confirm-top')).endsWith('SEAT 4') && (await txt(7, '.wf48-count')).startsWith('6 PLAYERS'), (await txt(7, '.wf48-confirm-top')) + ' | ' + (await txt(7, '.wf48-count')));
check('S6 RESERVE -> S5 count tile also shows 6 PLAYERS RESERVED', (await txt(5, '.wf48-count')) === '6 PLAYERS RESERVED', await txt(5, '.wf48-count'));
await click(7, '[data-wf48-cancel]'); await sleep(700);
check('S7 CANCEL RSVP -> S7 back to 5 players and S5 shows NOT COMING, without reload', (await txt(7, '.wf48-count')).startsWith('5 PLAYERS') && (await txt(5, '.wf48-rsvp-note')) === 'NOT COMING', (await txt(7, '.wf48-count')) + ' | ' + (await txt(5, '.wf48-rsvp-note')));

console.log('\n=== ITEM 7: body titles no longer repeat the header subtitle ===');
await load(48, { [IV]: base });
const heads = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('.storyboard .st-phone')].map(p=>({sub:((p.querySelector('.ux-headtitle small')||{}).textContent||'').trim(),title:((p.querySelector('.wf48-message-title,.wf48-player-top strong')||{}).textContent||'').trim()})))`));
check('S3 title is "TAP TO INVITE" (counter kept), S4 title is "WHAT PLAYERS WILL SEE"', heads[2].title === 'TAP TO INVITE' && heads[3].title === 'WHAT PLAYERS WILL SEE', JSON.stringify([heads[2], heads[3]]));
check('no WF48 screen repeats its header subtitle as its body title (case-insensitive)', heads.every(h => !h.title || h.title.toLowerCase() !== h.sub.toLowerCase()), heads.filter(h => h.title && h.title.toLowerCase() === h.sub.toLowerCase()).map(h => h.title).join(','));
check('S4 title fits on one line, S3 counter still shown', (await ev(`(()=>{const t=${ph(4)}.querySelector('.wf48-message-title');return t.scrollWidth<=t.clientWidth+1&&t.getBoundingClientRect().height<=30})()`)) === true && (await txt(3, '.wf48-player-top span')).endsWith('SELECTED'));

console.log('\n=== ITEM 9: one wording for the reserved count; one time format ===');
check('S5, S6 and S7 all say "N PLAYERS RESERVED"', (await txt(5, '.wf48-count')) === '5 PLAYERS RESERVED' && (await txt(6, '.wf48-count')) === '5 PLAYERS RESERVED' && (await txt(7, '.wf48-count')) === '5 PLAYERS RESERVED', [await txt(5, '.wf48-count'), await txt(6, '.wf48-count'), await txt(7, '.wf48-count')].join(' | '));
await setVal(1, '[data-wf2-time]', '25:99'); await click(1, '[data-wf48-next=schedule]'); await sleep(400);
check('S1 invalid-time message uses the displayed format "7:00 PM"', /time as 7:00 PM/.test(await txt(1, '.wf2-status')) && !/07:00/.test(await txt(1, '.wf2-status')), await txt(1, '.wf2-status'));

console.log('\n=== SETTINGS > INVITATIONS: new module, shared state, really drives WF48 ===');
await load(60, null);
const nFrames = await ev(`document.querySelectorAll('.storyboard .st-phone').length`);
check('Settings (WF60) now has 8 screens; the 8th is "Invitations"', nFrames === 8 && (await ev(`((${ph(8)}.querySelector('.ux-headtitle small')||{}).textContent||'')`)).trim() === 'Invitations', `frames=${nFrames} sub=` + (await ev(`((${ph(8)}.querySelector('.ux-headtitle small')||{}).textContent||'')`)));
const rows = JSON.parse(await ev(`JSON.stringify([...${ph(8)}.querySelectorAll('.st-ar')].map(r=>({t:(r.querySelector('b')||{}).textContent,tog:!!r.querySelector('.st-tog'),key:(r.querySelector('.st-tog')||{dataset:{}}).dataset.cfg||null,on:r.querySelector('.st-tog')?r.querySelector('.st-tog').classList.contains('on'):null})))`));
const want = ['Invitation message', 'Owner personal message', 'RSVP choices', 'Ask arrival time', 'Allow seat reservation', 'Show reserved count', 'Photos on reserved seats'];
check('module lists message, owner note, RSVP choices, arrival, seat reservation, reserved count, photos', want.every((w, i) => rows[i] && rows[i].t === w), rows.map(r => r.t).join(' | '));
check('5 real toggles bound to the shared invites.* settings, all ON by default', rows.filter(r => r.tog).length === 5 && rows.filter(r => r.tog).every(r => r.on && /^invites\./.test(r.key)), rows.filter(r => r.tog).map(r => r.key + ':' + r.on).join(' '));
check('seat-hold chips (15/30/60 MIN) and the delivery link are present', (await ev(`[...${ph(8)}.querySelectorAll('.fb-opt b')].map(b=>b.textContent.trim()).join(',')`)) === '15 MIN,30 MIN,60 MIN' && (await has(8, '.fb-li[data-rn-route="60:3"]')));
check('Settings home lists "Invitations" and it opens this screen (60:7)', (await ev(`[...${ph(1)}.querySelectorAll('.fb-li')].some(b=>b.dataset.rnRoute==='60:7'&&/Invitations/.test(b.textContent))`)) === true);
check('the Settings screen shows the honest backend note', /needs the delivery backend/.test(await txt(8, '.fb-note, .note, [class*=note]')) || (await ev(`${ph(8)}.innerText.includes('needs the delivery backend')`)) === true);
// flip toggles and verify WF48 follows (same browser storage)
const flip = async key => ev(`(()=>{const b=${ph(8)}.querySelector('.st-tog[data-cfg="invites.${key}"]');if(!b)return 'NOT FOUND';b.click();return b.classList.contains('on')?'on':'off'})()`);
for (const key of ['note', 'askArrival', 'reserve', 'showCount', 'thumbs']) { const r = await flip(key); check(`toggle invites.${key} turns OFF and is saved`, r === 'off' && JSON.parse(await ev(`localStorage.getItem(${JSON.stringify(CFGK)})`)).invites[key] === false, r); }
// WF48 with everything off
await send('Page.navigate', { url: url(48) }); await sleep(1800); await send('Page.reload'); await sleep(4200);
await ev(`localStorage.setItem(${JSON.stringify(IV)},${JSON.stringify(JSON.stringify(Object.assign({}, base, { note: 'Hello there', response: '' })))});0`); await send('Page.reload'); await sleep(4200);
check('note OFF: Screen 4 has no personal-message box, Screen 5 shows no personal message', !(await has(4, '[data-wf48-owner-note]')) && !(await has(5, '.wf48-guest-note')));
check('reserved count OFF: Screen 5 has no count tile', !(await has(5, '.wf48-count')));
await click(5, '[data-wf48-rsvp="YES"]'); await sleep(500);
check('arrival OFF: tapping YES shows no arrival question', !(await has(5, '.wf48-arrival')));
check('seat reservation OFF: YES offers SEND RESPONSE (not SELECT SEAT)', (await txt(5, '.wf48-message-footer button')) === 'SEND RESPONSE' && (await has(5, '[data-wf48-submit-rsvp]')) && !(await has(5, '[data-wf48-choose-seat]')));
await click(5, '[data-wf48-submit-rsvp]'); await sleep(400);
check('YES without a seat records "COMING RECORDED · NO SEAT HELD" and keeps no seat', (await txt(5, '.wf48-status')) === 'COMING RECORDED · NO SEAT HELD' && JSON.parse(await ev(`localStorage.getItem(${JSON.stringify(IV)})`)).seat === null, await txt(5, '.wf48-status'));
const photosOff = JSON.parse(await ev(`JSON.stringify([6,7].map(n=>{const p=[...document.querySelectorAll('.storyboard .st-phone')][n-1];return {img:p.querySelectorAll('.wf48-seat.reserved img').length,initials:[...p.querySelectorAll('.wf48-seat.reserved .wf48-seat-face span')].map(s=>s.textContent.trim()).join(',')}}))`));
check('photos OFF: reserved seats on Screens 6 and 7 show initials, no pictures', photosOff.every(x => x.img === 0 && x.initials.split(',').length === 5), JSON.stringify(photosOff));
// turn them back ON and verify WF48 follows
await load(60, 'keep');
for (const key of ['note', 'askArrival', 'reserve', 'showCount', 'thumbs']) await flip(key);
await send('Page.navigate', { url: url(48) }); await sleep(1800); await send('Page.reload'); await sleep(4200);
await ev(`localStorage.setItem(${JSON.stringify(IV)},${JSON.stringify(JSON.stringify(Object.assign({}, base, { note: 'Hello there' })))});0`); await send('Page.reload'); await sleep(4200);
check('all back ON: note box, personal message, count tile and photos return', (await has(4, '[data-wf48-owner-note]')) && (await has(5, '.wf48-guest-note')) && (await has(5, '.wf48-count')) && (await ev(`${ph(6)}.querySelectorAll('.wf48-seat.reserved img').length`)) === 5);
await click(5, '[data-wf48-rsvp="YES"]'); await sleep(400);
check('all back ON: YES shows the arrival question and SELECT SEAT again', (await has(5, '.wf48-arrival')) && (await txt(5, '.wf48-message-footer button')) === 'SELECT SEAT');
console.log('\n=== JavaScript errors ==='); check('no uncaught JavaScript exceptions', jsErrors.length === 0, jsErrors.slice(0, 3).join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed`); ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
