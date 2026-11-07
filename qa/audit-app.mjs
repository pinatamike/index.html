// Usage: node audit-app.mjs <index.html> <out.json> [width=390] [firstWf=1] [lastWf=71]
// READ-ONLY inventory of every screen of every workflow. Writes one JSON record per phone frame.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [htmlPath, outFile, W = '390', first = '1', last = '71'] = process.argv.slice(2);
const port = 5500 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-prof-'));
const edge = spawn(process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-background-timer-throttling', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let t; for (let i = 0; i < 50 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} await sleep(300); }
const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); const jsErrors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) pend.get(m.id)(m); else if (m.method === 'Runtime.exceptionThrown') jsErrors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || '').slice(0, 90)); });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true })).result.result.value;
await send('Page.enable'); await send('Emulation.setFocusEmulationEnabled', { enabled: true }); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride', { width: Number(W), height: 844, deviceScaleFactor: 2, mobile: true });
const base = 'file:///' + path.resolve(htmlPath).replace(/\\/g, '/');
const PROBE = `(() => {
  const out = [];
  const px = v => parseFloat(v) || 0;
  [...document.querySelectorAll('.storyboard .stage')].forEach(st => {
    const p = st.querySelector('.phone'); if (!p) return;
    const pr = p.getBoundingClientRect();
    const hd = p.querySelector('.ux-head'), uc = p.querySelector('.ux-content'), nb = p.querySelector(':scope>.ux-bottom');
    const rec = { wf: +st.dataset.rnWorkflow || 0, step: +st.dataset.rnStep, w: Math.round(pr.width), h: Math.round(pr.height) };
    const ht = p.querySelector('.ux-head .ux-headtitle'); rec.title = ht ? ht.innerText.replace(/\\s+/g, ' ').trim() : '';
    rec.stageTitle = (st.querySelector('.stage-title') || {}).textContent || '';
    rec.bottom = nb ? { bar: nb.dataset.bar || null, tabs: [...nb.querySelectorAll('.ux-tab')].map(x => (x.querySelector('.s2-lbl') || x).textContent.trim()), active: ((nb.querySelector('.ux-tab.chosen .s2-lbl') || {}).textContent || '').trim(), top: Math.round(nb.getBoundingClientRect().top - pr.top), h: Math.round(nb.getBoundingClientRect().height), fs: nb.querySelector('.s2-lbl') ? px(getComputedStyle(nb.querySelector('.s2-lbl')).fontSize) : null } : null;
    rec.noBar = p.classList.contains('s2-nobar');
    if (uc) { rec.scrollV = uc.scrollHeight - uc.clientHeight; rec.scrollH = uc.scrollWidth - uc.clientWidth; }
    // tiles: elements with a real frame on all four sides
    const tiles = [], radii = [], smallText = [], midText = [], cop = [], nums = [], bars = [];
    const all = p.querySelectorAll('*');
    const inNav = el => el.closest('.s2-nav,.nn-drawer,.ux-bottom');
    all.forEach(el => {
      const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
      const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(px);
      const framed = bw.every(x => x >= 1) && cs.borderTopStyle !== 'none' && r.width >= 40 && r.height >= 28 && !inNav(el) && el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && el.tagName !== 'TEXTAREA' || (el.tagName === 'BUTTON' && bw.every(x => x >= 1) && r.width >= 40 && r.height >= 28 && !inNav(el));
      if (framed) {
        tiles.push({ bw: Math.min(...bw), w: Math.round(r.width), h: Math.round(r.height), cls: (el.className && el.className.toString().split(' ')[0]) || el.tagName, top: Math.round(r.top - pr.top), bottom: Math.round(r.bottom - pr.top) });
        const rad = px(cs.borderTopLeftRadius), circle = Math.abs(r.width - r.height) < 3 && rad >= Math.min(r.width, r.height) / 2 - 1;
        if (rad > 1.5 && !circle) radii.push({ cls: (el.className && el.className.toString().split(' ')[0]) || el.tagName, rad: Math.round(rad), w: Math.round(r.width), h: Math.round(r.height) });
      }
      // leaf text
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
      if (own && !inNav(el)) {
        const fs = px(cs.fontSize);
        if (fs < 14) smallText.push(own.slice(0, 22) + ' ' + fs);
        else if (fs < 16) midText.push(1);
        if (/COP/.test(own) || el.classList.contains('money-cop') || el.classList.contains('rebuy-cop')) {
          const m = own.match(/COP\\s*[\\d,]+/); if (m || own.trim() === 'COP') cop.push({ t: own.slice(0, 26), fs });
        }
        const m2 = own.match(/(^|[^\\d,.:\\/-])(\\d{4,})(?![\\d,:\\/]|\\.\\d)/g); if (m2) nums.push(own.slice(0, 40));
        const m3 = own.match(/\\d{1,3}(\\.\\d{3}){1,}(?!\\d)/); if (m3) nums.push('dotsep:' + own.slice(0, 40));
      }
      // dark bars behind player names on photo tiles
      if (el.matches('.ux-seat-label,.ux-seat > b,.person-name,.wf48-player b,.s2-pname') ) { const bg = cs.backgroundColor, m = bg.match(/rgba?\\(([^)]+)\\)/); if (m) { const a = m[1].split(',').map(Number); const alpha = a.length > 3 ? a[3] : 1; if (alpha > 0.35 && a[0] < 40 && a[1] < 60 && a[2] < 80) bars.push(el.textContent.trim().slice(0, 16) + ' ' + bg); } }
    });
    // COP label vs its amount: ratio of font sizes (target 0.65), plus unformatted money (4+ digits without thousands separators)
    const copRatios = [], moneyBad = [], copUnwrapped = [];
    p.querySelectorAll('.s2-cop,[data-s2cop],.money-cop,.rebuy-cop,.money-cop-65,.fb-cop').forEach(c => {
      if (!c.textContent.trim().startsWith('COP') || getComputedStyle(c).display === 'none') return;
      const inp = c.parentElement && c.parentElement.querySelector('input'); let ref = (inp && /[0-9]/.test(inp.value)) ? inp : (c.nextElementSibling && /[0-9]/.test(c.nextElementSibling.textContent) ? c.nextElementSibling : c.parentElement);
      const sibTxt = c.nextSibling && c.nextSibling.nodeType === 3 ? c.nextSibling.textContent : '';
      const num = (ref.tagName === 'INPUT' ? ref.value : (ref === c.parentElement ? (sibTxt || ref.textContent) : ref.textContent)).trim();
      const rfs = parseFloat(getComputedStyle(ref).fontSize), cfs = parseFloat(getComputedStyle(c).fontSize);
      if (rfs && cfs) copRatios.push(+(cfs / rfs).toFixed(2));
      const m = num.match(/^[+-]?[0-9][0-9,.]*/); if (m && /^[0-9]{4,}$/.test(m[0].replace(/^[+-]/, ''))) moneyBad.push('COP ' + m[0]);
    });
    p.querySelectorAll('*').forEach(el => { if (el.children.length) return; const tx = (el.textContent || '').trim(); if (/^COP[ ]*[0-9]{4,}([^0-9,.]|$)/.test(tx)) moneyBad.push(tx.slice(0, 24)); else if (/COP[ ]*[0-9]/.test(tx) && !el.closest('input')) copUnwrapped.push(tx.slice(0, 24)); });
    rec.copRatios = copRatios; rec.copRatioBad = copRatios.filter(r => r < 0.58 || r > 0.72).length; rec.moneyBad = [...new Set(moneyBad)].slice(0, 5); rec.copUnwrapped = [...new Set(copUnwrapped)].slice(0, 4);
    rec.tiles = tiles.length; rec.tileBorders = tiles.reduce((o, t) => { o[t.bw] = (o[t.bw] || 0) + 1; return o; }, {});
    rec.rounded = radii.slice(0, 6); rec.roundedCount = radii.length;
    rec.smallText = [...new Set(smallText)].slice(0, 8); rec.smallCount = smallText.length; rec.midCount = midText.length;
    rec.copCount = cop.length; rec.nums = [...new Set(nums)].slice(0, 5); rec.nameBars = bars.slice(0, 4);
    // header->content and content->bottom distances (frame to frame)
    if (hd && uc) {
      const hb = hd.getBoundingClientRect().bottom - pr.top; const kids = [...uc.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return c.display !== 'none' && r.height >= 24 && r.width >= 60 && (px(c.borderTopWidth) >= 1 || e.tagName === 'H3'); });
      if (kids.length) { const first = Math.min(...kids.map(e => e.getBoundingClientRect().top - pr.top)), lastB = Math.max(...kids.map(e => e.getBoundingClientRect().bottom - pr.top)); rec.headToFirst = Math.round(first - hb); rec.lastBottom = Math.round(lastB); if (nb) rec.lastToNav = Math.round(nb.getBoundingClientRect().top - pr.top - lastB); else rec.lastToPhoneBottom = Math.round(pr.height - lastB); }
      rec.headerH = Math.round(hb);
    }
    rec.bg = getComputedStyle(uc || p).backgroundColor; rec.phoneBg = getComputedStyle(p).backgroundColor;
    out.push(rec);
  });
  return JSON.stringify(out);
})()`;
const all = [];
for (let wf = Number(first); wf <= Number(last); wf++) {
  await send('Page.navigate', { url: base + '#workflow-' + wf }); await sleep(1800);
  await send('Page.reload'); await sleep(2600);
  let recs; try { recs = JSON.parse(await ev(PROBE)); } catch (e) { recs = [{ wf, error: String(e).slice(0, 80) }]; }
  recs.forEach(r => { if (!r.wf) r.wf = wf; }); all.push(...recs);
  process.stdout.write(`wf${wf}:${recs.length} `);
}
fs.writeFileSync(outFile, JSON.stringify({ width: W, jsErrors, frames: all }, null, 0));
console.log(`\nframes=${all.length} jsErrors=${jsErrors.length}`); ws.close(); edge.kill();
