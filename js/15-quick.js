// v2.7: быстрый ввод 2.0 (#проект @тема !! ~30м, подсветка, история, подсказки названий) и секции панели этапа
(()=>{
const Q=s=>document.querySelector(s),on=(k,d)=>(S.set[k]??d);
const toM=s=>+s.slice(0,2)*60+ +s.slice(3,5),fm=m=>{m=Math.max(0,Math.min(1439,m));return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
let qo={};
const hist=()=>{try{return JSON.parse(localStorage.igqh||'[]')}catch(e){return[]}};
const hpush=t=>{try{localStorage.igqh=JSON.stringify([t,...hist().filter(x=>x!=t)].slice(0,8))}catch(e){}};
const pick=(list,w)=>{w=w.toLowerCase();return list.find(x=>x.toLowerCase()==w)||list.find(x=>x.toLowerCase().startsWith(w))};
function qparse(t){const r={pri:0};
 t=t.replace(/(^|\s)#([\p{L}\d_-]+)/u,(m,a,w)=>{const p=(S.proj||[]).find(p=>p.t==pick((S.proj||[]).map(p=>p.t),w));if(p){r.proj=p.id;r.pn=p.t;return a}return m});
 t=t.replace(/(^|\s)@([\p{L}\d_-]+)/u,(m,a,w)=>{const c=pick(Object.keys(S.cats),w);if(c){r.cat=c;return a}return m});
 t=t.replace(/(^|\s)(!{2,3})(?=\s|$)/,(m,a,b)=>{r.pri=b.length-1;return a});
 t=t.replace(/(^|\s)~(\d+(?:[.,]\d+)?)\s*(м|мин|ч|час)?(?=\s|$)/i,(m,a,n,u)=>{n=+n.replace(',','.');const h=u?/^ч/i.test(u):n<10;r.dur=Math.round(h?n*60:n);return a});
 r.text=t.replace(/\s+/g,' ').trim();return r}
function full(){const raw=Q('#ci').value.trim(),k=raw.match(KP),q=qparse(raw.replace(KP,'')),p=nlp(q.text,today());
 if(q.dur&&p.title){p.en=fm(toM(p.st)+q.dur)}
 return{raw,k,q,p,cat:qo.cat??q.cat,proj:qo.proj??q.proj,pri:qo.pri??q.pri}}
const chip=(a,t,c)=>`<button type="button" class="qc" data-qa="${a}" ${c?`style="--c:${c}"`:''} title="${a=='x'?'':'Нажмите, чтобы изменить'}">${t}</button>`;
window.cmdp=function(){const h=Q('#ch');if(!on('qk',1)){const t=Q('#ci').value.trim(),p=nlp(t.replace(KP,''),today());h.textContent=p.title?`${fd(p.date,{weekday:'short',day:'numeric',month:'short'})} · ${p.st}–${p.en} · ${p.title}`:'Введите название, дату и время.';return}
 const f=full(),p=f.p;
 if(!p.title){const H=hist();h.innerHTML='<div class="qh">Дата, время и длительность распознаются сами. <b>#проект</b> <b>@тема</b> <b>!!</b> важность, <b>~30м</b> длительность.</div>'+(H.length?'<div class="qp">'+H.map((x,i)=>`<button type="button" class="pl" data-qh="${i}">${esc(x)}</button>`).join('')+'</div>':'');return}
 const cat=f.cat||S.last&&S.cats[S.last]?f.cat||S.last:Object.keys(S.cats)[0],pr=(S.proj||[]).find(x=>x.id==f.proj);
 let s=`<div class="qp"><span class="qc ro">${fd(p.date,{weekday:'short',day:'numeric',month:'short'})}</span><span class="qc ro">${p.st}–${p.en}</span>`+chip('cat','● '+esc(cat),S.cats[cat])+(pr?chip('proj','# '+esc(pr.t),pr.c):((S.proj||[]).length?chip('proj','# проект'):''))+chip('pri',['обычное','!! важное','!!! самое важное'][f.pri])+(f.k?`<span class="qc ro">${f.k[1].toLowerCase()}</span>`:'')+(p.rep?'<span class="qc ro">↻ повтор</span>':'')+`</div><div class="qt">${esc(p.title)}</div>`;
 const tl=p.title.toLowerCase();
 if(p.title==f.q.text&&tl.length>1){const seen=new Set(),sg=[];for(let i=S.ev.length-1;i>=0&&sg.length<3;i--){const t=S.ev[i].title;if(t&&t.toLowerCase().startsWith(tl)&&t.toLowerCase()!=tl&&!seen.has(t)){seen.add(t);sg.push(t)}}
  if(sg.length)s+='<div class="qp">'+sg.map(x=>`<button type="button" class="pl" data-qs="${esc(x)}">→ ${esc(x)}</button>`).join('')+'</div>'}
 h.innerHTML=s};
window.cmdgo=function(){const f=full(),p=f.p;if(!p.title)return;const raw=f.raw;snap();
 const same=S.ev.slice().reverse().find(e=>e.title==p.title);
 const cat=f.cat||same&&S.cats[same.cat]&&same.cat||(S.last&&S.cats[S.last]?S.last:Object.keys(S.cats)[0]);
 const e={id:uid(),title:p.title,date:p.date,st:p.st,en:p.en,cat,pri:f.pri,tags:[],rep:p.rep||{t:'none',n:1},note:'',loc:'',url:'',chk:[],rem:[],kind:f.k?(f.k[1].toLowerCase()=='задача'?'task':'habit'):'event'};
 const pj=f.proj||(same&&(S.proj||[]).some(x=>x.id==same.proj)?same.proj:'');if(pj)e.proj=pj;
 S.ev.push(e);nid=e.id;cur=p.date;hpush(raw);Q('#cmd').hidden=true;save();render();toast('Добавлено')};
const _oc=window.openCmd;window.openCmd=function(){qo={};_oc()};
document.addEventListener('click',ev=>{const b=ev.target.closest('#ch [data-qa],#ch [data-qh],#ch [data-qs]');if(!b)return;const d=b.dataset;
 if(d.qh!=null){Q('#ci').value=hist()[+d.qh]||'';Q('#ci').focus();cmdp();return}
 if(d.qs!=null){Q('#ci').value=d.qs;Q('#ci').focus();cmdp();return}
 const f=full();
 if(d.qa=='cat'){const k=Object.keys(S.cats),c=f.cat||k[0];qo.cat=k[(k.indexOf(c)+1)%k.length]}
 if(d.qa=='proj'){const l=['',...(S.proj||[]).map(p=>p.id)],i=l.indexOf(f.proj||'');qo.proj=l[(i+1)%l.length]}
 if(d.qa=='pri')qo.pri=(f.pri+1)%3;
 cmdp()});
// Секции панели этапа
const SEC={'Шаблоны':0,'Тип':0,'Когда':1,'Тема':1,'Важность':0,'Цель':0,'Проект':0,'Повтор':0,'Дополнительно':0,'Напомнить за':0,'Место и ссылка':0,'Описание':0,'Чек-лист':0};
const filled=n=>{const d=window.dd;if(!d)return 0;return({'Цель':!!d.goal,'Проект':!!d.proj,'Повтор':d.rep&&d.rep.t!='none','Место и ссылка':!!(d.loc||d.url),'Описание':!!d.note,'Чек-лист':!!(d.chk&&d.chk.length),'Напомнить за':!!(d.rem&&d.rem.length),'Важность':d.pri>0,'Дополнительно':!!(d.est||d.val||d.col)})[n]};
const JOIN=/(zoom\.us|meet\.google|teams\.microsoft|teams\.live|t\.me\/|telemost|whereby|webex|skype)/i;
function secs(){const db=Q('#db');if(!db||!on('psec',1))return;const ps=S.set.ps||{};
 db.querySelectorAll(':scope>.ds').forEach(el=>{const l=el.querySelector(':scope>label');if(!l||el.dataset.sec)return;const n=l.textContent.trim();if(!(n in SEC))return;el.dataset.sec=n;
  const open=ps[n]!=null?!!ps[n]:(SEC[n]||filled(n));
  l.setAttribute('role','button');l.tabIndex=0;l.dataset.act='sec';l.setAttribute('aria-expanded',open);el.classList.toggle('sc',!open);
  let sm=[...el.querySelectorAll('.pl.on,.seg .on')].map(x=>x.textContent.trim()).filter(Boolean);const se=el.querySelector('select');if(se&&se.value!='none')sm.push(se.selectedOptions[0].textContent.trim());
  if(n=='Место и ссылка'){const v=[...el.querySelectorAll('input')].map(i=>i.value).filter(Boolean);sm=v}
  if(sm.length){const s=document.createElement('span');s.className='qsum';s.textContent=sm.slice(0,3).join(', ');l.appendChild(s)}
  if(n=='Место и ссылка'){const u=window.dd&&window.dd.url;if(u&&JOIN.test(u)&&on('join',1)){const a=document.createElement('a');a.className='pl on qjoin';a.href=/^https?:/i.test(u)?u:'https://'+u;a.target='_blank';a.rel='noopener';a.textContent='Присоединиться';el.appendChild(a)}}})}
function toggleSec(l){const el=l.parentElement,n=el.dataset.sec,o=el.classList.contains('sc');el.classList.toggle('sc',!o);l.setAttribute('aria-expanded',o);S.set.ps={...(S.set.ps||{}),[n]:o?1:0};save()}
document.addEventListener('click',e=>{const l=e.target.closest('#db label[data-act=sec]');if(l)toggleSec(l)});
document.addEventListener('keydown',e=>{const l=e.target.closest&&e.target.closest('#db label[data-act=sec]');if(l&&(e.key=='Enter'||e.key==' ')){e.preventDefault();toggleSec(l)}});
const db=Q('#db');if(db)new MutationObserver(secs).observe(db,{childList:true});
// Настройки
const _es=window.editSet;window.editSet=()=>(_es?_es():'')+sw('Подсказки быстрого ввода','qk',[[1,'Вкл'],[0,'Выкл']],1)+sw('Секции в панели этапа','psec',[[1,'Вкл'],[0,'Выкл']],1)+sw('Кнопка «Присоединиться»','join',[[1,'Вкл'],[0,'Выкл']],1);
})();

// O04: кнопка «Сейчас» в панели этапа — начало на текущем времени (длительность сохраняется)
function nowSt(){const n=tzNow(),m=n.getUTCHours()*60+n.getUTCMinutes(),st=Math.min(1435,Math.round(m/5)*5),u=(tm(dd.en)-tm(dd.st)+1440)%1440||60;dd.st=fm(st);dd.en=fm(Math.min(1439,st+u));if(dd.date!=today())dd.date=today();dre()}
