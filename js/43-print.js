/* v2.29 (I08): печатный вид A4. 1) @page: «Месяц» — альбомный лист, остальное — книжный, поля 12 мм, блоки не рвутся между страницами.
   2) «Отчёт клиенту» → кнопка «Печать / PDF»: аккуратный лист с заголовком, периодом, списками и подписью. Настройка S.set.rprn (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.rprn===0);
const x=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* Ориентация листа по виду «Отчёта»: month/year — альбомная */
const orient=v=>v=='month'||v=='year'?'landscape':'portrait';
const css=o=>'@page{size:A4 '+o+';margin:12mm}.rpw>*,.rpw section,.pbox,.psh li{break-inside:avoid;page-break-inside:avoid}.psh{font:14px/1.55 Inter,system-ui,sans-serif;color:#111;max-width:720px;margin:auto}.psh h1{font:700 22px Manrope,Inter,sans-serif;margin:0 0 4px}.psh .pm{color:#555;margin:0 0 14px}.psh h3{font:700 14px Manrope,Inter,sans-serif;margin:16px 0 4px;border-bottom:1px solid #ddd;padding-bottom:3px}.psh p{margin:4px 0}.psh ul{margin:4px 0;padding-left:20px}.psh .pf{margin-top:24px;color:#777;font-size:12px}';
/* Текст отчёта → HTML-лист. Строка 1 — заголовок, «Период:» — подпись; «Что:» — подзаголовок, «• …» — пункт списка */
function sheet(text,date){const L=String(text||'').split('\n');if(!L.join('').trim())return'<div class="psh"><p>Пока нечего печатать.</p></div>';
  let o='<div class="psh"><h1>'+x(L[0])+'</h1>',ul=false;const cl=()=>{if(ul){o+='</ul>';ul=false}};
  L.slice(1).forEach(s=>{if(!s.trim()){cl();return}
    if(s.startsWith('• ')){if(!ul){o+='<ul>';ul=true}o+='<li>'+x(s.slice(2))+'</li>';return}
    cl();if(/^Период:/.test(s))o+='<p class="pm">'+x(s)+'</p>';
    else if(/^[^:]{1,40}:$/.test(s))o+='<h3>'+x(s.slice(0,-1))+'</h3>';else o+='<p>'+x(s)+'</p>'});
  cl();return o+'<div class="pf">Сформировано '+x(date||'')+'</div></div>'}
function setPage(o){let st=document.getElementById('prnst');if(!st){st=document.createElement('style');st.id='prnst';document.head.appendChild(st)}st.textContent=css(o)}
let sheetOn=false;
addEventListener('beforeprint',()=>{if(!on())return;const rp=document.getElementById('rp');
  setPage(sheetOn?'portrait':(rp&&!rp.hidden&&typeof rpv!='undefined'?orient(rpv):'portrait'))});
addEventListener('afterprint',()=>{if(!sheetOn)return;sheetOn=false;const rp=document.getElementById('rp');if(rp){rp.hidden=true;rp.innerHTML=''}});
function open(text){const rp=document.getElementById('rp');if(!rp)return;sheetOn=true;
  rp.innerHTML='<div class="rpw"><div class="rph nop"><span class="sp"></span><button type="button" class="pri" data-prn="go" style="min-height:44px">Печать / PDF</button><button type="button" data-prn="x" style="min-height:44px">Закрыть</button></div>'+sheet(text,new Date().toLocaleDateString('ru-RU'))+'</div>';
  rp.hidden=false;rp._t=text}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-prn],[data-crpr]');if(!b)return;
  if(b.dataset.crpr!==undefined){const ta=document.getElementById('zc2');if(!ta||!ta.value.trim()){toast('Сначала выберите клиента и период',1);return}open(ta.value);return}
  if(b.dataset.prn=='go'){setPage('portrait');print()}else{sheetOn=false;const rp=document.getElementById('rp');rp.hidden=true;rp.innerHTML=''}});
window.PRN={on,orient,css,sheet,open};
})();
