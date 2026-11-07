// Usage: node test-fixes123.mjs <index.html>
// Checks for audit fixes 1 (Screen 5 personal message), 2 (Screen 7 inert seats), 3 (Screen 3 footer). PASS/FAIL per assertion.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath] = process.argv.slice(2);
const port = 7100 + Math.floor(Math.random() * 400);
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
const url = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/') + '#workflow-48'; const KEY = 'nora.wf48.invites.preview.v2';
let pass = 0, fail = 0; const check = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`); };
const load = async seed => { await send('Page.navigate', { url }); await sleep(2500); await ev(`localStorage.clear(); ${seed ? `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(seed))});` : ''} 0`); await send('Page.reload'); await sleep(3500); };
const ph = n => `[...document.querySelectorAll('.storyboard .st-phone')][${n - 1}]`;
const click = (n, sel) => ev(`(()=>{const b=${ph(n)}.querySelector(${JSON.stringify(sel)});if(!b)return 'NOT FOUND';if(b.disabled)return 'DISABLED';b.click();return 'ok'})()`);
const state = () => ev(`localStorage.getItem(${JSON.stringify(KEY)})`).then(s => s ? JSON.parse(s) : null);
const txt = (n, sel) => ev(`((${ph(n)}.querySelector(${JSON.stringify(sel)})||{}).textContent||'(none)').replace(/\\s+/g,' ').trim()`);
const base = { send: true, audience: 'PICK', selected: [], seatScheme: 2, table: 1, arrival: '7:00 PM', response: '', confirmed: false, rsvpLog: {} };
const LONG = 'Hi everyone! Doors open at 6:30 PM and dinner is served at 7:00 sharp before we start the cards. Parking is available behind the building on the left side, please do not park on the street. Bring cash for your buy-in and a good attitude. If anything changes I will message the group here. Thanks and see you Sunday!';

console.log('=== FIX 3: Screen 3 footer keeps its style after interaction ===');
await load(base); // fresh page, S3 default
const fb = async () => JSON.parse(await ev(`(()=>{const b=${ph(3)}.querySelector('[data-wf48-finish]'),k=${ph(3)}.querySelector('.wf48-player-actions button:not([data-wf48-finish])');const s=x=>{const r=x.getBoundingClientRect(),c=getComputedStyle(x),g=document.createRange();g.selectNodeContents(x);const t=g.getBoundingClientRect();return {h:Math.round(r.height),w:Math.round(r.width),fs:c.fontSize,pad:c.padding,disp:c.display,over:t.bottom>r.bottom-1||t.top<r.top+1,foot:x.parentElement.classList.contains('s2-foot')}};return JSON.stringify({rev:s(b),back:s(k)})})()`));
const d0 = await fb();
const steps = [['pick player 0', () => click(3, '[data-wf48-player="0"]')], ['pick player 5', () => click(3, '[data-wf48-player="5"]')], ['page 2 dot', () => click(3, '[data-wf48-dot="1"]')], ['page 1 dot', () => click(3, '[data-wf48-dot="0"]')], ['deselect player 0', () => click(3, '[data-wf48-player="0"]')], ['deselect player 5', () => click(3, '[data-wf48-player="5"]')]];
check('default: REVIEW INVITES is 17px, 54px tall, flex, 0/8px padding, no text over the border, has s2-foot', d0.rev.fs === '17px' && d0.rev.h === 54 && d0.rev.disp === 'flex' && d0.rev.pad === '0px 8px' && !d0.rev.over && d0.rev.foot, JSON.stringify(d0.rev));
for (const [name, fn] of steps) { await fn(); await sleep(350); const d = await fb(); check(`after "${name}": footer identical to default (both buttons) and no overflow`, JSON.stringify(d) === JSON.stringify(d0) && !d.rev.over && !d.back.over, JSON.stringify(d.rev)); }
await click(3, '[data-wf48-finish]'); await sleep(300);
check('REVIEW INVITES with nobody selected still shows the message', (await txt(3, '.wf48-status')) === 'SELECT AT LEAST ONE PLAYER', await txt(3, '.wf48-status'));

console.log('\n=== FIX 1: Screen 5 personal message never silently cut off ===');
const note = async () => JSON.parse(await ev(`(()=>{const p=${ph(5)},n=p.querySelector('.wf48-guest-note'),g=p.querySelector('.wf48-guest'),f=p.querySelector('.wf48-message-footer'),c=p.querySelector('.wf48-message-card'),pr=p.getBoundingClientRect();if(!n)return JSON.stringify(null);const cs=getComputedStyle(n);return JSON.stringify({h:Math.round(n.getBoundingClientRect().height),clientH:n.clientHeight,scrollH:n.scrollHeight,oy:cs.overflowY,guestOverflow:g.scrollHeight-g.clientHeight,footerTop:Math.round(f.getBoundingClientRect().top-pr.top),cardTop:Math.round(c.getBoundingClientRect().top-pr.top),cardH:Math.round(c.getBoundingClientRect().height),textFirstLineVisible:n.querySelector('span').getBoundingClientRect().top<n.getBoundingClientRect().bottom-14,footerGap:Math.round(pr.bottom-f.getBoundingClientRect().bottom)})})()`));
for (const [label, text] of [['short (30)', 'Bring your lucky chips! — Mike'], ['medium (110)', 'Hi team, doors open at 6:30 for dinner. Parking is behind the building. Please bring cash for the buy-in. See you!'], ['max (280)', LONG.slice(0, 280)]]) {
  await load(Object.assign({}, base, { note: text })); const rows = {};
  rows.default = await note();
  for (const r of ['YES', 'NO', 'MAYBE']) { await click(5, `[data-wf48-rsvp="${r}"]`); await sleep(450); rows[r] = await note(); }
  for (const [st, d] of Object.entries(rows)) {
    const fits = d.scrollH <= d.clientH + 1; // fully visible without scrolling
    const ok = d.guestOverflow === 0 && d.footerTop === 589 && d.cardTop === 107 && d.cardH === 184 && d.h >= 61 && (fits || d.oy === 'auto') && d.textFirstLineVisible;
    check(`${label} note, ${st}: tile ${d.h}px (min 61), ${fits ? 'fully visible' : 'scrolls (' + (d.scrollH - d.clientH) + 'px more)'}, card/footer positions unchanged, nothing pushed off screen`, ok, JSON.stringify(d));
    if (label.startsWith('short')) check(`   short note, ${st}: message fully readable (no hidden text at all)`, fits);
    if (label.startsWith('medium') && st !== 'YES') check(`   medium note, ${st}: message fully readable without scrolling`, fits);
  }
}
// keyboard/touch scroll works on a long note: tile scrollTop can move
await load(Object.assign({}, base, { note: LONG })); const moved = await ev(`(()=>{const n=${ph(5)}.querySelector('.wf48-guest-note');n.scrollTop=40;return n.scrollTop})()`);
check('long note can be scrolled inside its tile to read the rest', moved > 0, 'scrollTop=' + moved);

console.log('\n=== FIX 2: Screen 7 seat tiles are inert ===');
await load(base); await click(5, '[data-wf48-rsvp="YES"]'); await sleep(300); await click(5, '[data-wf48-choose-seat]'); await sleep(500); await click(6, '[data-wf48-seat="4"]'); await sleep(400); await click(6, '[data-wf48-reserve]'); await sleep(600);
await send('Page.reload'); await sleep(3500);
const seats7 = JSON.parse(await ev(`JSON.stringify([...${ph(7)}.querySelectorAll('.wf48-seat')].map(s=>({id:s.dataset.wf48Seat,d:s.disabled})))`));
check('all 10 seat tiles on Screen 7 are disabled (not focusable / not tappable)', seats7.length === 10 && seats7.every(s => s.d), JSON.stringify(seats7.filter(s => !s.d)));
const before = await ev(`${ph(7)}.innerText`); const stB = await state();
for (const sid of [2, 6, 8, 10, 4, 9]) { const r = await click(7, `[data-wf48-seat="${sid}"]`); await sleep(200); check(`tap seat ${sid} on Screen 7 does nothing`, r === 'DISABLED'); }
// even a forced DOM click event must not change anything (guards against synthetic taps)
await ev(`(()=>{const b=${ph(7)}.querySelector('[data-wf48-seat="2"]');b.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return 0})()`); await sleep(400);
const after = await ev(`${ph(7)}.innerText`); const stA = await state();
check('Screen 7 content unchanged after taps (still "SEAT RESERVED", CANCEL RSVP + DONE)', before === after && (await txt(7, '.wf48-message-title')) === 'SEAT RESERVED', await txt(7, '.wf48-message-title'));
check('saved seat/log unchanged (seat 4, log seat 4, confirmed)', stA.seat === stB.seat && stA.seat === 4 && stA.rsvpLog.current.seat === 4 && stA.confirmed === true, JSON.stringify({ seat: stA.seat, log: stA.rsvpLog.current.seat }));
check('DONE and CANCEL RSVP still work on Screen 7', (await click(7, '[data-wf48-done]')) === 'ok' && (await txt(7, '.wf48-confirm-top')).includes('RSVP CONFIRMED') && (await click(7, '[data-wf48-cancel]')) === 'ok');
await sleep(500); const stC = await state(); check('CANCEL RSVP clears the reservation', stC.seat === null && stC.response === 'NO' && stC.confirmed === false);
await load(base); await click(5, '[data-wf48-rsvp="YES"]'); await sleep(300); await click(5, '[data-wf48-choose-seat]'); await sleep(500);
const s6 = JSON.parse(await ev(`JSON.stringify([...${ph(6)}.querySelectorAll('.wf48-seat')].map(s=>({id:Number(s.dataset.wf48Seat),d:s.disabled,res:s.classList.contains('reserved')})))`));
check('Screen 6 is unchanged: only the 5 taken seats are disabled; open seats 2,4,6,8,10 are tappable', s6.filter(s => s.d).map(s => s.id).sort((a, b) => a - b).join() === '1,3,5,7,9' && s6.filter(s => !s.d).map(s => s.id).sort((a, b) => a - b).join() === '2,4,6,8,10');

console.log('\n=== JavaScript errors ==='); check('no uncaught JavaScript exceptions', jsErrors.length === 0, jsErrors.join(' | '));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed`); ws.close(); edge.kill(); process.exit(fail ? 1 : 0);
