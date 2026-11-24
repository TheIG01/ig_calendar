/* v2.36 (O14): «тихая» плашка аффирмации — без кнопки, исчезает сама через заданное время, не мешает кликам и не шлёт системное окно.
   Настройки: S.set.afq (0 — как раньше, с кнопкой «Хорошо»; 1 — тихая), S.set.afqs (секунд: 5/10/20/30). */
(()=>{
/* Чистая функция: как показывать плашку. L — тексты, set — настройки → {quiet, ms} */
function plan(L,set){set=set||{};const q=set.afq==1;
  if(!q)return{quiet:false,ms:Math.min(90000,8000+L.join('').length*80)};
  const s=Math.max(3,Math.min(60,+set.afqs||10));return{quiet:true,ms:s*1000}}
const html=(L,quiet,esc)=>L.map(t=>`<p>${esc(t).replace(/\n/g,'<br>')}</p>`).join('')+(quiet?'':'<button data-afq="ok">Хорошо</button>');
if(typeof window!='undefined'){
  window.AFQ={plan,html};
  const orig=window.affShow;
  window.affShow=function(L){const p=plan(L,S.set),b=$('#aff');
    if(!p.quiet){if(b)b.style.pointerEvents='';return orig(L)}
    b.innerHTML=html(L,true,esc);b.style.pointerEvents='none';b.setAttribute('role','status');b.classList.add('on');
    clearTimeout(orig.t);orig.t=setTimeout(()=>b.classList.remove('on'),p.ms)};
}
if(typeof document!='undefined'&&document.addEventListener)document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-afq=ok]');if(b)b.parentNode.classList.remove('on')});
})();
