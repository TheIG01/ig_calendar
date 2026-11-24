// v2.23 N23 «Спринты недели/месяца»: цель периода, список задач, итог в конце, шкала выполнения.
// Поле цели: g.spr [{id,p,s,g,tk,n}] — p 'w' (неделя) | 'm' (месяц), s — первый день периода (yyyy-mm-dd),
// g — цель периода, tk [{id,t,d}] — задачи (d — выполнено), n — итог. Неделя начинается в понедельник.
// Настройка S.set.gspr (0 — блок скрыт). Правки идут в gg и сохраняются кнопкой «Сохранить» (как финансы).
window.SPR=(function(){
const on=()=>!(S.set&&S.set.gspr===0);
const sprs=g=>(g&&g.spr)||[];
const days=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/864e5);
const dow=s=>(new Date(s+'T00:00:00Z').getUTCDay()+6)%7;

// Границы периода, которому принадлежит дата t. Возвращает {s,e} — первый и последний день.
function bounds(p,t){
 if(p==='m'){const s=t.slice(0,8)+'01',d=new Date(s+'T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+1,0);return{s,e:d.toISOString().slice(0,10)}}
 const s=add(t,-dow(t));return{s,e:add(s,6)}}

// Текущий спринт (тот, чей период содержит сегодня) или null.
function cur(g,t){return sprs(g).find(x=>x.s<=t&&t<=bounds(x.p,x.s).e)||null}

// Выполнение задач: {done,total,pct}. Без задач pct = 0.
function prog(sp){const L=(sp&&sp.tk)||[],done=L.filter(x=>x.d).length,total=L.length;
 return{done,total,pct:total?Math.round(done/total*100):0}}

// Название периода: «Неделя 23 – 29 нояб.» или «Ноябрь 2026».
function label(sp){const b=bounds(sp.p,sp.s);
 if(sp.p==='m')return 'Месяц: '+fd(b.s,{month:'long',year:'numeric'});
 return 'Неделя: '+fd(b.s,{day:'numeric',month:'short'})+' – '+fd(b.e,{day:'numeric',month:'short'})}

// Короткая строка состояния: сколько дней осталось или что спринт завершён.
function msg(sp,t){const b=bounds(sp.p,sp.s),pr=prog(sp);
 if(t>b.e)return 'Спринт завершён: выполнено '+pr.pct+'% задач.';
 return 'Осталось дней: '+(days(t,b.e)+1)+'. Выполнено '+pr.pct+'% задач.'}

// Блок «Спринт» в окне цели.
function html(g){if(!on())return '';
 const t=today(),c=cur(g,t),past=sprs(g).filter(x=>x!==c).sort((a,b)=>(b.s||'').localeCompare(a.s||'')).slice(0,5);
 const pastHTML=past.length?past.map(x=>{const pr=prog(x);return `<div class="row"><small>${esc(label(x))}</small><b>${pr.pct}%</b><span class="sp">${esc(x.n||x.g||'Без итога')}</span></div>`}).join(''):'';
 if(!c)return `<div class="ds" id="spr"><label>Спринт</label>
 ${ui.empty('history','Спринтов на текущий период нет. Создайте спринт недели или месяца: цель, задачи и итог.')}
 <div class="bar" style="margin:0"><button class="pri" data-spnew="w">Спринт недели</button><button data-spnew="m">Спринт месяца</button></div>${pastHTML}</div>`;
 const pr=prog(c);
 const tasks=(c.tk||[]).map(x=>`<li style="display:flex;gap:8px;align-items:center;min-height:44px"><button data-sptog data-spid="${esc(c.id)}" data-tid="${esc(x.id)}" aria-pressed="${!!x.d}" aria-label="Отметить задачу: ${esc(x.t)}" style="min-width:44px;min-height:44px">${x.d?'✓':'○'}</button><span class="sp" style="${x.d?'text-decoration:line-through;opacity:.6':''}">${esc(x.t)}</span><button class="x" data-spdel data-spid="${esc(c.id)}" data-tid="${esc(x.id)}" aria-label="Удалить задачу: ${esc(x.t)}">×</button></li>`).join('');
 return `<div class="ds" id="spr"><label>Спринт</label>
 <div class="gf" role="status"><b>${esc(label(c))}</b><div>${esc(msg(c,t))}</div></div>
 <input data-spgoal data-spid="${esc(c.id)}" value="${esc(c.g||'')}" maxlength="160" placeholder="Цель периода, например «Закрыть 3 проекта»" aria-label="Цель спринта" style="width:100%">
 <div class="xbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pr.pct}" aria-label="Выполнено ${pr.pct}%"><i style="width:${pr.pct}%"></i></div>
 <ul style="list-style:none;padding:0;margin:8px 0">${tasks||'<li><small>Задач пока нет. Добавьте первую ниже.</small></li>'}</ul>
 <div class="bar" style="margin:0"><input data-spna aria-label="Текст новой задачи" placeholder="Новая задача" maxlength="160" style="flex:1"><button class="pri" data-spadd data-spid="${esc(c.id)}">Добавить</button></div>
 <label style="margin-top:8px">Итог в конце периода</label>
 <textarea data-spsum data-spid="${esc(c.id)}" rows="2" maxlength="600" aria-label="Итог спринта" style="width:100%">${esc(c.n||'')}</textarea>
 <div class="bar" style="margin:0"><button class="x" data-spdelS data-spid="${esc(c.id)}" aria-label="Удалить спринт">Удалить спринт</button></div>
 ${pastHTML}</div>`}

// Делегирование: только внутри окна цели (#db). Правки идут в gg.
if(typeof document!=='undefined'){
document.addEventListener('change',e=>{const el=e.target.closest&&e.target.closest('#db [data-spgoal],#db [data-spsum]');if(!el||!gg)return;
 const sp=sprs(gg).find(x=>x.id==el.dataset.spid);if(!sp)return;
 if(el.hasAttribute('data-spgoal'))sp.g=el.value.trim().slice(0,160);else sp.n=el.value.trim().slice(0,600);gre()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#db [data-spnew],#db [data-spadd],#db [data-sptog],#db [data-spdel],#db [data-spdelS]');if(!b||!gg)return;
 const t=today();
 if(b.hasAttribute('data-spnew')){if(cur(gg,t)){toast('Спринт на этот период уже есть',1);return}
  const p=b.dataset.spnew;gg.spr=sprs(gg).concat({id:uid(),p,s:bounds(p,t).s,g:'',tk:[],n:''});gre();return}
 const sp=sprs(gg).find(x=>x.id==b.dataset.spid);if(!sp)return;
 if(b.hasAttribute('data-spdelS')){gg.spr=sprs(gg).filter(x=>x.id!=sp.id);if(!gg.spr.length)delete gg.spr;gre();return}
 if(b.hasAttribute('data-spadd')){const v=(b.parentElement.querySelector('[data-spna]').value||'').trim().slice(0,160);
  if(!v){toast('Введите текст задачи',1);return}sp.tk=(sp.tk||[]).concat({id:uid(),t:v,d:false});gre();return}
 const k=(sp.tk||[]).find(x=>x.id==b.dataset.tid);if(!k)return;
 if(b.hasAttribute('data-sptog')){k.d=!k.d;gre();return}
 sp.tk=sp.tk.filter(x=>x!==k);gre()});
}

return{on,bounds,cur,prog,label,msg,html}})();
