// v2.3: общие компоненты интерфейса — окна, ввод, выбор, копирование, иконки, пустые состояния.
// Работает поверх XT.show (окно #xm). Без alert/prompt/confirm.
(()=>{
const q=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Иконки (одна толщина линии 1.8): ic('plus')
const IC={plus:'M12 5v14M5 12h14',check:'M5 12.5l4.5 4.5L19 7.5',x:'M6 6l12 12M18 6L6 18',trash:'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12',edit:'M5 19l1-4 9-9 3 3-9 9zM14 7l3 3',copy:'M8 8h10v11H8zM6 16V5h10',search:'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',cal:'M5 6h14v14H5zM5 10h14M9 4v4M15 4v4',list:'M9 7h10M9 12h10M9 17h10M5 7h.01M5 12h.01M5 17h.01',gear:'M12 9a3 3 0 100 6 3 3 0 000-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1',clock:'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2',target:'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8a4 4 0 100 8 4 4 0 000-8z',inbox:'M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5',star:'M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z',undo:'M9 7L4 12l5 5M4 12h10a6 6 0 010 8',sparkle:'M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z',skip:'M5 6l7 6-7 6zM13 6l7 6-7 6',bolt:'M13 3L5 14h6l-1 7 8-11h-6z',brain:'M9 5a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 003 4 3 3 0 006 0V5a3 3 0 00-4 0zM15 5a3 3 0 013 3 3 3 0 012 5 3 3 0 01-3 4 3 3 0 01-6 0',save:'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',phone:'M8 3h8v18H8zM11 18h2',refresh:'M4 12a8 8 0 0114-5.3L20 9M20 4v5h-5M20 12a8 8 0 01-14 5.3L4 15M4 20v-5h5',key:'M15 7a4 4 0 11-3.5 6L4 20v-3l2-2h2v-2h2l1.5-1.5A4 4 0 0115 7z',wave:'M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0',rain:'M7 14a4 4 0 010-8 5 5 0 019.7 1.5A3.5 3.5 0 0117 14zM8 17l-1 3M12 17l-1 3M16 17l-1 3',mute:'M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6',lifebuoy:'M12 4a8 8 0 100 16 8 8 0 000-16zM12 9a3 3 0 100 6 3 3 0 000-6zM6 6l3 3M18 6l-3 3M6 18l3-3M18 18l-3-3',broom:'M14 4l6 6-5 5M4 20l5-5 3 3-5 2zM9 15l-2-2 6-6',history:'M4 12a8 8 0 108-8 8 8 0 00-6 2.7L4 9M4 4v5h5M12 8v4l3 2',chart:'M5 20V10M12 20V4M19 20v-6',export:'M12 15V4M8 8l4-4 4 4M5 14v6h14v-6',mood:'M12 4a8 8 0 100 16 8 8 0 000-16zM9 10h.01M15 10h.01M8.5 14.5a4.5 4.5 0 007 0',pin:'M9 4h6l-1 5 3 3H7l3-3zM12 12v8',folder:'M4 7h6l2 2h8v10H4z',sun:'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',invoice:'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',speaker:'M4 14v-4h4l5-4v12l-5-4zM17 9a4 4 0 010 6',bell:'M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0',stairs:'M4 20h4v-4h4v-4h4V8h4',pulse:'M3 12h4l2-5 4 10 2-5h6',block:'M12 4a8 8 0 100 16 8 8 0 000-16zM6 6l12 12'};
window.ic=(n,s=18)=>IC[n]?`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`:'';
window.ring=(pct,s=36,sw=4,col='var(--ac,#2f6bff)')=>{const p=Math.max(0,Math.min(100,Math.round(+pct||0))),r=(s-sw)/2,c=2*Math.PI*r,h=s/2;return `<svg class="rg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" role="img" aria-label="Прогресс ${p}%"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="${sw}"/><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${(c*p/100).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 ${h} ${h})"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${Math.round(s*.3)}" font-weight="600" fill="currentColor">${p}</text></svg>`};
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
