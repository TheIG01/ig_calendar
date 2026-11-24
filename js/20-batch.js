// v2.8.4, G07: пакетные операции над задачами и перенос просроченного с выбором.
// Настройка S.set.bx (по умолчанию вкл; 0 — прежнее поведение «Всё на сегодня»).
// Повторяющиеся задачи не переносятся, не удаляются и не меняют серию пачкой: защита от случайной правки серии.
(function(){
const H=window.HUB;
const BX={sel:new Set(),od:0};
const on=()=>(S.set.bx??1)!==0;
const kOf=x=>x.e.id+'|'+x.d;
const isRep=e=>!!(e.rep&&e.rep.t!='none');
const openL=()=>{const t=today();return H.tasks().filter(x=>!x.dn&&(!BX.od||x.d<t)).sort((a,b)=>a.d.localeCompare(b.d)||(b.e.pri||0)-(a.e.pri||0))};

function html(){
  const L=openL(),ps=(S.proj||[]).filter(p=>!p.arch);
  const list=L.map(x=>{const r=isRep(x.e),p=x.e.proj&&H.PJ(x.e.proj);return `<label class="bx-row"><input type="checkbox" data-bxc="${kOf(x)}"${BX.sel.has(kOf(x))?' checked':''}><span class="bx-t"><b>${esc(x.e.title||'Без названия')}</b><small>${H.dlb(x.d)}${r?' · повтор':''}${p?' · '+esc(p.t):''}</small></span></label>`}).join('');
  return `<div class="xc2" role="group" aria-label="Какие задачи показать"><button data-bxa="f" data-v="0" class="${BX.od?'':'on'}">Все открытые</button><button data-bxa="f" data-v="1" class="${BX.od?'on':''}">Только просроченные</button></div>`
  +(L.length?`<div class="bx-list">${list}</div>`:`<div class="xemp">${BX.od?'Просроченных задач нет. Так держать!':'Открытых задач нет. Отдохните '+ic('sparkle',14)}</div>`)
  +`<div class="bx-act"><div class="xm2">Выбрано: <b id="bxn">${BX.sel.size}</b> из ${L.length}</div>`
  +`<div class="xc2"><button data-bxa="all">Выбрать все</button><button data-bxa="none">Снять выбор</button></div>`
  +`<div class="xc2"><button class="xpri" data-bxa="go" data-m="0">На сегодня</button><button data-bxa="go" data-m="1">На завтра</button><button data-bxa="go" data-m="7">Через неделю</button></div>`
  +`<div class="xc2"><button data-bxa="st" data-s="idea">Идея</button><button data-bxa="st" data-s="plan">В плане</button><button data-bxa="st" data-s="work">В работе</button><button data-bxa="st" data-s="wait">Ждёт ответа</button></div>`
  +`<div class="xc2"><button data-bxa="done">✓ Выполнено</button><button data-bxa="del">${ic('trash',16)} В корзину</button></div>`
  +`<div class="xgi"><select id="bxp" aria-label="Проект"><option value="">Без проекта</option>${ps.map(p=>`<option value="${p.id}">${esc(p.t)}</option>`).join('')}</select><button class="xtg" data-bxa="pr">В проект</button></div>`
  +`<p class="xn">Повторяющиеся задачи пачкой не переносятся и не удаляются: меняйте их по одной.</p></div>`;
}
const show=()=>XT.show(['check','Задачи: пакетные действия'],html());
function bxOpen(od){BX.od=od?1:0;BX.sel.clear();if(BX.od)openL().forEach(x=>BX.sel.add(kOf(x)));show()}

// Применяет fn(e,d) к отмеченным; fn возвращает false, если операция к задаче неприменима (повтор).
function apply(label,fn){
  const keys=[...BX.sel];
  if(!keys.length){toast('Сначала отметьте задачи',1);return}
  snap();let ok=0,skip=0;
  keys.forEach(k=>{const[id,d]=k.split('|'),e=S.ev.find(v=>v.id==id);if(!e)return;fn(e,d)===false?skip++:ok++});
  BX.sel.clear();save();render();XT.close();
  toast(label+': '+ok+(skip?' · пропущено повторов: '+skip:''));
}
function remove(){
  const keys=[...BX.sel];
  if(!keys.length){toast('Сначала отметьте задачи',1);return}
  const ids=new Set(),skip=[];
  keys.forEach(k=>{const id=k.split('|')[0],e=S.ev.find(v=>v.id==id);if(!e)return;isRep(e)?skip.push(id):ids.add(id)});
  if(!ids.size){toast('Повторяющиеся задачи удаляются по одной',1);return}
  snap();trashPut(S.ev.filter(e=>ids.has(e.id)));S.ev=S.ev.filter(e=>!ids.has(e.id));
  BX.sel.clear();save();render();XT.close();
  toast('В корзину: '+ids.size+(skip.length?' · повторы пропущены: '+skip.length:''));
}

const MOVE=n=>(e)=>{if(isRep(e))return false;e.date=add(today(),n)};
const ACT={
  f(b){BX.od=+b.dataset.v?1:0;if(BX.od)openL().forEach(x=>BX.sel.add(kOf(x)));show()},
  all(){openL().forEach(x=>BX.sel.add(kOf(x)));show()},
  none(){BX.sel.clear();show()},
  go(b){const n=+b.dataset.m;apply('Перенесено',MOVE(n))},
  st(b){const s=b.dataset.s;apply('Статус изменён',e=>{e.status=s})},
  done(){apply('Отмечено выполненными',(e,d)=>{e.done=e.done||{};e.done[d]=1})},
  pr(){const v=document.querySelector('#bxp').value;apply('Проект изменён',e=>{if(v)e.proj=v;else delete e.proj})},
  del(){remove()},
};

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-bxa]');
  if(!b)return;
  if(b.dataset.bxa=='open'){bxOpen(0);return}
  if(!b.closest('#xb'))return;
  const f=ACT[b.dataset.bxa];if(f)f(b);
});
document.addEventListener('change',e=>{
  const c=e.target.closest&&e.target.closest('[data-bxc]');
  if(!c)return;
  const k=c.dataset.bxc;
  c.checked?BX.sel.add(k):BX.sel.delete(k);
  const n=document.querySelector('#bxn');if(n)n.textContent=BX.sel.size;
});

// Перенос просроченного: раньше переносилось всё сразу, теперь окно выбора (все просроченные отмечены по умолчанию).
const oldLate=XP.late;
XP.late=()=>{if(!on())return oldLate();bxOpen(1)};

// Кнопка «Выбрать задачи» над списком во вкладке «Задачи» (точка входа window.vKWrap из 03-hub).
const oldVK=H.vK;
window.vKWrap=function(){return (on()?'<div class="xc2"><button data-bxa="open">'+ic('check',14)+' Выбрать задачи</button></div>':'')+oldVK()};
})();
