/* v2.26 (I03): план и факт по часам в отчёте клиенту. План = нормы часов по услугам (в неделю) × дни периода / 7. Настройка S.set.rpl (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.rpl===0);
const ms=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10));
const days=(a,b)=>Math.round((ms(b)-ms(a))/864e5)+1;
/* Сумма норм (ч в неделю) по списку проектов: {услуга: часы} */
function norms(L){const n={};(L||[]).forEach(p=>Object.keys(p.norm||{}).forEach(k=>{const v=+p.norm[k]||0;if(v>0)n[k]=(n[k]||0)+v}));return n}
/* План в минутах на период по услуге */
const planMin=(h,a,b)=>Math.round(h*60*days(a,b)/7);
/* Итог: {plan, fact, left, over, pct}; fact считается только по услугам с нормой */
function calc(nm,svc,a,b){let plan=0,fact=0;Object.keys(nm).forEach(k=>{plan+=planMin(nm[k],a,b);fact+=(svc&&svc[k])||0});
  return{plan,fact,left:Math.max(0,plan-fact),over:Math.max(0,fact-plan),pct:plan?Math.round(fact/plan*100):0}}
const H=m=>(m/60).toFixed(m%60?1:0).replace('.',',')+' ч';
function txt(c){if(!c.plan)return'';
  return 'План по нормам: '+H(c.plan)+' · сделано '+H(c.fact)+' ('+c.pct+'%) · '+(c.over?'сверх плана '+H(c.over):c.left?'осталось '+H(c.left):'план выполнен')}
/* По услуге: «5 ч из 6 ч» или «план выполнен» */
function svcTxt(h,fact,a,b){const p=planMin(h,a,b);if(!p)return'';return fact>=p?'план '+H(p)+' выполнен':H(fact)+' из '+H(p)}
window.PLN={on,norms,planMin,calc,txt,svcTxt,days};
})();
