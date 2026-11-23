// v2.8.6: G05 «Зависит от» (блокировка задач) и G02 виды задач «Список» и «Таймлайн».
// Грузится после 20-batch.js. Функции хаба берутся из window.HUB (03-hub.js).
const depTarget=e=>(e&&e.dep&&e.dep!=e.id)?S.ev.find(v=>v.id==e.dep&&v.kind=='task')||null:null;
const depDone=t=>!!t.done?.[t.rep&&t.rep.t!='none'?today():t.date];
const depOpts=e=>S.ev.filter(v=>v.kind=='task'&&v.id!=e.id&&v.status!='idea'&&!depDone(v)&&v.dep!=e.id);

// Строка «⛔ ждёт: …» в карточке задачи (вызывается из meta в 03-hub.js)
window.blkTxt=(e,d)=>{if(!(S.set.dpb??1)||e.kind!='task'||e.done?.[d])return'';const t=depTarget(e);if(!t||depDone(t))return'';return `<span class="od">⛔ ждёт: ${esc(t.title||'Без названия')}</span>`};

// Поле «Зависит от» в форме задачи (вставляется в dHTML, 00-core.js)
window.depHTML=e=>{if(!(S.set.dpb??1)||e.kind!='task')return'';const cur=depTarget(e),opts=depOpts(e);if(cur&&!opts.includes(cur))opts.unshift(cur);
  return `<div class="ds"><label for="dpS">Зависит от</label><select id="dpS" data-dep><option value="">Ни от чего</option>${opts.map(v=>`<option value="${v.id}"${e.dep==v.id?' selected':''}>${esc(v.title||'Без названия')}${v.date?' · '+esc(HB.dlb(v.date)):''}</option>`).join('')}</select></div>`};
document.addEventListener('change',ev=>{const s=ev.target;if(!s.matches||!s.matches('[data-dep]')||!dd)return;dd.dep=s.value||undefined;dre()});

// ---- G02: виды задач ----
const HB=window.HUB;
const TVW=[['g','Группы'],['l','Список'],['t','Таймлайн']];
const oldVKW=window.vKWrap;
const tvSwitch=m=>(S.set.tvs??1)?`<div class="xc2 tvw" role="group" aria-label="Вид списка задач">${TVW.map(([k,v])=>`<button class="${k==m?'on':''}" data-tvw="${k}" aria-pressed="${k==m}">${v}</button>`).join('')}</div>`:'';
const tvOpen=()=>HB.smF(HB.tasks()).filter(x=>!x.dn).sort((a,b)=>a.d.localeCompare(b.d)||(b.e.pri||0)-(a.e.pri||0));
const tvRow=x=>HB.row(x.e,x.d,x.dn,x.o);
const tvFlat=()=>{const L=tvOpen();return L.length?L.map(tvRow).join(''):ui.empty('inbox','Открытых задач нет')};
const tvSec=(lab,items,cls='')=>`<section class="tld ${cls}${items.length?'':' emp'}"><h5>${lab}<span>${items.length}</span></h5>${items.length?items.map(tvRow).join(''):'<p class="tle">Пусто</p>'}</section>`;
const tvTimeline=()=>{const t=today(),L=tvOpen();let h=L.some(x=>x.d<t)?tvSec('Просрочено',L.filter(x=>x.d<t),'od'):'';
  for(let i=0;i<14;i++){const d=add(t,i),lab=i==0?'Сегодня':i==1?'Завтра':new Date(d+'T00:00:00Z').toLocaleDateString('ru',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'});h+=tvSec(lab,L.filter(x=>x.d==d))}
  return h};
window.vKWrap=function(){if(!(S.set.tvs??1))return oldVKW();const m=TVW.some(x=>x[0]==S.set.tvw)?S.set.tvw:'g';if(m=='g')return tvSwitch(m)+oldVKW();
  return tvSwitch(m)+((S.set.bx??1)!==0?'<div class="xc2"><button data-bxa="open">☑ Выбрать задачи</button></div>':'')+HB.smBar()+HB.qa()+(m=='l'?tvFlat():tvTimeline())};
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-tvw]');if(!b)return;S.set.tvw=b.dataset.tvw;save();window.HUB.hp()});
