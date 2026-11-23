// v2.7.4: правка одного повтора — «Только этот» / «Этот и следующие» / «Все повторы»
// occD — дата повтора, по которому открыли этап (запоминается при щелчке по плашке этапа)
let occD=null,occId=null;
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.ev[data-id]');occId=b?b.dataset.id:null;occD=b?(b.closest('[data-d]')?.dataset.d||null):null},true);

// Чистая функция (тестируется в tests/run.js): делит серию o по дате od.
// Возвращает новую версию старой серии o2 и новый этап nw (без id).
function splitSeries(o,e,od,mode){
  const cl=x=>JSON.parse(JSON.stringify(x)),pick=(m,f)=>{if(!m)return undefined;const r={};for(const k in m)if(f(k))r[k]=m[k];return Object.keys(r).length?r:undefined};
  const o2=cl(o),nw=cl(e);delete nw.id;nw.date=od;
  if(mode=='one'){
    o2.ex=[...(o2.ex||[]),od];
    nw.rep={t:'none',n:1};delete nw.sched;delete nw.ex;
    nw.done=pick(e.done,k=>k==od);
    return{o2,nw};
  }
  // «Этот и следующие»: старая серия заканчивается днём раньше, новая начинается с od
  o2.rep={...o2.rep,end:add(od,-1)};
  o2.ex=(o2.ex||[]).filter(x=>x<od);
  o2.done=pick(o2.done,k=>k<od);
  nw.ex=(e.ex||[]).filter(x=>x>=od);
  nw.done=pick(e.done,k=>k>=od);
  return{o2,nw};
}

// Какую серию правим: только если открыт повтор не первый и серия повторяющаяся
function scopeOrig(e){
  if(!e.id||!occD||occId!=e.id)return null;
  const o=S.ev.find(x=>x.id==e.id);
  if(!o||!o.rep||o.rep.t=='none'||occD<=o.date)return null;
  return o;
}

function normRep(e){const r=e.rep;if(r.t=='weekly'&&!Object.keys(r.sched||{}).length)r.sched={[P(e.date).getUTCDay()]:[e.st,e.en]};if(r.t!='weekly')delete r.sched}

function saveDd(){normRep(dd);snap();if(dd.id)S.ev[S.ev.findIndex(x=>x.id==dd.id)]=dd;else{dd.id=uid();S.ev.push(dd);nid=dd.id}S.last=dd.cat;dd=null;save();render()}

function askScope(o){
  const od=occD;
  ui.choose('Повторяющийся этап','Что изменить? Изменения коснутся выбранных повторов.',[
    {t:'Только этот повтор',v:'one',pri:1},{t:'Этот и следующие',v:'fwd'},{t:'Все повторы',v:'all'},{t:'Отмена',v:null}
  ]).then(v=>{
    if(!v||!dd)return;
    if(v=='all'){saveDd();return}
    normRep(dd);snap();
    const{o2,nw}=splitSeries(o,dd,od,v);
    const i=S.ev.findIndex(x=>x.id==o.id);if(i>=0)S.ev[i]=o2;
    nw.id=uid();S.ev.push(nw);
    S.last=dd.cat;dd=null;save();render();
    toast(v=='one'?'Изменён только этот повтор':'Этот и следующие повторы сохранены отдельно');
  });
}
