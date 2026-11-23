/* v2.9.2 (часть 3): N24 канбан проекта. Колонки: Задача / В работе / Ждёт / Готово.
   Статус: поле задачи ks ('w' в работе, 'h' ждёт); «Готово» = отмечено на дату задачи (как обычно).
   Перенос — через выбор статуса в карточке (доступно с клавиатуры, без перетаскивания). Миграции нет. */
(()=>{
const COLS=[['t','Задача'],['w','В работе'],['h','Ждёт'],['d','Готово']];
const colOf=e=>(e.done&&e.done[e.date])?'d':(e.ks||'t');
const tasksOf=pid=>S.ev.filter(e=>e.kind=='task'&&e.proj==pid&&(!e.rep||e.rep.t=='none'));

function kbCard(e){const c=colOf(e),est=+e.est||0;
  return `<div class="kbcard"><b>${esc(e.title||'Без названия')}</b><div class="kbm">${e.date?HUB.dlb(e.date):''}${est?' · '+hr(est*60):''}</div>`+
    `<select data-kbs="${e.id}" aria-label="Статус: ${esc(e.title||'задача')}">${COLS.map(([k,n])=>`<option value="${k}"${k==c?' selected':''}>${n}</option>`).join('')}</select></div>`}

function kbHTML(p){const L=tasksOf(p.id);
  const cols=COLS.map(([k,n])=>{const it=L.filter(e=>colOf(e)==k),h=it.reduce((s,e)=>s+(+e.est||0),0);
    const ad=k=='t'?`<div class="kbadd"><input data-kbin="${p.id}" placeholder="Новая задача…" aria-label="Новая задача"><button type="button" data-kbadd="${p.id}" aria-label="Добавить задачу">+</button></div>`:'';
    return `<section class="kbc" aria-label="${n}"><h5>${n}<span>${it.length}${h?' · '+hr(h*60):''}</span></h5>${ad}${it.map(kbCard).join('')||'<div class="xemp">Пусто</div>'}</section>`}).join('');
  const rec=S.ev.filter(e=>e.kind=='task'&&e.proj==p.id&&e.rep&&e.rep.t!='none').length;
  return `<div class="kbnote">Повторяющиеся задачи здесь не показаны${rec?` (${rec} шт.)`:''}: они в календаре.</div><div class="kbw">${cols}</div>`}

function kbOpen(pid){const p=PJ(pid);if(!p)return;XT.show('Канбан: '+p.t,kbHTML(p))}

function kbSet(id,to){const e=S.ev.find(x=>x.id==id);if(!e)return;snap();
  if(to=='d'){e.done=e.done||{};if(!e.done[e.date]){e.done[e.date]=1;S.pts=(S.pts||0)+10}}
  else{if(e.done&&e.done[e.date]){delete e.done[e.date];S.pts=(S.pts||0)-10}
    if(to=='t')delete e.ks;else e.ks=to}
  save();render();kbOpen(e.proj)}

function kbAdd(pid){const i=document.querySelector(`[data-kbin="${pid}"]`),v=(i&&i.value||'').trim();if(!v){if(i)i.focus();return}
  snap();S.ev.push(mk2(v,today(),'task',{proj:pid}));save();render();kbOpen(pid);
  setTimeout(()=>{const n=document.querySelector(`[data-kbin="${pid}"]`);if(n)n.focus()},30)}

document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-kb],[data-kbadd]');if(!b)return;
  if(b.dataset.kbadd)kbAdd(b.dataset.kbadd);else kbOpen(b.dataset.kb)});
document.addEventListener('change',ev=>{const s=ev.target.closest&&ev.target.closest('[data-kbs]');if(s)kbSet(s.dataset.kbs,s.value)});
document.addEventListener('keydown',ev=>{if(ev.key!='Enter'||!ev.target.matches||!ev.target.matches('[data-kbin]'))return;ev.preventDefault();kbAdd(ev.target.dataset.kbin)});
})();
