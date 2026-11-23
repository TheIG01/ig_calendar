/* v2.9.2 (часть 3): G14 сводка у папки (часы и подпроекты в карточке родителя) и G16 «Агентство»
   (часы по клиентам за неделю; этапы «Агентство» без проекта раскладываются по проектам).
   Настройки: fsm (сводка папок), agy (блок «Агентство»). Миграции нет: поля проекта/этапа уже есть. */
(()=>{
const on=k=>(S.set[k]??1)!=0;
const plural=n=>{const d=n%10,h=n%100;if(h>10&&h<20)return 'подпроектов';if(d==1)return 'подпроект';if(d>1&&d<5)return 'подпроекта';return 'подпроектов'};
const WEEK=()=>{const w=wk(today());return[0,1,2,3,4,5,6].map(i=>add(w,i))};
const isAg=e=>e.cat=='Агентство'||/агент/i.test(e.cat||'');

/* G14: все подпапки проекта (рекурсивно, без циклов, без архивных) */
function subs(p){const out=[];const walk=id=>(S.proj||[]).forEach(c=>{if(c.par==id&&!c.arch&&!out.includes(c)){out.push(c);walk(c.id)}});walk(p.id);return out}

/* Блок внутри карточки проекта: сводка папки и кнопка канбана (вызывается из 03-hub vP) */
window.projExtra=function(p){
  let h='';
  if(on('fsm')){const sb=subs(p);if(sb.length){let w=0,l=0;sb.forEach(c=>{const r=pst(c);w+=r[0];l+=r[1]});
    h+=`<div class="xm2"><span>Внутри: <b>${sb.length} ${plural(sb.length)}</b></span><span>отработано <b>${hr(w)}</b></span><span>запланировано <b>${hr(l)}</b></span></div>`}}
  if(on('pkb'))h+=`<div class="xc2" style="margin:6px 0"><button data-kb="${p.id}">Канбан проекта</button></div>`;
  return h;
};

/* G16: часы за неделю по проектам клиентов и нераспределённые этапы «Агентство» */
function weekMin(pid){let m=0;WEEK().forEach(d=>S.ev.forEach(e=>{if(e.proj!=pid||e.kind=='habit'||e.ad)return;const o=occ(e,d);if(o)m+=dur(o[0],o[1])}));return m}
function unassigned(){const out=new Map();WEEK().forEach(d=>S.ev.forEach(e=>{if(e.proj||e.kind=='habit'||e.ad||!isAg(e))return;const o=occ(e,d);if(!o)return;const r=out.get(e.id)||{e,m:0,d};r.m+=dur(o[0],o[1]);out.set(e.id,r)}));return[...out.values()]}

window.agyHTML=function(){
  if(!on('agy')||HUB.st.arch)return'';
  const act=(S.proj||[]).filter(p=>!p.arch),C=act.filter(p=>p.cl),un=unassigned();
  if(!C.length&&!un.length)return'';
  const pm=new Map(act.map(p=>[p.id,weekMin(p.id)])),G={};
  C.forEach(p=>(G[p.cl]=G[p.cl]||[]).push(p));
  const cm={};let tot=0;
  Object.keys(G).forEach(n=>{cm[n]=G[n].reduce((s,p)=>s+pm.get(p.id),0);tot+=cm[n]});
  const um=un.reduce((s,x)=>s+x.m,0);tot+=um;
  const pct=m=>tot?Math.round(m/tot*100):0;
  const rows=Object.keys(G).sort((a,b)=>cm[b]-cm[a]).map(n=>`<div class="agy-c"><div class="xm2"><span><b>${esc(n)}</b></span><span>${hr(cm[n])} · ${pct(cm[n])}%</span></div><div class="xbar"><i style="width:${pct(cm[n])}%"></i></div>`+
    G[n].map(p=>`<div class="xm2" style="margin:2px 0 0 14px"><span>● ${esc(p.t)}</span><span>${hr(pm.get(p.id))}</span></div>`).join('')+`</div>`).join('');
  const opts=act.map(p=>`<option value="${p.id}">${esc(p.t)}</option>`).join('');
  const ur=un.sort((a,b)=>a.d.localeCompare(b.d)).slice(0,8).map(x=>`<div class="xr"><div class="xat"><b>${esc(x.e.title||'Без названия')}</b><span>${HUB.dlb(x.d)} · ${hr(x.m)}</span></div>`+
    `<select class="xin agy-sel" data-agy="${x.e.id}" aria-label="В какой проект: ${esc(x.e.title||'этап')}"><option value="">Выбрать проект…</option>${opts}</select></div>`).join('');
  return `<div class="xk agy" style="--c:var(--ac)"><div class="xtt"><b>Агентство · эта неделя</b><span style="color:var(--mut)">${hr(tot)}</span></div>${rows}`+
    (un.length?`<div class="xm2"><span>Без проекта: <b>${hr(um)}</b></span></div>${ur}${un.length>8?`<div class="xn">Показаны первые 8 из ${un.length}</div>`:''}`:'')+`</div>`;
};
const prevW=window.vPWrap;
window.vPWrap=vP0=>{const base=prevW(vP0);return function(){return window.agyHTML()+base()}};

document.addEventListener('change',ev=>{const s=ev.target.closest&&ev.target.closest('[data-agy]');if(!s||!s.value)return;
  const e=S.ev.find(x=>x.id==s.dataset.agy);if(!e)return;snap();e.proj=s.value;save();render();toast('Этап разложен по проекту',1)});
})();
