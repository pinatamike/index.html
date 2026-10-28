function wf10Phone(w,step,i){if(i===0)return null;const details=i===1||i===3;const updated=i===3;const body=details?`<div class="wf10-grid"><div class="wf10-tile purple"><span>GAME TYPE</span><b>Dealer’s Choice</b></div><div class="wf10-tile cyan"><span>BLINDS</span><b>COP 5,000 / 10,000</b></div><div class="wf10-tile gold"><span>MIN / MAX<br>BUY-IN</span><b>COP 500,000<br>COP 2,000,000</b></div><div class="wf10-tile cyan"><span>TABLES</span><b>1</b></div><div class="wf10-tile cyan"><span>RUNTIME</span><b>10h 17m</b></div><div class="wf10-tile green wf10-rake" role="button" tabindex="0" aria-label="Open rake entry"><span>RAKE</span><b>COP ${updated?"830,000":"780,000"}</b><small class="wf10-plus" aria-hidden="true">+</small></div></div><div class="wf10-detail-actions wf10-table-actions"><button type="button" class="wf10-pause">PAUSE TABLE</button><button type="button" class="wf10-close">CLOSE TABLE</button></div>`:`<div class="wf10-entry"><label class="wf10-input-label" for="wf10-amount">RAKE AMOUNT</label><div class="wf10-input-wrap"><span>COP</span><input id="wf10-amount" type="text" inputmode="numeric" pattern="[0-9]*" value="50,000" placeholder="Enter amount" autocomplete="off" aria-label="Rake amount in COP"><button type="button" class="wf10-clear" aria-label="Clear rake amount" onclick="var x=document.getElementById('wf10-amount');x.value='';x.dispatchEvent(new Event('input',{bubbles:true}));x.focus()">×</button></div></div><div class="wf10-summary"><div class="wf10-summary-tile"><span>PREVIOUS RAKE</span><strong>COP 780,000</strong></div><div class="wf10-summary-tile"><span>NEW RAKE</span><strong id="wf10-new">COP 50,000</strong></div><div class="wf10-summary-tile wf10-summary-total"><span>UPDATED RAKE<br>TOTAL</span><strong id="wf10-updated">COP 830,000</strong></div></div><button type="button" id="wf10-confirm" class="wf10-confirm">CONFIRM RAKE</button><div id="wf10-feedback" class="wf10-feedback" aria-live="polite"></div>`;return '<div class="stage hi-stage"><div class="stage-head"><div class="stage-number">'+(i+1)+'</div><div class="stage-title">'+esc(step)+'</div></div><div class="phone hi-phone wf10-phone"><div class="notch"></div>'+fullHead('LIVE SESSION',details?'Game Details':'Add Rake')+'<div class="ux-content screen-specific">'+body+'</div>'+fixedNav('Table')+'</div><p class="steptext">'+(updated?'Rake confirmed · returned to updated Game Details':details?'Authorized Game Details · select RAKE':'Enter rake amount · confirm once')+'</p></div>'}

/* Workflow 10 preview-only interactions. Production must enforce role access and server-side authorization. */
document.addEventListener('click',function(e){
 const close=e.target.closest('.wf10-phone .wf10-close');
 if(!close)return;
 if(!window.confirm('Close this table? This requires a second confirmation.'))return;
 if(!window.confirm('FINAL CONFIRMATION: Close the table? This action cannot be undone.'))return;
 window.alert('Preview only: table close confirmed twice. No real table was closed.');
});


