(()=>{
const H=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),vb=n=>navigator.vibrate&&navigator.vibrate(n);
const SH=document.createElement('div');SH.id='xs';SH.hidden=true;SH.innerHTML='<div class="xsb"></div><div class="xsc"></div>';document.body.appendChild(SH);
SH.firstChild.onclick=()=>SH.hidden=true;
const A=document.createElement('div');A.id='xa';A.hidden=true;document.body.appendChild(A);
const fk=()=>({stopPropagation(){},clientX:innerWidth/2,clientY:innerHeight/2});
function act(id,d){const e=S.ev.find(v=>v.id==id);if(!e)return;const o=occ(e,d)||[e.st,e.en],rp=e.rep&&e.rep.t!='none',dn=e.done?.[d];
SH.lastChild.innerHTML=`<b>${H(e.title||'Без названия')}</b><div class="xn">${o[0]}–${o[1]} · ${d.slice(5)}${rp?' · повтор':''}</div><div class="xsg">`+[['✓',dn?'Не выполнено':'Выполнено','done'],['✎','Изменить','edit'],['Аа','Переименовать','ren'],['!','Важность','pri'],['🎨','Тема','cat'],['📁','Проект','prj'],['🔁','Повтор','rpt'],['🔔','Напомнить','rem'],['📝','Заметка','note'],['⧉','Дублировать','dup'],['⧉1','Копия на завтра','dup1'],['⧉7','Копия через неделю','dup7'],['−15','Раньше 15 мин','s-15'],['+15','Позже 15 мин','s15'],['−1ч','Раньше 1 ч','s-60'],['+1ч','Позже 1 ч','s60'],['−','Короче на 15','l-15'],['+','Длиннее на 15','l15'],rp?['⏭','Пропустить день','skip']:['➡','На завтра','tom'],['🗑','Удалить','del']].map(a=>`<button data-a="${a[2]}"><i>${a[0]}</i><span>${a[1]}</span></button>`).join('')+'</div>';
SH.hidden=false;SH.lastChild.querySelectorAll('button').forEach(b=>b.onclick=()=>run(b.dataset.a,e,d,o))}
function run(a,e,d,o){SH.hidden=true;const s=tm(o[0]),L=dur(o[0],o[1]);
if(a=='edit'){window._xaR=!A.hidden;A.hidden=true;openEv(e.id);return}
if(a=='done'){tdone(fk(),e.id,d);vb(15);if(!A.hidden)ag();return}
if(['ren','pri','cat','prj','rpt','rem','note'].includes(a))return sub(a,e,d,o);
snap();
if(/^s-?\d+$/.test(a)){const n=Math.max(0,Math.min(1440-L,s+ +a.slice(1)));mv(e,d,n,n+L,0)}
else if(a[0]=='l')mv(e,d,s,s+Math.max(15,L+ +a.slice(1)),0);
else if(a=='tom')mv(e,d,s,s+L,1);
else if(a=='skip')e.ex=[...(e.ex||[]),d];
else if(a=='dup'){const c=structuredClone(e);c.id=uid();c.title+=' (копия)';c.done={};S.ev.push(c)}
else if(a=='dup1'||a=='dup7'){const c=structuredClone(e);c.id=uid();c.done={};c.date=add(e.date,a=='dup1'?1:7);S.ev.push(c)}
else if(a=='del'){trashPut([e]);S.ev=S.ev.filter(x=>x.id!=e.id)}
save();render();if(!A.hidden)ag();toast(a=='del'?'Этап удалён':'Готово')}
function menu(t,items){const C=SH.lastChild;C.innerHTML=`<b>${H(t)}</b><div class="xsg" style="margin-top:10px">${items.map((x,i)=>`<button data-i="${i}"><i>${x[2]||''}</i><span>${H(x[0])}</span></button>`).join('')}</div>`;C.querySelectorAll('button').forEach(b=>b.onclick=()=>{snap();items[b.dataset.i][1]();save();render();SH.hidden=true;if(!A.hidden)ag();toast('Готово')});SH.hidden=false}
function ask(t,v,fn){const C=SH.lastChild;C.innerHTML=`<b>${H(t)}</b><textarea id="xsa" rows="3" class="xsta">${H(v)}</textarea><button class="xsg1" id="xso">Сохранить</button>`;SH.hidden=false;const i=C.querySelector('#xsa');setTimeout(()=>i.focus(),60);C.querySelector('#xso').onclick=()=>{snap();fn(i.value.trim());save();render();SH.hidden=true;if(!A.hidden)ag();toast('Готово')}}
function sub(a,e,d,o){const sc=ds=>Object.fromEntries(ds.map(w=>[w,[e.st,e.en]]));
if(a=='ren')return ask('Название',e.title||'',v=>{if(v)e.title=v});
if(a=='note')return ask('Заметка',e.note||'',v=>{e.note=v});
if(a=='pri')return menu('Важность',[['Обычное',()=>{e.pri=0},'○'],['Важное',()=>{e.pri=1},'!'],['Критичное',()=>{e.pri=2},'‼']]);
if(a=='cat')return menu('Тема',Object.keys(S.cats).map(k=>[k,()=>{e.cat=k;S.last=k},'●']));
if(a=='prj')return menu('Проект',[['Без проекта',()=>{e.proj=''},'∅'],...(S.proj||[]).filter(p=>!p.arch).map(p=>[p.t,()=>{e.proj=p.id},'●'])]);
if(a=='rem')return menu('Напомнить за',[['Не напоминать',()=>{e.rem=[]},'🔕'],['В момент начала',()=>{e.rem=[0]},'0'],['5 минут',()=>{e.rem=[5]},'5'],['15 минут',()=>{e.rem=[15]},'15'],['1 час',()=>{e.rem=[60]},'1ч'],['1 день',()=>{e.rem=[1440]},'1д']]);
if(a=='rpt')return menu('Повтор',[['Не повторять',()=>{e.rep={t:'none',n:1}},'—'],['Каждый день',()=>{e.rep={t:'daily',n:1}},'1д'],['По будням',()=>{e.rep={t:'weekly',n:1,sched:sc([1,2,3,4,5])}},'Пн–Пт'],['Каждую неделю',()=>{e.rep={t:'weekly',n:1,sched:sc([P(e.date).getUTCDay()])}},'1н'],['Каждый месяц',()=>{e.rep={t:'monthly',n:1}},'1м']])}
const NE=document.createElement('div');NE.id='xn2';NE.hidden=true;NE.innerHTML='<div class="xsb"></div><div class="xsc"></div>';document.body.appendChild(NE);NE.firstChild.onclick=()=>NE.hidden=true;
const $n=s=>NE.querySelector(s);
window.XN={k:'event',pr:0,s:{},open(){const n=tzNow(),a=cur==today()?Math.min(1320,Math.ceil((n.getUTCHours()*60+n.getUTCMinutes()+15)/15)*15):540;XN.s={d:cur,a,len:DD()||60};XN.k='event';XN.pr=0;XN.draw();NE.hidden=false;setTimeout(()=>$n('#xni').focus(),80)},
draw(){const s=XN.s;NE.lastChild.innerHTML=`<div class="xnk">${[['event','Событие'],['task','Задача'],['habit','Привычка']].map(([k,v])=>`<button class="${XN.k==k?'on':''}" onclick="XN.set('k','${k}')">${v}</button>`).join('')}</div><input id="xni" class="xnt" placeholder="Название" onkeydown="if(event.key=='Enter')XN.add(0)"><div class="xnr"><input type="date" id="xnd" value="${s.d}"><input type="time" id="xns" value="${hm(s.a)}" step="900"></div><div class="xnc">${[15,30,45,60,90,120].map(m=>`<button class="${s.len==m?'on':''}" onclick="XN.set('len',${m})">${m<60?m+' мин':m/60+' ч'}</button>`).join('')}<button class="${XN.pr?'on':''}" onclick="XN.set('pr',${XN.pr?0:1})">! Важное</button></div><div class="xnr"><button class="xnb" onclick="XN.add(1)">Создать и ещё</button><button class="xnb pri" onclick="XN.add(0)">Создать</button></div>`},
set(k,v){const t=$n('#xni').value,d=$n('#xnd').value,s=$n('#xns').value;if(d)XN.s.d=d;if(s)XN.s.a=tm(s);if(k=='k')XN.k=v;else if(k=='pr')XN.pr=v;else XN.s[k]=v;XN.draw();$n('#xni').value=t},
add(more){const t=$n('#xni').value.trim(),d=$n('#xnd').value||cur,a=tm($n('#xns').value||'09:00'),len=XN.s.len||60;if(!t){$n('#xni').focus();return}snap();const e={id:uid(),title:t,date:d,st:hm(a),en:fm(Math.min(1440,a+len)),cat:S.last&&S.cats[S.last]?S.last:Object.keys(S.cats)[0],pri:XN.pr,tags:[],rep:{t:XN.k=='habit'?'daily':'none',n:1},note:'',loc:'',url:'',chk:[],rem:[],kind:XN.k};if(XN.k!='event')e.done={};S.ev.push(e);cur=d;save();render();if(more){XN.s.a=Math.min(1380,a+len);XN.s.d=d;XN.draw();$n('#xni').focus();toast('Создано: '+t,1)}else{NE.hidden=true;toast('Этап создан')}}};
function ag(){const L=evs0(cur),t=new Date(cur+'T00:00:00Z').toLocaleDateString('ru',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'});
A.innerHTML=`<div class="xah"><button onclick="XA.step(-1)" aria-label="Предыдущий день">‹</button><b>${t}${cur==today()?' · сегодня':''}</b><button onclick="XA.step(1)" aria-label="Следующий день">›</button><button onclick="XA.close()" aria-label="Закрыть">${ic('x',16)}</button></div><div class="xal">`+(L.map(e=>{const dn=e.done?.[e._d],k=e.kind=='task'||e.kind=='habit';return `<div class="xai ${dn?'dn':''}" style="--c:${col(e)}">${k?`<button class="xck" onclick="XA.ck('${e.id}','${e._d}',event)">${dn?'✓':''}</button>`:'<i class="xdot"></i>'}<div class="xat" onclick="XA.ed('${e.id}')"><b>${H(e.title||'Без названия')}</b><span>${e.ad?'Весь день':e.st+'–'+e.en}${e._c?' · с прошлого дня':''}</span></div><button class="xmo" onclick="XA.mo('${e.id}','${e._d}')">⋯</button></div>`}).join('')||ui.empty('sparkle','На этот день ничего нет — свободный день','Новый этап','onclick="XA.add()"'))+`</div><button class="xpri" onclick="XA.add()">+ Новый этап</button>`}
window.XA={open(){A.hidden=false;ag()},close(){A.hidden=true},step(n){cur=add(cur,n);ag();render()},ck(id,d,ev){tdone(ev,id,d);ag()},ed(id){window._xaR=1;A.hidden=true;openEv(id)},mo(id,d){act(id,d)},add(){A.hidden=true;window._xaR=1;qnew()}};
const dl0=dlg.onclose;dlg.addEventListener('close',()=>{if(window._xaR){window._xaR=0;setTimeout(()=>{A.hidden=false;ag()},60)}});
let tp=null,lp=0,sw=null,dg=null;
document.addEventListener('touchstart',e=>{if(e.touches.length>1)return;const t=e.touches[0],b=e.target.closest('.ev[data-id]');
if(b){const c=b.closest('[data-d]');tp={x:t.clientX,y:t.clientY,id:b.dataset.id,d:c?c.dataset.d:cur};tp.t=setTimeout(()=>{if(!tp)return;lp=Date.now();vb(15);act(tp.id,tp.d);tp=null},480)}
sw=innerWidth<=800&&!b&&!e.target.closest('dialog,#xs')&&(A.hidden?e.target.closest('.tg'):A.contains(e.target))?{x:t.clientX,y:t.clientY}:null;
if(e.target.closest('dialog .dh')&&!e.target.closest('input,button'))dg={y:t.clientY}},{passive:true});
document.addEventListener('touchmove',e=>{const t=e.touches[0];if(tp&&(Math.abs(t.clientX-tp.x)>8||Math.abs(t.clientY-tp.y)>8)){clearTimeout(tp.t);tp=null}},{passive:true});
document.addEventListener('touchend',e=>{if(tp){clearTimeout(tp.t);tp=null}const t=e.changedTouches[0];
if(sw){const dx=t.clientX-sw.x,dy=t.clientY-sw.y;sw=null;if(Math.abs(dx)>70&&Math.abs(dy)<45){vb(8);A.hidden?go(dx<0?1:-1):XA.step(dx<0?1:-1)}}
if(dg){if(t.clientY-dg.y>90)dlg.close();dg=null}},{passive:true});
document.addEventListener('click',e=>{if(Date.now()-lp<700){e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('contextmenu',e=>{const b=e.target.closest('.ev[data-id]');if(b&&matchMedia('(pointer:coarse)').matches){e.preventDefault();e.stopPropagation();if(tp){clearTimeout(tp.t);lp=Date.now();act(tp.id,tp.d);tp=null}}},true);
dlg.addEventListener('focusin',e=>{if(innerWidth<=800&&e.target.matches('input,textarea,select'))setTimeout(()=>e.target.scrollIntoView({block:'center',behavior:'smooth'}),300)});
const R1=render;render=function(){const r=R1.apply(this,arguments);return r};
})();
