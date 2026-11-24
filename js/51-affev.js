/* v2.37 (K03): аффирмация «перед событием» — за N минут до этапа, в названии которого есть ключевое слово (например «созвон»).
   Расписание: s.k='ev', s.kw (слово), s.ago (минут, 5/10/15/30). Только на сайте. Настройка S.set.afe (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.afe===0),AGO=[5,10,15,30];
const tmn=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?+m[1]*60+ +m[2]:null};
/* Чистая функция: evs=[{title,st}] сегодняшних событий, now — минуты от полуночи. → название события или null.
   Срабатывает в окне 3 минуты: ago-3 < (старт − сейчас) ≤ ago */
function due(evs,s,now){const kw=String(s.kw||'').trim().toLowerCase();if(!kw||s.k!='ev'||!s.on)return null;const ago=+s.ago||10;
  for(const e of evs){const st=tmn(e.st);if(st==null||!String(e.title||'').toLowerCase().includes(kw))continue;const d=st-now;if(d>ago-3&&d<=ago)return e.title}return null}
function ui(s,i){if(!on())return'<small style="color:var(--mut)">Выключено в «Настройках»: «Аффирмации перед событием»</small>';
  return `<div class="bar" style="margin:0"><input value="${esc(s.kw||'')}" data-afe="kw" data-i="${i}" placeholder="Слово в названии: созвон, встреча…" aria-label="Слово в названии события" style="flex:1"></div>`
   +`<div class="bar" style="margin:0">За <select data-afe="ago" data-i="${i}" aria-label="За сколько минут">${AGO.map(m=>`<option value="${m}" ${(+s.ago||10)==m?'selected':''}>${m} мин`).join('')}</select> до начала · только на сайте</div>`}
const fired={};
function tick(){if(!on())return;const a=affM(),n=tzNow(),m=n.getUTCHours()*60+n.getUTCMinutes(),wd=n.getUTCDay(),d=today(),dn=Math.floor(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate())/864e5);
  const evs=(S.ev||[]).filter(e=>e.kind!='task').map(e=>{const o=occ(e,d);return o?{title:e.title,st:Array.isArray(o)?o[0]:e.st}:null}).filter(Boolean),out=[];
  a.sch.forEach(s=>{if(s.k!='ev'||s.web===false||!(s.days||[0,1,2,3,4,5,6]).includes(wd))return;const t=due(evs,s,m);if(!t)return;const k=s.id+d+t;if(fired[k])return;fired[k]=1;const x=affPick(a,s,'i0',dn);if(x)out.push(x)});
  if(out.length)affShow(out)}
function act(el){const a=affM(),s=a.sch[+el.dataset.i];if(!s)return;const k=el.dataset.afe;if(k=='kw')s.kw=el.value;else if(k=='ago')s.ago=+el.value;a_save(0)}
if(typeof document!='undefined'&&document.addEventListener){['input','change'].forEach(ev=>document.addEventListener(ev,e=>{const el=e.target.closest&&e.target.closest('[data-afe]');if(el)act(el)}));
  if(typeof setInterval!='undefined')setInterval(tick,3e4)}
if(typeof window!='undefined')window.AFE={on,due,ui,tmn,AGO};
})();
