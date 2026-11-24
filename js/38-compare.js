/* v2.24 (I01): сравнение периодов в отчёте клиенту. Чистые функции CMP.* + настройка S.set.rcmp (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.rcmp===0);
const ms=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10));
const days=(a,b)=>Math.round((ms(b)-ms(a))/864e5)+1;
/* Предыдущий период той же длины. Месяц с начала сравниваем с тем же числом дней прошлого месяца. */
function prevSpan(k,a,b){const n=days(a,b);
  if(k=='m'||k=='pm'){const pe=add(a,-1),ps=pe.slice(0,8)+'01',pl=days(ps,pe);return[ps,add(ps,Math.min(n,pl)-1)]}
  return[add(a,-n),add(a,-1)]}
/* Разница: {k:'up'|'down'|'same'|'new'|'none', pct} */
function delta(cur,prev){cur=+cur||0;prev=+prev||0;
  if(!cur&&!prev)return{k:'none',pct:0};
  if(!prev)return{k:'new',pct:0};
  const pct=Math.round((cur-prev)/prev*100);
  return{k:pct>0?'up':pct<0?'down':'same',pct}}
function txt(d){return d.k=='up'?'▲ на '+d.pct+'%':d.k=='down'?'▼ на '+Math.abs(d.pct)+'%':d.k=='same'?'как в прошлый раз':d.k=='new'?'раньше не было':''}
window.CMP={on,prevSpan,delta,txt,days};
})();
