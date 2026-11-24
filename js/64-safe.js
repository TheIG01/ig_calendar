/* v3.5 «Надёжность»: C10 приватный режим (S.set.prv), B15/O19 импорт с предпросмотром (объединить / только новые / заменить),
   C05/C01 защита и устройства (сервер: /me, /devs, /revoke), N40/U20 «Что нового» после обновления (S.set.nws),
   M10 доступность: подписи значков, role=dialog и ловушка фокуса (S.set.a11). */
(()=>{
const K={ev:'Этапы',goals:'Цели',proj:'Проекты',tpl:'Шаблоны'},$=s=>document.getElementById(s);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/* Чистая функция: что изменится при импорте. mode: merge | new | replace. Возвращает {out,R}: out — новые списки, R — счётчики */
function plan(cur,inc,mode){const out={},R={};Object.keys(K).forEach(k=>{
 const c=Array.isArray(cur&&cur[k])?cur[k]:[],n=(Array.isArray(inc&&inc[k])?inc[k]:[]).filter(x=>x&&x.id!=null),m=new Map(c.map(x=>[x&&x.id,x]));
 let add=0,upd=0,del=0;const res=mode=='replace'?[]:c.slice();
 n.forEach(x=>{const o=m.get(x.id);if(o===undefined){add++;res.push(x)}else if(!same(o,x)){upd++;if(mode=='merge')res[res.findIndex(y=>y&&y.id==x.id)]=x;else if(mode=='replace')res.push(x)}else if(mode=='replace')res.push(x)});
 if(mode=='replace')del=c.filter(x=>!n.some(y=>y.id==(x&&x.id))).length;
 if(mode=='new')upd=0;out[k]=res;R[k]={add,upd,del}});return{out,R}}
const line=R=>Object.keys(K).map(k=>{const r=R[k],p=[];if(r.add)p.push('добавится '+r.add);if(r.upd)p.push('обновится '+r.upd);if(r.del)p.push('удалится '+r.del);return p.length?K[k]+': '+p.join(', '):''}).filter(Boolean).join(' · ')||'Ничего не изменится.';
/* Проверка файла: вернёт текст ошибки или '' */
function check(o,v){if(!o||typeof o!='object'||Array.isArray(o)||!Array.isArray(o.ev))return'Это не копия IG calendar: нет списка этапов.';if(v&&o.v>v)return'Файл сделан в более новой версии. Обновите сайт и повторите.';return''}
function devLine(d){return(d.n||'Устройство')+' · '+new Date(d.t).toLocaleDateString('ru-RU')}
/* C10. Приватный режим */
function prv(on){document.body.classList.toggle('prv',!!on)}
function setPrv(on){S.set.prv=on?1:0;save();prv(on);if(window.toast)toast(on?'Названия скрыты. Alt+P — показать':'Названия снова видны')}
/* Что нового */
function newsBody(n){const L=String(n[1]).split(/(?<=[.!?])\s+/).filter(Boolean).slice(0,4);return'<ul class="xn">'+L.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><div class="bar"><button type="button" class="pri" data-sf="ok" style="min-height:44px">Понятно</button><button type="button" data-sf="all" style="min-height:44px">Все новости</button></div>'}
function news(){if(typeof localStorage=='undefined'||(S.set&&S.set.nws===0))return;const s=localStorage.igws;localStorage.igws=VERSION;if(!s||s==VERSION)return;const n=(window.NEWS||[])[0];if(n)setTimeout(()=>XT.show(['star','Что нового в '+n[0]],newsBody(n)),1500)}
/* Карточка в «О сервисе» */
function card(){const s=S.set||{},cb=(k,on,t)=>`<label class="xl" style="min-height:44px"><input type="checkbox" data-sf="${k}" ${on?'checked':''}> ${t}</label>`;
 return`<div class="card" id="safec"><h3>Защита и копии</h3>${cb('prv',s.prv,'Приватный режим: скрыть названия (Alt+P)')}${cb('nws',s.nws!==0,'Показывать «Что нового» после обновления')}${cb('a11',s.a11!==0,'Подписи и фокус для клавиатуры и экранных дикторов')}
 <div class="bar"><button type="button" data-sf="sec" style="min-height:44px">Защита и устройства</button><button type="button" data-sf="exp" style="min-height:44px">Скачать всё одним файлом</button></div><div id="sfsec" class="xn" aria-live="polite"></div>
 <div class="bar"><label class="xl">Импорт из файла <input type="file" accept=".json" data-sf="file"></label>${localStorage.igpre?'<button type="button" data-sf="undo" style="min-height:44px">Вернуть как до импорта</button>':''}</div><div id="sfimp" aria-live="polite"></div></div>`}
async function secLoad(){const o=$('sfsec');if(!o)return;o.textContent='Проверяю…';
 try{const me=await api('GET',null,'/me'),d=await api('GET',null,'/devs');if(!me.sec||!d||!d.list)throw 0;const sc=me.sec,R=[sc.wh?'✅ Секрет вебхука задан':'⚠️ Секрет вебхука не задан (docs/SECURITY.md)',sc.org?'✅ Сервер отвечает только вашему сайту':'ℹ️ Адрес сайта не ограничен (необязательно)',sc.wh&&sc.leg?'ℹ️ Старый адрес бота ещё открыт (LEGACY_TG=off закроет)':''].filter(Boolean);
  o.innerHTML=R.map(x=>'<div>'+esc(x)+'</div>').join('')+'<div style="margin-top:8px"><b>Устройства</b></div>'+(d.list.length?d.list.map(x=>`<div class="bar"><span>${esc(devLine(x))}${x.cur?' · это устройство':''}</span>${x.cur?'':`<button type="button" data-sf="rv" data-h="${esc(x.h)}" aria-label="Отозвать ${esc(x.n)}" style="min-height:44px">Отозвать</button>`}</div>`).join(''):'<div>Список появится после следующего входа.</div>')}
 catch(e){o.textContent=e===401?'Нужно войти заново.':e===0?'Сервер старой версии: обновите worker.js (Cloudflare → Deploy).':'Нет связи с сервером. Работает офлайн.'}}
function preview(){const o=$('sfimp'),inc=window.SAFE.pend;if(!o||!inc)return;const m=(o.querySelector('input[name=sfm]:checked')||{}).value||'merge';o.querySelector('#sfpv').textContent=line(plan(S,inc,m).R)}
function show(inc){const o=$('sfimp'),e=check(inc,S.v);if(e){o.textContent=e;window.SAFE.pend=null;return}window.SAFE.pend=inc;
 o.innerHTML=[['merge','Объединить: добавить новое и обновить совпавшее'],['new','Только новые: ничего не менять'],['replace','Заменить этапы, цели, проекты и шаблоны']].map((x,i)=>`<label class="xl" style="min-height:44px"><input type="radio" name="sfm" value="${x[0]}" ${i?'':'checked'}> ${x[1]}</label>`).join('')+'<div id="sfpv" class="xn"></div><div class="bar"><button type="button" class="pri" data-sf="go" style="min-height:44px">Применить</button></div><small>Настройки и вход не меняются. Перед импортом копия сохранится: её можно вернуть.</small>';preview()}
function apply(){const inc=window.SAFE.pend,m=(document.querySelector('#sfimp input[name=sfm]:checked')||{}).value||'merge';if(!inc)return;
 try{localStorage.igpre=JSON.stringify(S)}catch(e){if(window.toast)toast('Не хватило места для копии. Сначала скачайте файл.');return}
 const p=plan(S,inc,m);Object.keys(K).forEach(k=>{S[k]=p.out[k]});save();render();window.SAFE.pend=null;$('sfimp').textContent='Готово: '+line(p.R);if(window.toast)toast('Импорт выполнен')}
function undo(){try{const o=JSON.parse(localStorage.igpre);S=o;save();render();localStorage.removeItem('igpre');if(window.toast)toast('Данные возвращены')}catch(e){if(window.toast)toast('Копии нет')}}
/* M10. Доступность */
const LBL={'+':'Добавить','×':'Закрыть','✕':'Закрыть','x':'Закрыть','‹':'Назад','›':'Вперёд','<':'Назад','>':'Вперёд','☰':'Меню','⋯':'Ещё','…':'Ещё'};
function label(b){const t=(b.textContent||'').trim();if(t.length>1&&!LBL[t])return'';return LBL[t]||b.getAttribute('title')||b.dataset.act||''}
function fix(root){if(S.set&&S.set.a11===0)return;root.querySelectorAll('button:not([aria-label]),[role=button]:not([aria-label])').forEach(b=>{const l=label(b);if(l)b.setAttribute('aria-label',l)});
 const xb=$('xb'),r=xb&&xb.parentElement;if(r&&!r.getAttribute('role')){r.setAttribute('role','dialog');r.setAttribute('aria-modal','true');r.setAttribute('aria-labelledby','xt')}}
let ft=0,op=null;
function watch(){new MutationObserver(()=>{if(ft)return;ft=setTimeout(()=>{ft=0;fix(document.body);const xb=$('xb'),r=xb&&xb.parentElement;
 if(r&&!r.hidden&&!r.contains(document.activeElement)){op=document.activeElement;const f=r.querySelector('button,input,select,textarea,[tabindex]');if(f&&S.set.a11!==0)f.focus({preventScroll:true})}else if(r&&r.hidden&&op){try{op.focus({preventScroll:true})}catch(e){}op=null}},250)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']})}
function trap(e){if(e.key!='Tab'||(S.set&&S.set.a11===0))return;const xb=$('xb'),r=xb&&xb.parentElement;if(!r||r.hidden||!r.contains(e.target))return;
 const f=[...r.querySelectorAll('button:not([disabled]),input:not([disabled]),select,textarea,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);if(!f.length)return;
 const a=f[0],z=f[f.length-1];if(e.shiftKey&&e.target===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&e.target===z){e.preventDefault();a.focus()}}
if(typeof document!='undefined'){
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sf]');if(!b||b.tagName=='INPUT')return;const a=b.dataset.sf;
  if(a=='sec')secLoad();else if(a=='exp')exp();else if(a=='go')apply();else if(a=='undo')undo();else if(a=='ok')XT.close();else if(a=='all')XT.show(['star','Все новости'],'<ul class="xn">'+(window.NEWS||[]).map(x=>'<li><b>'+esc(x[0])+'</b> '+esc(x[1])+'</li>').join('')+'</ul>');
  else if(a=='rv')api('POST',{h:b.dataset.h},'/revoke').then(secLoad).catch(()=>{if(window.toast)toast('Не получилось. Проверьте связь')})});
 document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.sf&&t.name!='sfm')return;if(t.name=='sfm'){preview();return}const a=t.dataset.sf;
  if(a=='prv')setPrv(t.checked);else if(a=='nws'||a=='a11'){S.set[a]=t.checked?1:0;save();fix(document.body)}
  else if(a=='file'&&t.files[0]){const r=new FileReader();r.onload=()=>{let o=null;try{o=JSON.parse(r.result)}catch(x){}show(o)};r.readAsText(t.files[0]);t.value=''}});
 document.addEventListener('keydown',e=>{if(e.altKey&&!e.ctrlKey&&!e.metaKey&&(e.code=='KeyP'||e.key=='p'||e.key=='з')){e.preventDefault();setPrv(!(S.set&&S.set.prv))}trap(e)});
 const v0=window.vAbout;if(v0)window.vAbout=function(){return v0.apply(this,arguments)+card()};
 prv(S.set&&S.set.prv);news();fix(document.body);watch()}
window.SAFE={plan,line,check,devLine,label,newsBody,pend:null};
})();
