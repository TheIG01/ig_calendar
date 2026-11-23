// v2.3: общие компоненты интерфейса — окна, ввод, выбор, копирование, иконки, пустые состояния.
// Работает поверх XT.show (окно #xm). Без alert/prompt/confirm.
(()=>{
const q=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Иконки (одна толщина линии 1.8): ic('plus')
const IC={plus:'M12 5v14M5 12h14',check:'M5 12.5l4.5 4.5L19 7.5',x:'M6 6l12 12M18 6L6 18',trash:'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12',edit:'M5 19l1-4 9-9 3 3-9 9zM14 7l3 3',copy:'M8 8h10v11H8zM6 16V5h10',search:'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',cal:'M5 6h14v14H5zM5 10h14M9 4v4M15 4v4',list:'M9 7h10M9 12h10M9 17h10M5 7h.01M5 12h.01M5 17h.01',gear:'M12 9a3 3 0 100 6 3 3 0 000-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',clock:'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2',target:'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8a4 4 0 100 8 4 4 0 000-8z',inbox:'M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5',star:'M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z',undo:'M9 7L4 12l5 5M4 12h10a6 6 0 010 8',sparkle:'M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z'};
window.ic=(n,s=18)=>IC[n]?`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`:'';
// Окно с ожиданием результата. btns: [{t,v,pri}]; закрытие крестиком/фоном/Esc → null
const dlg=(title,html,btns,mount)=>new Promise(res=>{
 const M=q('#xm');let done=0;
 const fin=v=>{if(done)return;done=1;ob.disconnect();b.removeEventListener('click',h);b.removeEventListener('keydown',k);if(!M.hidden)XT.close();res(v)};
 XT.show(title,html+'<div class="uib">'+btns.map((x,i)=>`<button class="${x.pri?'xpri':''}" data-ui="${i}">${E(x.t)}</button>`).join('')+'</div>');
 const b=q('#xb'),val=()=>({v:(q('#uiv')||{}).value});
 const h=e=>{const a=e.target.closest('[data-ui]');if(!a)return;const x=btns[+a.dataset.ui];fin(typeof x.v=='function'?x.v(val()):x.v)};
 const k=e=>{if(e.key=='Enter'&&e.target.id=='uiv'&&e.target.tagName=='INPUT'){e.preventDefault();const x=btns.find(z=>z.pri);if(x)fin(typeof x.v=='function'?x.v(val()):x.v)}};
 b.addEventListener('click',h);b.addEventListener('keydown',k);
 const ob=new MutationObserver(()=>{if(M.hidden)fin(null)});ob.observe(M,{attributes:true,attributeFilter:['hidden']});
 if(mount)mount(b);const f=q('#uiv')||b.querySelector('.xpri');if(f)setTimeout(()=>f.focus(),30)});
const ui=window.ui={
 // Да/Нет: true/false
 confirm:(msg,ok='Да',title='Подтверждение')=>dlg(title,'<p>'+E(msg).replace(/\n/g,'<br>')+'</p>',[{t:ok,v:true,pri:1},{t:'Отмена',v:false}]).then(v=>v===true),
 // Выбор из нескольких вариантов: вернёт v выбранной кнопки или null
 choose:(title,msg,opts)=>dlg(title,'<p>'+E(msg).replace(/\n/g,'<br>')+'</p>',opts),
 // Ввод текста: строка или null при отмене. o:{multi,type,hint,ok}
 prompt:(title,label,val='',o={})=>dlg(title,`<label class="xl2">${E(label)}${o.multi?`<textarea id="uiv" rows="6" placeholder="${E(o.hint||'')}">${E(val)}</textarea>`:`<input id="uiv" type="${o.type||'text'}" ${o.type=='password'?'autocomplete="off"':''} ${o.num?'inputmode="numeric"':''} value="${E(val)}" placeholder="${E(o.hint||'')}">`}</label>`,[{t:o.ok||'Готово',pri:1,v:x=>x.v??''},{t:'Отмена',v:null}]),
 // Показать текст для ручного копирования (если буфер недоступен)
 copy:(title,text)=>dlg(title,`<p class="xn">Скопируйте текст ниже.</p><label class="xl2"><textarea id="uiv" rows="4" readonly>${E(text)}</textarea></label>`,[{t:'Закрыть',pri:1,v:true}],()=>{const t=q('#uiv');t.onfocus=()=>t.select()}),
 // Пустое состояние: ui.empty('inbox','Пока пусто','Добавить','data-act="new"')
 empty:(icon,text,btn,attrs)=>`<div class="empty">${ic(icon,28)}<p>${E(text)}</p>${btn?`<button class="xpri" ${attrs||''}>${E(btn)}</button>`:''}</div>`
};
// Esc закрывает окно
document.addEventListener('keydown',e=>{if(e.key=='Escape'){const M=q('#xm');if(M&&!M.hidden)XT.close()}});
// Настройка «плавные анимации»
window.uiApply=()=>{try{document.documentElement.dataset.anim=S.set.anim===0?'0':'1'}catch(e){}};
uiApply();addEventListener('DOMContentLoaded',()=>uiApply());
window.ask=ui.confirm;
})();
