// v2.10 «Матрёшка целей»: несколько целей на этап (поле gx), журнал по всей ветке цели.
// Этап: goal — основная цель, gx — доп. цели. Без gx поведение прежнее.
// egs() объявлена в js/00-core.js (нужна при первой отрисовке).

// Убирает цель id из этапа; основной становится первая из оставшихся.
function unG(e,id){const L=egs(e).filter(x=>x!=id);e.goal=L[0]||'';if(L.length>1)e.gx=L.slice(1);else delete e.gx}

// Переключение цели в окне этапа (вкл/выкл), без закрытия окна.
function tgG(id){const cur=egs(dd),L=cur.includes(id)?cur.filter(x=>x!=id):[...cur,id];dd.goal=L[0]||'';if(L.length>1)dd.gx=L.slice(1);else delete dd.gx;dre()}

// Журнал ветки: записи цели, выполненные этапы (сама цель и все подцели любой глубины).
function gjour(g,lim=20){const t=today(),out=[],seen=new Set();
 const walk=(x,dep)=>{if(!x||seen.has(x.id)||dep>30)return;seen.add(x.id);
  (x.log||[]).forEach(l=>{if(l.d&&l.d<=t)out.push({d:l.d,v:+l.v||0,t:l.n||'',g:x.t})});
  S.ev.forEach(e=>{if(!egs(e).includes(x.id))return;Object.keys(e.done||{}).forEach(d=>{if(d<=t)out.push({d,v:+e.val||0,t:e.title||'Без названия',g:x.t})})});
  S.goals.filter(k=>k.par==x.id).forEach(k=>walk(k,dep+1))};
 walk(g,0);return out.sort((a,b)=>b.d.localeCompare(a.d)).slice(0,lim)};
if(typeof window!='undefined')window.gjour=gjour;

// Блок «Журнал ветки» в окне цели.
function gjHTML(g){const J=gjour(g,12),u=g.u?' '+esc(g.u):'';
 return `<div class="ds"><label>Журнал ветки</label>${J.length?J.map(x=>`<div class="row"><small>${fd(x.d,{day:'numeric',month:'short'})}</small><b>${x.v?'+'+(+x.v).toLocaleString('ru')+u:'✓'}</b><span class="sp">${esc(x.t)}${x.g!=g.t?' · <i>'+esc(x.g)+'</i>':''}</span></div>`).join(''):'<small style="color:var(--mut)">Записей пока нет. Отмечайте выполненные этапы или записывайте прогресс: история появится здесь, даже по мелким шагам.</small>'}</div>`}

// v2.10.1 «Ключевые результаты» (G12): результаты внутри цели, недельный чекин, светофор.
// Поля: g.kr [{id,t,tg,cv,u}] — результаты; g.ck [{d,n,c,kr}] — чекины; g.st — дата старта (для светофора).
const krOn=()=>!(S.set&&S.set.kr===false);
function krK(k){return k.tg>0?Math.min(100,k.cv/k.tg*100):(k.cv>0?100:0)}
function krPct(g){const L=g.kr||[];return L.length?L.reduce((s,k)=>s+krK(k),0)/L.length:0}
// Светофор: сравнивает прогресс с тем, сколько времени уже прошло от старта до срока.
function gLight(g){if(!g.dl||!g.st)return null;const t=today(),p=window.gpc(g);if(p>=100)return{c:'d',t:'Выполнено'};if(g.dl<t)return{c:'r',t:'Срок прошёл'};
 const span=P(g.dl)-P(g.st),el=P(t)-P(g.st),exp=span<=0?100:Math.max(0,Math.min(100,el/span*100)),k=exp<1?1:p/exp;
 return k>=0.9?{c:'g',t:'На пути'}:k>=0.6?{c:'y',t:'Под угрозой'}:{c:'r',t:'Не успеваем'}}
// Пора чекин: результаты есть, а последний чекин старше 7 дней (или его не было).
function krDue(g){if(!krOn()||!(g.kr||[]).length)return false;const last=(g.ck||[]).slice(-1)[0];return !last||today()>=add(last.d,7)}

