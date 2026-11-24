/* v2.39 (K02): умная отсрочка — в системном уведомлении кнопки «Через 10 мин», «Через час», «До вечера».
   Отложенные хранятся в localStorage.igsnz и показываются снова. Настройка S.set.nsz (0 — без кнопок). */
(()=>{
const on=()=>!(S.set&&S.set.nsz===0),KEY='igsnz',EVE=18;
const ACT=[['s10','Через 10 мин'],['s60','Через час'],['seve','До вечера']];
/* Чистая функция: когда показать снова. a — действие, now — Date. «До вечера»: сегодня 18:00; если уже позже 17:30 — через час */
function at(a,now){const t=+now,m=a=='s10'?10:a=='s30'?30:a=='s60'?60:0;if(m)return t+m*6e4;
  if(a=='seve'){const e=new Date(now);e.setHours(EVE,0,0,0);return +e-t>30*6e4?+e:t+60*6e4}return null}
const load=()=>{try{const l=JSON.parse(localStorage[KEY]||'[]');return Array.isArray(l)?l:[]}catch(e){return[]}};
const put=l=>{try{localStorage[KEY]=JSON.stringify(l.slice(-30))}catch(e){}};
function add(a,title,body,now){const w=at(a,now||new Date());if(!w)return false;const l=load();l.push({at:w,title:title||'Этап',body:body||''});put(l);return true}
function take(now){const l=load(),d=l.filter(x=>x.at<=+now);if(d.length)put(l.filter(x=>x.at>+now));return d}
function tick(){if(!on())return;take(new Date()).forEach(x=>{if(window.AFN)window.AFN.show({title:x.title,body:'Отложено · '+x.body,tag:'sz'+x.at})})}
if(typeof window!='undefined'){window.SNZ={on,at,add,take,load,ACT,tick};
  if(navigator.serviceWorker&&navigator.serviceWorker.addEventListener)navigator.serviceWorker.addEventListener('message',e=>{const d=e.data;if(d&&d.t=='snz'&&on())add(d.a,d.title,d.body)});
  if(typeof setInterval!='undefined')setInterval(tick,2e4)}
})();
