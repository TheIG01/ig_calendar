/* v2.44 (L05): экранная клавиатура на телефоне не перекрывает шторки и поля: окно поднимается, нижняя панель прячется,
   поле в фокусе прокручивается в видимую часть. Настройка S.set.kbd (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.kbd===0);
/* Чистая функция: высота клавиатуры в px по размерам окна и видимой области; меньше 120 px — это не клавиатура */
const kbh=(inner,vh,top)=>{const h=Math.round(inner-vh-(top||0));return h>=120?h:0};
function upd(){const r=document.documentElement,v=window.visualViewport;if(!v)return;
 const h=on()?kbh(window.innerHeight,v.height,v.offsetTop):0;
 r.style.setProperty('--kb',h+'px');r.classList.toggle('kbo',h>0);
 if(h>0){const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&a.scrollIntoView)setTimeout(()=>a.scrollIntoView({block:'center',behavior:'smooth'}),60)}}
if(typeof window!='undefined'&&window.visualViewport&&window.visualViewport.addEventListener){window.visualViewport.addEventListener('resize',upd);window.visualViewport.addEventListener('scroll',upd)}
if(typeof window!='undefined')window.KBD={on,kbh};
})();
