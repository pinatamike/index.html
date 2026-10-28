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
