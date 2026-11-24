/* v2.51 (N35): ярлык «Записать» на главном экране телефона — открывает шторку «Быстрая запись» и кладёт мысль во входящие.
   Manifest: shortcut ./index.html?cap=1. Настройка S.set.cap (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.cap===0);
/* Чистая функция: текст записи → одна строка до 300 знаков; пусто, если писать нечего */
const clean=s=>String(s==null?'':s).replace(/\s+/g,' ').trim().slice(0,300);
function add(s){const v=clean(s);if(!v||!on())return'';(S.inbox=S.inbox||[]).push({id:uid(),t:v});return v}
const cnt=()=>(S.inbox||[]).length;
const hint=()=>cnt()?'Во входящих: '+cnt():'Во входящих пока пусто — первая мысль станет началом.';
function close(){const o=document.getElementById('capsh');if(o)o.remove()}
function open(){
  if(!on()){if(typeof toast=='function')toast('Ярлык «Записать» выключен в «Настройках»');return false}
  close();const o=document.createElement('div');o.id='capsh';o.className='capsh';
  o.innerHTML='<div class="capb" role="dialog" aria-modal="true" aria-label="Быстрая запись"><b>Быстрая запись</b><textarea id="capt" rows="3" maxlength="300" placeholder="Что у вас на уме?" aria-label="Текст записи"></textarea><small id="caph">'+hint()+'</small><div class="capr"><button type="button" class="capx" data-act="cap-close">Закрыть</button><button type="button" class="capok" data-act="cap-save">Записать</button></div></div>';
  document.body.appendChild(o);const t=document.getElementById('capt');setTimeout(()=>t&&t.focus(),60);return true}
function go(){const t=document.getElementById('capt');if(!t)return;const v=add(t.value);
  if(!v){t.focus();return}
  if(typeof save=='function')save();
  if(typeof render=='function')render();if(typeof toast=='function')toast('Во входящие: '+v.slice(0,40),1);close()}
if(typeof document!='undefined'){
 document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act^="cap-"]');if(b){const a=b.dataset.act;if(a=='cap-save')go();else close();return}
  if(e.target&&e.target.id=='capsh')close()});
 document.addEventListener('keydown',e=>{if(!document.getElementById('capsh'))return;if(e.key=='Escape')close();else if(e.key=='Enter'&&!e.shiftKey&&e.target&&e.target.id=='capt'){e.preventDefault();go()}});
}
window.CAP={on,clean,add,open,close,hint};
})();
