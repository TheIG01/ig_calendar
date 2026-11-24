/* v2.9.2 (часть 3): N21 отчёт клиенту. Клиент (или проект без клиента) → период → шаблон (Короткий / По услугам / Полный).
   Текст в поле, копируется кнопкой. Заменяет XZ.cr из 07-smart.js. Настройка: crt (шаблон по умолчанию). */
(()=>{
const nr=e=>!e.rep||e.rep.t=='none';
const f=d=>d.split('-').reverse().join('.');
const PER=[['7','7 дней'],['30','30 дней'],['m','Этот месяц'],['pm','Прошлый месяц']];
const TPL=['Короткий','По услугам','Полный'];

/* Варианты: клиенты (c:имя) и проекты без клиента (p:id), только активные */
function choices(){const seen=new Set(),out=[];(S.proj||[]).filter(p=>!p.arch).forEach(p=>{
  if(p.cl){if(!seen.has('c:'+p.cl)){seen.add('c:'+p.cl);out.push(['c:'+p.cl,'Клиент: '+p.cl])}}
  else out.push(['p:'+p.id,'Проект: '+p.t])});return out}
function projsOf(v){if(v.startsWith('c:')){const n=v.slice(2);return (S.proj||[]).filter(p=>!p.arch&&p.cl==n)}
  const p=PJ(v.slice(2));return p&&!p.arch?[p]:[]}
function span(k){const t=today();
  if(k=='m')return[t.slice(0,8)+'01',t];
  if(k=='pm'){const last=add(t.slice(0,8)+'01',-1);return[last.slice(0,8)+'01',last]}
  return[add(t,-(+k-1)),t]}

/* Сбор данных за период: часы (без задач, привычек и весь-день), сделано, планы, по услугам и проектам */
function gather(C,rg){const L=projsOf(C.w),ids=new Set(L.map(p=>p.id)),[a,b]=rg||span(C.p),t=today();
  const r={L,a,b,m:0,dn:[],svc:{},pm:{},open:[],rows:[]};
  for(let d=a;d<=b;d=add(d,1))S.ev.forEach(e=>{if(!ids.has(e.proj))return;const o=occ(e,d);if(!o)return;
    if(e.kind=='task'){if(e.done&&e.done[d])r.dn.push(e.title||'Без названия')}
    else if(e.kind!='habit'&&!e.ad){const mm=dur(o[0],o[1]),k=e.svc||'Без услуги';r.m+=mm;r.svc[k]=(r.svc[k]||0)+mm;r.pm[e.proj]=(r.pm[e.proj]||0)+mm;const p=PJ(e.proj)||{};r.rows.push([d,p.cl||'',p.t||'',e.svc||'',e.title||'Без названия',o[0],o[1],mm])}});
  S.ev.forEach(e=>{if(ids.has(e.proj)&&e.kind=='task'&&nr(e)&&!(e.done&&e.done[e.date])&&e.date>=t)r.open.push(e)});
  r.open.sort((x,y)=>x.date.localeCompare(y.date));
  return r}

function build(){const C=XZ._cr,R=gather(C);if(!R.L.length)return'';
  const isC=C.w.startsWith('c:'),name=isC?C.w.slice(2):R.L[0].t,tp=C.t;
  const norm=k=>R.L.reduce((s,p)=>s+((p.norm&&p.norm[k])||0),0);
  const cp=window.CMP&&CMP.on()?gather(C,CMP.prevSpan(C.p,R.a,R.b)):null,dl=(c,p)=>{const x=cp?CMP.txt(CMP.delta(c,p)):'';return x?' ('+x+')':''};
  const L=[(isC?'Отчёт по клиенту «':'Отчёт по проекту «')+name+'»','Период: '+f(R.a)+' — '+f(R.b),'','Отработано: '+hr(R.m)+(cp?dl(R.m,cp.m).replace(')',', было '+hr(cp.m)+')'):'')];
  const pl=window.PLN&&PLN.on()?PLN.txt(PLN.calc(PLN.norms(R.L),R.svc,R.a,R.b)):'';if(pl)L.push(pl);
  const gh=window.HEAT&&HEAT.on()?HEAT.txt(HEAT.grid(R.rows)):'';if(gh)L.push(gh);
  if(tp>=1){const ks=Object.keys(R.svc).sort((x,y)=>R.svc[y]-R.svc[x]);
    L.push('','По услугам:',...(ks.length?ks.map(k=>'• '+k+' — '+hr(R.svc[k])+(cp?dl(R.svc[k],cp.svc[k]):'')+(norm(k)?' ('+(window.PLN&&PLN.on()?PLN.svcTxt(norm(k),R.svc[k]||0,R.a,R.b)+', ':'')+'норма '+norm(k)+' ч в неделю)':'')):['—']))}
  if(tp>=2){const ps=Object.keys(R.pm).sort((x,y)=>R.pm[y]-R.pm[x]);
    L.push('','По проектам:',...(ps.length?ps.map(id=>'• '+((PJ(id)||{}).t||'')+' — '+hr(R.pm[id])):['—']))}
  L.push('','Сделано:',...(R.dn.length?R.dn.slice(0,tp==2?30:10).map(x=>'• '+x):['—']));
  L.push('','В планах:',...(R.open.length?R.open.slice(0,tp==2?15:5).map(e=>'• '+(e.title||'Без названия')+' (до '+f(e.date)+')'):['—']));
  return L.join('\n')}

function paint(){const C=XZ._cr,ta=document.getElementById('zc2');if(ta)ta.value=build();
  const R=gather(C),g=window.HEAT?HEAT.grid(R.rows):null,hm=document.getElementById('zhm'),zi=document.getElementById('zin');
  if(hm)hm.innerHTML=window.HEAT&&HEAT.on()?HEAT.html(g):'';
  if(zi)zi.innerHTML=window.INS&&INS.on()?INS.html(INS.list({norms:window.PLN?PLN.norms(R.L):{},svc:R.svc,a:R.a,b:R.b,planMin:PLN.planMin,days:PLN.days,cur:R.m,prev:window.CMP&&CMP.on()?gather(C,CMP.prevSpan(C.p,R.a,R.b)).m:0,grid:g})):'';
  document.querySelectorAll('[data-crp]').forEach(b=>{const on=b.dataset.crp==C.p;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}

XZ.cr=()=>{const ch=choices();
  if(!ch.length){XT.show(['invoice','Отчёт клиенту'],'<div class="xemp">Добавьте проект с клиентом в разделе «Проекты», и здесь появится отчёт.</div>');return}
  const C=XZ._cr=XZ._cr||{};
  if(!ch.some(x=>x[0]==C.w))C.w=ch[0][0];
  C.p=C.p||'7';C.t=C.t??(+(S.set.crt??1));
  XT.show(['invoice','Отчёт клиенту'],
    `<label class="xn" for="crw">Клиент или проект</label><select id="crw" class="xin" data-crw>${ch.map(([v,l])=>`<option value="${esc(v)}"${v==C.w?' selected':''}>${esc(l)}</option>`).join('')}</select>`+
    `<div class="xn" id="crpl">Период</div><div class="xc2" role="group" aria-labelledby="crpl">${PER.map(([k,l])=>`<button type="button" data-crp="${k}" aria-pressed="${k==C.p}" class="${k==C.p?'on':''}">${l}</button>`).join('')}</div>`+
    `<label class="xn" for="crt">Шаблон</label><select id="crt" class="xin" data-crt>${TPL.map((l,i)=>`<option value="${i}"${i==C.t?' selected':''}>${l}</option>`).join('')}</select>`+
    `<div id="zin"></div><div id="zhm"></div><textarea id="zc2" class="xsta" rows="12" aria-label="Текст отчёта"></textarea>`+
    `<button type="button" class="xpri" data-crc>Копировать текст</button>`+(window.CSV&&CSV.on()?`<button type="button" class="xpri" data-crx style="margin-top:8px;min-height:44px">Скачать таблицу CSV (Excel, Google Таблицы)</button>`:'')+(window.PRN&&PRN.on()?`<button type="button" class="xpri" data-crpr style="margin-top:8px;min-height:44px">Печать или PDF (лист A4)</button>`:''));
  paint()};

document.addEventListener('change',ev=>{const t=ev.target;if(!XZ._cr)return;
  if(t.matches&&t.matches('[data-crw]')){XZ._cr.w=t.value;paint()}
  else if(t.matches&&t.matches('[data-crt]')){XZ._cr.t=+t.value;paint()}});
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-crp],[data-crc],[data-crx]');if(!b||!XZ._cr)return;
  if(b.dataset.crx!==undefined){const R=gather(XZ._cr);if(!R.rows.length){toast('За этот период нет отработанных часов',1);return}
    dl2(CSV.name(XZ._cr.w,R.a,R.b),CSV.build(R.rows),'text/csv;charset=utf-8');toast('Таблица скачана',1);return}
  if(b.dataset.crp){XZ._cr.p=b.dataset.crp;paint();return}
  const ta=document.getElementById('zc2');if(!ta)return;
  const done=()=>toast('Скопировано',1);
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(done,()=>{ta.select();document.execCommand('copy');done()});
  else{ta.select();document.execCommand('copy');done()}});
})();
