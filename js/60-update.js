/* v2.46 (O20): плашка «Доступна новая версия» вместо тоста. Кнопки «Обновить» и «Позже», без inline onclick.
   Появляется, когда новый service worker уже сменил старый (controllerchange). Настройка S.set.upd (0 — не показывать, карточка «Приложение»). */
(()=>{
const on=()=>!(S.set&&S.set.upd===0);
const nextVal=set=>(set&&set.upd===0)?1:0;
const lbl=()=>'Уведомлять о новой версии: '+(on()?'вкл':'выкл');
const TXT='Доступна новая версия сайта. Данные не потеряются.';
function html(){return `<div class="upd" id="updbar" role="status"><span>${TXT}</span><span class="upd-b"><button type="button" class="pri" data-upd="go" style="min-height:44px">Обновить</button><button type="button" data-upd="later" style="min-height:44px">Позже</button></span></div>`}
function show(){if(!on()||typeof document=='undefined'||document.getElementById('updbar'))return 0;const t=document.createElement('div');t.innerHTML=html();document.body.appendChild(t.firstElementChild);return 1}
function hide(){const d=typeof document!='undefined'&&document.getElementById('updbar');if(d)d.remove()}
function go(){hide();if(typeof location!='undefined')location.reload()}
function toggle(b){S.set=S.set||{};S.set.upd=nextVal(S.set);save();if(b)b.textContent=lbl();return S.set.upd}
const later=()=>!!(S.set&&S.set.updm===1);
const mlbl=()=>'Обновлять: '+(later()?'при следующем запуске':'сразу');
function toggleMode(b){S.set=S.set||{};S.set.updm=later()?0:1;save();if(b)b.textContent=mlbl();return S.set.updm}
function skipIfNow(reg){if(!reg||!reg.waiting||later())return 0;reg.waiting.postMessage('skip');return 1}
function watch(reg){if(!reg)return;skipIfNow(reg);reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state=='installed')skipIfNow(reg)})})}
if(typeof navigator!='undefined'&&navigator.serviceWorker)navigator.serviceWorker.ready.then(watch).catch(()=>0);
window.UPD={on,nextVal,lbl,html,show,hide,go,toggle,TXT,later,mlbl,toggleMode,skipIfNow,watch};
if(typeof document!='undefined')document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-upd]');if(!b)return;b.dataset.upd=='go'?go():hide()});
})();
