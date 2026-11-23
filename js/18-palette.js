// v2.7.11: командная палитра (N32). Ctrl+Shift+P: команды, этапы и проекты.
// Ctrl+K остаётся быстрым вводом (15-quick.js), поэтому палитра на другом сочетании.
(()=>{
const $p=s=>document.querySelector(s);
const norm=s=>String(s||'').toLowerCase().replace(/ё/g,'е');
const GO=v=>()=>{view=v;vr()};
const CMDS=[
 {t:'Новый этап',k:'создать событие добавить',run:()=>openEv({})},
 {t:'Быстрый ввод фразой',k:'ввод фраза ctrl k',run:()=>openCmd()},
 {t:'Сегодня',k:'сегодня today',run:()=>{cur=today();vr()}},
 {t:'Вид: день',k:'день day',run:GO('day')},
 {t:'Вид: неделя',k:'неделя week',run:GO('week')},
 {t:'Вид: месяц',k:'месяц month',run:GO('month')},
 {t:'Вид: год',k:'год year',run:GO('year')},
 {t:'Вид: повестка',k:'повестка список agenda',run:GO('agenda')},
 {t:'Тема: светлая',k:'тема светлая light',run:()=>sv2('theme','light')},
 {t:'Тема: тёмная',k:'тема тёмная dark ночь',run:()=>sv2('theme','dark')},
 {t:'Тема: Сон (тёплая)',k:'тема сон sleep',run:()=>sv2('theme','sleep')},
 {t:'Тема: по времени суток',k:'тема время суток',run:()=>sv2('theme','time')},
 {t:'Главные 3 дела на сегодня',k:'главное топ top',run:()=>XT.top()},
 {t:'Закрыть день',k:'конец день итоги',run:()=>XT.end()},
 {t:'Инструменты',k:'инструменты меню',run:()=>XT.menu()},
 {t:'Поиск по всему',k:'поиск найти search',run:()=>XD.search()},
 {t:'Отменить',k:'отмена undo назад',run:()=>undo()},
 {t:'Повторить',k:'повтор redo вперёд',run:()=>redo()},
 {t:'Настройки',k:'настройки параметры',run:()=>openSet()},
 {t:'Горячие клавиши',k:'клавиши шпаргалка',run:()=>XD.keys()},
 {t:'Диагностика и копии',k:'копии диагностика восстановить',run:()=>XD.open()}
];
let wrap,inp,list,items=[],sel=0,prev=null;

function build(){
  wrap=document.createElement('div');
  wrap.id='pal';wrap.className='cmd';wrap.hidden=true;
  wrap.innerHTML='<div role="dialog" aria-modal="true" aria-label="Командная палитра"><input id="pali" role="combobox" aria-expanded="true" aria-controls="pall" aria-label="Команда, этап или проект" autocomplete="off" placeholder="Команда, этап или проект…"><div id="pall" class="pal-l" role="listbox"></div></div>';
  document.body.appendChild(wrap);
  inp=wrap.querySelector('#pali');list=wrap.querySelector('#pall');
  inp.addEventListener('input',()=>{sel=0;draw()});
  inp.addEventListener('keydown',onKey);
  list.addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(b)run(+b.dataset.i)});
  wrap.addEventListener('click',e=>{if(e.target===wrap)close()});
}

function gather(q){
  const words=norm(q).trim().split(/\s+/).filter(Boolean);
  const hit=t=>words.every(w=>norm(t).includes(w));
  const out=CMDS.filter(c=>!words.length||hit(c.t+' '+c.k));
  if(words.length){
    (S.proj||[]).filter(p=>hit(p.t)).slice(0,4).forEach(p=>out.push({t:'Проект: '+p.t,h:'показать только его этапы',run:()=>pfs(p.id)}));
    (S.ev||[]).filter(e=>e.title&&hit(e.title)).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,8).forEach(e=>out.push({t:e.title,h:`${e.date||''} · ${e.st||''}`,run:()=>{if(e.date)cur=e.date;vr();openEv(e.id)}}));
    out.push({t:`Создать этап «${q.trim()}»`,h:'откроет быстрый ввод',run:()=>{openCmd();const i=$p('#ci');if(i){i.value=q.trim();cmdp()}}});
  }
  return out.slice(0,30);
}

function draw(){
  items=gather(inp.value);
  if(sel>=items.length)sel=Math.max(0,items.length-1);
  list.innerHTML=items.length?items.map((it,i)=>`<button type="button" class="pal-i${i===sel?' on':''}" role="option" aria-selected="${i===sel}" data-i="${i}"><span>${esc(it.t)}</span>${it.h?`<small>${esc(it.h)}</small>`:''}</button>`).join(''):'<div class="pal-e">Ничего не нашлось. Попробуйте другое слово.</div>';
}

function onKey(e){
  if(e.key=='ArrowDown'||e.key=='ArrowUp'){
    e.preventDefault();const n=items.length;if(!n)return;
    sel=(sel+(e.key=='ArrowDown'?1:-1)+n)%n;draw();
    list.querySelector('.on')?.scrollIntoView({block:'nearest'});
  }else if(e.key=='Enter'){e.preventDefault();run(sel)}
  else if(e.key=='Escape'){e.preventDefault();close()}
}

function run(i){const it=items[i];if(!it)return;close();try{it.run()}catch(err){console.error(err)}}
function open(){
  if(!wrap)build();
  prev=document.activeElement;
  wrap.hidden=false;inp.value='';sel=0;draw();inp.focus();
}
function close(){
  if(!wrap||wrap.hidden)return;
  wrap.hidden=true;
  if(prev&&prev.focus)prev.focus();
}

addEventListener('keydown',e=>{
  if(!((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.code=='KeyP'))return;
  if((S.set.pal??1)==0)return;
  e.preventDefault();open();
});

const _es=window.editSet;
window.editSet=()=>(_es?_es():'')+sw('Командная палитра (Ctrl+Shift+P)','pal',[[1,'Вкл'],[0,'Выкл']],1);
})();