/* Workflow 11: paused-table preview; no production transactions. */
function wf11Phone(w,step,i){
 if(i===1)return wf10Phone(w,step,1);
 const paused=i===2;
 const body=paused?
 '<div class="wf11-banner">⏸ TABLE PAUSED <span>TABLE 1</span></div><div class="wf11-status"><div class="wf11-stat"><span>TABLE STATUS</span><strong>PAUSED</strong></div><div class="wf11-stat"><span>PLAYING TIME</span><strong>10h 17m</strong><small>Stopped while paused</small></div><div class="wf11-stat"><span>TIME PAUSED</span><strong>12m</strong><small>Counts upward</small></div></div><div class="wf11-hint">Player and financial administration remains available while the table is paused.</div><button type="button" class="wf11-action wf11-resume">RESUME TABLE</button>':
 '<div class="wf11-resumed"><strong>✓ TABLE RESUMED</strong><span>Playing time is accumulating again.</span></div><div class="wf11-resume-details"><div><span>GAME TYPE</span><b>Dealer’s Choice</b></div><div><span>BLINDS</span><b><small>COP</small> 5,000 / 10,000</b></div><div><span>MIN / MAX<br>BUY-IN</span><b><small>COP</small> 500,000<br><small>COP</small> 2,000,000</b></div><div><span>TABLES</span><b>1</b></div><div><span>RUNTIME</span><b>10h 17m</b></div><div class="wf11-rake"><span>RAKE</span><b><small>COP</small> 780,000</b><em>+</em></div></div><div class="wf10-detail-actions wf10-table-actions"><button type="button" class="wf10-pause">PAUSE TABLE</button><button type="button" class="wf10-close">CLOSE TABLE</button></div>';
 return '<div class="stage hi-stage"><div class="stage-head"><div class="stage-number">'+(i+1)+'</div><div class="stage-title">'+esc(step)+'</div></div><div class="phone hi-phone wf10-phone wf11-phone"><div class="notch"></div>'+fullHead('LIVE SESSION',paused?'Table Paused':'Game Details')+'<div class="ux-content screen-specific">'+body+'</div>'+fixedNav('Table')+'</div><p class="steptext">'+(paused?'Table 1 paused · runtime frozen · resume available':'Table resumed · returned to Game Details')+'</p></div>';
}
(function(){const css=`
.wf11-phone .ux-content{position:relative;display:flex;flex-direction:column;gap:9px;padding-top:5px}
.wf11-banner{background:#966000;color:#fff4d3;border:2px solid #ffd05c;padding:11px 9px;text-align:center;font-size:21px;font-weight:1000}
.wf11-banner span{display:block;font-size:13px;margin-top:2px}
.wf11-status{display:flex;flex-direction:column;gap:8px}
.wf11-stat{border:2px solid #19b9e5;background:#092b43;min-height:104px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
.wf11-stat span{font-size:16px;font-weight:900}
.wf11-stat strong{font-size:30px;line-height:1.05;color:#fff}
.wf11-stat:first-child{border-color:#ffd05c;background:#513b0b}
.wf11-stat:first-child strong{color:#ffe38c}
.wf11-stat small{font-size:13px;color:#c3d9e7}
.wf11-hint{font-size:14px;line-height:1.3;text-align:center;color:#b8d5e6;padding:6px 3px}
.wf11-action{margin-top:auto;margin-bottom:5px;height:65px;flex-shrink:0;border:2px solid #4fe5b4;background:#006a4f;color:white;font-size:20px;font-weight:900}
.wf11-resumed{border:2px solid #4fe5b4;background:#075a46;text-align:center;padding:10px 5px;display:flex;flex-direction:column;gap:3px}
.wf11-resumed strong{font-size:19px}.wf11-resumed span{font-size:13px}
.wf11-resume-details{border:2px solid #16b6df;background:#092b43;display:flex;flex-direction:column;flex:1;min-height:0;padding:0 9px}
.wf11-resume-details>div{flex:1;display:flex;justify-content:space-between;align-items:center;gap:5px;border-bottom:1px solid #28607c;padding:6px 0}
.wf11-resume-details>div:last-child{border:2px solid #46e7b6;background:#065a48;margin:4px 0;padding:8px}
.wf11-resume-details span{font-size:15px;font-weight:900}.wf11-resume-details b{font-size:20px;text-align:right;line-height:1.2}
.wf11-resume-details small{font-size:.65em}.wf11-resume-details em{border:1px solid #b6ffe5;padding:2px 6px;font-style:normal}
.wf11-phone .wf10-detail-actions{flex-shrink:0;margin-bottom:5px}
`;const style=document.createElement('style');style.textContent=css;document.head.appendChild(style)})();

/* Register after the review studio initializes; no large index.html rewrite required. */
window.addEventListener('load',function(){
 const w=WORKFLOWS.find(x=>x.id===11);
 if(!w)return;
 w.steps=['Open Table View','Game Details — tap PAUSE TABLE','Table Paused — tap RESUME TABLE','Game Details — table resumed'];
 const previous=customPhone;
 customPhone=function(workflow,step,i){return workflow.id===11&&i>0?wf11Phone(workflow,step,i):previous(workflow,step,i)};
 if(location.hash==='#workflow-11')show(11);
});

