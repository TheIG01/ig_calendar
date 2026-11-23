// v2.11 «Проекты — верхний уровень»: цели внутри проекта и прогресс проекта по целям.
// Поле g.proj — проект цели (верхний уровень). Подцель не хранит проект: берёт его у корневой цели.
// Настройка S.set.pgo (по умолчанию вкл): блок «Цели проекта» в карточке и выбор проекта в окне цели.
const pgOn=()=>!(S.set&&S.set.pgo===0);

// Корневая цель ветки (идём вверх по par, не дольше 20 шагов).
function goalRoot(g){let c=g,n=0;while(c.par&&n++<20){const up=S.goals.find(x=>x.id==c.par);if(!up)break;c=up}return c}

// Проект цели: проект её корневой цели.
function goalProj(g){return goalRoot(g).proj||''}

// Верхние цели проекта: без родителя (или родитель пропал) и с этим проектом.
function projTop(p){return S.goals.filter(g=>(!g.par||!S.goals.some(x=>x.id==g.par))&&g.proj==p.id)}

// Прогресс проекта по целям: среднее по верхним целям (каждая цель уже учитывает свои подцели через gpc). null — целей нет.
function projGoalPct(p){const L=projTop(p);if(!L.length)return null;return L.reduce((a,g)=>a+gpc(g),0)/L.length}

// Дерево подцелей для показа (глубина ограничена, чтобы карточка не разъезжалась).
function pgNode(g,d){const kids=S.goals.filter(x=>x.par==g.id),pc=Math.round(gpc(g));
 return `<div class="pgn" style="margin-left:${d*14}px"><div class="pgr"><button class="pgt" data-pgo="${g.id}">${esc(g.t)}</button><span>${pc}%</span></div><div class="pb"><i style="width:${pc}%"></i></div>${d<6?kids.map(k=>pgNode(k,d+1)).join(''):''}</div>`}

// Полоска проекта: часы (если есть план) и цели (если есть) — среднее; null — полоски нет.
function projMixPct(p,pl,w){const h=pl?Math.min(100,w/60/pl*100):null,g=projGoalPct(p);if(h==null&&g==null)return null;if(h==null)return g;if(g==null)return h;return (h+g)/2}

// Блок в карточке проекта (вставляется в vP).
const W=typeof window!=='undefined'?window:globalThis;
W.projGoalsHTML=function(p){if(!pgOn())return '';const L=projTop(p),pc=projGoalPct(p);
 return `<div class="pgb"><div class="pgh"><b>Цели проекта</b>${pc==null?'':`<span>${Math.round(pc)}% по целям</span>`}</div>${L.map(g=>pgNode(g,0)).join('')||'<small class="xemp">Цели пока не привязаны. Добавьте первую ниже.</small>'}<div class="xgi"><input id="pg${p.id}" aria-label="Название новой цели проекта" placeholder="Новая цель проекта…" style="flex:1;width:auto" data-pgin="${p.id}"><button class="xtg" data-pgadd="${p.id}" aria-label="Добавить цель в проект">+</button></div></div>`};

// Выбор проекта в окне цели (только у верхних целей).
W.goalProjPicker=function(g){if(!pgOn()||g.par)return '';
 return `<div class="ds"><label>Проект</label><div class="pills"><button class="pl ${!g.proj?'on':''}" data-gp="">Без проекта</button>${(S.proj||[]).filter(p=>!p.arch||p.id==g.proj).map(p=>`<button class="pl ${g.proj==p.id?'on':''}" style="--c:${p.c}" data-gp="${p.id}">${esc(p.t)}</button>`).join('')}</div></div>`};

if(typeof document!=='undefined'){
 const addGoal=(pid,t)=>{t=(t||'').trim();if(!t)return;S.goals.push({id:uid(),t,m:'log',tg:0,dl:'',why:'',proj:pid});save();render()};
 document.addEventListener('click',e=>{
  const add=e.target.closest('[data-pgadd]');
  if(add){const i=document.getElementById('pg'+add.dataset.pgadd);addGoal(add.dataset.pgadd,i&&i.value);return}
  const go=e.target.closest('[data-pgo]');
  if(go){window.XP&&XP.close();openGoal(go.dataset.pgo);return}
  const gp=e.target.closest('[data-gp]');
  if(gp&&gg){if(gp.dataset.gp)gg.proj=gp.dataset.gp;else delete gg.proj;gre()}
 });
 document.addEventListener('keydown',e=>{
  if(e.key!='Enter'||!e.target.matches||!e.target.matches('[data-pgin]'))return;
  addGoal(e.target.dataset.pgin,e.target.value);
 });
}
if(typeof module!=='undefined')module.exports={goalRoot,goalProj,projTop,projGoalPct,projMixPct};
