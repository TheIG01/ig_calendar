// v2.17 G13: прогноз цели. «При текущем темпе вы закончите к ...», факт против плана, кнопка «Сдвинуть срок».
window.GF=(function(){
const days=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/864e5);
const on=()=>!(S.set&&S.set.fc===0);
function calc(g,t,p){if(!g||!g.st||!g.dl)return{k:'nodates'};if(p>=100)return{k:'done'};if(g.dl<t)return{k:'late'};
 const el=Math.max(0,days(g.st,t)),left=Math.max(1,days(t,g.dl)),plan=Math.max(0,Math.min(100,el/Math.max(1,days(g.st,g.dl))*100));
 if(el<3||p<=0)return{k:'few',p,plan,need:(100-p)/left*7};
 const rate=p/el,eta=add(t,Math.ceil((100-p)/rate)),slack=days(eta,g.dl);
 return{k:slack>=0?'ok':'bad',p,plan,eta,slack,rate:rate*7,need:(100-p)/left*7}}
const n1=v=>(+v.toFixed(1)).toLocaleString('ru');
function html(g){if(!on())return '';const t=today(),r=calc(g,t,window.gpc?gpc(g):0);let m='';
 if(r.k=='nodates')return '<small style="color:var(--mut)">Прогноз появится, когда у цели будут срок и дата старта.</small>';
 if(r.k=='done')return '';
 if(r.k=='late')m='Срок прошёл. Сдвиньте срок или закройте цель.';
 else if(r.k=='few')m=`Пока мало данных для прогноза. Чтобы успеть к сроку, нужно примерно ${n1(r.need)}% в неделю.`;
 else{const d=fd(r.eta,{day:'numeric',month:'long'});m=r.k=='ok'?`При текущем темпе вы закончите около ${d}: на ${r.slack} дн. раньше срока.`:`При текущем темпе вы закончите около ${d}: на ${-r.slack} дн. позже срока. Нужно ${n1(r.need)}% в неделю, сейчас ${n1(r.rate)}%.`}
 const bars=r.plan!=null?`<div class="gfb"><small>Факт ${Math.round(r.p||0)}%</small><div class="xbar"><i style="width:${Math.round(r.p||0)}%"></i></div><small>План по времени ${Math.round(r.plan)}%</small><div class="xbar gfp"><i style="width:${Math.round(r.plan)}%"></i></div></div>`:'';
 const btn=(r.k=='bad'||r.k=='late')?`<button type="button" class="lnk gfs" data-gfs="${esc(g.id)}" data-to="${r.eta||add(t,7)}">Сдвинуть срок${r.eta?' на '+fd(r.eta,{day:'numeric',month:'short'}):' на неделю'}</button>`:'';
 return `<div class="gf" role="status"><b>Прогноз</b><div>${esc(m)}</div>${bars}${btn}</div>`}
function init(){document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-gfs]');if(!b)return;const g=S.goals.find(x=>x.id==b.dataset.gfs);if(!g)return;g.dl=b.dataset.to;save();render();if(window.openGoal)openGoal(g.id)})}
if(typeof document!='undefined'&&document.addEventListener)init();
return{calc,html,on}})();