/* Workflow 11 refinement: compact pause view, persistent banner, and multi-table example. */
(function(){
 const extra=document.createElement('style');extra.textContent=`
 .wf11-phone .ux-content{gap:8px!important;padding-top:5px!important}
 .wf11-banner{display:flex;align-items:center;justify-content:center;gap:12px;font-size:22px!important;padding:12px 7px!important}
 .wf11-banner .wf11-pause-icon{font-size:38px;font-weight:1000;line-height:1;letter-spacing:-5px;margin-right:4px}
 .wf11-banner .wf11-banner-text{line-height:1.15}
 .wf11-banner .wf11-banner-text small{display:block;font-size:13px;margin-top:4px}
 .wf11-phone .wf11-status{gap:7px!important}
 .wf11-phone .wf11-stat{min-height:92px!important;padding:9px 8px!important}
 .wf11-phone .wf11-hint{font-size:13px;padding:2px 4px!important}
 .wf11-phone .wf11-action{margin-top:auto!important;margin-bottom:10px!important;height:62px!important;min-height:62px!important;display:flex;align-items:center;justify-content:center;line-height:1.1}
 .wf11-phone .ux-content>.wf11-action{flex-shrink:0}
 .wf11-phone .wf11-resumed{padding:8px 5px!important}
 .wf11-phone .wf11-resume-details{min-height:0}
 .wf11-phone .wf11-resume-details>div{padding:3px 0!important}
 .wf11-phone .wf11-resume-details b{font-size:19px!important}
 .wf11-phone .wf10-detail-actions{margin-bottom:10px!important}
 .wf11-persistent{background:#925c00;border:2px solid #ffd064;color:#fff;text-align:center;font-size:16px;font-weight:950;padding:11px 5px;display:flex;align-items:center;justify-content:center;gap:10px}
 .wf11-persistent b{font-size:24px;line-height:1}
 .wf11-elsewhere{display:flex;flex-direction:column;gap:9px;flex:1}
 .wf11-elsewhere .wf11-expense-row{display:flex;align-items:center;justify-content:space-between;border:2px solid #24bde6;background:#092b43;padding:14px 10px;font-size:17px;font-weight:900;min-height:85px}
 .wf11-elsewhere .wf11-expense-row strong{color:#50e6bc}
 .wf11-elsewhere .wf11-add-expense{margin-top:4px;border:2px solid #4fe5b4;background:#075c49;color:white;font-size:19px;font-weight:900;padding:17px 4px}
 .wf11-multitable{display:flex;gap:7px}.wf11-multitable span{flex:1;border:2px solid #2cbce8;text-align:center;padding:13px 2px;font-weight:900;font-size:16px;background:#092b43}
 .wf11-multitable span:first-child{border-color:#ffd05c;background:#634300}
 .wf11-multitable-status{display:flex;flex-direction:column;gap:10px;flex:1}
 .wf11-multitable-status>div{border:2px solid #2bbce6;padding:15px 10px;background:#092b43;font-weight:900;font-size:19px}
 .wf11-multitable-status>div:first-child{border-color:#ffd05c;background:#57400d}
 .wf11-multitable-status small{display:block;font-size:14px;color:#d0e0ed;margin-top:6px}
 `;document.head.appendChild(extra);
 const original=wf11Phone;
 wf11Phone=function(w,step,i){
  if(i===1)return original(w,step,i);
  if(i===2){let out=original(w,step,i);out=out.replace('<div class="wf11-banner">⏸ TABLE PAUSED <span>TABLE 1</span></div>','<div class="wf11-banner"><span class="wf11-pause-icon">Ⅱ</span><span class="wf11-banner-text">TABLE PAUSED</span></div>');out=out.replace('Table 1 paused · runtime frozen','Table paused · runtime frozen');return out;}
  if(i===3){let out=original(w,step,i);return out.replace('<div class="wf11-resumed"><strong>✓ TABLE RESUMED</strong><span>Playing time is accumulating again.</span></div>','<div class="wf11-resumed"><strong>✓ TABLE RESUMED</strong><span>Playing time is accumulating again.</span></div>');}
  const multiple=i===5;
  const body=multiple?
  '<div class="wf11-persistent"><b>Ⅱ</b> TABLE 1 PAUSED</div><div class="wf11-multitable"><span>TABLE 1<br>⏸</span><span>TABLE 2<br>●</span><span>TABLE 3<br>●</span></div><div class="wf11-multitable-status"><div>TABLE 1 — PAUSED<small>Playing time frozen · 12m paused</small></div><div>TABLE 2 — RUNNING<small>Playing time accumulating</small></div><div>TABLE 3 — RUNNING<small>Playing time accumulating</small></div></div><button class="wf11-action" type="button">RESUME TABLE 1</button>':
  '<div class="wf11-persistent"><b>Ⅱ</b> TABLE PAUSED</div><div class="wf11-elsewhere"><div class="wf11-expense-row"><span>VENUE RENT</span><strong>COP 150,000</strong></div><div class="wf11-expense-row"><span>FOOD / DRINKS</span><strong>COP 75,000</strong></div><div class="wf11-expense-row"><span>OTHER EXPENSES</span><strong>COP 30,000</strong></div><button class="wf11-add-expense" type="button">+ ADD EXPENSE</button></div><button class="wf11-action" type="button">RETURN TO TABLE / RESUME</button>';
  return '<div class="stage hi-stage"><div class="stage-head"><div class="stage-number">'+(i+1)+'</div><div class="stage-title">'+esc(step)+'</div></div><div class="phone hi-phone wf10-phone wf11-phone"><div class="notch"></div>'+fullHead('LIVE SESSION',multiple?'Tables':'Expenses')+'<div class="ux-content screen-specific">'+body+'</div>'+fixedNav(multiple?'Table':'Expenses')+'</div><p class="steptext">'+(multiple?'Multi-table example: identify the paused table':'Pause warning persists while using other Live Session tabs')+'</p></div>';
 };
 window.addEventListener('load',function(){
  const w=WORKFLOWS.find(x=>x.id===11);
  if(!w)return;
  w.steps=['Open Table View','Game Details — tap PAUSE TABLE','Table Paused — tap RESUME TABLE','Game Details — table resumed','While paused — open Expenses','Multiple tables — Table 1 paused'];
  if(location.hash==='#workflow-11')show(11);
 });
})();
