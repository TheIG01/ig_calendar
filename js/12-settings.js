// v2.4: центр настроек (поиск, пояснения «?», сброс), профили интерфейса, экспорт/импорт темы.
// Новые ключи лежат внутри S.set (добавочно, миграция не нужна): prof, cprof, profBak, eve, mor.
(()=>{
const q=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Умолчания и пояснения. Ключ = имя в S.set
const DF={theme:'light',ac:'#2f6bff',fs:15,r:12,font:'inter',hh:44,ws:1,sn:15,dd:60,dv:null,anim:1,m:'full',fx:1,snd:0,eve:20,mor:7,eco:0};
const HELP={theme:'Цвета всего сервиса. «По времени суток» — днём светлая, вечером «Сон».',ac:'Главный цвет кнопок и выделений. Можно любой: палитра или HEX.',fs:'Размер текста во всём интерфейсе (12–20).',r:'Насколько скруглены карточки и кнопки (0–24).',font:'Шрифт интерфейса.',hh:'Высота часа в сетке: меньше — виден весь день, больше — удобнее тянуть.',ws:'С какого дня начинается неделя.',sn:'К какой минуте прилипает этап, когда вы тянете его мышью.',dd:'Сколько длится новый этап, созданный кликом.',dv:'Какой вид открывается при входе.',anim:'Плавные переходы между экранами. Выключите, если мешают.',m:'Анимации интерфейса целиком.',fx:'Фейерверк, когда вы отмечаете дело выполненным.',snd:'Тихий звук при выполнении.',eve:'С этого часа включается тема «Сон».',mor:'С этого часа возвращается светлая тема.',eco:'Реже обращаться к серверу — экономит батарею и трафик.'};
const dflt=k=>k=='dv'?(innerWidth<800?'day':'week'):DF[k];
const TH=['light','dark','sleep','study','auto','time'],FN=['inter','manrope','system','serif'];
// Ключи, которые входят в профиль
const PK=['theme','ac','fs','r','font','hh','ws','sn','dd','dv','anim','m','fx','snd','blk','hide'];
const BL=(...on)=>{const o={};['tasks','hab','time','proj','goals','diary'].forEach(k=>o[k]=on.includes(k)?1:0);return o};
const PROF={
 min:{n:'Минимализм',d:'Только задачи, без шума и эффектов',s:{hh:44,fx:0,snd:0,r:14,blk:BL('tasks'),hide:['tags','goal']}},
 focus:{n:'Фокус',d:'День крупно, задачи и время',s:{dv:'day',hh:56,fx:0,snd:0,blk:BL('tasks','time'),hide:['tags']}},
 plan:{n:'Планирование недели',d:'Неделя компактно, все блоки',s:{dv:'week',hh:36,blk:BL('tasks','hab','time','proj','goals'),hide:[]}},
 agency:{n:'Агентство',d:'Неделя, проекты и цели',s:{dv:'week',hh:44,fx:0,blk:BL('tasks','time','proj','goals'),hide:[]}}
};
const cp=()=>S.set.cprof=S.set.cprof||[];
const allProf=()=>[...Object.entries(PROF).map(([id,p])=>({id,n:p.n,d:p.d,s:p.s})),...cp().map(p=>({id:p.id,n:p.n,d:'Ваш профиль',s:p.s,my:1}))];
const snap=()=>{const o={};PK.forEach(k=>{if(S.set[k]!==undefined)o[k]=JSON.parse(JSON.stringify(S.set[k]))});return o};
const apply=(id)=>{const p=allProf().find(x=>x.id==id);if(!p)return;
 S.set.profBak={set:snap(),id:S.set.prof||''};
 PK.forEach(k=>{if(k in p.s)S.set[k]=JSON.parse(JSON.stringify(p.s[k]));else if(p.my)delete S.set[k]});
 S.set.prof=id;save();if(window.uiApply)uiApply();render();sref();
 toast('Профиль «'+p.n+'» включён <button data-act="prof-undo">Вернуть как было</button>',1)};
const undoProf=()=>{const b=S.set.profBak;if(!b)return;PK.forEach(k=>delete S.set[k]);Object.assign(S.set,b.set);S.set.prof=b.id;delete S.set.profBak;save();if(window.uiApply)uiApply();render();sref()};
async function saveProf(){const n=await ui.prompt('Свой профиль','Название профиля','',{ok:'Сохранить',hint:'Например: «Утро»'});if(!n||!n.trim())return;
 const id='c'+Date.now().toString(36);cp().push({id,n:n.trim().slice(0,30),s:snap()});S.set.prof=id;save();render();sref()}
async function delProf(id){const p=cp().find(x=>x.id==id);if(!p||!await ui.confirm('Удалить профиль «'+p.n+'»? Настройки интерфейса не изменятся.','Удалить'))return;
 S.set.cprof=cp().filter(x=>x.id!=id);if(S.set.prof==id)S.set.prof='';save();sref()}
// Меню профилей (кнопка в шапке)
async function menu(){const a=allProf(),cur=S.set.prof;
 const v=await ui.choose('Профили интерфейса','Один клик меняет блоки, плотность и эффекты. Тема и цвета остаются вашими.',[...a.map(p=>({t:(p.id==cur?'✓ ':'')+p.n+' — '+p.d,v:p.id})),{t:'Сохранить текущий вид как профиль…',v:'+save'},{t:'Закрыть',v:null}]);
 if(v=='+save')saveProf();else if(v)apply(v)}
// Тема: экспорт/импорт с проверкой
const THK=['theme','ac','fs','r','font','hh','eve','mor'];
const thVal=o=>{if(!o||typeof o!='object'||o.igTheme!==1)return null;const r={},n=(x,a,b)=>Number.isFinite(+x)&&+x>=a&&+x<=b?+x:null;
 if(TH.includes(o.theme))r.theme=o.theme;if(/^#[0-9a-f]{6}$/i.test(o.ac||''))r.ac=o.ac.toLowerCase();
 for(const[k,a,b]of[['fs',12,20],['r',0,24],['eve',17,23],['mor',4,10]]){const v=n(o[k],a,b);if(v!==null)r[k]=v}
 if(FN.includes(o.font))r.font=o.font;if([36,44,56].includes(+o.hh))r.hh=+o.hh;return Object.keys(r).length?r:null};
window.thVal=thVal;
function expTheme(){const o={igTheme:1};THK.forEach(k=>{if(S.set[k]!==undefined)o[k]=S.set[k]});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:'application/json'}));a.download='ig-theme.json';a.click()}
function impTheme(inp){const f=inp.files[0];inp.value='';if(!f)return;const r=new FileReader();
 r.onload=async()=>{let t=null;try{t=thVal(JSON.parse(r.result))}catch(e){}
  if(!t){ui.confirm('Это не файл темы IG calendar. Ничего не изменено.','Понятно');return}
  if(!await ui.confirm('Применить тему из файла? Поменяются цвета, шрифт и размеры. Расписание и данные не затрагиваются.','Применить'))return;
  S.set.profBak={set:snap(),id:S.set.prof||''};Object.assign(S.set,t);save();render();sref()};r.readAsText(f)}
