// Usage: node qa/test-design.mjs <inventory.json>      (produce it with: node qa/audit-app.mjs index.html inv.json 390)
// Design-system regression checks over every screen of every workflow. PASS/FAIL per rule; exit code 1 on any failure.
import fs from 'node:fs';
const file = process.argv[2]; if (!file) { console.error('usage: node qa/test-design.mjs <inventory.json>'); process.exit(2); }
const inv = JSON.parse(fs.readFileSync(file, 'utf8')); const frames = inv.frames.filter(f => !f.error);
let pass = 0, fail = 0; const check = (name, ok, detail = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`); };
const where = list => list.slice(0, 6).map(f => `wf${f.wf}/s${f.step}`).join(', ') + (list.length > 6 ? ` (+${list.length - 6})` : '');
check(`inventory covers ${new Set(frames.map(f => f.wf)).size} workflows / ${frames.length} screens with no probe errors`, new Set(frames.map(f => f.wf)).size === 71 && frames.length >= 299 && inv.frames.length === frames.length, `${new Set(frames.map(f => f.wf)).size} workflows, ${frames.length} frames`);
check('no JavaScript errors while rendering all workflows', (inv.jsErrors || []).length === 0, (inv.jsErrors || []).slice(0, 2).join(' | '));
// 8. square corners (the paid stamp and the round mic button are the only intentional round shapes)
const roundAllowed = /co6-paid-stamp|st-micbig|st-micsm/;
const roundBad = frames.filter(f => (f.rounded || []).some(r => !roundAllowed.test(r.cls)));
check('8. square tile corners: no rounded tiles or buttons except the paid stamp and the mic', roundBad.length === 0, where(roundBad) + ' ' + roundBad.slice(0, 3).map(f => f.rounded.map(r => r.cls + ' r=' + r.rad).join('/')).join('; '));
// 9. standardised border thickness
const bw = {}; frames.forEach(f => Object.entries(f.tileBorders || {}).forEach(([k, v]) => bw[k] = (bw[k] || 0) + v));
const total = Object.values(bw).reduce((a, b) => a + b, 0), std = (bw[2] || 0) + (bw[3] || 0);
check(`9. standard tile borders: at least 95% of framed tiles use the 2px or 3px token (${(100 * std / total).toFixed(1)}%: ${JSON.stringify(bw)})`, std / total >= 0.95);
check('9b. no tile uses a border thicker than 5px or a hairline of 0.5px', Object.keys(bw).every(k => Number(k) >= 1 && Number(k) <= 5));
// 10. essential text size (stamp lettering is an approved exception)
const smallBad = frames.filter(f => (f.smallText || []).some(s => { const sz = parseFloat(s.split(' ').pop()); const tx = s.replace(/\s[\d.]+$/, ''); return sz > 0 && sz < 14 && !/^COP/.test(tx) && !/★|IN FULL|S & S|PAID/.test(tx); }));
check('10. no essential text under 14px (excluding COP labels, stamp lettering and hidden glyphs)', smallBad.length === 0, where(smallBad) + ' ' + smallBad.slice(0, 3).map(f => f.smallText.join('/')).join('; '));
// 11. COP at 65%
const copBad = frames.filter(f => (f.copRatioBad || 0) > 0);
check('11. every measured COP label is 58-72% of its amount (target 65%)', copBad.length === 0, where(copBad) + ' ' + copBad.slice(0, 3).map(f => f.copRatios.join(',')).join('; '));
check('11b. no COP amount is written inline in one text node (which could not be sized separately)', frames.every(f => !(f.copUnwrapped || []).length), where(frames.filter(f => (f.copUnwrapped || []).length)));
// 12. thousands separators
const moneyBad = frames.filter(f => (f.moneyBad || []).length);
check('12. money amounts of 4+ digits always carry thousands separators', moneyBad.length === 0, where(moneyBad) + ' ' + moneyBad.slice(0, 3).map(f => f.moneyBad.join('/')).join('; '));
// 13. no dark bars behind player names
const barBad = frames.filter(f => (f.nameBars || []).length);
check('13. no dark bars behind player names on photo tiles', barBad.length === 0, where(barBad));
// layout hygiene
check('no screen needs vertical or horizontal scrolling inside its phone', frames.every(f => !(f.scrollV > 2) && !(f.scrollH > 2)), where(frames.filter(f => f.scrollV > 2 || f.scrollH > 2)));
check('all screens use one header height (65px)', new Set(frames.filter(f => f.headerH).map(f => f.headerH)).size === 1, [...new Set(frames.filter(f => f.headerH).map(f => f.headerH))].join(','));
check('one phone background colour on every screen', new Set(frames.map(f => f.phoneBg)).size === 1, [...new Set(frames.map(f => f.phoneBg))].join(' | '));
// navigation facts visible in the inventory
const SIX = ['Tables', 'Players', 'Team', 'Schedule', 'Reports', 'Settings'];
const bars = frames.filter(f => f.bottom);
check('5. contextual bottom bars never equal the six primary tabs', bars.every(f => JSON.stringify(f.bottom.tabs) !== JSON.stringify(SIX)), where(bars.filter(f => JSON.stringify(f.bottom.tabs) === JSON.stringify(SIX))));
check('6. every Live bar uses "Table" (singular), never "Tables"', bars.filter(f => f.bottom.bar === 'live').every(f => f.bottom.tabs.includes('Table') && !f.bottom.tabs.includes('Tables')));
check('7. Reports screens have the 5-tab Reports bar, Settings screens the 6-tab Settings bar', frames.filter(f => f.wf >= 67 && f.wf <= 71).every(f => f.bottom && f.bottom.bar === 'reporting' && f.bottom.tabs.length === 5) && frames.filter(f => f.wf >= 59 && f.wf <= 66).every(f => f.bottom && f.bottom.bar === 'settings' && f.bottom.tabs.length === 6));
const noBarScope = f => f.wf >= 48 && f.wf <= 58 && !(f.wf === 53 && f.step === 3);   // WF53's last screen is the live table (Live bar) by design
check('no bottom bar in Schedule (48-53) or Players (54-58), except WF53 final live screen', frames.filter(noBarScope).every(f => !f.bottom), where(frames.filter(f => noBarScope(f) && f.bottom)));
check('no stale old-style bar: every bottom bar is the contextual kind', bars.every(f => ['live', 'reporting', 'settings'].includes(f.bottom.bar)), where(bars.filter(f => !['live', 'reporting', 'settings'].includes(f.bottom.bar))));
check('header titles use the new section names (no SCHEDULED / REPORTING)', frames.every(f => !/\b(SCHEDULED|REPORTING)\b/.test(f.title || '')), where(frames.filter(f => /\b(SCHEDULED|REPORTING)\b/.test(f.title || ''))));
console.log(`\nSUMMARY: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
