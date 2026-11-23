// v2.5: новые виды (Повестка, Рабочая неделя, N дней), масштаб сетки, список дня в месяце.
// Вызывается из vCal/go/render в 00-core.js. Ключи S.set: nd, ag, hhv, vx (всё необязательное).
const EXTRA_VIEWS=['agenda','work','nd'];
const ND=()=>Math.min(10,Math.max(2,+S.set.nd||3)),AG=()=>[7,14,30].includes(+S.set.ag)?+S.set.ag:14;
const workStart=d=>add(wk(d),(S.set.ws??1)?0:1);
const stepDays=()=>view=='week'||view=='work'?7:view=='nd'?ND():view=='agenda'?AG():1;
const agTitle=()=>fd(cur,{day:'numeric',month:'short'})+' – '+fd(add(cur,AG()-1),{day:'numeric',month:'short',year:'numeric'});
const vxSel=()=>{
 const on=S.set.vx??1,cur_=view=='nd'?'nd'+ND():view,tg=['day','week','work','nd'].includes(view);
 const o=[['','Ещё виды'],['agenda','Повестка'],['work','Рабочая неделя'],['nd2','2 дня'],['nd3','3 дня'],['nd5','5 дней'],['nd10','10 дней']];
 return (on?`<select id="vx" class="vx" aria-label="Другие виды календаря">${o.map(([v,t])=>`<option value="${v}" ${v==cur_||(!v&&['day','week','month','year'].includes(view))?'selected':''}>${t}</option>`).join('')}</select>`:'')
 +(tg?`<span class="zm"><button type="button" data-zoom="-1" aria-label="Уменьшить масштаб сетки">−</button><button type="button" data-zoom="1" aria-label="Увеличить масштаб сетки">+</button></span>`:'');
};
function vAgenda(){
 const days=[...Array(AG())].map((_,i)=>add(cur,i)),rows=days.map(x=>({x,l:evs(x)})).filter(r=>r.l.length);
 if(!rows.length)return `<div class="ag">${ui.empty('cal','В ближайшие '+AG()+' дней этапов нет','Новый этап','data-act="agnew"')}</div>`;
 return '<div class="ag">'+rows.map(({x,l})=>`<section class="agd ${x==today()?'td':''}"><h3>${fd(x,{weekday:'long',day:'numeric',month:'long'})}</h3>${l.map(e=>`<button type="button" class="age ${e.done?.[x]?'dn':''}" data-open="${esc(e.id)}" style="--c:${col(e)}"><i></i><span>${e.st}–${e.en}</span><b>${esc(e.title||'Без названия')}</b></button>`).join('')}</section>`).join('')+'</div>';
}
function setHH(v){const h=Math.max(24,Math.min(120,Math.round(v)));S.set.hhv=S.set.hhv||{};S.set.hhv[view]=h;save();render()}
function dayDrawer(x){
 const l=evs(x);
 let d=document.getElementById('dday');if(d)d.remove();
 d=document.createElement('div');d.id='dday';d.className='dday';d.setAttribute('role','dialog');d.setAttribute('aria-label','Этапы дня');
 d.innerHTML=`<div class="ddh"><b>${fd(x,{weekday:'long',day:'numeric',month:'long'})}</b><button type="button" data-ddnew="${x}" aria-label="Добавить этап">+</button><button type="button" data-ddx aria-label="Закрыть">×</button></div>`+(l.length?l.map(e=>`<button type="button" class="age" data-open="${esc(e.id)}" style="--c:${col(e)}"><i></i><span>${e.st}–${e.en}</span><b>${esc(e.title||'Без названия')}</b></button>`).join(''):'<p class="ddm">Свободный день</p>');
 document.body.appendChild(d);d.querySelector('button[data-ddx]').focus();
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-more],[data-open],[data-zoom],[data-ddx],[data-ddnew],[data-act="agnew"]');
 if(!t){if(!e.target.closest('#dday'))document.getElementById('dday')?.remove();return}
 if(t.dataset.more){e.stopPropagation();dayDrawer(t.dataset.more)}
 else if(t.dataset.open){document.getElementById('dday')?.remove();openEv(t.dataset.open)}
 else if(t.dataset.zoom)setHH(HH*(t.dataset.zoom>0?1.25:0.8));
 else if('ddx' in t.dataset)document.getElementById('dday')?.remove();
 else if(t.dataset.ddnew){document.getElementById('dday')?.remove();mk(t.dataset.ddnew,540,600)}
 else if(t.dataset.act=='agnew')mk(cur,540,600);
},true);
document.addEventListener('keydown',e=>{
 if(e.key=='Escape')document.getElementById('dday')?.remove();
 if((e.key=='Enter'||e.key==' ')&&e.target.dataset?.more){e.preventDefault();dayDrawer(e.target.dataset.more)}
 if(e.target.closest('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey||(typeof dlg!='undefined'&&dlg.open))return;
 const m={'1':'day','2':'week','3':'month','4':'year',a:'agenda','ф':'agenda'}[e.key.toLowerCase()];
 if(m){tab='cal';view=m;render()}
 else if(e.key=='+'||e.key=='=')setHH(HH*1.25);else if(e.key=='-')setHH(HH*0.8);
});
document.addEventListener('change',e=>{
 if(e.target.id!='vx'||!e.target.value)return;
 const v=e.target.value;if(v.startsWith('nd')){S.set.nd=+v.slice(2);save();view='nd'}else view=v;tab='cal';render();
});
document.addEventListener('wheel',e=>{
 if(!(e.ctrlKey||e.metaKey)||!e.target.closest('.tg'))return;
 e.preventDefault();setHH(HH*(e.deltaY<0?1.1:0.91));
},{passive:false});
