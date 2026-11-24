/* v2.41 (L08): плашка «Офлайн — изменения сохранятся» и «Снова онлайн». Настройка S.set.ofl (0 — не показывать). */
(()=>{
const on=()=>!(S.set&&S.set.ofl===0);
/* Чистая функция: текст плашки по состоянию сети; null — плашка не нужна */
const msg=(online,wasOff)=>on()?(online?(wasOff?'Снова онлайн — всё синхронизируется':null):'Офлайн — изменения сохранятся на устройстве'):null;
let off=false,tm=0;
function show(t,ok){let b=document.getElementById('ofl');if(!t){if(b)b.remove();return}
 if(!b){b=document.createElement('div');b.id='ofl';b.setAttribute('role','status');b.setAttribute('aria-live','polite');document.body.appendChild(b)}
 b.className=ok?'ofl ok':'ofl';b.textContent=t}
function upd(){const o=navigator.onLine!==false;clearTimeout(tm);
 if(!o){off=true;show(msg(false,0),0)}
 else{const t=msg(true,off);off=false;show(t,1);if(t)tm=setTimeout(()=>show(null),3500)}}
if(typeof window!='undefined'&&window.addEventListener){window.addEventListener('offline',upd);window.addEventListener('online',upd);if(typeof navigator!='undefined'&&navigator.onLine===false)setTimeout(upd,0)}
if(typeof window!='undefined')window.OFL={on,msg};
})();
