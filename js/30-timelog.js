// v2.13.4 · H06: журнал записей таймера (отметка, объединение, разделение, проект)
(()=>{
const isT=e=>!!e&&e.kind==='event'&&Array.isArray(e.tags)&&e.tags.includes('таймер');
let SEL=new Set();
const recs=()=>(S.ev||[]).filter(isT).sort((a,b)=>(b.date+b.st).localeCompare(a.date+a.st)).slice(0,80);
const byId=id=>(S.ev||[]).find(e=>e.id==id);
const mid=e=>hm(tm(e.st)+Math.floor(dur(e.st,e.en)/2));
const pName=e=>{const p=PJ(e.proj);return p?' · '+esc(p.name||p.title||'Проект'):''};
const sync=()=>{const m=document.querySelector('[data-tl="m"]');if(m)m.textContent='⇆ Объединить выбранные ('+SEL.size+')'};

const row=e=>`<div class="xtl" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid #e3e8f2">`+
`<label style="display:flex;gap:8px;align-items:center;min-height:44px;flex:1 1 180px;cursor:pointer"><input type="checkbox" data-tl="s" data-id="${esc(e.id)}" ${SEL.has(e.id)?'checked':''} aria-label="Выбрать запись ${esc(e.title||'')}"><span><b>${esc(e.title||'Без названия')}</b><br><small>${fd(e.date,{day:'numeric',month:'short'})} · ${esc(e.st)}–${esc(e.en)} · ${hr(dur(e.st,e.en))}${pName(e)}</small></span></label>`+
`<input type="time" data-tl="at" value="${mid(e)}" aria-label="Время разделения" style="min-height:44px">`+
`<button data-tl="x" data-id="${esc(e.id)}" style="min-height:44px">✂ Разделить</button></div>`;

const toolbar=()=>{const ps=(S.proj||[]).filter(p=>!p.arch);return `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding-bottom:8px">`+
`<button data-tl="m" class="xpri" style="min-height:44px">⇆ Объединить выбранные (${SEL.size})</button>`+
`<label style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">Проект выбранным <select data-tl="p" aria-label="Проект для выбранных записей" style="min-height:44px"><option value="">— без проекта —</option>${ps.map(p=>`<option value="${esc(p.id)}">${esc(p.name||p.title||'Проект')}</option>`).join('')}</select></label>`+
`<button data-tl="pa" style="min-height:44px">Назначить</button></div>`};

const open=()=>{SEL=new Set([...SEL].filter(byId));const L=recs();
 XT.show('Журнал записей таймера',L.length?'<p class="xn">Отметьте записи, чтобы объединить или назначить проект. «Разделить» делит запись по указанному времени.</p>'+toolbar()+L.map(row).join(''):ui.empty('cal','Записей таймера пока нет. Запустите таймер, и записи появятся здесь.'))};

const merge=()=>{const rs=[...SEL].map(byId).filter(Boolean);
 if(rs.length<2)return toast('Отметьте хотя бы две записи',1);
 if(new Set(rs.map(e=>e.date)).size>1)return toast('Объединять можно записи одного дня',1);
 rs.sort((a,b)=>a.st.localeCompare(b.st));const keep=rs[0],others=rs.slice(1);
 keep.en=rs.reduce((m,e)=>tm(e.en)>tm(m)?e.en:m,keep.en);
 if(!keep.proj){const p=others.find(e=>e.proj);if(p)keep.proj=p.proj}
 if(!keep.title){const t=others.find(e=>e.title);if(t)keep.title=t.title}
 trashPut(others);S.ev=S.ev.filter(e=>!others.some(o=>o.id==e.id));
 SEL=new Set([keep.id]);save();render();toast('Объединено: '+hr(dur(keep.st,keep.en)),1);open()};

const split=(id,at)=>{const e=byId(id);if(!e)return;const a=tm(at),s=tm(e.st),n=tm(e.en);
 if(!/^\d\d:\d\d$/.test(at)||a<=s||a>=n)return toast('Время должно быть внутри записи',1);
 const cp=JSON.parse(JSON.stringify(e));cp.id=uid();cp.st=hm(a);cp.rem=[];
 e.en=hm(a);S.ev.push(cp);save();render();toast('Разделено на две записи',1);open()};

const assign=pid=>{const ids=[...SEL];if(!ids.length)return toast('Сначала отметьте записи',1);
 (S.ev||[]).forEach(e=>{if(SEL.has(e.id)&&isT(e))e.proj=pid});save();render();toast('Проект назначен: '+ids.length,1);open()};

document.addEventListener('change',e=>{const c=e.target.closest('[data-tl="s"]');if(!c)return;
 c.checked?SEL.add(c.dataset.id):SEL.delete(c.dataset.id);sync()});

document.addEventListener('click',e=>{const b=e.target.closest('[data-tl]');if(!b)return;const a=b.dataset.tl;
 if(a=='m')merge();
 else if(a=='x')split(b.dataset.id,b.closest('.xtl').querySelector('[data-tl="at"]').value);
 else if(a=='pa')assign(document.querySelector('[data-tl="p"]').value)},true);

const m=XT.menu;XT.menu=function(){m();const b=q('#xb'),bt=document.createElement('button');
 bt.innerHTML=ic('cal',18)+' Журнал записей таймера';bt.onclick=()=>{SEL=new Set();open()};b.insertBefore(bt,b.firstChild)};

window.XTL={open};
})();
