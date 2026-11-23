/* v2.9 (часть 1): окно проекта (G15: клиент N19, пауза, бюджет, нормы по услугам N22),
   финансы проекта (G17, по умолчанию скрыто: S.set.fin), итог архива (G18).
   Новые поля проекта необязательны (миграция не нужна): p.cl клиент, p.ps пауза (1),
   p.bud бюджет ₽, p.norm {услуга: часов в неделю}. */
(()=>{
const $=id=>document.getElementById(id),V=id=>($(id)||{}).value||'';
const finOn=()=>S.set.fin==1,normOn=()=>S.set.svn!==0;
/* G17: часы текущей недели/месяца — отработано и запланировано (как pst, но по периоду) */
function perHrs(p){const t=today(),y=+t.slice(0,4),mo=+t.slice(5,7);const s=p.pper=='m'?t.slice(0,8)+'01':wk(t),e=p.pper=='m'?new Date(Date.UTC(y,mo,0)).toISOString().slice(0,10):add(s,6);
 let done=0,tot=0;for(let d=s;d<=e;d=add(d,1))S.ev.forEach(ev=>{if(ev.proj!=p.id)return;const o=occ(ev,d);if(!o)return;const m=dur(o[0],o[1]);tot+=m;if(d<t||ev.done?.[d])done+=m});return{done,tot}}
const mny=v=>Math.round(v).toLocaleString('ru')+' ₽';
/* G14: папки. p.par — id родительского проекта (пусто = верхний уровень) */
function subIds(id){const out=[id];for(let i=0;i<out.length;i++)(S.proj||[]).forEach(p=>{if(p.par==out[i]&&!out.includes(p.id))out.push(p.id)});return out}
function parOpts(p){const bad=p?subIds(p.id):[];return '<option value="">Без папки (верхний уровень)</option>'+(S.proj||[]).filter(x=>!bad.includes(x.id)&&!x.arch).map(x=>`<option value="${x.id}"${p&&p.par==x.id?' selected':''}>${esc(x.t)}</option>`).join('')}
function safePar(self,par){if(!par||!PJ(par))return '';return (self&&subIds(self).includes(par))?'':par}
const PCOL=['#2f6bff','#7c5cff','#0ea5a4','#16a34a','#f59e0b','#db2777','#e5484d','#64748b'];

/* «SEO 5, Сайты» → услуги и нормы (число в конце — норма ч/нед) */
function parseSvc(s){const svc=[],norm={};String(s||'').split(',').forEach(x=>{let t=x.trim().replace(/['"]/g,'');if(!t)return;let n=0;const m=t.match(/^(.*?)\s+(\d+(?:[.,]\d+)?)$/);if(m&&m[1]){t=m[1].trim();n=+m[2].replace(',','.')}if(!svc.includes(t))svc.push(t);if(n>0)norm[t]=n});return{svc,norm}}

/* Часы по услугам за текущую неделю (без привычек и весь-день) */
function weekSvc(p){const w=wk(today()),r={};for(let i=0;i<7;i++){const d=add(w,i);S.ev.forEach(e=>{if(e.proj!=p.id||e.kind=='habit'||e.ad)return;const o=occ(e,d);if(o){const k=e.svc||'Без услуги';r[k]=(r[k]||0)+dur(o[0],o[1])}})}return r}

const PE=window.PE;
PE.open=id=>{const p=id?PJ(id):null;if(id&&!p)return;PE.id=id||'';PE.c=p?p.c:PCOL[(S.proj||[]).length%PCOL.length];
 const svc=p?(p.svc||[]).map(s=>p.norm&&p.norm[s]?s+' '+p.norm[s]:s).join(', '):'';
 const col=c=>`<button type="button" data-pe="col" data-c="${c}" aria-label="Цвет ${c}" class="pe-col" style="background:${c};border:3px solid ${c==PE.c?'var(--tx)':'transparent'}"></button>`;
 XT.show(p?'Проект: '+p.t:'Новый проект',`<input id="zj1" class="xin" placeholder="Название (например, ДомНОВ)" value="${esc(p?p.t:'')}" aria-label="Название проекта">`+
 `<div class="xn">Цвет</div><div class="xc2" id="zjc">${PCOL.map(col).join('')}</div>`+
 `<div class="xn">Клиент</div><input id="zcl" class="xin" placeholder="Например, ООО «Ромашка»" value="${esc(p?.cl||'')}">`+`<div class="xn">Папка (внутри какого проекта)</div><select id="zpar" class="xin">${parOpts(p)}</select>`+
 `<div class="xnr"><div style="flex:1"><div class="xn">План часов</div><input id="zj2" class="xin" type="number" min="0" step="1" value="${p&&p.plan?p.plan:''}" placeholder="0 = без плана"><select id="zpp" class="xin" style="margin-top:6px" aria-label="План на период"><option value="">на весь проект</option><option value="w"${p&&p.pper=='w'?' selected':''}>в неделю</option><option value="m"${p&&p.pper=='m'?' selected':''}>в месяц</option></select></div><div style="flex:1"><div class="xn">Ставка, ₽/час</div><input id="zj3" class="xin" type="number" min="0" step="50" value="${p&&p.rate?p.rate:''}" placeholder="для счёта"></div></div>`+
 `<div class="xnr"><div style="flex:1"><div class="xn">Бюджет, ₽</div><input id="zbud" class="xin" type="number" min="0" step="1000" value="${p&&p.bud?p.bud:''}" placeholder="необязательно"></div><div style="flex:1"><div class="xn">Статус</div><label class="xtg" style="display:flex;align-items:center;gap:8px;min-height:44px"><input type="checkbox" id="zps"${p&&p.ps?' checked':''}> На паузе</label></div></div>`+
 `<div class="xn">Услуги и нормы, ч в неделю (через запятую, например: SEO 5, Сайты 10)</div><input id="zj4" class="xin" value="${esc(svc)}" placeholder="SEO 5, Сайты 10, Реклама">`+
 `<div class="xn">Заметки проекта</div><textarea id="znt" class="xin" rows="4" placeholder="Ссылки, договорённости, важное по проекту">${esc(p?.nt||'')}</textarea>`+
 `<div class="xn">Результат (что получилось, для архива)</div><textarea id="zres" class="xin" rows="2" placeholder="Например: сайт запущен, позиции выросли">${esc(p?.res||'')}</textarea>`+
 `<div class="xc2" style="margin-top:12px"><button data-pe="save">Сохранить</button>${p?`<button data-pe="arch">${p.arch?'Вернуть из архива':'В архив'}</button><button data-pe="del">Удалить</button>`:''}</div>`)};

PE.col=c=>{PE.c=c;document.querySelectorAll('#zjc [data-c]').forEach(x=>{x.style.borderColor=x.dataset.c==c?'var(--tx)':'transparent'})};

PE.save=()=>{const t=V('zj1').trim().replace(/['"]/g,'');if(!t){$('zj1').focus();return}
 const{svc,norm}=parseSvc(V('zj4'));
 const o={t,c:PE.c,cl:V('zcl').trim().replace(/['"]/g,''),res:(V('zres')||'').trim().slice(0,500),nt:(V('znt')||'').trim().slice(0,3000),par:safePar(PE.id,V('zpar')),plan:+V('zj2')||0,pper:V('zpp')||'',rate:+V('zj3')||0,bud:+V('zbud')||0,ps:$('zps')&&$('zps').checked?1:0,svc,norm};
 snap();S.proj=S.proj||[];if(PE.id)Object.assign(PJ(PE.id),o);else S.proj.push({id:uid(),...o});
 save();render();XT.close();toast('Проект сохранён',1)};

document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pe]');if(!b)return;const a=b.dataset.pe;
 if(a=='col')PE.col(b.dataset.c);else if(a=='save')PE.save();else if(a=='arch')PE.arch();else if(a=='del')PE.del()});

/* Карточка проекта в календаре: клиент, пауза, финансы (если включены), нормы по услугам */
window.vPH=function(){const p=PJ(S.pf);if(!p)return'';const[w,l]=pst(p),pl=(+p.plan||0)*60,sv=pss(p);
 const head=[p.cl?esc(p.cl):'',p.ps?'⏸ на паузе':''].filter(Boolean).join(' · ');
 const hrs=w/60;
 const pp=p.pper&&p.plan?perHrs(p):null,dl=pp?pp.tot-p.plan*60:0;
 const ppl=pp?`<div class="xm2"><span>${p.pper=='m'?'Месяц':'Неделя'}: отработано <b>${hr(pp.done)}</b>, запланировано <b>${hr(pp.tot)}</b> из ${p.plan} ч · ${dl>0?'дороже плана на <b>'+hr(dl)+'</b>':dl<0?'дешевле плана на <b>'+hr(-dl)+'</b>':'точно по плану'}${finOn()&&p.rate&&dl?' ('+mny(Math.abs(dl)/60*p.rate)+')':''}</span></div>`:'';
 const money=finOn()&&p.rate?`<div class="xm2"><span>Выручка <b>${mny(hrs*p.rate)}</b></span>${p.plan?`<span>План <b>${mny(p.plan*p.rate)}</b></span>`:''}${p.bud?`<span>Бюджет осталось <b>${mny(p.bud-hrs*p.rate)}</b></span>`:''}</div>`:'';
 const ws=p.norm&&Object.keys(p.norm).length&&normOn()?weekSvc(p):null;
 const nb=ws?`<div class="xm2" style="flex-direction:column;align-items:stretch">${Object.entries(p.norm).map(([k,n])=>{const h=(ws[k]||0)/60,over=h>n;return `<div><span>${esc(k)}: <b>${hr(ws[k]||0)}</b> из ${n} ч в неделю${over?' · <b style="color:#e5484d">перерасход</b>':''}</span><div class="pb"><i style="width:${Math.min(100,h/n*100)}%;${over?'background:#e5484d':''}"></i></div></div>`}).join('')}</div>`:'';
 return `<div class="ph"><div><b>${esc(p.t)}</b>${head?` <span>${head}</span>`:''}<span>Отработано ${hr(w)}${pl?' · по плану осталось '+hr(Math.max(0,pl-w))+' из '+hr(pl):' · запланировано ещё '+hr(l)}</span></div>${pl?`<div class="pb"><i style="width:${Math.min(100,w/pl*100)}%"></i></div>`:''}${money}${ppl}${nb}<div class="pills">${(p.svc||[]).map(v=>`<button class="pl ${S.sf==v?'on':''}" onclick="sfs('${v}')">${esc(v)} · ${hr(sv[v]||0)}</button>`).join('')}<button class="lnk" onclick="pedit('${p.id}')">Настроить проект</button><button class="lnk" onclick="pfs('${p.id}')">Показать всё</button></div></div>`};

/* Итог архива: сверху списка архива — сумма часов по завершённым проектам (G18, часть 1) */
window.vPWrap=vP0=>function(){const h=vP0();if(!HUB.st.arch)return h;const A=(S.proj||[]).filter(p=>p.arch);if(!A.length)return h;
 let tot=0,rev=0;A.forEach(p=>{const[w]=pst(p);tot+=w;rev+=w/60*(p.rate||0)});
 return `<div class="xk" style="--c:var(--ac)"><div class="xtt"><b>Итог архива</b><span style="color:var(--mut)">${A.length} проектов</span></div><div class="xm2"><span>часов <b>${hr(tot)}</b></span>${finOn()&&rev?`<span>выручка <b>${mny(rev)}</b></span>`:''}</div></div>`+h};
})();
