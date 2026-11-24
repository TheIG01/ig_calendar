/* v2.43 (U01): в шторке «+» добавлены «Заметка» (во входящие) и «Таймер» (запуск с названием). Настройка S.set.xnx (0 — скрыть). */
(()=>{
const on=()=>!(S.set&&S.set.xnx===0);
/* Чистая функция: что делать по виду и тексту. note без текста — просьба вписать; timer без текста допустим */
const plan=(k,t)=>{t=(t||'').trim();if(k=='note')return t?{ok:1,act:'inbox',t}:{ok:0,hint:'Впишите текст заметки'};if(k=='timer')return{ok:1,act:'timer',t};return{ok:0}};
const btns=()=>[['note','Заметка'],['timer','Таймер']].map(([k,v])=>`<button data-xk="${k}" aria-label="${k=='note'?'Записать во входящие':'Запустить таймер'}">${v}</button>`).join('');
function run(k){const i=document.getElementById('xni'),p=plan(k,i&&i.value);
 if(!p.ok){if(p.hint&&typeof toast=='function')toast(p.hint);if(i)i.focus();return}
 if(p.act=='inbox'){(S.inbox=S.inbox||[]).push({id:uid(),t:p.t});save();NE.hidden=true;render();toast('Записано во входящие',1)}
 else{if(!S.timer)tstart0();if(S.timer&&p.t)S.timer.title=p.t;save();NE.hidden=true;render();toast('Таймер запущен',1)}}
if(typeof XN!='undefined'&&XN&&XN.draw&&typeof document!='undefined'){
 const d0=XN.draw;XN.draw=function(){d0.apply(this,arguments);if(!on())return;const k=document.querySelector('.xnk');if(k)k.insertAdjacentHTML('beforeend',btns())};
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-xk]');if(b)run(b.dataset.xk)})}
if(typeof window!='undefined')window.XNP={on,plan};
})();
