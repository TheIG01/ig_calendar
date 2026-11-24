// v2.22 N18 «Трекер финансов целей»: цель в ₽ (доход агентства), записи «+5000» / «-1200», график нарастающим итогом, прогноз по среднему темпу.
// Поля цели: g.fgt — цель в ₽; g.fin [{id,d,a,n}] — записи (a — число со знаком, d — дата).
// Настройка S.set.gfin (0 — блок скрыт). Записи сохраняются через gg, как и ключевые результаты.
window.FIN=(function(){
const on=()=>!(S.set&&S.set.gfin===0);
const money=v=>Math.round(v).toLocaleString('ru')+' ₽';
const days=(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/864e5);
const entries=g=>(g&&g.fin)||[];
const sum=g=>entries(g).reduce((s,e)=>s+(+e.a||0),0);

// «+5 000», «5000,5», «−1200» → число. Пусто, мусор или 0 → NaN.
function parse(s){const x=String(s||'').replace(/[\s\u00a0]/g,'').replace('\u2212','-').replace(',','.').replace(/₽$/,'');
 if(!/^[+-]?\d+(\.\d{1,2})?$/.test(x))return NaN;const v=+x;return v===0?NaN:v}

// Нарастающий итог по дням: [{d,v}] по возрастанию даты.
function series(g){const by={};entries(g).forEach(e=>{by[e.d]=(by[e.d]||0)+(+e.a||0)});let v=0;
 return Object.keys(by).sort().map(d=>{v+=by[d];return{d,v}})}

// Прогноз. t — сегодня (строка yyyy-mm-dd). Возвращает объект с полем k (вид результата).
function calc(g,t){const target=+g.fgt||0,cur=sum(g);
 if(!target)return{k:'notarget',cur};
 if(cur>=target)return{k:'done',cur,target};
 const need=target-cur,dd=[...new Set(entries(g).map(e=>e.d))].sort();
 if(dd.length<2)return{k:'few',cur,target,need};
 const el=Math.max(1,days(dd[0],t)),perDay=cur/el;
 if(perDay<=0)return{k:'flat',cur,target,need};
 const eta=add(t,Math.ceil(need/perDay));
 if(!g.dl)return{k:'eta',cur,target,need,eta,perDay};
 const slack=days(eta,g.dl);
 return{k:slack>=0?'ok':'bad',cur,target,need,eta,slack,perDay};
}

// Текст прогноза по результату calc.
function msg(r){const d=r.eta?fd(r.eta,{day:'numeric',month:'long'}):'';
 switch(r.k){
  case 'notarget':return 'Укажите цель в ₽, и здесь появятся прогресс и прогноз.';
  case 'done':return 'Цель достигнута: '+money(r.cur)+'.';
  case 'few':return 'Прогноз появится после записей минимум за два разных дня.';
  case 'flat':return 'Сумма пока не растёт. Добавьте доход, чтобы появился прогноз.';
  case 'eta':return 'При среднем темпе цель будет достигнута около '+d+'.';
  case 'ok':return 'При среднем темпе цель будет достигнута около '+d+': на '+r.slack+' дн. раньше срока.';
  case 'bad':return 'При среднем темпе цель будет достигнута около '+d+': на '+(-r.slack)+' дн. позже срока. Нужно ещё '+money(r.need)+'.';
  default:return ''}}

// График: линия накопленной суммы и пунктир цели. Нужно минимум две точки.
function chart(g){const P=series(g);if(P.length<2)return '';
 const W=300,H=80,tg=+g.fgt||0,mx=Math.max(1,tg,...P.map(p=>p.v)),mn=Math.min(0,...P.map(p=>p.v)),rg=(mx-mn)||1;
 const x=i=>(i/(P.length-1)*W).toFixed(1),y=v=>(H-(v-mn)/rg*H).toFixed(1);
 const pts=P.map((p,i)=>x(i)+','+y(p.v)).join(' ');
 const line=tg?`<line x1="0" x2="${W}" y1="${y(tg)}" y2="${y(tg)}" stroke="var(--mut,#6b7385)" stroke-dasharray="4 4"/>`:'';
 return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="График накопленной суммы: ${money(P[P.length-1].v)}" style="width:100%;height:80px;display:block;margin:8px 0">${line}<polyline points="${pts}" fill="none" stroke="var(--acc,#2f6bff)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`}

// Блок «Финансы цели» в окне цели.
function html(g){if(!on())return '';
 const t=today(),r=calc(g,t),L=entries(g).slice().sort((a,b)=>(b.d||'').localeCompare(a.d||'')).slice(0,8),
  pct=g.fgt?Math.round(Math.min(100,Math.max(0,sum(g)/g.fgt*100))):0;
 return `<div class="ds" id="fin"><label>Финансы цели</label>
 <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>${money(r.cur)}</b><small>из</small><input type="number" min="0" step="100" value="${+g.fgt||''}" data-fgt aria-label="Цель в рублях" placeholder="цель ₽" style="width:130px"></div>
 ${g.fgt?`<div class="xbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Выполнено ${pct}%"><i style="width:${pct}%"></i></div>`:''}
 ${chart(g)}
 <div class="gf" role="status"><b>Прогноз</b><div>${esc(msg(r))}</div></div>
 <div class="bar" style="margin:0"><input id="fga" inputmode="decimal" placeholder="+5000 или −1200" aria-label="Сумма записи" style="width:150px"><input id="fgn" placeholder="За что, например «Проект Альфа»" aria-label="Комментарий к записи" style="flex:1"><button class="pri" data-fgadd>Записать</button></div>
 ${L.length?L.map(e=>`<div class="row"><small>${fd(e.d,{day:'numeric',month:'short'})}</small><b>${e.a>0?'+':'−'}${Math.abs(e.a).toLocaleString('ru')} ₽</b><span class="sp">${esc(e.n||'Без комментария')}</span><button class="x" data-fgdel="${esc(e.id)}" aria-label="Удалить запись на ${Math.abs(e.a)} ₽">×</button></div>`).join(''):ui.empty('history','Записей пока нет. Добавьте первый доход, например +5000.')}
 </div>`}

// Делегирование: только внутри окна цели (#db). Правки идут в gg и сохраняются кнопкой «Сохранить» (как ключевые результаты).
if(typeof document!=='undefined'){
document.addEventListener('change',e=>{const i=e.target.closest&&e.target.closest('#db [data-fgt]');if(!i||!gg)return;
 const v=Math.max(0,+i.value||0);if(v)gg.fgt=v;else delete gg.fgt;gre()});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#db [data-fgadd],#db [data-fgdel]');if(!b||!gg)return;
 if(b.hasAttribute('data-fgdel')){gg.fin=entries(gg).filter(x=>x.id!=b.dataset.fgdel);if(!gg.fin.length)delete gg.fin;gre();return}
 const a=parse($('#fga').value);if(isNaN(a)){toast('Введите сумму, например 5000 или -1200',1);return}
 gg.fin=entries(gg).concat({id:uid(),d:today(),a,n:($('#fgn').value||'').trim().slice(0,160)});gre()});
}

return{parse,sum,series,calc,msg,html,on}})();
