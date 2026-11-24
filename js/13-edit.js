// v2.5.2: Отменить/Повторить в шапке, магнитная привязка, перенос дня в «Месяце», меню по правому клику
(()=>{
const Q=s=>document.querySelector(s),on=(k,d)=>(S.set[k]??d);
let RS=[],lastUb=null,busy=0;
// --- Отменить / Повторить ---
const _undo=window.undo;
window.undo=function(){if(!ub)return;busy=1;RS.push(JSON.stringify(S.ev));try{_undo()}finally{busy=0;lastUb=ub}bar()};
window.redo=function(){if(!RS.length)return;busy=1;try{ub=JSON.stringify(S.ev);S.ev=JSON.parse(RS.pop());save();Q('#toast')?.classList.remove('on');render();toast('Повторено')}finally{busy=0;lastUb=ub}bar()};
function bar(){const u=Q('#ubU'),r=Q('#ubR');if(!u)return;const h=!on('uhd',1);u.hidden=r.hidden=h;u.disabled=!ub;r.disabled=!RS.length}
function mkBar(){if(Q('#ubU'))return;const t=Q('#tm');if(!t)return;t.insertAdjacentHTML('beforebegin','<button class="kbtn ubtn" id="ubU" data-act="undo" aria-label="Отменить (Ctrl+Z)" title="Отменить (Ctrl+Z)">↶</button><button class="kbtn ubtn" id="ubR" data-act="redo" aria-label="Повторить (Ctrl+Shift+Z)" title="Повторить (Ctrl+Shift+Z)">↷</button>')}
const _render=window.render;
window.render=function(){const r=_render.apply(this,arguments);if(!busy&&ub!==lastUb){RS=[];lastUb=ub}mkBar();bar();return r};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act=undo],[data-act=redo]');if(!b)return;b.dataset.act=='undo'?undo():redo()});
addEventListener('keydown',e=>{if(!(e.ctrlKey||e.metaKey)||e.target.closest('input,textarea,select'))return;if((e.code=='KeyZ'&&e.shiftKey)||e.code=='KeyY'){e.preventDefault();e.stopImmediatePropagation();redo()}},true);
// --- Магнитная привязка (Alt — без неё) ---
window.mgn=function(ns,d,e){if(!on('mag',1)||e.altKey)return ns;const th=Math.max(4,Math.round(7*60/HH)),E=[];
 d.c.querySelectorAll('.ev[data-id]').forEach(x=>{if(x===d.el||x.classList.contains('ghost')||!x.dataset.s)return;E.push(tm(x.dataset.s),tm(x.dataset.e))});
 let best=null,bd=th+1;E.forEach(p=>{[[ns,p],[ns+d.d,p-d.d]].forEach(([a,r])=>{const df=Math.abs(a-p);if(df<bd){bd=df;best=r}})});
 return best==null?ns:Math.max(0,Math.min(1440-d.d,best))};
// --- Перенос дня в «Месяце» ---
let md=null,sup=0;
const cellAt=(x,y)=>document.elementFromPoint(x,y)?.closest('.mg .c[data-d]');
const clr=()=>document.querySelectorAll('.mdrop').forEach(x=>x.classList.remove('mdrop'));
document.addEventListener('pointerdown',e=>{if(!on('mdr',1)||e.button||e.pointerType=='touch'||e.shiftKey||e.ctrlKey||e.metaKey)return;const ch=e.target.closest('.mg .ch[data-id]');if(!ch||e.target.closest('input,.cb'))return;md={id:ch.dataset.id,x:e.clientX,y:e.clientY,mv:0,el:ch,from:ch.closest('.c')?.dataset.d}});
document.addEventListener('pointermove',e=>{if(!md)return;if(!md.mv&&Math.hypot(e.clientX-md.x,e.clientY-md.y)<6)return;md.mv=1;md.el.classList.add('mdrag');clr();cellAt(e.clientX,e.clientY)?.classList.add('mdrop')});
document.addEventListener('pointerup',e=>{if(!md)return;const m=md;md=null;if(!m.mv)return;sup=Date.now();m.el.classList.remove('mdrag');clr();const c=cellAt(e.clientX,e.clientY);if(!c||c.dataset.d==m.from)return;
 const o=S.ev.find(v=>v.id==m.id);if(!o)return;if(o.rep&&o.rep.t!='none'){toast('Повторяющийся этап переносится в «Неделе» или в окне этапа',1);return}
 ub=JSON.stringify(S.ev);o.date=c.dataset.d;save();render();toast('Перенесено на '+fd(o.date,{day:'numeric',month:'short'}))});
document.addEventListener('click',e=>{if(Date.now()-sup<350){e.stopPropagation();e.preventDefault();sup=0}},true);
// --- Меню по правому клику ---
const cm=document.createElement('div');cm.id='ctxm';cm.hidden=true;cm.setAttribute('role','menu');document.body.appendChild(cm);
const hide=()=>{cm.hidden=true};
addEventListener('contextmenu',e=>{if(!on('ctx',1)||matchMedia('(pointer:coarse)').matches)return;const b=e.target.closest('.ev[data-id],.ch[data-id]');if(!b||b.querySelector('input.ti'))return;
 const o=S.ev.find(v=>v.id==b.dataset.id);if(!o)return;e.preventDefault();e.stopImmediatePropagation();
 const c=b.closest('[data-d]'),d=c?c.dataset.d:cur,rec=o.rep&&o.rep.t!='none',tk=o.kind&&o.kind!='event',it=[['open','Открыть'],tk?['done',o.done?.[d]?'Вернуть в работу':'Готово']:0,['dup','Дублировать'],rec?['skip','Пропустить этот день ('+d.slice(5)+')']:['tom','Перенести на завтра'],['del','Удалить']].filter(Boolean);
 cm.innerHTML=it.map(([k,t])=>`<button role="menuitem" data-cm="${k}" class="${k=='del'?'dng':''}">${t}</button>`).join('');
 cm.hidden=false;cm.style.left=Math.max(4,Math.min(e.clientX,innerWidth-200))+'px';cm.style.top=Math.max(4,Math.min(e.clientY,innerHeight-cm.offsetHeight-8))+'px';cm.firstChild.focus();
 cm._o=o;cm._d=d},true);
cm.addEventListener('click',e=>{const k=e.target.closest('[data-cm]')?.dataset.cm,o=cm._o,d=cm._d;hide();if(!k||!o)return;
 if(k=='open')openEv(o.id);
 else if(k=='done')tdone({stopPropagation(){},clientX:innerWidth/2,clientY:innerHeight/2},o.id,d);
 else if(k=='dup'){ub=JSON.stringify(S.ev);const n=structuredClone(o);n.id=uid();n.title+=' (копия)';S.ev.push(n);save();render();toast('Скопировано')}
 else if(k=='tom'){ub=JSON.stringify(S.ev);o.date=add(o.date||d,1);save();render();toast('Перенесено на завтра')}
 else if(k=='skip'){ub=JSON.stringify(S.ev);o.ex=[...(o.ex||[]),d];save();render();toast('Этот день пропущен, остальные повторы на месте')}
 else if(k=='del'){ub=JSON.stringify(S.ev);trashPut([o]);S.ev=S.ev.filter(x=>x.id!=o.id);save();render();toast('Этап удалён')}});
cm.addEventListener('keydown',e=>{const bs=[...cm.querySelectorAll('button')],i=bs.indexOf(document.activeElement);if(e.key=='ArrowDown'){e.preventDefault();bs[(i+1)%bs.length].focus()}else if(e.key=='ArrowUp'){e.preventDefault();bs[(i-1+bs.length)%bs.length].focus()}else if(e.key=='Escape')hide()});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#ctxm'))hide()});addEventListener('scroll',hide,true);addEventListener('blur',hide);
// --- Настройки ---
window.editSet=()=>{const t=(l,k,d)=>sw(l,k,[[1,'Вкл'],[0,'Выкл']],d);
 return t('Кнопки «Отменить / Повторить» в шапке','uhd',1)+t('Магнитная привязка к соседним этапам (Alt — временно выкл.)','mag',1)+t('Перенос мышью между днями в «Месяце»','mdr',1)+t('Меню по правому клику на этапе','ctx',1)+t('Список «Ещё виды» в шапке','vx',1)+t('Плашка «Офлайн — изменения сохранятся»','ofl',1)+t('Свайп влево/вправо — соседний день (телефон)','swp',1)+t('Шторка «+»: кнопки «Заметка» и «Таймер»','xnx',1)+t('Ярлык «Записать» на главном экране: быстрая запись во входящие','cap',1)+t('Телефон: окна поднимаются над экранной клавиатурой','kbd',1)+t('Телефон: режим «одной рукой» — крупные кнопки и нижняя панель','oh',0)+t('Напоминания в Telegram (бот)','rtg',1)+t('Системные напоминания в браузере','rsi',1)+t('Куда слать напоминание этапа: Telegram и/или сайт','rch',1)+t('Кнопки отсрочки в уведомлении: 10 мин, час, до вечера','nsz',1)+t('Несколько напоминаний в одну минуту — одним уведомлением','ntg',1)+t('Сводка «Что / Когда / Куда» в настройках уведомлений','ncs',1)+t('Вид «Матрица» на доске','mx',1)+t('Карточки клиентов в «Проектах»','cln',1)+t('Ключевые результаты и светофор в целях','kr',1)+t('Прогноз цели: когда успеем при текущем темпе','fc',1)+t('Финансы целей: записи в ₽, график и прогноз','gfin',1)+t('Спринты недели и месяца в целях: цель, задачи, итог','gspr',1)+t('Главные 3 недели на вкладке «Сегодня»','wt',1)+t('Утренний ритуал и вопрос «что главное» на вкладке «Сегодня»','mr',1)+t('Вечерний итог дня на вкладке «Сегодня»','ev',1)+sw('Прощаемые пропуски: серия не рвётся','shield',[[0,'Нет'],[1,'1 в неделю'],[2,'2 в неделю']],1)+t('Привычки цепочкой: утро, день, вечер','stk',1)+t('Цели внутри проекта (блок в карточке и выбор проекта в цели)','pgo',1)+t('Сводка папки: сколько внутри и часы','fsm',1)+t('Агентство: часы по клиентам за неделю','agy',1)+t('Кнопка «Канбан проекта» в карточке','pkb',1)+t('Отчёт клиенту: сравнение с прошлым периодом (▲▼)','rcmp',1)+t('Отчёт клиенту: кнопка «Скачать таблицу CSV»','rcsv',1)+t('Отчёт клиенту: план по нормам и остаток до плана','rpl',1)+t('Отчёт клиенту: тепловая карта и золотые часы','rht',1)+t('Отчёт клиенту: блок «Что заметно» (автоинсайты)','rins',1)+t('Печать: лист A4 для отчёта клиенту, «Месяц» — альбомный','rprn',1)+t('Недельный обзор: мастер из 5 шагов (с пятницы)','wrv',1)+t('Настроение, энергия и сон: отметки и связь с делами','mdn',1)+t('Достижения и поздравления (выкл — тихий режим)','ach',1)+t('Карточка «Приложение»: установка и проверка обновления','pwa',1)+t('«Поделиться» из других приложений — во входящие','shr',1)+sw('Аффирмация на сайте','afq',[[0,'С кнопкой'],[1,'Тихая плашка']],0)+sw('Тихая плашка исчезает через','afqs',[[5,'5 с'],[10,'10 с'],[20,'20 с'],[30,'30 с']],10)+t('Аффирмация перед событием: за 5–30 минут до «созвона» и т. п.','afe',1)+t('Аффирмации: темы (деньги, здоровье, фокус) и «любимые» — чаще','afc',1)+sw('Шаблон отчёта клиенту по умолчанию','crt',[[0,'Короткий'],[1,'По услугам'],[2,'Полный']],1)+t('Зависимости задач («ждёт»)','dpb',1)+t('Виды задач «Список» и «Таймлайн»','tvs',1)+t('Напоминание «Вернуться к идеям» раз в неделю в боте','idr',1)+t('Умные списки и «Идеи» в задачах','sm',1)+t('Пакетные операции и перенос просроченного с выбором','bx',1)+t('Напоминание о клиенте в боте, когда пришёл срок контакта','cnb',1)+t('Итоговая карточка архивного проекта','arc',1)+t('Финансы проекта: ставка, выручка, бюджет (по умолчанию скрыто)','fin',0)+t('Нормы часов по услугам в проекте','svn',1)
  +sw('Дней в виде «N дней»','nd',[[2,'2'],[3,'3'],[4,'4'],[5,'5'],[7,'7'],[10,'10']],3)+sw('Дней в «Повестке»','ag',[[7,'7'],[14,'14'],[30,'30']],14)};
mkBar();bar();
})();
