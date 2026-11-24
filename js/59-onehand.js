/* v2.45 (U16): режим «одной рукой» на телефоне: крупные зоны нажатия (≥48 px), крупная нижняя панель и «+».
   Настройка S.set.oh (по умолчанию выкл). Работает при ширине до 800 px. */
(()=>{
const on=()=>!!(S.set&&S.set.oh===1);
/* Чистая функция: включать ли режим при данной ширине окна */
const act=w=>on()&&w<=800;
function apply(){const r=document.documentElement;if(r)r.classList.toggle('oh',act(window.innerWidth))}
if(typeof window!='undefined'&&typeof document!='undefined'&&window.addEventListener){
 window.addEventListener('resize',apply);
 if(typeof render=='function'){const r0=render;window.render=render=function(){const x=r0.apply(this,arguments);apply();return x}}
 setTimeout(apply,0)}
if(typeof window!='undefined')window.OH={on,act};
})();
