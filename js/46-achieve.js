/* v2.32 (K05): достижения в умеренной дозе — «10/50/100/500 задач», «25/100/250 часов в проекте», «4 недельных обзора».
   Данные: S.ach{id:дата}. Настройка S.set.ach (0 — «тихий режим»: ни карточки, ни всплывающих поздравлений). */
(()=>{
const on=()=>!(S.set&&S.set.ach===0);
const TASKS=[10,50,100,500],HOURS=[25,100,250],WEEKS=[4,12];
const word=n=>{const a=n%100,b=n%10;return a>10&&a<15?'задач':b==1?'задача':b>1&&b<5?'задачи':'задач'};
/* Кандидаты по готовой статистике st={tasks:число, hours:[{id,t,h}], reviews:число} → [{id,t}] */
function cands(st){const o=[];TASKS.forEach(n=>{if(st.tasks>=n)o.push({id:'td'+n,t:'Закрыто '+n+' '+word(n)})});
  (st.hours||[]).forEach(p=>HOURS.forEach(n=>{if(p.h>=n)o.push({id:'ph'+n+p.id,t:n+' часов в проекте «'+p.t+'»'})}));
  WEEKS.forEach(n=>{if(st.reviews>=n)o.push({id:'wr'+n,t:n+' недельных обзора пройдено'})});return o}
/* Статистика из данных сайта: закрытые задачи, часы по проектам (прошедшие этапы за 400 дней), число обзоров */
function stats(){const t=today();let tk=0;const H={};
  (S.ev||[]).forEach(e=>{if(e.kind=='task')tk+=Object.keys(e.done||{}).length});
  (S.proj||[]).filter(p=>!p.arch).forEach(p=>{H[p.id]={id:p.id,t:p.t,h:0}});
  for(let i=-400;i<=0;i++){const d=add(t,i);(S.ev||[]).forEach(e=>{if(!e.proj||!H[e.proj]||(e.kind&&e.kind!='event'&&!e.done?.[d]))return;const o=occ(e,d);if(o)H[e.proj].h+=dur(o[0],o[1])/60})}
  return{tasks:tk,hours:Object.keys(H).map(k=>H[k]).filter(p=>p.h>0),reviews:Object.keys(S.wrv||{}).length}}
/* Записывает новые достижения с сегодняшней датой; возвращает только что полученные */
function check(st,d){if(!on())return[];st=st||stats();d=d||today();S.ach=S.ach||{};const n=cands(st).filter(c=>!S.ach[c.id]);n.forEach(c=>{S.ach[c.id]=d});return n}
const titleOf=(id,st)=>{const c=cands(st).find(x=>x.id==id);return c?c.t:null};
function earned(st){st=st||stats();return Object.keys(S.ach||{}).map(id=>({id,d:S.ach[id],t:titleOf(id,st)})).filter(x=>x.t).sort((a,b)=>b.d.localeCompare(a.d)||a.id.localeCompare(b.id))}
const fmt=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
function card(){if(!on())return '';const st=stats(),n=check(st);if(n.length){save();toast('Новое достижение: '+n[0].t)}
  const L=earned(st).slice(0,6);
  return `<details class="xk rt"><summary>Достижения${L.length?` <small>${Object.keys(S.ach||{}).length}</small>`:''}</summary>${L.length?L.map(x=>`<div class="rtl"><span>${esc(x.t)}</span><small>${fmt(x.d)}</small></div>`).join(''):'<div class="xemp">Первое достижение — после 10 закрытых задач. Без спешки.</div>'}<small>Все поздравления выключаются в Настройках («Тихий режим»).</small></details>`}
window.AC={on,cands,stats,check,earned,card,word};
})();
