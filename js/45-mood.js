/* v2.31 (I07): настроение, энергия и сон — три быстрые отметки в день и связь с продуктивностью.
   Данные: S.mood{дата:{m:1-5,e:1-5,s:часы сна}}. Карточка на «Сегодня», вывод — после 7 отметок. Настройка S.set.mdn (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.mdn===0);
const K={m:'Настроение',e:'Энергия',s:'Сон, ч'};
function norm(k,v){v=+v;if(!isFinite(v))return null;if(k=='s')return v>=0&&v<=14?Math.round(v*2)/2:null;return v>=1&&v<=5&&v==Math.floor(v)?v:null}
/* Отметка; повторное нажатие на то же значение снимает её. День без отметок удаляется */
function set(k,v,d){if(!K[k])return false;d=d||today();v=norm(k,v);S.mood=S.mood||{};const r=Object.assign({},S.mood[d]);
  if(v==null||r[k]===v)delete r[k];else r[k]=v;if(Object.keys(r).length)S.mood[d]=r;else delete S.mood[d];return true}
const get=d=>(S.mood||{})[d||today()]||{};
const count=()=>Object.keys(S.mood||{}).length;
/* Сколько задач закрыто в каждый из дней: {дата:число} */
function doneByDay(){const o={};tasks().forEach(x=>{if(x.dn)o[x.d]=(o[x.d]||0)+1});return o}
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
/* Связь отметки k с числом закрытых задач: хорошие дни (m,e ≥4; сон ≥7 ч) против плохих (m,e ≤2; сон ≤5 ч). Нужно ≥3 дня в каждой группе */
function corr(k,dn){dn=dn||doneByDay();const hi=[],lo=[];Object.keys(S.mood||{}).forEach(d=>{const v=S.mood[d][k];if(v==null)return;const n=dn[d]||0;if(k=='s'){if(v>=7)hi.push(n);else if(v<=5)lo.push(n)}else{if(v>=4)hi.push(n);else if(v<=2)lo.push(n)}});
  return hi.length>=3&&lo.length>=3?{k,hi:avg(hi),lo:avg(lo),nh:hi.length,nl:lo.length}:null}
const f1=x=>(Math.round(x*10)/10).toString().replace('.',',');
const WORD={m:['с хорошим настроением','с плохим'],e:['с высокой энергией','с низкой'],s:['после сна от 7 ч','после сна до 5 ч']};
function insights(dn){if(count()<7)return[];return ['m','e','s'].map(k=>corr(k,dn)).filter(c=>c&&Math.abs(c.hi-c.lo)>=1).map(c=>`В дни ${WORD[c.k][0]} вы закрываете в среднем ${f1(c.hi)} задач, ${WORD[c.k][1]} — ${f1(c.lo)}`)}
function card(){if(!on())return '';const r=get(),btn=(k,n)=>`<button type="button" data-md="${k}" data-v="${n}" aria-pressed="${r[k]===n}" aria-label="${K[k]}: ${n}" style="min-width:44px;min-height:44px${r[k]===n?';background:#2f6bff;color:#fff':''}">${n}</button>`,row=k=>`<div class="rtl"><span>${K[k]}</span><span>${[1,2,3,4,5].map(n=>btn(k,n)).join('')}</span></div>`;
  const ins=insights();
  return `<details class="xk rt"><summary>Как вы сегодня${count()?` <small>отметок: ${count()}</small>`:''}</summary>${row('m')}${row('e')}<label class="rtf">Сон, часов<input type="number" min="0" max="14" step="0.5" inputmode="decimal" data-mds="1" value="${r.s==null?'':r.s}" aria-label="Сколько часов вы спали"></label>${ins.length?ins.map(x=>`<div class="gf" role="status">${x}</div>`).join(''):`<div class="xemp">${count()<7?'Отметьте хотя бы 7 дней — и здесь появится, как самочувствие связано с делами.':'Пока связи не видно. Это нормально.'}</div>`}</details>`}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-md]');if(!b)return;set(b.dataset.md,+b.dataset.v);save();render()});
document.addEventListener('change',ev=>{const i=ev.target.closest&&ev.target.closest('[data-mds]');if(!i)return;set('s',i.value===''?NaN:i.value);save();render()});
window.MD={on,set,get,count,corr,insights,card,doneByDay};
})();
