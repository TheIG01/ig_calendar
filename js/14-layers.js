// v2.6: слои, раскраска, конфликты, рабочие часы, свободные окна, вторая шкала, стрелки по этапам, раскрытие коротких этапов
(()=>{
const Q=s=>document.querySelector(s),QA=s=>[...document.querySelectorAll(s)],g=(k,d)=>(S.set[k]??d);
const hid=()=>S.set.lyOff||[];
const evOf=id=>S.ev.find(v=>v.id==id);
// Скрытые слои учитываются в okf (00-core.js)
// --- Раскраска (E15) ---
const PRC=['','#f59e0b','#ef4444','#b91c1c'];
function colorOf(o,d){const m=g('cm','cat');
 if(m=='pri')return PRC[o.pri||0]||'#8a93a6';
 if(m=='status'){const t=today();if(o.done?.[d])return '#12a150';if(o.kind&&o.kind!='event'&&d<t)return '#ef4444';return o.kind&&o.kind!='event'?'#f59e0b':'#2f6bff'}
 if(m=='proj'){const p=(S.proj||[]).find(x=>x.id==o.proj);return p?.col||p?.c||(p?'#8b5cf6':'#8a93a6')}
 return null}
function paint(){const m=g('cm','cat');if(m=='cat')return;
 QA('.ev[data-id],.ch[data-id]').forEach(el=>{const o=evOf(el.dataset.id);if(!o)return;const c=el.closest('[data-d]'),c2=colorOf(o,c?c.dataset.d:cur);if(c2)el.style.setProperty('--c',c2)})}
// --- Конфликты (E14) ---
function conflicts(){const m=g('cf','ev');if(m=='off')return;
 QA('.col').forEach(c=>{const L=[...c.querySelectorAll('.ev[data-id]:not(.ghost)')].map(el=>({el,o:evOf(el.dataset.id),a:tm(el.dataset.s),b:Math.max(tm(el.dataset.e),tm(el.dataset.s)+25)})).filter(x=>x.o&&!x.el.classList.contains('live'));
  L.forEach((x,i)=>{for(let j=i+1;j<L.length;j++){const y=L[j];if(x.a<y.b&&y.a<x.b){const ok=m=='all'||((!x.o.kind||x.o.kind=='event')&&(!y.o.kind||y.o.kind=='event'));if(ok){[x,y].forEach(z=>{z.el.classList.add('cfl');z.el.title+=' · ⚠ пересекается с другим этапом'})}}}})})}
// --- Рабочие часы и свободные окна (E10, E13) ---
const WH=()=>[g('wh1',9)*60,g('wh2',18)*60];
const FR=()=>!!window.__fr;
function busy(d){return evs(d).filter(e=>!e.done?.[d]||1).map(e=>[tm(e.st),Math.max(tm(e.en),tm(e.st)+1)]).sort((a,b)=>a[0]-b[0])}
function gaps(d,min,a0,b0){const B=busy(d),r=[];let p=a0;B.forEach(([s,e])=>{if(s>p&&s-p>=min)r.push([p,Math.min(s,b0)]);p=Math.max(p,e)});if(b0-p>=min)r.push([p,b0]);return r.filter(x=>x[1]-x[0]>=min)}
function zones(){const wh=g('wz',1),fr=FR(),T=m=>m*HH/60;if(!wh&&!fr)return;const[a,b]=WH();
 QA('.col[data-d]').forEach(c=>{const d=c.dataset.d;let h='';
  if(wh){h+=`<div class="qz" style="top:0;height:${T(a)}px"></div><div class="qz" style="top:${T(b)}px;height:${T(1440-b)}px"></div>`}
  if(fr){const mn=g('fmin',30),n=tzNow(),now=d==today()?n.getUTCHours()*60+n.getUTCMinutes():0;gaps(d,mn,Math.max(a,now),b).forEach(([s,e])=>{h+=`<button class="fw" data-fw="${d}|${s}|${e}" style="top:${T(s)}px;height:${T(e-s)}px" aria-label="Свободно ${hm(s)}–${hm(e)}, создать этап">+ ${hm(s)}–${hm(e)}</button>`})}
  c.insertAdjacentHTML('afterbegin',h)})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-fw]');if(!b)return;e.stopPropagation();const[d,s,en]=b.dataset.fw.split('|').map((v,i)=>i?+v:v),du=Math.min(en-s,DD());openEv({date:d,st:hm(s),en:fm(s+du)})},true);
function findTime(){ui.prompt('Найти время','Сколько минут нужно?',String(g('fmin',30)>30?g('fmin',30):60),{num:1,ok:'Найти'}).then(v=>{const n=Math.max(5,Math.min(600,parseInt(v,10)||0));if(!v)return;const[a,b]=WH(),t=today(),nw=tzNow(),nm=nw.getUTCHours()*60+nw.getUTCMinutes();
 for(let i=0;i<30;i++){const d=add(t,i),G=gaps(d,n,Math.max(a,i?0:nm),b);if(G.length){cur=d;view=view=='month'||view=='year'||view=='agenda'?'week':view;vr();openEv({date:d,st:hm(G[0][0]),en:fm(G[0][0]+n)});toast('Ближайшее окно: '+fd(d,{day:'numeric',month:'short'})+', '+hm(G[0][0]),1);return}}
 toast('В ближайшие 30 дней окна на '+n+' мин не нашлось',1)})}
// --- Вторая шкала времени (E09) ---
function tz2(){const z=g('tz2','');if(!z||view=='month'||view=='year'||view=='agenda')return;let f;try{f=new Intl.DateTimeFormat('ru',{timeZone:z,hour:'2-digit',minute:'2-digit',hour12:false})}catch(_){return}
 const d=view=='day'?cur:wk(cur);QA('.hrs>div').forEach((el,h)=>{const t=P(d).getTime()+(h-S.set.tz)*36e5;el.querySelector('span')?.insertAdjacentHTML('afterend','<em class="h2" title="'+z+'">'+f.format(new Date(t))+'</em>')})}
// --- Панель слоёв (U05) ---
function bar(){QA('#lyb').forEach(x=>x.remove());if(!g('ly',1)||['year','agenda'].includes(view))return;const h=Q('.bar');if(!h)return;const off=hid();
 const cs=Object.entries(S.cats).map(([n,c])=>`<button class="pl lyc ${off.includes(n)?'off':'on'}" style="--c:${c}" data-ly="${esc(n)}" aria-pressed="${!off.includes(n)}" aria-label="Слой «${esc(n)}»: ${off.includes(n)?'скрыт':'показан'}">${esc(n)}</button>`).join('');
 h.insertAdjacentHTML('afterend',`<div class="pills" id="lyb" role="group" aria-label="Слои">${cs}<button class="pl" data-ly-pri aria-pressed="${!!window.__pr}" title="Показать только важные">★ Важные</button><button class="pl" data-fr aria-pressed="${FR()}" title="Подсветить свободное время">◌ Окна</button><button class="pl" data-ft title="Найти время для задачи">⏱ Найти время</button></div>`)}
document.addEventListener('click',e=>{const t=e.target;let b;
 if(b=t.closest('[data-ly]')){const n=b.dataset.ly,o=hid().slice(),i=o.indexOf(n);i<0?o.push(n):o.splice(i,1);S.set.lyOff=o;save();render()}
 else if(t.closest('[data-ly-pri]')){window.__pr=!window.__pr;render()}
 else if(t.closest('[data-fr]')){window.__fr=!window.__fr;render()}
 else if(t.closest('[data-ft]')){findTime()}});
// «Только важные» — через DOM
function prio(){if(!window.__pr)return;QA('.ev[data-id],.ch[data-id]').forEach(el=>{const o=evOf(el.dataset.id);if(o&&!(o.pri>0))el.style.display='none'})}
// --- Раскрытие коротких этапов (O01) ---
document.addEventListener('click',e=>{if(!g('xs',1)||!matchMedia('(pointer:coarse)').matches)return;const el=e.target.closest('.ev.sm[data-id]');if(!el||e.target.closest('input,.cb'))return;
 if(!el.classList.contains('xp')){e.stopPropagation();e.preventDefault();QA('.ev.xp').forEach(x=>x.classList.remove('xp'));el.classList.add('xp')}},true);
// --- Стрелки по этапам (E04) ---
function mkFocusable(){if(!g('kb',1))return;QA('.ev[data-id]:not(.ghost)').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',el.title||'Этап')})}
function near(el,dx,dy){const L=QA('.ev[data-id]:not(.ghost)').filter(x=>x.offsetParent&&x.style.display!='none'),r=el.getBoundingClientRect();let best=null,bs=1e9;
 L.forEach(x=>{if(x==el)return;const q=x.getBoundingClientRect(),cx=q.left+q.width/2-(r.left+r.width/2),cy=q.top-r.top;
  if(dy&&Math.abs(cx)<r.width*0.8&&cy*dy>0&&Math.abs(cy)<bs){bs=Math.abs(cy);best=x}
  if(dx&&cx*dx>r.width*0.3){const s=Math.abs(cx)+Math.abs(cy)*2;if(s<bs){bs=s;best=x}}});return best}
document.addEventListener('keydown',e=>{if(!g('kb',1)||e.ctrlKey||e.metaKey||e.altKey)return;const el=e.target.closest?.('.ev[data-id]');if(!el||e.target.closest('input,textarea'))return;const k=e.key,id=el.dataset.id;
 const mv={ArrowDown:[0,1],ArrowUp:[0,-1],ArrowRight:[1,0],ArrowLeft:[-1,0]}[k];
 if(mv){e.preventDefault();const n=near(el,mv[0],mv[1]);n?n.focus():0}
 else if(k=='Enter'||k=='e'||k=='E'||k=='у'||k=='У'){e.preventDefault();openEv(id)}
 else if(k=='d'||k=='D'||k=='в'||k=='В'){const o=evOf(id);if(o?.kind&&o.kind!='event'){e.preventDefault();const c=el.closest('[data-d]');tdone({stopPropagation(){},clientX:innerWidth/2,clientY:innerHeight/2},id,c?c.dataset.d:cur)}}
 else if(k=='Delete'||k=='Backspace'){const o=evOf(id);if(o){e.preventDefault();ub=JSON.stringify(S.ev);trashPut([o]);S.ev=S.ev.filter(x=>x.id!=id);save();render();toast('Этап удалён')}}});
// --- Подключение к render ---
const _r=window.render;
window.render=function(){const r=_r.apply(this,arguments);try{bar();zones();tz2();paint();conflicts();prio();mkFocusable()}catch(err){console.error('layers',err)}return r};
// --- Настройки ---
const _es=window.editSet;
window.layerSet=()=>{const t=(l,k,d)=>sw(l,k,[[1,'Вкл'],[0,'Выкл']],d),n=(l,k,d,a,b)=>`<div class="srow"><span>${l}</span><input type="number" min="${a}" max="${b}" value="${g(k,d)}" onchange="sv2('${k}',+this.value)" style="width:70px"></div>`;
 return t('Панель слоёв над календарём','ly',1)+sw('Раскраска этапов','cm',[['cat','По теме'],['pri','По важности'],['status','По статусу'],['proj','По проекту']],'cat')
 +sw('Метка ⚠ при пересечении','cf',[['ev','Встречи'],['all','Любые'],['off','Выкл']],'ev')
 +t('Серые «тихие зоны» вне рабочих часов','wz',1)+n('Рабочие часы: с','wh1',9,0,23)+n('Рабочие часы: до','wh2',18,1,24)+n('Свободные окна от (мин)','fmin',30,5,240)
 +`<div class="srow"><span>Вторая шкала времени (пояс, напр. Europe/Berlin; пусто — выкл)</span><input value="${esc(g('tz2',''))}" list="tzl" onchange="sv2('tz2',this.value.trim())" style="width:190px"><datalist id="tzl">${(Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):[]).map(z=>'<option value="'+z+'">').join('')}</datalist></div>`
 +t('Раскрывать короткие этапы по касанию (телефон)','xs',1)+t('Стрелки и клавиши на этапах (Enter, D, Del)','kb',1)};
if(typeof _es=='function')window.editSet=()=>_es()+layerSet();
})();