function krHTML(g){if(!krOn())return '';const L=g.kr||[],ck=(g.ck||[]).slice(-3).reverse(),lt=gLight(g);
 return `<div class="ds"><label>Ключевые результаты</label>
 ${lt?`<div class="kl kl-${lt.c}" role="status"><span class="ld" aria-hidden="true"></span><b>${lt.t}</b></div>`:'<small style="color:var(--mut)">Светофор появится, когда у цели будут срок и дата старта.</small>'}
 ${L.map(k=>`<div class="row"><span class="sp">${esc(k.t)}</span><input type="number" min="0" value="${k.cv}" data-krv="${k.id}" aria-label="Текущее значение: ${esc(k.t)}" style="width:90px"><small>из ${fn(k.tg)}${esc(k.u||'')} · ${Math.round(krK(k))}%</small><button class="x" data-krdel="${k.id}" aria-label="Удалить результат: ${esc(k.t)}">×</button></div>`).join('')}
 <div class="bar" style="margin:0"><input id="krn" placeholder="+ результат, например «Лиды»" aria-label="Название результата" style="flex:1"><input id="krt" type="number" min="0" placeholder="цель" aria-label="Цель" style="width:100px"><button class="pri" data-kradd>Добавить</button></div>
 <small style="color:var(--mut)">Итого по результатам: ${Math.round(krPct(g))}%</small></div>
 <div class="ds"><label>Недельный чекин</label><small style="color:var(--mut)">Как продвинулись за неделю? Напишите коротко.</small>
 <div class="bar" style="margin:0"><input id="ckn" placeholder="Что получилось и что мешает" aria-label="Комментарий к чекину" style="flex:1"><button class="pri" data-ckgo>Сохранить чекин</button></div>
 ${ck.map(c=>`<div class="row"><small>${fd(c.d,{day:'numeric',month:'short'})}</small><span class="sp">${esc(c.n||'Без комментария')}</span><b>${esc(c.c||'')}</b></div>`).join('')}</div>`}

function krCheck(){const sg=S.goals.findIndex(x=>x.id==gg.id);if(sg<0)return;const n=($('#ckn').value||'').trim(),L=gg.kr||[];
 if(!L.length){toast('Сначала добавьте ключевой результат',1);return}
 const snap={};L.forEach(k=>snap[k.id]=k.cv);const lt=gLight(gg);
 gg.ck=(gg.ck||[]).concat({d:today(),n,c:lt?lt.t:'',kr:snap});S.goals[sg]=structuredClone(gg);save();toast('Чекин сохранён');gre()}

// Делегирование: кнопки внутри окна цели (только в браузере)
if(typeof document!='undefined'){
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('#db [data-krv]');if(!i||!gg)return;const k=(gg.kr||[]).find(x=>x.id==i.dataset.krv);if(k){k.cv=+i.value||0;gre()}});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#db [data-krdel],#db [data-kradd],#db [data-ckgo]');if(!b||!gg)return;
 if(b.dataset.krdel){gg.kr=(gg.kr||[]).filter(k=>k.id!=b.dataset.krdel);if(!gg.kr.length)delete gg.kr}
 else if(b.hasAttribute('data-kradd')){const t=($('#krn').value||'').trim(),tg=+$('#krt').value||0;if(!t)return;gg.kr=gg.kr||[];gg.kr.push({id:uid(),t,tg,cv:0,u:gg.u||''});if(!gg.st)gg.st=today()}
 else return krCheck();
 gre()});
// Баннер «пора чекин» наверху списка целей
if(typeof vG=='function'){const vGBaseKR=vG;
vG=function(){const due=krOn()?S.goals.filter(krDue):[];const bn=due.length?`<div class="tri-b" role="status"><div><b>🗓 Пора сделать чекин</b><span>${due.map(g=>esc(g.t)).join(', ')}</span></div><div class="tri-a">${due.slice(0,3).map(g=>`<button data-kgo="${g.id}">${esc(g.t)}</button>`).join('')}</div></div>`:'';return bn+vGBaseKR()}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-kgo]');if(!b)return;XP.close();openGoal(b.dataset.kgo)});
}
