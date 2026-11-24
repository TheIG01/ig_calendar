/* v2.50 (K01в): тихие часы и в браузере — те же S.set.qoff/qf/qt, что у Telegram (по умолчанию 23:00–07:00). S.set.qbr=0 — браузер их игнорирует. */
/* v2.49 (K01б): правила по темам и проектам — S.set.nmc (темы), S.set.nmp (id проектов); пусто — всё включено. */
/* v2.38 (K02): напоминания, которые не раздражают — несколько этапов в одну минуту показываются одним уведомлением.
   Настройка S.set.ntg (0 — каждое отдельно, как раньше). Заменяет ntf() из js/07-smart.js. */
(()=>{
const on=()=>!(S.set&&S.set.ntg===0);
const word=n=>{const a=n%100,b=n%10;return a>10&&a<15?'этапов':b==1?'этап':b>1&&b<5?'этапа':'этапов'};
const lab=r=>r>=1440?'За сутки, ':r?'Через '+r+' мин, ':'Сейчас, ';
const muted=(e,set)=>{set=set||{};return(set.nmc||[]).includes(e.cat)||(!!e.proj&&(set.nmp||[]).includes(String(e.proj)))};
const mm=s=>{const a=String(s||'').split(':');return(+a[0]||0)*60+(+a[1]||0)};
const quiet=(set,m)=>{set=set||{};if(set.qoff||set.qbr===0)return false;const f=mm(set.qf||'23:00'),t=mm(set.qt||'07:00');return f==t?false:f<t?(m>=f&&m<t):(m>=f||m<t)};
/* Чистая функция: list=[{title,st,r,tag}] → [{title,body,tag}]. Один пункт или группировка выкл — по одному; иначе одно общее */
function group(list,enabled){
  if(!list.length)return[];
  if(!enabled||list.length<2)return list.map(x=>({title:x.title||'Этап',body:lab(x.r)+x.st,tag:x.tag}));
  const s=list.slice().sort((a,b)=>(a.st>b.st?1:a.st<b.st?-1:0)),sh=s.slice(0,5).map(x=>x.st+' '+(x.title||'Этап')),rest=s.length-sh.length;
  return[{title:'Скоро: '+s.length+' '+word(s.length),body:sh.join('\n')+(rest>0?'\nи ещё '+rest:''),tag:'grp'+s[0].tag}]}
function show(n){const o={body:n.body,tag:n.tag,data:{title:n.title,body:n.body}};if(window.SNZ&&SNZ.on())o.actions=SNZ.ACT.map(([action,title])=>({action,title}));if(navigator.serviceWorker)navigator.serviceWorker.ready.then(g=>g.showNotification(n.title,o)).catch(()=>new Notification(n.title,{body:n.body}));else new Notification(n.title,{body:n.body})}
function ntf(){if(!window.Notification||Notification.permission!='granted'||localStorage.igntf=='0'||S.set?.rsi===false)return;
  const d=today(),m=nowMin();if(quiet(S.set,m))return;const dr=(S.set&&S.set.drem!=null)?S.set.drem:15,L=[];
  [0,1,2].forEach(k=>{const D=k?add(d,k):d;evs(D).forEach(e=>{if(e.ad||e.kind=='habit'||(e.done&&e.done[D])||(window.RCH&&!RCH.allow(e,'web'))||muted(e,S.set))return;
    (e.rem&&e.rem.length?e.rem:dr?[dr]:[]).forEach(r=>{const t=k*1440+tm(e.st)-r;if(m>=t&&m<t+2){const kk='n'+D+e.id+r;if(sessionStorage[kk])return;sessionStorage[kk]=1;L.push({title:e.title,st:e.st,r,tag:kk})}})})});
  group(L,on()).forEach(show)}
if(typeof window!='undefined'){window.AFN={on,group,word,lab,show,muted,quiet};window.ntf=ntf}
})();
