/* v3.0 «Пульт»: L03 настраиваемая нижняя панель (S.set.bnb — список кнопок, пусто = как раньше),
   L04 «Подробнее» в шторке «+», O10 напоминание о привычках со «слабым» временем (S.set.hwk: 0 — выкл, S.set.hwt — время, по умолчанию 20:00). */
(()=>{
const CAT={today:'Сегодня',list:'Список',view:'Вид',timer:'Таймер',more:'Ещё',hab:'Привычки',goals:'Цели',inbox:'Входящие'};
const DEF=['today','list','view','timer','more'];
/* Чистая функция: сохранённый список → 4 или 5 допустимых кнопок без повторов */
function pick(a){const r=[];(Array.isArray(a)?a:[]).forEach(k=>{if(CAT[k]&&!r.includes(k)&&r.length<5)r.push(k)});return r.length>=3?r:DEF.slice()}
function html(list){const m=Math.ceil(list.length/2),L=list.map(k=>`<button type="button" data-bn="${k}" aria-label="${CAT[k]}">${CAT[k]}</button>`);
 L.splice(m,0,'<button type="button" class="bnp" data-bn="plus" aria-label="Добавить">+</button>');return L.join('')}
function draw(){const n=document.getElementById('bn');if(n)n.innerHTML=html(pick(S.set&&S.set.bnb))}
function act(k){
 if(k=='today'){cur=today();view='day';vr()}else if(k=='list')XA.open();else if(k=='view'){view=view=='month'?'week':'month';vr()}
 else if(k=='plus'){innerWidth<=800?XN.open():qnew()}else if(k=='timer'){S.timer?tstop():tstart()}
 else if(k=='more')document.body.classList.toggle('side');else if(k=='hab')XP.open('habits');else if(k=='goals')XP.open('goals');
 else if(k=='inbox')XP.open('board')}
/* O10. Чистая функция: привычки дня [{title,s}] (s — серия), now/время напоминания в минутах, done — уже показано. Серия ≥3 и не отмечена сегодня */
function weak(H,now,at,shown){if(shown||now<at||now>=at+10)return[];return H.filter(h=>h.s>=3&&!h.d)}
const mm=s=>{const a=String(s||'20:00').split(':');return(+a[0]||0)*60+(+a[1]||0)};
function tick(){if(!window.Notification||Notification.permission!='granted'||!S.set||S.set.hwk===0||S.set.rsi===false)return;
 const d=today(),k='hw'+d;if(window.AFN&&AFN.quiet(S.set,nowMin()))return;
 const H=weak(S.ev.filter(e=>e.kind=='habit'&&evs(d).some(x=>x.id==e.id)).map(e=>({title:e.title,s:strk(e),d:!!(e.done&&e.done[d])})),nowMin(),mm(S.set.hwt),sessionStorage[k]);
 if(!H.length)return;sessionStorage[k]=1;const t=H.length==1?'Не забудьте: '+H[0].title:'Привычек ждёт отметка: '+H.length;
 AFN.show({title:t,body:'Ваша серия — '+H.map(h=>h.title+' '+h.s+' дн.').slice(0,3).join(', '),tag:'hw'+d})}
function card(){const l=pick(S.set&&S.set.bnb);
 return `<div class="card" id="pultc"><h3>Нижняя панель и привычки</h3><div class="bar">Кнопки панели на телефоне (3–5, «+» всегда в центре):</div><div class="pchips">${Object.keys(CAT).map(k=>`<label style="display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-right:10px"><input type="checkbox" data-pb="${k}"${l.includes(k)?' checked':''}> ${CAT[k]}</label>`).join('')}</div><label style="display:flex;align-items:center;gap:8px;min-height:44px"><input type="checkbox" data-ph="1"${S.set&&S.set.hwk===0?'':' checked'}> Напоминать о привычке со «слабым» временем</label><label style="display:flex;align-items:center;gap:8px;min-height:44px">Во сколько <input type="time" data-pt="1" value="${(S.set&&S.set.hwt)||'20:00'}" aria-label="Время напоминания о привычках"></label></div>`}
if(typeof document!='undefined'){
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#bn [data-bn]');if(b){act(b.dataset.bn);return}
  const x=e.target.closest&&e.target.closest('[data-xd]');if(x){const s=XN.s||{},t=document.getElementById('xni');NE.hidden=true;mk(s.d||cur,s.a||540,(s.a||540)+(s.len||60));return}});
 document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!(t.dataset.pb||t.dataset.ph||t.dataset.pt))return;
  if(t.dataset.pb){const l=[...document.querySelectorAll('[data-pb]')].filter(c=>c.checked).map(c=>c.dataset.pb);if(l.length<3||l.length>5){t.checked=!t.checked;if(window.toast)toast('Выберите от 3 до 5 кнопок');return}S.set.bnb=l}
  else if(t.dataset.ph)S.set.hwk=t.checked?1:0;else S.set.hwt=t.value||'20:00';save();draw()});
 const d0=XN&&XN.draw;if(d0)XN.draw=function(){d0.apply(this,arguments);const r=NE.lastChild&&NE.lastChild.querySelector('.xnr:last-child');if(r&&!r.querySelector('[data-xd]'))r.insertAdjacentHTML('afterbegin','<button type="button" class="xnb" data-xd="1" aria-label="Открыть полную форму">Подробнее</button>')};
 const v0=window.vAbout;if(v0)window.vAbout=function(){return v0.apply(this,arguments)+card()};
 draw();setInterval(tick,3e4)}
window.PULT={CAT,DEF,pick,html,weak};
})();
