/* v2.9.3 (G18): итоговая карточка архивного проекта — период, часы, сделано, услуги, выручка.
   Только чтение этапов проекта; новых полей данных нет. Настройка arc (по умолчанию вкл).
   Подключается поверх window.projExtra из 24-agency.js (поэтому грузится после него). */
(()=>{
const on=()=>(S.set.arc??1)!=0;
const money=v=>Math.round(v).toLocaleString('ru')+' ₽';
function archSum(p){
  const evs=(S.ev||[]).filter(e=>e.proj==p.id&&e.kind!='habit');
  if(!evs.length)return '<div class="xm2"><span>Итог: этапов в проекте не было</span></div>';
  let first='',last='',done=0;
  evs.forEach(e=>{if(!first||e.date<first)first=e.date;const L=[e.date,e.rep?.end].filter(Boolean);Object.keys(e.done||{}).forEach(d=>{if(e.done[d]){done++;L.push(d)}});L.forEach(d=>{if(!last||d>last)last=d})});
  const[w]=pst(p),hrs=w/60,rev=p.rate?hrs*p.rate:0,sv=Object.entries(pss(p)).sort((a,b)=>b[1]-a[1]).slice(0,3);
  return `<div class="arc" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line,#e6e9f0)"><div class="xm2"><b>Итог проекта</b></div>`+
   `<div class="xm2"><span>период <b>${first?esc(first):'—'} — ${last?esc(last):'—'}</b></span><span>часов <b>${hr(w)}</b></span><span>сделано этапов <b>${done}</b></span>${finOn2()&&rev?`<span>выручка <b>${money(rev)}</b></span>`:''}</div>`+
   (sv.length?`<div class="xm2">${sv.map(([k,m])=>`<span>${esc(k)} <b>${hr(m)}</b></span>`).join('')}</div>`:'')+`</div>`;
}
const finOn2=()=>S.set.fin==1;
const base=window.projExtra;
window.projExtra=function(p){let h=base?base(p):'';if(p.arch&&on())h+=archSum(p);return h};
})();
