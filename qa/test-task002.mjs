// Usage: node test-task002.mjs <index.html>
// WF48 seat renumbering functional tests. Prints PASS/FAIL per assertion and a summary.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 8500 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 100)); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result.result.value;
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const url = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + '#workflow-48';
const KEY = 'nora.wf48.invites.preview.v2';
let pass = 0, fail = 0;
const check = (name, ok, detail = '') => { if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`); };
const load = async (seed) => { await send('Page.navigate', { url }); await sleep(2500); await ev(`localStorage.clear(); ${seed ? `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(seed))});` : ''} 0`); await send('Page.reload'); await sleep(3500); };
const ph = n => `[...document.querySelectorAll('.storyboard .st-phone')][${n - 1}]`;
const click = (n, sel) => ev(`(()=>{const b=${ph(n)}.querySelector(${JSON.stringify(sel)});if(!b)return 'NOT FOUND';if(b.disabled)return 'DISABLED';b.click();return 'ok'})()`);
const state = () => ev(`localStorage.getItem(${JSON.stringify(KEY)})`).then(s => s ? JSON.parse(s) : null);
const seatsOf = n => ev(`JSON.stringify([...${ph(n)}.querySelectorAll('.wf48-seat')].map(s=>{const r=s.getBoundingClientRect(),c=s.closest('.wf48-table-seats').getBoundingClientRect();return {id:Number(s.dataset.wf48Seat),label:s.querySelector('.wf48-seat-number').textContent.trim(),name:s.querySelector('b').textContent.trim(),reserved:s.classList.contains('reserved'),mine:s.classList.contains('mine'),disabled:s.disabled,cx:+(((r.left+r.width/2-c.left)/c.width)*100).toFixed(1),cy:+(((r.top+r.height/2-c.top)/c.height)*100).toFixed(1)}}))`).then(JSON.parse);
const txt = (n, sel) => ev(`((${ph(n)}.querySelector(${JSON.stringify(sel)})||{}).textContent||'(none)').replace(/\\s+/g,' ').trim()`);

// geometry: index i (old label i+1) at these centre percentages; new id = ((i+1+5)%10)+1
const COORDS = [[17, 14], [50, 14], [83, 14], [83, 38], [83, 62], [83, 86], [50, 86], [17, 86], [17, 62], [17, 38]];
const OLD2NEW = { 5: 1, 6: 2, 7: 3, 8: 4, 9: 5, 10: 6, 1: 7, 2: 8, 3: 9, 4: 10 };
const DEMO = { 7: 'Luka', 9: 'Macaulay', 1: 'Miguel', 3: 'Paul', 5: 'Nora' }; // new id -> player, same physical spots as old 1,3,5,7,9

console.log('=== A. Position mapping, all 10 seats, Screens 6 and 7 ===');
await load(null);
for (const scr of [6, 7]) {
  const s = await seatsOf(scr); const ids = s.map(x => x.id);
  check(`S${scr}: exactly 10 seat tiles, ids unique 1..10`, s.length === 10 && new Set(ids).size === 10 && ids.slice().sort((a, b) => a - b).join() === '1,2,3,4,5,6,7,8,9,10', ids.join());
  check(`S${scr}: displayed label equals internal id on every tile`, s.every(x => String(x.id) === x.label));
  let allPos = true; const bad = [];
  for (let i = 0; i < 10; i++) { const oldLabel = i + 1, newId = OLD2NEW[oldLabel], tile = s.find(x => x.id === newId); const ok = tile && Math.abs(tile.cx - COORDS[i][0]) < 1.5 && Math.abs(tile.cy - COORDS[i][1]) < 1.5; if (!ok) { allPos = false; bad.push(`old ${oldLabel}->new ${newId}`); } }
  check(`S${scr}: old position 5,6,7,8,9,10,1,2,3,4 now carries 1..10 (mapping table)`, allPos, bad.join('; '));
  const demoOk = Object.entries(DEMO).every(([sid, nm]) => { const x = s.find(y => y.id === Number(sid)); return x && x.reserved && x.name === nm && x.disabled; });
  check(`S${scr}: demo players keep their physical seats (ids 7,9,1,3,5), reserved + disabled`, demoOk);
  check(`S${scr}: open seats are 2,4,6,8,10; enabled on Screen 6, inert (disabled) on Screen 7`, [2, 4, 6, 8, 10].every(sid => { const x = s.find(y => y.id === sid); return x && !x.reserved && (scr === 6 ? !x.disabled : x.disabled) && x.name === 'OPEN'; }));
  const seq = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => OLD2NEW[i + 1]);
  check(`S${scr}: clockwise from top-left reads ${seq.join(',')}`, seq.join() === '7,8,9,10,1,2,3,4,5,6');
}
check('S6: header count 5 PLAYERS RESERVED', (await txt(6, '.wf48-count')).startsWith('5 PLAYERS'), await txt(6, '.wf48-count'));
check('S7: count tile says 5 PLAYERS RESERVED SEATS', (await txt(7, '.wf48-count')).startsWith('5 PLAYERS'), await txt(7, '.wf48-count'));

console.log('\n=== B. Full flow for every open seat (2,4,6,8,10): YES -> choose seat -> reserve -> confirm -> done -> reload -> cancel ===');
for (const seatId of [2, 4, 6, 8, 10]) {
  await load(null);
  const r1 = await click(5, '[data-wf48-rsvp="YES"]'); await sleep(300);
  await click(5, '[data-wf48-choose-seat]'); await sleep(500);
  const r3 = await click(6, `[data-wf48-seat="${seatId}"]`); await sleep(500);
  const hint = await txt(6, '.wf48-seat-hint'); const st1 = await state(); const s6 = await seatsOf(6); const mine6 = s6.filter(x => x.mine);
  const expectedIdx = Number(Object.entries(OLD2NEW).find(([, nv]) => nv === seatId)[0]) - 1;
  check(`seat ${seatId}: click selected it (hint, state, single 'mine' tile at its own position)`, r1 === 'ok' && r3 === 'ok' && hint === `SELECTED: TABLE 1 · SEAT ${seatId}` && st1 && st1.seat === seatId && mine6.length === 1 && mine6[0].id === seatId && Math.abs(mine6[0].cx - COORDS[expectedIdx][0]) < 1.5 && Math.abs(mine6[0].cy - COORDS[expectedIdx][1]) < 1.5, `hint="${hint}" state.seat=${st1 && st1.seat} mine=${mine6.map(x => x.id)}`);
  const r4 = await click(6, '[data-wf48-reserve]'); await sleep(700);
  const st2 = await state();
  check(`seat ${seatId}: RESERVE stores confirmation data (confirmed, seat, rsvpLog seat)`, r4 === 'ok' && st2.confirmed === true && st2.seat === seatId && st2.rsvpLog.current && st2.rsvpLog.current.seat === seatId && st2.rsvpLog.current.table === 1, JSON.stringify({ conf: st2.confirmed, seat: st2.seat, log: st2.rsvpLog.current && st2.rsvpLog.current.seat }));
  await send('Page.reload'); await sleep(3500);   // Screen 7 renders from the saved state (live refresh after RESERVE does not exist in the original either)
  const s7 = await seatsOf(7); const banner = await txt(7, '.wf48-confirm-top'); const cnt = await txt(7, '.wf48-count'); const mine7 = s7.filter(x => x.mine);
  const expIdx = Number(Object.entries(OLD2NEW).find(([, nv]) => nv === seatId)[0]) - 1;
  check(`seat ${seatId}: Screen 7 renders banner SEAT ${seatId}, own tile at the right spot, count 6`, banner.endsWith(`SEAT ${seatId}`) && mine7.length === 1 && mine7[0].id === seatId && Math.abs(mine7[0].cx - COORDS[expIdx][0]) < 1.5 && Math.abs(mine7[0].cy - COORDS[expIdx][1]) < 1.5 && cnt.startsWith('6 PLAYERS'), `banner="${banner}" mine=${mine7.map(x => x.id)} count="${cnt}"`);
  const ids7 = s7.map(x => x.id); const reservedNow = s7.filter(x => x.reserved || x.mine).map(x => x.id);
  check(`seat ${seatId}: no duplicate ids / no double booking on S7 (6 distinct reserved seats)`, new Set(ids7).size === 10 && new Set(reservedNow).size === 6, reservedNow.sort((a, b) => a - b).join());
  const s6r = await seatsOf(6); const mine6r = s6r.filter(x => x.mine);
  check(`seat ${seatId}: Screen 6 after reload also shows only seat ${seatId} as mine, and open seats stay open`, mine6r.length === 1 && mine6r[0].id === seatId && s6r.filter(x => !x.reserved && !x.mine).length === 4, `mine=${mine6r.map(x => x.id)}`);
  const r5 = await click(7, '[data-wf48-done]'); await sleep(500);
  const banner2 = await txt(7, '.wf48-confirm-top');
  check(`seat ${seatId}: DONE banner shows RSVP CONFIRMED with SEAT ${seatId}`, r5 === 'ok' && banner2.includes('RSVP CONFIRMED') && banner2.endsWith(`SEAT ${seatId}`), banner2);
  const r6 = await click(7, '[data-wf48-cancel]'); await sleep(700);
  const st3 = await state();
  check(`seat ${seatId}: CANCEL RSVP clears the reservation in saved state (seat null, response NO, not confirmed)`, r6 === 'ok' && st3.seat === null && st3.response === 'NO' && st3.confirmed === false, `state.seat=${st3.seat} resp=${st3.response} confirmed=${st3.confirmed}`);
  await send('Page.reload'); await sleep(3500);
  const s7c = await seatsOf(7); const cnt2 = await txt(7, '.wf48-count');
  check(`seat ${seatId}: after cancel + reload no seat is mine, count back to 5, seat ${seatId} is open again`, !s7c.some(x => x.mine) && cnt2.startsWith('5 PLAYERS') && s7c.find(x => x.id === seatId).name === 'OPEN', `count="${cnt2}"`);
}
console.log('\n=== C. Reserved seats cannot be chosen (double-booking guard) ===');
await load(null); await click(5, '[data-wf48-rsvp="YES"]'); await sleep(300); await click(5, '[data-wf48-choose-seat]'); await sleep(500);
for (const seatId of [1, 3, 5, 7, 9]) {
  const r = await click(6, `[data-wf48-seat="${seatId}"]`); await sleep(200); const st = await state();
  check(`reserved seat ${seatId} (${DEMO[seatId]}) is not selectable`, r === 'DISABLED' && (!st || st.seat === null), `click=${r} state.seat=${st && st.seat}`);
}
await click(6, '[data-wf48-reserve]'); await sleep(300);
check('RESERVE with no seat chosen is rejected with the message', (await txt(6, '.wf48-status')) === 'SELECT AN OPEN SEAT', await txt(6, '.wf48-status'));

console.log('\n=== D. Saved demo state from the OLD numbering is migrated (old seat -> new seat, same physical spot) ===');
for (const [oldSeat, newSeat] of [[2, 8], [4, 10], [6, 2], [8, 4], [10, 6]]) {
  const seed = { send: true, audience: 'PICK', response: 'YES', arrival: '7:00 PM', seat: oldSeat, table: 1, confirmed: true, rsvpLog: { current: { status: 'Coming', table: 1, seat: oldSeat, arrival: '7:00 PM' } }, selected: [], note: '' }; // no seatScheme = old data
  await load(seed);
  const s7 = await seatsOf(7); const m = s7.filter(x => x.mine); const idx = oldSeat - 1;
  const banner = await txt(7, '.wf48-confirm-top');
  check(`old saved seat ${oldSeat} -> new ${newSeat}, same physical position`, m.length === 1 && m[0].id === newSeat && Math.abs(m[0].cx - COORDS[idx][0]) < 1.5 && Math.abs(m[0].cy - COORDS[idx][1]) < 1.5, `mine=${m.map(x => x.id)} banner="${banner}"`);
  await click(7, '[data-wf48-done]'); await sleep(400); const st = await state();
  check(`  migrated state is stamped and consistent (seat ${newSeat}, scheme 2, log seat ${newSeat})`, st.seat === newSeat && st.seatScheme === 2 && st.rsvpLog.current.seat === newSeat, JSON.stringify({ seat: st.seat, scheme: st.seatScheme, log: st.rsvpLog.current.seat }));
  await send('Page.reload'); await sleep(3500); const s7b = await seatsOf(7);
  check(`  second load does not migrate again (still seat ${newSeat})`, s7b.filter(x => x.mine).map(x => x.id).join() === String(newSeat), s7b.filter(x => x.mine).map(x => x.id).join());
}

console.log('\n=== E. JavaScript errors ===');
check('no uncaught JavaScript exceptions during all of the above', jsErrors.length === 0, jsErrors.join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed`);
ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
