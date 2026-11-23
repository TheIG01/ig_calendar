/* v2.9.1 (часть 2): папки с подпапками (G14: порядок и отступ в списке, окно проекта — в 22-projects.js)
   и карточки клиентов (N19: последний контакт, дата следующего контакта).
   Данные: p.par — id родительского проекта; p.nx — дата следующего контакта (пишется во все проекты клиента,
   чтобы синхронизировалась вместе с проектами). Миграции не нужно: поля необязательны. */
(()=>{
const plural=n=>{const d=n%10,h=n%100;if(h>10&&h<20)return 'проектов';if(d==1)return 'проект';if(d>1&&d<5)return 'проекта';return 'проектов'};

/* Порядок: родитель, затем его подпапки (рекурсивно). Проект, чей родитель не в списке, — верхнего уровня. */
window.projList=function(list){
  const ids=new Set(list.map(p=>p.id)),out=[],seen=new Set();
  const walk=p=>{if(seen.has(p.id))return;seen.add(p.id);out.push(p);list.filter(c=>c.par==p.id).forEach(walk)};
  list.filter(p=>!p.par||!ids.has(p.par)).forEach(walk);
  list.forEach(p=>{if(!seen.has(p.id))walk(p)});
  return out;
};

/* Отступ: сколько родителей у проекта в том же списке (актив/архив). Защита от циклов: не больше 10 уровней. */
window.projDepth=p=>{let d=0,cur=p,n=0;while(cur&&cur.par&&n++<10){const up=(S.proj||[]).find(x=>x.id==cur.par);if(!up||!!up.arch!=!!p.arch)break;d++;cur=up}return d};

/* Карточки клиентов сверху списка активных проектов (N19) */
window.clientsHTML=function(arch){
  if(arch||(S.set.cln??1)==0)return'';
  const P=(S.proj||[]).filter(p=>!p.arch&&p.cl);if(!P.length)return'';
  const G={};P.forEach(p=>(G[p.cl]=G[p.cl]||[]).push(p));
  const t=today(),esc2=s=>esc(s),dl=HUB.dlb;
  const rows=Object.keys(G).sort((a,b)=>a.localeCompare(b,'ru')).map(name=>{
    const ps=G[name],ids=new Set(ps.map(p=>p.id));
    let last='';
    S.ev.forEach(e=>{if(!ids.has(e.proj)||!e.done)return;Object.keys(e.done).forEach(d=>{if(e.done[d]&&d<=t&&d>last)last=d})});
    const nx=ps.map(p=>p.nx).filter(Boolean).sort()[0]||'',due=!!nx&&nx<=t;
    return `<div class="xk" style="--c:${ps[0].c}"><div class="xtt"><b>${esc2(name)}</b><span style="color:var(--mut)">${ps.length} ${plural(ps.length)}</span></div>`+
      `<div class="xm2"><span>последний контакт <b>${last?dl(last):'—'}</b></span><span>следующий <b${due?' style="color:#e5484d"':''}>${nx?dl(nx)+(due?' · пора':''):'не задан'}</b></span></div>`+
      `<div class="xc2" style="margin-top:8px"><button data-cli="${esc2(name)}">Дата контакта</button></div></div>`;
  }).join('');
  return `<div class="xn" style="margin:4px 0 8px">Клиенты</div>${rows}`;
};

/* Окно даты контакта: делегирование, без inline onclick */
document.addEventListener('click',ev=>{
  const b=ev.target.closest&&ev.target.closest('[data-cli]');if(!b)return;
  const name=b.dataset.cli,cur=(S.proj||[]).find(p=>p.cl==name&&p.nx);
  XT.show('Контакт: '+name,`<div class="xn">Когда связаться в следующий раз</div>`+
    `<input id="zcn" class="xin" type="date" value="${cur?cur.nx:''}" aria-label="Дата следующего контакта">`+
    `<div class="xc2" style="margin-top:12px"><button data-cln="${esc(name)}" data-v="1">Сохранить</button><button data-cln="${esc(name)}" data-v="0">Убрать дату</button></div>`);
});
document.addEventListener('click',ev=>{
  const b=ev.target.closest&&ev.target.closest('[data-cln]');if(!b)return;
  const name=b.dataset.cln,v=b.dataset.v==='1'?((document.getElementById('zcn')||{}).value||''):'';
  snap();(S.proj||[]).forEach(p=>{if(p.cl==name)p.nx=v});
  save();render();XT.close();toast(v?'Дата контакта сохранена':'Дата контакта убрана',1);
});
})();
