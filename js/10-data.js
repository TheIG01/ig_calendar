// v2.2: окно подтверждения ask(), корзина (S.trash), история (S.hist)
(()=>{
const q=s=>document.querySelector(s),CAP=100,HC=200;
const fdt=t=>{const d=new Date(t+(S.set.tz||0)*36e5),p=n=>String(n).padStart(2,'0');return p(d.getUTCDate())+'.'+p(d.getUTCMonth()+1)+' '+p(d.getUTCHours())+':'+p(d.getUTCMinutes())};
window.ask=(msg,ok='Да',title='Подтверждение')=>new Promise(r=>{XT.show(title,'<p>'+esc(msg)+'</p><button class="xpri" data-ask="1">'+esc(ok)+'</button><button data-ask="0">Отмена</button>');const b=q('#xb'),h=e=>{const a=e.target.closest('[data-ask]');if(!a)return;b.removeEventListener('click',h);XT.close();r(a.dataset.ask=='1')};b.addEventListener('click',h)});
window.hist=(a,n)=>{S.hist=S.hist||[];S.hist.push({t:Date.now(),a,n:String(n||'').slice(0,80)});if(S.hist.length>HC)S.hist.splice(0,S.hist.length-HC)};
window.trashPut=arr=>{S.trash=S.trash||[];const now=Date.now(),days=S.set.trashDays??30;arr.forEach(e=>{S.trash.push({t:now,e:JSON.parse(JSON.stringify(e))});hist('del',e.title||'Без названия')});
 const lim=now-days*864e5;S.trash=S.trash.filter(x=>x.t>lim);if(S.trash.length>CAP)S.trash.splice(0,S.trash.length-CAP)};
const box=(t,h)=>XT.show(t,h);
XT.trash=()=>{const L=(S.trash||[]).slice().reverse(),d=S.set.trashDays??30;
 box(['trash','Корзина'],(L.length?L.map(x=>`<div class="xn" style="display:flex;gap:8px;align-items:center;justify-content:space-between"><span><b>${esc(x.e.title||'Без названия')}</b><br>${esc(x.e.date||'')} ${esc(x.e.st||'')} · удалено ${fdt(x.t)}</span><button data-tr="r" data-id="${esc(x.e.id)}" data-t="${x.t}" aria-label="Восстановить этап" style="min-height:44px">↩ Вернуть</button></div>`).join('')+'<button data-tr="c">Очистить корзину</button>':'<p class="xn">Корзина пуста. Удалённые этапы хранятся здесь, и их можно вернуть.</p>')+`<label class="xn">Хранить удалённое, дней: <select data-tr="d">${[7,14,30,90].map(v=>`<option ${v==d?'selected':''}>${v}</option>`).join('')}</select></label><button data-tr="h">${ic('history',16)} История действий</button>`)};
XT.hist=()=>{const L=(S.hist||[]).slice(-50).reverse(),N={del:'Удалён',restore:'Возвращён',clear:'Корзина очищена'};
 box(['history','История'],L.length?L.map(x=>`<div class="xn">${fdt(x.t)} · ${N[x.a]||x.a}${x.n?': <b>'+esc(x.n)+'</b>':''}</div>`).join('')+'<button data-tr="t">← К корзине</button>':ui.empty('history','История пока пуста.')+'<button data-tr="t">← К корзине</button>')};
document.addEventListener('click',async e=>{const b=e.target.closest('[data-tr]');if(!b)return;const a=b.dataset.tr;
 if(a=='r'){const i=(S.trash||[]).findIndex(x=>x.t==b.dataset.t&&x.e.id==b.dataset.id);if(i<0)return;const x=S.trash.splice(i,1)[0];if(!S.ev.some(v=>v.id==x.e.id))S.ev.push(x.e);hist('restore',x.e.title);save();render();toast('Этап возвращён');XT.trash()}
 else if(a=='c'){if(await ask('Очистить корзину насовсем?','Очистить')){S.trash=[];hist('clear');save();XT.trash()}}
 else if(a=='h')XT.hist();else if(a=='t')XT.trash()},true);
document.addEventListener('change',e=>{const s=e.target.closest('select[data-tr="d"]');if(s){S.set.trashDays=+s.value;trashPut([]);save();toast('Сохранено',1)}});
const m=XT.menu;XT.menu=function(){m();const b=q('#xb'),bt=document.createElement('button');bt.innerHTML=(window.ic?window.ic('trash',18)+' ':'')+'Корзина и история';bt.onclick=XT.trash;b.insertBefore(bt,b.firstChild)};
})();
