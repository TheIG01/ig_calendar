/* v2.30 (I06): недельный обзор — мастер из 5 шагов: итоги → не закрыто → входящие → цели → план следующей недели.
   Карточка на «Сегодня» с пятницы до воскресенья. Данные: S.wrv{начало недели:1} (обзор пройден), план → S.wtop. Настройка S.set.wrv (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.wrv===0);
const STEPS=['Итоги','Не закрыто','Входящие','Цели','План'];
const nm=e=>String(e&&e.title||'Без названия');
const wkS=t=>wk(t||today());
const done=ws=>!!(S.wrv&&S.wrv[ws||wkS()]);
/* Данные обзора за неделю, в которую входит t */
function collect(t){t=t||today();const ws=wkS(t),we=add(ws,6),nx=add(ws,7),L=tasks().filter(x=>x.d>=ws&&x.d<=we);
  const dn=L.filter(x=>x.dn),open=L.filter(x=>!x.dn&&x.d<=t&&(!x.e.rep||x.e.rep.t=='none'));
  const goals=(S.goals||[]).filter(g=>!g.par&&!g.proj).slice(0,6).map(g=>{const p=gp(g);return{id:g.id,t:g.t,pct:p.b?Math.min(100,Math.round(p.a/p.b*100)):0}});
  return{ws,we,nx,total:L.length,done:dn.length,open,inbox:(S.inbox||[]).slice(),goals,plan:((S.wtop||{})[nx]||[]).slice()}}
/* Показывать ли карточку: настройка вкл, с пятницы недели, обзор ещё не пройден */
function due(t){t=t||today();return on()&&t>=add(wkS(t),4)&&!done(wkS(t))}
function moveTask(id,date){const e=(S.ev||[]).find(v=>v.id==id);if(!e||(e.rep&&e.rep.t!='none'))return false;e.date=date;return true}
function inboxTo(id,date){const l=S.inbox||[],i=l.find(x=>x.id==id);if(!i)return false;S.inbox=l.filter(x=>x.id!=id);if(date)S.ev.push(mkE(i.t,date,'task'));return true}
function planAdd(nx,t){t=String(t||'').trim().slice(0,120);S.wtop=S.wtop||{};const L=S.wtop[nx]||[];if(!t||L.length>=3)return false;S.wtop[nx]=[...L,{t,d:0}];return true}
function planDel(nx,i){const L=(S.wtop||{})[nx]||[];if(!L[i])return false;L.splice(i,1);return true}
function finish(ws){S.wrv=S.wrv||{};S.wrv[ws||wkS()]=1;const k=Object.keys(S.wrv).sort();while(k.length>12)delete S.wrv[k.shift()]}
const fmt=d=>d.slice(8)+'.'+d.slice(5,7);
function card(){if(!due())return '';return `<div class="xk rt"><h5>Недельный обзор</h5><div class="xemp">Пять коротких шагов: итоги, хвосты, входящие, цели и план на следующую неделю.</div><button type="button" class="xpri" data-wr="open" style="min-height:44px">Начать обзор</button></div>`}
let step=0;
function body(D){const e=esc;
 if(step==0)return `<p class="wrb"><b>${D.done}</b> из ${D.total} задач недели выполнено.</p>`+(D.total?'':'<div class="xemp">На этой неделе задач не было. Можно сразу перейти к плану.</div>');
 if(step==1)return D.open.length?D.open.map(x=>`<div class="rtl"><span>${e(nm(x.e))} <small>${fmt(x.d)}</small></span><span><button type="button" data-wr="mv" data-id="${e(x.e.id)}" data-to="${D.nx}" style="min-height:44px">На след. неделю</button><button type="button" data-wr="mv" data-id="${e(x.e.id)}" data-to="${today()}" style="min-height:44px">На сегодня</button></span></div>`).join(''):'<div class="xemp">Все задачи закрыты. Хорошая неделя.</div>';
 if(step==2)return D.inbox.length?D.inbox.map(x=>`<div class="rtl"><span>${e(x.t)}</span><span><button type="button" data-wr="ib" data-id="${e(x.id)}" data-to="${D.nx}" style="min-height:44px">В план</button><button type="button" data-wr="ib" data-id="${e(x.id)}" data-to="" aria-label="Убрать из входящих" style="min-height:44px">Убрать</button></span></div>`).join(''):'<div class="xemp">Входящие пусты.</div>';
 if(step==3)return D.goals.length?D.goals.map(g=>`<div class="rtl"><span>${e(g.t)}</span><b>${g.pct}%</b></div>`).join(''):'<div class="xemp">Целей пока нет. Их можно добавить в разделе «Цели».</div>';
 return D.plan.map((x,i)=>`<div class="rtl"><span>${e(x.t)}</span><button type="button" data-wr="pd" data-i="${i}" aria-label="Убрать из плана" style="min-height:44px">×</button></div>`).join('')+(D.plan.length<3?`<div class="rta"><input id="wri" maxlength="120" placeholder="Что главное на следующей неделе?" aria-label="Главное на следующей неделе"><button type="button" data-wr="pa" aria-label="Добавить" style="min-height:44px">+</button></div>`:'')+(D.plan.length?'':'<div class="xemp">До трёх главных дел. Они появятся на «Сегодня» в понедельник.</div>')}
function draw(){let o=document.getElementById('wr');if(!o)return;const D=collect(),last=step==4;
 o.innerHTML=`<div class="wrw" role="dialog" aria-modal="true" aria-label="Недельный обзор"><h3>Недельный обзор · шаг ${step+1} из 5: ${STEPS[step]}</h3><div class="wrs">${body(D)}</div><div class="wrn"><button type="button" data-wr="x" style="min-height:44px">Закрыть</button><span class="sp"></span>${step?'<button type="button" data-wr="b" style="min-height:44px">Назад</button>':''}<button type="button" class="pri" data-wr="${last?'fin':'n'}" style="min-height:44px">${last?'Завершить':'Дальше'}</button></div></div>`}
function open(){let o=document.getElementById('wr');if(!o){o=document.createElement('div');o.id='wr';document.body.appendChild(o)}step=0;draw()}
function close(){const o=document.getElementById('wr');if(o)o.remove()}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-wr]');if(!b)return;const a=b.dataset.wr,D=collect();
 if(a=='open')return open();if(a=='x')return close();
 if(a=='n'){step=Math.min(4,step+1);return draw()}if(a=='b'){step=Math.max(0,step-1);return draw()}
 if(a=='fin'){finish(D.ws);save();close();render();toast('Обзор недели завершён');return}
 if(a=='mv')moveTask(b.dataset.id,b.dataset.to);else if(a=='ib')inboxTo(b.dataset.id,b.dataset.to||'');
 else if(a=='pa'){const i=document.getElementById('wri');if(i)planAdd(D.nx,i.value)}else if(a=='pd')planDel(D.nx,+b.dataset.i);else return;
 save();draw()});
document.addEventListener('keydown',ev=>{if(ev.key=='Escape')close()});
window.WR={on,collect,due,done,moveTask,inboxTo,planAdd,planDel,finish,card,open};
})();