// Сброс
async function resetKey(k){S.set[k]=dflt(k);if(k=='dv')delete S.set.dv;save();if(window.uiApply)uiApply();render();sref()}
async function resetLook(){if(!await ui.confirm('Вернуть внешний вид и параметры календаря к значениям по умолчанию? Данные, категории и аккаунт не пострадают.','Сбросить'))return;
 S.set.profBak={set:snap(),id:S.set.prof||''};Object.keys(DF).forEach(k=>{if(k!='eco')S.set[k]=dflt(k)});delete S.set.dv;delete S.set.blk;S.set.hide=[];S.set.prof='';save();if(window.uiApply)uiApply();render();sref()}
// Карточка «Внешний вид» (замена прежней)
const seg=(k,o)=>`<div class="seg">${o.map(([v,t])=>`<button class="${(S.set[k]??DF[k])==v?'on':''}" onclick="sv2('${k}','${v}')">${t}</button>`).join('')}</div>`;
const rng=(k,a,b)=>`<input type="range" min="${a}" max="${b}" value="${S.set[k]??DF[k]}" aria-label="${k}" onchange="sv2('${k}',+this.value)" style="width:150px;min-height:32px">`;
window.vLook=()=>{const s=S.set,th=s.theme;
 return `<div class="card"><h3>Внешний вид</h3><div class="srow"><span>Тема</span><select aria-label="Тема" onchange="sv2('theme',this.value)">${[['light','Светлая'],['dark','Тёмная'],['sleep','Сон (тёплая)'],['study','Учёба (зелёная)'],['auto','Как в системе'],['time','По времени суток']].map(([k,v])=>`<option value="${k}" ${th==k?'selected':''}>${v}</option>`).join('')}</select></div>`
 +(th=='time'?`<div class="srow"><span>«Сон» с (час)</span>${seg('eve',[[19,'19'],[20,'20'],[21,'21'],[22,'22']])}</div><div class="srow"><span>Светлая с (час)</span>${seg('mor',[[6,'6'],[7,'7'],[8,'8'],[9,'9']])}</div>`:'')
 +`<div class="srow"><span>Акцент: любой цвет</span><span style="display:flex;gap:8px;align-items:center"><input type="color" aria-label="Выбор цвета" value="${s.ac}" onchange="sv2('ac',this.value)"><input id="hexin" aria-label="HEX цвета" value="${s.ac}" maxlength="7" style="width:92px" data-act="hex-in"></span></div>`
 +`<div class="srow"><span>Размер текста</span>${rng('fs',12,20)}</div><div class="srow"><span>Скругление</span>${rng('r',0,24)}</div>`
 +`<div class="srow" style="display:block"><span>Тема-файл</span><div class="bar"><button data-act="th-exp">Экспорт темы</button><button data-act="th-imp">Импорт темы</button><input type="file" id="thf" accept=".json" hidden></div></div></div>`};
