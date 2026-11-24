/* v2.33 (L06): установка и обновление приложения. Карточка «Приложение» в «О сервисе»: статус установки,
   кнопка «Установить» (Chrome/Android/ПК) или подсказка для iPhone, кнопка «Проверить обновление». Настройка S.set.pwa (0 — скрыть). */
(()=>{
const on=()=>!(S.set&&S.set.pwa===0);
let ev=null;
if(typeof addEventListener=='function')addEventListener('beforeinstallprompt',e=>{e.preventDefault();ev=e});
if(typeof addEventListener=='function')addEventListener('appinstalled',()=>{ev=null});
/* Режим по среде: installed — уже установлено, prompt — можно установить кнопкой, ios — только через «Поделиться», none — браузер не умеет */
function mode(env){env=env||{};if(env.standalone)return'installed';if(env.prompt)return'prompt';if(env.ios)return'ios';return'none'}
function env(){const w=typeof window!='undefined'?window:{},ua=typeof navigator!='undefined'?navigator.userAgent||'':'';
  return{standalone:!!(w.matchMedia&&w.matchMedia('(display-mode: standalone)').matches)||(typeof navigator!='undefined'&&navigator.standalone===true),prompt:!!ev,ios:/iphone|ipad|ipod/i.test(ua)}}
const TXT={installed:'Приложение установлено — открыто как отдельное окно.',prompt:'Можно установить как приложение: свой значок, окно без вкладок, работа без сети.',ios:'На iPhone: кнопка «Поделиться» → «На экран Домой».',none:'Этот браузер не предлагает установку. Сайт всё равно работает без сети.'};
function html(m){if(!on())return'';m=m||mode(env());
  return `<div class="card"><h3>Приложение</h3><div class="bar">${TXT[m]}</div>${m=='prompt'?'<button type="button" class="pri" data-pw="install" style="min-height:44px">Установить</button> ':''}<button type="button" data-pw="upd" style="min-height:44px">${window.UPD?UPD.lbl():'Уведомлять о новой версии'}</button> ${window.UPD?'<button type="button" data-pw="updm" style="min-height:44px">'+UPD.mlbl()+'</button>':''} <button type="button" data-pw="check" style="min-height:44px">Проверить обновление</button></div>`}
function check(){toast('Проверяю обновления…');const p=navigator.serviceWorker&&navigator.serviceWorker.getRegistration?navigator.serviceWorker.getRegistration():Promise.resolve(null);
  p.then(r=>r&&r.update()).catch(()=>0).then(()=>setTimeout(()=>toast('Версия '+VERSION+'. Если вышла новая — появится плашка «Доступна новая версия»'),2500))}
function install(){if(!ev)return;const e=ev;ev=null;e.prompt();if(e.userChoice)e.userChoice.then(c=>toast(c&&c.outcome=='accepted'?'Устанавливаю…':'Хорошо, можно позже'))}
if(typeof document!='undefined')document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pw]');if(!b)return;b.dataset.pw=='install'?install():b.dataset.pw=='upd'?(window.UPD&&UPD.toggle(b)):b.dataset.pw=='updm'?(window.UPD&&UPD.toggleMode(b)):check()});
window.PW={on,mode,html,TXT};
})();
