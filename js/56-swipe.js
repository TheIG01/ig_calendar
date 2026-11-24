/* v2.42 (L02): свайп влево/вправо по экрану — следующий/предыдущий день (в «Дне» и «Месяце»). Настройка S.set.swp (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.swp===0);
/* Чистая функция: направление по жесту. dx,dy в px, dt в мс. Влево → +1 (вперёд), вправо → −1. 0 — не жест */
const dir=(dx,dy,dt,v)=>{if(!on()||(v!='day'&&v!='month'))return 0;if(Math.abs(dx)<70||Math.abs(dy)>45||Math.abs(dx)<Math.abs(dy)*2||dt>700)return 0;return dx<0?1:-1};
const skip=t=>!!(t&&t.closest&&t.closest('input,textarea,select,button,a,.ev,.tk,.qp,.xc,[contenteditable],[draggable=true]'));
let x0,y0,t0,ok=0;
if(typeof document!='undefined'&&document.addEventListener){
 document.addEventListener('touchstart',e=>{const m=e.target.closest&&e.target.closest('#main');ok=!!m&&!skip(e.target)&&e.touches.length==1;if(ok){x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now()}},{passive:true});
 document.addEventListener('touchend',e=>{if(!ok)return;ok=0;const c=e.changedTouches[0],d=dir(c.clientX-x0,c.clientY-y0,Date.now()-t0,typeof view!='undefined'?view:'');if(d&&typeof go=='function')go(d)},{passive:true})}
if(typeof window!='undefined')window.SWP={on,dir};
})();