// Верх центра настроек: поиск, профили, сброс
window.setTop=()=>{const cur=S.set.prof,a=allProf();
 return `<div class="card" id="stop"><input id="sq" type="search" placeholder="Найти настройку…" aria-label="Найти настройку" value="${E(window._sq||'')}" style="width:100%"><div id="sqe" class="xn" hidden>Ничего не найдено. Попробуйте другое слово.</div>
 <div class="srow" style="display:block"><span>Профиль интерфейса</span><div class="pills">${a.map(p=>`<button class="pl ${p.id==cur?'on':''}" data-act="prof-set" data-id="${p.id}" title="${E(p.d)}">${E(p.n)}</button>${p.my?`<button class="pl" data-act="prof-del" data-id="${p.id}" aria-label="Удалить профиль ${E(p.n)}">✕</button>`:''}`).join('')}<button class="pl" data-act="prof-save">＋ Сохранить свой</button></div></div>
 <div class="bar"><button data-act="reset-look">Сбросить внешний вид и календарь</button></div></div>`};
// После отрисовки: «?» и «↺» у строк, поиск
const keyOf=r=>{const m=(r.innerHTML.match(/sv2\('(\w+)'/)||[])[1];return m};
function deco(){const root=q('#db');if(!root)return;
 root.querySelectorAll('.srow').forEach(r=>{if(r.querySelector('.hq'))return;const k=keyOf(r);if(!k||!(k in DF)&&!HELP[k])return;
  const sp=r.querySelector('span'),cur=S.set[k]??dflt(k),ch=String(cur)!=String(dflt(k));
  if(HELP[k]&&sp){const b=document.createElement('button');b.className='hq';b.type='button';b.dataset.act='help';b.setAttribute('aria-label','Что это? '+sp.textContent);b.textContent='?';sp.append(' ',b);
   const h=document.createElement('small');h.className='hh2';h.hidden=true;h.textContent=HELP[k]+(DF[k]!==undefined?' По умолчанию: '+dfLabel(k)+'.':'');sp.after(h);r.dataset.help=HELP[k]}
  if(ch&&k in DF){const b=document.createElement('button');b.className='hq rs';b.type='button';b.dataset.act='reset-key';b.dataset.k=k;b.setAttribute('aria-label','Сбросить к умолчанию');b.title='Сбросить к умолчанию';b.textContent='↺';r.append(b)}});
 filt()}
const dfLabel=k=>{const v=dflt(k),m={hh:{36:'компактно',44:'обычно',56:'просторно'},anim:{1:'вкл',0:'выкл'},fx:{1:'да',0:'нет'},snd:{1:'да',0:'нет'},ws:{1:'с понедельника',0:'с воскресенья'},m:{full:'плавные',off:'выключены'}};return(m[k]&&m[k][v])||String(v)};
function filt(){const root=q('#db'),inp=q('#sq');if(!root||!inp)return;const t=(window._sq||'').trim().toLowerCase(),cards=[...root.querySelectorAll('.card')].filter(c=>c.id!='stop');let any=0;
 cards.forEach(c=>{const kids=[...c.children].filter(x=>x.tagName!='H3'),h=(c.querySelector('h3')||{}).textContent||'';
  if(!t){c.hidden=false;kids.forEach(x=>x.hidden=false);return}
  const hit=h.toLowerCase().includes(t);let n=0;
  kids.forEach(x=>{const m=hit||(x.textContent+' '+(x.dataset.help||'')).toLowerCase().includes(t);x.hidden=!m;if(m)n++});
  c.hidden=!(hit||n);if(!c.hidden)any++});
 const e=q('#sqe');if(e)e.hidden=!t||any>0;
 root.querySelectorAll('.hh2').forEach(x=>{if(t&&!x.closest('.srow').hidden&&x.closest('.srow').dataset.help.toLowerCase().includes(t))x.hidden=false})}
window.setPost=deco;
// Делегирование кликов
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const d=a.dataset;
 const m={'prof':menu,'prof-undo':()=>{undoProf();q('#toast').classList.remove('on')},'prof-set':()=>apply(d.id),'prof-del':()=>delProf(d.id),'prof-save':saveProf,'reset-look':resetLook,'reset-key':()=>resetKey(d.k),'th-exp':expTheme,'th-imp':()=>q('#thf').click(),
 'help':()=>{const h=a.closest('.srow').querySelector('.hh2');if(h)h.hidden=!h.hidden}}[d.act];if(m){e.preventDefault();m()}});
document.addEventListener('input',e=>{if(e.target.id=='sq'){window._sq=e.target.value;filt()}});
document.addEventListener('change',e=>{if(e.target.id=='thf')impTheme(e.target);
 if(e.target.id=='hexin'){let v=e.target.value.trim();if(v[0]!='#')v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v))sv2('ac',v.toLowerCase());else e.target.value=S.set.ac}});
})();
