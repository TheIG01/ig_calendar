/* v4.0 «Финал»: O18 статус синхронизации, N39 проверка сервиса, B14 сверка данных (S.set.int), B13 настройки копий (S.set.bkd/bke),
   C09 экран блокировки (localStorage.iglk, только на устройстве), U19 звук и вибрация (S.set.snd/vol/vib), N10/N36 ссылка «только чтение» (ICS, воркер). */
(()=>{
const $=s=>document.getElementById(s),KN={ev:'этапы',goals:'цели',proj:'проекты',tasks:'задачи',habits:'привычки',tpl:'шаблоны'},IK=Object.keys(KN);
/* ---- чистые функции (тесты: tests/final.js) ---- */
function fnv(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
const ids=(S,k)=>(Array.isArray(S&&S[k])?S[k]:[]).map(x=>x&&x.id).filter(x=>x!=null).map(String).sort();
const idsHash=S=>fnv(IK.map(k=>k+':'+ids(S,k).join(',')).join('|'));
function integ(a,b){const d={};IK.forEach(k=>{const x=new Set(ids(a,k)),y=new Set(ids(b,k)),l=[...x].filter(i=>!y.has(i)).length,r=[...y].filter(i=>!x.has(i)).length;if(l||r)d[k]={l,r}});return{same:!Object.keys(d).length,diff:d}}
function stLine(i){if(!i.tok)return{tone:'warn',t:'Вход не выполнен: данные хранятся только на этом устройстве.'};
 if(i.online===false)return{tone:'warn',t:'Нет сети. Всё сохраняется на устройстве и отправится, когда связь появится.'};
 const p=i.pend?' Есть изменения, ждущие отправки.':'';
 if(i.sst=='auth')return{tone:'bad',t:'Нужно войти заново.'};
 if(i.sst=='err')return{tone:'bad',t:'Нет связи с сервером'+(i.last?'. Последняя синхронизация в '+i.last:'')+'.'+p};
 if(i.sst=='ok')return{tone:i.pend?'warn':'ok',t:'Синхронизировано в '+(i.last||'—')+'.'+(i.pend?p:' Всё отправлено.')};
 return{tone:'warn',t:'В этом запуске синхронизации ещё не было.'}}
function health(i){const R=[],a=(ok,t,h)=>R.push({ok:!!ok,t,h:ok?'':h});
 a(i.tok,'Вход в аккаунт','Войдите в «Аккаунт и синхронизация», чтобы данные были и на сервере.');
 a(i.sync=='ok','Синхронизация работает','Нажмите «Синхронизировать сейчас». Если не помогает — проверьте связь.');
 if(i.ping===null)a(0,'Сервер отвечает','Нет ответа. Проверьте связь и адрес сервера.');
 else if(i.ping!==undefined)a(i.ping===i.ver,'Сервер (worker.js) той же версии','На сервере '+(i.ping||'старая версия')+', на сайте '+i.ver+': вставьте worker.js в Cloudflare и нажмите Deploy.');
 if(i.me){a(i.me.tg,'Telegram-бот привязан','Привяжите бота в «Аккаунт и синхронизация».');a(i.me.wh,'Секрет вебхука задан','Необязательно, но безопаснее: docs/SECURITY.md.')}
 a(i.notif=='granted','Уведомления в браузере разрешены','Разрешите их в настройках браузера. Необязательно: напоминания идут и в Telegram.');
 const age=i.bak?(Date.parse(i.today)-Date.parse(i.bak))/864e5:99;a(age<=3,'Автокопия свежая (не старше 3 дней)','Нажмите «Скопировать сейчас» в блоке «Копии на устройстве».');
 a(i.sw,'Работа без сети включена','Обновите страницу один раз; на iPhone добавьте сайт на главный экран.');return R}
const lockOk=(c,now,hid)=>!c||!c.h?false:hid==null?true:now-hid>=(+c.m||0)*6e4,okPin=p=>/^\d{4,8}$/.test(p||'');
async function hashPin(pin,salt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const linkLine=l=>(l.tag||'Все этапы')+' · '+(l.full?'с названиями':'только «Занято»')+' · '+(l.exp?'до '+new Date(l.exp).toLocaleDateString('ru-RU'):'без срока');
window.FIN={fnv,idsHash,integ,stLine,health,lockOk,okPin,hashPin,linkLine};
if(typeof document=='undefined')return;
/* ---- экран ---- */
const say=(id,h)=>{const o=$(id);if(o)o.innerHTML=h},tt=m=>window.toast&&toast(m,1),url=()=>SY().url.replace(/\/$/,''),lkCfg=()=>{try{const o=JSON.parse(localStorage.iglk||'null');return o&&o.h?o:null}catch(e){return null}};
const cb=(k,on,t)=>`<label class="xl"><input type="checkbox" data-fn="${k}" ${on?'checked':''}> ${t}</label>`,bt=(a,t,x)=>`<button type="button" data-fn="${a}" ${x||''}>${t}</button>`;
const sel=(id,o,cur)=>`<select id="${id}">${o.map(x=>`<option value="${esc(x[0])}" ${String(x[0])==String(cur)?'selected':''}>${esc(x[1])}</option>`).join('')}</select>`;
function stInfo(){let pend=false;try{pend=!!SY().tok&&sySj(S)!=syJ}catch(e){}return{tok:SY().tok,sst,last:lastSync,pend,online:navigator.onLine}}
function stHtml(){const r=stLine(stInfo());return'<span class="fn-'+r.tone+'">'+(r.tone=='ok'?'✅ ':r.tone=='bad'?'⛔ ':'⚠️ ')+esc(r.t)+'</span>'}
function inner(){const s=S.set||{},lk=lkCfg(),bd=localStorage.igbd||'';
 return`<div class="card"><h3>Состояние сервиса</h3><div id="fnst" class="xn" aria-live="polite">${stHtml()}</div><div class="bar">${bt('now','Синхронизировать сейчас')}${bt('hl','Проверить сервис')}${bt('ig','Сверить данные')}</div><div id="fnhl" class="xn" aria-live="polite"></div>${cb('int',s.int!==0,'Раз в сутки тихо сверять данные с сервером')}</div>
<div class="card"><h3>Копии на устройстве</h3><div class="xn">Последняя копия: ${bd?esc(bd):'ещё нет'}</div><div class="bar"><label class="xl">Хранить дней ${sel('fnbkd',[[3,'3'],[7,'7'],[14,'14'],[30,'30']],s.bkd||7)}</label><label class="xl">Делать раз в ${sel('fnbke',[[1,'день'],[2,'2 дня'],[7,'неделю']],s.bke||1)}</label></div><div class="bar">${bt('bk','Скопировать сейчас')}${bt('bl','Список копий и восстановление')}</div></div>
<div class="card"><h3>Экран блокировки</h3><div class="xn">${lk?'Включён. PIN хранится только на этом устройстве.':'Выключен.'} Это защита от случайных глаз, а не шифрование.</div><div class="bar">${bt('lkset',lk?'Сменить PIN':'Включить')}${lk?bt('lkoff','Выключить'):''}</div>${lk?`<label class="xl">Спрашивать ${sel('fnlkw',[[0,'сразу при возврате'],[1,'через 1 мин'],[5,'через 5 мин'],[30,'через 30 мин']],lk.m||0)}</label>`:''}</div>
<div class="card"><h3>Звук и вибрация</h3>${cb('snd',s.snd,'Сигнал напоминания в браузере')}<label class="xl">Громкость <input type="range" min="1" max="10" value="${s.vol||5}" data-fn="vol" aria-label="Громкость сигнала"></label>${cb('vib',s.vib!==0,'Вибрация на телефоне')}<div class="bar">${bt('tst','Проверить')}</div></div>
<div class="card"><h3>Календарь на чтение (ссылка)</h3><div class="xn">Для помощника или клиента: подписка в Google или Apple Календаре. Открывается по секретной ссылке, её можно отозвать. Для чужих лучше «Только „Занято“».</div><div class="bar"><label class="xl">Что показывать ${sel('fntag',[['','Все этапы']].concat(Object.keys(S.cats||{}).map(c=>[c,'Тема: '+c])),'')}</label><label class="xl">Названия ${sel('fnfull',[[0,'Только «Занято»'],[1,'С названиями']],0)}</label><label class="xl">Срок ${sel('fndays',[[7,'7 дней'],[30,'30 дней'],[90,'90 дней'],[0,'Без срока']],30)}</label></div><div class="bar">${bt('lkmk','Создать ссылку')}${bt('lkls','Мои ссылки')}</div><div id="fnls" aria-live="polite"></div></div>`}
const card=()=>`<div id="finw">${inner()}</div>`,again=()=>say('finw',inner());
/* N39 / B14 */
async function runHealth(){say('fnhl','Проверяю…');const i={tok:SY().tok,sync:sst,ver:VERSION,today:today(),bak:localStorage.igbd||'',notif:typeof Notification!='undefined'?Notification.permission:'none',sw:!!(navigator.serviceWorker&&navigator.serviceWorker.controller)};
 if(i.tok){try{i.ping=(await fetch(url()+'/ping').then(r=>r.json())).v||''}catch(e){i.ping=null}try{const m=await api('GET',null,'/me');i.me={tg:!!m.tg,wh:!!(m.sec&&m.sec.wh)}}catch(e){}}
 say('fnhl',health(i).map(x=>`<div>${x.ok?'✅':'⚠️'} ${esc(x.t)}${x.ok?'':'<br><small>'+esc(x.h)+'</small>'}</div>`).join(''))}
async function runInteg(q){if(!SY().tok){if(!q)say('fnhl','Сначала войдите в аккаунт.');return}
 try{let d=integ(S,await api('GET'));if(d.same){if(!q)say('fnhl','✅ Данные на сайте и на сервере совпадают.');return}
  await sync(true);d=integ(S,await api('GET'));if(d.same){if(q)tt('Данные сверены с сервером');else say('fnhl','✅ Были расхождения — исправлены.');return}
  if(!q)say('fnhl','⚠️ Остались различия: '+Object.keys(d.diff).map(k=>KN[k]+' (здесь лишних '+d.diff[k].l+', на сервере '+d.diff[k].r+')').join('; ')+'. Откройте сайт на другом устройстве и повторите через минуту.')}
 catch(e){if(!q)say('fnhl','Нет связи. Попробуйте позже.')}}
/* C09 */
let hid=null,fails=0,until=0;
function hideLock(){const d=$('fnlk');if(d)d.remove();document.body.classList.remove('fnbh')}
function showLock(){if($('fnlk'))return;const d=document.createElement('div');d.id='fnlk';d.className='fnlk';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-labelledby','fnlkt');
 d.innerHTML='<div class="fnlkb"><h2 id="fnlkt">Введите PIN</h2><input id="fnlkp" type="password" inputmode="numeric" autocomplete="off" maxlength="8" aria-label="PIN"><div id="fnlkm" class="xn" aria-live="polite"></div><button type="button" class="pri" data-fn="lkgo">Открыть</button><button type="button" data-fn="lkfg">Забыли PIN?</button></div>';
 document.body.appendChild(d);document.body.classList.add('fnbh');setTimeout(()=>{const p=$('fnlkp');if(p)p.focus()},50)}
async function tryUnlock(){const c=lkCfg(),m=$('fnlkm'),p=$('fnlkp');if(!c){hideLock();return}if(Date.now()<until){m.textContent='Подождите несколько секунд.';return}
 if(okPin(p.value)&&await hashPin(p.value,c.s)==c.h){fails=0;hideLock();return}
 p.value='';if(++fails>=5){until=Date.now()+3e4;fails=0;m.textContent='Слишком много попыток. Подождите 30 секунд.'}else m.textContent='Неверный PIN.'}
async function forgot(){const d=$('fnlk');if(!SY().tok){XT.show('Забыли PIN?','<p>Без входа в аккаунт данные хранятся только здесь. Сбросить PIN можно, очистив данные сайта в настройках браузера, но данные пропадут.</p>');return}
 if(d)d.hidden=true;const ok=await ui.confirm('Вы выйдете из аккаунта на этом устройстве. Данные на сервере сохранятся, после входа всё вернётся.','Выйти','Забыли PIN?');
 if(!ok){if(d)d.hidden=false;return}try{await sync(true)}catch(e){}localStorage.removeItem('iglk');hideLock();logout(0,1)}
async function lkSet(){const a=await ui.prompt('PIN для экрана блокировки','4–8 цифр','',{type:'password',num:1,ok:'Далее'});if(!a)return;if(!okPin(a)){tt('PIN — от 4 до 8 цифр');return}
 const b=await ui.prompt('PIN для экрана блокировки','Повторите PIN','',{type:'password',num:1,ok:'Включить'});if(!b)return;if(a!==b){tt('PIN не совпал');return}
 const s=[...crypto.getRandomValues(new Uint8Array(8))].map(x=>x.toString(16).padStart(2,'0')).join(''),o=lkCfg();localStorage.iglk=JSON.stringify({s,h:await hashPin(a,s),m:o?o.m:0});tt('Блокировка включена');again()}
/* N10 / N36 */
const copy=t=>{const f=()=>XT.show('Ссылка','<textarea class="xsta" rows="4" readonly>'+esc(t)+'</textarea>');try{navigator.clipboard.writeText(t).then(()=>tt('Ссылка скопирована'),f)}catch(e){f()}};
async function lnkLoad(){say('fnls','Загружаю…');try{const d=await api('GET',null,'/lnks');if(!d||!d.list)throw 0;say('fnls',d.list.length?d.list.map(l=>`<div class="bar"><span>${esc(linkLine(l))}</span>${bt('lkcp','Копировать','data-tk="'+esc(l.tk)+'"')}${bt('lkdl','Отозвать','data-tk="'+esc(l.tk)+'"')}</div>`).join(''):'Ссылок пока нет.')}
 catch(e){say('fnls',e===401?'Нужно войти заново.':'Нет связи или сервер старой версии: вставьте worker.js в Cloudflare и нажмите Deploy.')}}
async function lnkMk(){if(!SY().tok){say('fnls','Сначала войдите в аккаунт.');return}const v=i=>($(i)||{}).value;
 try{const d=await api('POST',{tag:v('fntag')||'',full:+v('fnfull')?1:0,days:+v('fndays')||0},'/lnk');if(!d||!d.tk)throw 0;copy(url()+d.path);lnkLoad()}
 catch(e){say('fnls',e===409?'Уже 5 ссылок. Отзовите ненужную.':'Не получилось. Проверьте связь и обновите worker.js.')}}
const A={now:async()=>{say('fnst','Синхронизирую…');try{await sync(true)}catch(e){}say('fnst',stHtml())},hl:runHealth,ig:()=>runInteg(0),
 bk:async()=>{tt(await window.XD.now()?'Копия сохранена':'Не получилось сохранить копию');again()},bl:()=>window.XD.bk(),lkset:lkSet,lkoff:()=>{localStorage.removeItem('iglk');hideLock();again()},
 tst:()=>{const o=S.set.snd;S.set.snd=1;try{beep()}catch(e){}S.set.snd=o;if(navigator.vibrate)navigator.vibrate(40)},lkmk:lnkMk,lkls:lnkLoad,lkgo:tryUnlock,lkfg:forgot,
 lkcp:b=>copy(url()+'/ics/'+b.dataset.tk+'.ics'),lkdl:async b=>{if(!await ui.confirm('Приложения, которые подписаны по этой ссылке, перестанут получать календарь.','Отозвать','Отозвать ссылку?'))return;try{await api('POST',{tk:b.dataset.tk},'/lnkdel')}catch(e){tt('Не получилось. Проверьте связь')}lnkLoad()}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button[data-fn]');if(b&&A[b.dataset.fn])A[b.dataset.fn](b)});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset&&t.dataset.fn;
 if(k=='int'||k=='snd'||k=='vib'){S.set[k]=t.checked?1:0;save()}else if(k=='vol'){S.set.vol=+t.value;save()}
 else if(t.id=='fnbkd'||t.id=='fnbke'){S.set[t.id=='fnbkd'?'bkd':'bke']=+t.value;save()}
 else if(t.id=='fnlkw'){const c=lkCfg();if(c){c.m=+t.value;localStorage.iglk=JSON.stringify(c)}}});
document.addEventListener('keydown',e=>{const d=$('fnlk');if(!d)return;if(e.key=='Enter'&&e.target.id=='fnlkp'){e.preventDefault();tryUnlock()}
 if(e.key=='Tab'){const f=[...d.querySelectorAll('input,button')];const a=f[0],z=f[f.length-1];if(e.shiftKey&&e.target===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&e.target===z){e.preventDefault();a.focus()}}});
document.addEventListener('visibilitychange',()=>{const c=lkCfg();if(document.hidden){hid=Date.now();if(c)document.body.classList.add('fnbh')}else if(c&&lockOk(c,Date.now(),hid))showLock();else if(!$('fnlk'))document.body.classList.remove('fnbh')});
/* U19: общий выключатель вибрации */
if(navigator.vibrate&&!navigator.vibrate.fn){const v=navigator.vibrate.bind(navigator),f=p=>S.set&&S.set.vib===0?false:v(p);f.fn=1;try{navigator.vibrate=f}catch(e){}}
const v0=window.vAbout;if(v0)window.vAbout=function(){return v0.apply(this,arguments)+card()};
if(lkCfg())showLock();
setTimeout(()=>{const t=today();if(S.set.int!==0&&SY().tok&&localStorage.igic!=t){localStorage.igic=t;runInteg(1)}},2e4);
})();
