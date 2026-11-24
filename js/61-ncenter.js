/* v2.50 (K01в): тихие часы в сводке и кнопка «Тихие часы и в браузере» (S.set.qbr=0 — выкл). Сами часы — в блоке «Тихие часы» ниже.
   v2.48 (K01а): центр уведомлений — сводка «Что / Когда / Куда» в «Настройках». S.set.ncs (0 — скрыть).
   v2.49 (K01б): правила по темам и проектам. S.set.nmc — выключенные темы (имена S.cats), S.set.nmp — выключенные проекты (id). Пусто — всё включено.
   Значения по умолчанию совпадают с js/52-notify.js и js/53-snooze.js. */
(()=>{
const on=set=>!(set&&set.ncs===0);
const lab=m=>m==60?'1 час':m+' мин';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Чистая функция: set → [{k,t,v:[строки]}]. Только показ */
function rows(set){
  set=set||{};
  const dr=set.drem!=null?set.drem:15,tg=set.rtg!==0,web=set.rsi!==false;
  const what=['Этапы и события'+(set.afe!==0?', аффирмация перед ними':'')];
  what.push('привычки и дела на весь день — без напоминаний');
  const when=[dr?'За '+lab(dr)+' до этапа':'По умолчанию без напоминаний'];
  if(set.ntg!==0)when.push('несколько этапов в одну минуту — одним уведомлением');
  if(set.nsz!==0)when.push('отложить: 10 мин, час или до вечера');
  when.push('у каждого этапа можно задать своё время');
  when.push(set.qoff?'тихие часы выключены':'тихие часы: '+(set.qf||'23:00')+'–'+(set.qt||'07:00')+(set.qbr===0?' (только Telegram)':' (браузер и Telegram)'));
  const ch=[];if(web)ch.push('браузер');if(tg)ch.push('Telegram');
  const where=[ch.length?ch.join(' и '):'никуда — напоминания выключены'];
  if(set.rch===0)where.push('выбор каналов для этапа скрыт, напоминания идут везде');
  else if(ch.length)where.push('для каждого этапа можно выбрать канал');
  return[{k:'what',t:'Что',v:what},{k:'when',t:'Когда',v:when},{k:'where',t:'Куда',v:where}];
}
/* Выключено ли: t='c' (тема, имя) или 'p' (проект, id). Строки сравниваются как строки */
const isMuted=(set,t,k)=>((set&&set[t=='c'?'nmc':'nmp'])||[]).includes(String(k));
const cntMuted=set=>((set&&set.nmc)||[]).length+((set&&set.nmp)||[]).length;
/* Переключает правило: key='c:<тема>' или 'p:<id>'. Меняет set. Возвращает true, если теперь включено */
function toggle(set,key){
  const i=key.indexOf(':'),t=key.slice(0,i)=='c'?'c':'p',v=key.slice(i+1),f=t=='c'?'nmc':'nmp';
  set[f]=set[f]||[];const a=set[f],j=a.indexOf(v);
  if(j<0){a.push(v);return false}
  a.splice(j,1);return true;
}
function chip(key,name,isOn){
  return `<button type="button" class="pl ${isOn?'on':''}" data-nrule="${esc(encodeURIComponent(key))}" aria-pressed="${isOn}" aria-label="${esc(name)}: напоминания ${isOn?'включены':'выключены'}">${esc(name)}</button>`;
}
const qchip=set=>{const o=!(set&&set.qbr===0);return `<button type="button" class="pl ${o?'on':''}" data-nq="1" aria-pressed="${o}" aria-label="Тихие часы и в браузере: ${o?'включено':'выключено'}">Тихие часы и в браузере</button>`};
/* Блок правил по темам и проектам. Пустые списки — честная подсказка */
function chips(set,cats,projs){
  const C=Object.keys(cats||{}),P=(projs||[]).filter(p=>!p.arch);
  if(!C.length&&!P.length)return '<small style="color:var(--mut)">Темы и проекты появятся, когда вы их создадите.</small>';
  let h=`<small style="color:var(--mut)">Выключено: <span data-nc-cnt>${cntMuted(set)}</span>. Нажмите, чтобы выключить или включить напоминания.</small>`;
  if(C.length)h+=`<div class="ncg" style="margin-top:6px"><small>Темы</small><div class="pills">${C.map(k=>chip('c:'+k,k,!isMuted(set,'c',k))).join('')}</div></div>`;
  if(P.length)h+=`<div class="ncg" style="margin-top:6px"><small>Проекты</small><div class="pills">${P.map(p=>chip('p:'+p.id,p.t||'Без названия',!isMuted(set,'p',p.id))).join('')}</div></div>`;
  return h;
}
/* Разметка сводки. Пользовательский текст экранируется; обработчики — делегированные (data-nrule) */
function html(set,cats,projs){
  if(!on(set))return'';
  const body=rows(set).map(r=>`<div class="srow" style="display:block"><b>${r.t}</b><ul style="margin:4px 0 0;padding-left:18px;color:var(--mut)">${r.v.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
  return `<div class="card" id="ncen" aria-label="Сводка уведомлений"><h3>Уведомления: что, когда, куда</h3>${body}<div class="srow" style="display:block"><b>Темы и проекты</b><div style="margin-top:4px">${chips(set,cats,projs)}</div></div><div class="srow" style="display:block"><b>Тихие часы</b><div class="pills" style="margin-top:4px">${qchip(set)}</div><small style="color:var(--mut)">Время задаётся в блоке «Тихие часы» ниже.</small></div><div class="srow" style="display:block"><small style="color:var(--mut)">Сводка показывает текущие настройки. Остальное меняется в блоках ниже.</small></div></div>`;
}
if(typeof document!='undefined')document.addEventListener('click',e=>{
  const q=e.target.closest&&e.target.closest('[data-nq]');
  if(q&&typeof S!='undefined'){S.set=S.set||{};if(S.set.qbr===0)delete S.set.qbr;else S.set.qbr=0;const o=S.set.qbr!==0;q.classList.toggle('on',o);q.setAttribute('aria-pressed',String(o));q.setAttribute('aria-label','Тихие часы и в браузере: '+(o?'включено':'выключено'));if(typeof save=='function')save();return}
  const b=e.target.closest&&e.target.closest('[data-nrule]');if(!b||typeof S=='undefined')return;
  S.set=S.set||{};
  const now=toggle(S.set,decodeURIComponent(b.dataset.nrule));
  b.classList.toggle('on',now);b.setAttribute('aria-pressed',String(now));
  const c=document.querySelector('[data-nc-cnt]');if(c)c.textContent=cntMuted(S.set);
  if(typeof save=='function')save();
});
if(typeof window!='undefined')window.NC={on,rows,html,toggle,isMuted,cntMuted};
})();
