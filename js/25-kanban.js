/* v2.9.2 (часть 3): N24 канбан проекта. Колонки: Задача / В работе / Ждёт / Готово.
   Статус: поле задачи ks ('w' в работе, 'h' ждёт); «Готово» = отмечено на дату задачи (как обычно).
   v2.9.4: перенос перетаскиванием за ручку ⠿ (мышь и касание) + выбор статуса (клавиатура). Миграции нет. */
(()=>{
const COLS=[['t','Задача'],['w','В работе'],['h','Ждёт'],['d','Готово']];
const colOf=e=>(e.done&&e.done[e.date])?'d':(e.ks||'t');
const tasksOf=pid=>S.ev.filter(e=>e.kind=='task'&&e.proj==pid&&(!e.rep||e.rep.t=='none'));

function kbCard(e){const c=colOf(e),est=+e.est||0,ttl=esc(e.title||'Без названия');
  return `<div class="kbcard" data-kbid="${e.id}"><div class="kbrow"><button type="button" class="kbh" data-kbh="${e.id}" tabindex="-1" aria-hidden="true" title="Перетащить в другую колонку">⠿</button><b>${ttl}</b></div><div class="kbm">${e.date?HUB.dlb(e.date):''}${est?' · '+hr(est*60):''}</div>`+
    `<select data-kbs="${e.id}" aria-label="Статус: ${ttl}">${COLS.map(([k,n])=>`<option value="${k}"${k==c?' selected':''}>${n}</option>`).join('')}</select></div>`}

function kbHTML(p){const L=tasksOf(p.id);
  const cols=COLS.map(([k,n])=>{const it=L.filter(e=>colOf(e)==k),h=it.reduce((s,e)=>s+(+e.est||0),0);
    const ad=k=='t'?`<div class="kbadd"><input data-kbin="${p.id}" placeholder="Новая задача…" aria-label="Новая задача"><button type="button" data-kbadd="${p.id}" aria-label="Добавить задачу">+</button></div>`:'';
    return `<section class="kbc" data-col="${k}" aria-label="${n}"><h5>${n}<span>${it.length}${h?' · '+hr(h*60):''}</span></h5>${ad}${it.map(kbCard).join('')||'<div class="xemp">Пусто</div>'}</section>`}).join('');
  const rec=S.ev.filter(e=>e.kind=='task'&&e.proj==p.id&&e.rep&&e.rep.t!='none').length;
  return `<div class="kbnote">Перенесите задачу за ⠿ в другую колонку или выберите статус. Повторяющиеся задачи здесь не показаны${rec?` (${rec} шт.)`:''}: они в календаре.</div><div class="kbw">${cols}</div>`}

function kbOpen(pid){const p=PJ(pid);if(!p)return;XT.show('Канбан: '+p.t,kbHTML(p))}

function kbSet(id,to){const e=S.ev.find(x=>x.id==id);if(!e)return;snap();
  if(to=='d'){e.done=e.done||{};if(!e.done[e.date]){e.done[e.date]=1;S.pts=(S.pts||0)+10}}
  else{if(e.done&&e.done[e.date]){delete e.done[e.date];S.pts=(S.pts||0)-10}
    if(to=='t')delete e.ks;else e.ks=to}
  save();render();kbOpen(e.proj)}

function kbAdd(pid){const i=document.querySelector(`[data-kbin="${pid}"]`),v=(i&&i.value||'').trim();if(!v){if(i)i.focus();return}
  snap();S.ev.push(mk2(v,today(),'task',{proj:pid}));save();render();kbOpen(pid);
  setTimeout(()=>{const n=document.querySelector(`[data-kbin="${pid}"]`);if(n)n.focus()},30)}

/* Перетаскивание: pointer events (мышь и касание). Колонка под указателем подсвечивается; при отпускании статус меняется через kbSet. */
let drag=null;
const markCol=(k,on)=>{const s=document.querySelector(`.kbc[data-col="${k}"]`);if(s)s.classList.toggle('kbhot',on)};
function kbDown(ev){const h=ev.target.closest&&ev.target.closest('[data-kbh]');if(!h||ev.button>0)return;
  const card=h.closest('.kbcard');if(!card)return;
  drag={id:h.dataset.kbh,card,pid:ev.pointerId,x:ev.clientX,y:ev.clientY,col:null,moved:false};
  try{h.setPointerCapture(ev.pointerId)}catch(_){}
  ev.preventDefault()}
function kbEdge(x){const w=document.querySelector('.kbw');if(!w)return;const r=w.getBoundingClientRect();
  if(x<r.left+48)w.scrollLeft-=14;else if(x>r.right-48)w.scrollLeft+=14}
function kbMove(ev){if(!drag||ev.pointerId!==drag.pid)return;
  const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;
  if(!drag.moved){if(Math.hypot(dx,dy)<6)return;drag.moved=true;drag.card.classList.add('kbdrag')}
  drag.card.style.transform=`translate(${dx}px,${dy}px)`;
  const el=document.elementFromPoint(ev.clientX,ev.clientY),sec=el&&el.closest&&el.closest('.kbc[data-col]'),col=sec?sec.dataset.col:null;
  if(col!==drag.col){if(drag.col)markCol(drag.col,false);drag.col=col;if(col)markCol(col,true)}
  kbEdge(ev.clientX)}
function kbEnd(ev,cancel){if(!drag||ev.pointerId!==drag.pid)return;
  const d=drag;drag=null;d.card.classList.remove('kbdrag');d.card.style.transform='';
  if(d.col)markCol(d.col,false);
  if(cancel||!d.moved||!d.col)return;
  const e=S.ev.find(x=>x.id==d.id);
  if(e&&d.col!=colOf(e))kbSet(d.id,d.col)}

document.addEventListener('pointerdown',kbDown);
document.addEventListener('pointermove',kbMove);
document.addEventListener('pointerup',ev=>kbEnd(ev,false));
document.addEventListener('pointercancel',ev=>kbEnd(ev,true));

document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-kb],[data-kbadd]');if(!b)return;
  if(b.dataset.kbadd)kbAdd(b.dataset.kbadd);else kbOpen(b.dataset.kb)});
document.addEventListener('change',ev=>{const s=ev.target.closest&&ev.target.closest('[data-kbs]');if(s)kbSet(s.dataset.kbs,s.value)});
document.addEventListener('keydown',ev=>{if(ev.key!='Enter'||!ev.target.matches||!ev.target.matches('[data-kbin]'))return;ev.preventDefault();kbAdd(ev.target.dataset.kbin)});
})();
