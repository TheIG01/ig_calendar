// Привычки 2.0 (v2.16–2.17): количество в день, норма «N раз в неделю», челлендж 21/30/66 дней.
// Данные лежат в самой привычке (S.ev, kind='habit'): tgt, unit, cnt{дата:число}, wq, ch{days,start}. Миграция не нужна.
window.HQ=(function(){
const MSG=[[100,'Челлендж пройден! Вы доказали себе, что можете.'],[75,'Финишная прямая. Осталось совсем немного.'],[50,'Половина пути позади. Так держать!'],[25,'Четверть пройдена. Ритм уже появляется.'],[0,'Старт дан. Главное — не пропускать первые дни.']];
const tgt=e=>Math.max(1,Math.min(999,Math.round(+e.tgt||1)));
const cnt=(e,d)=>(e.cnt&&e.cnt[d])||0;
function setCnt(e,d,n){n=Math.max(0,Math.min(999,Math.round(+n||0)));e.cnt=e.cnt||{};e.done=e.done||{};const was=!!e.done[d];
 if(n)e.cnt[d]=n;else delete e.cnt[d];
 const ok=n>=tgt(e);
 if(ok&&!was){e.done[d]=1;S.pts=(S.pts||0)+10}else if(!ok&&was){delete e.done[d];S.pts=(S.pts||0)-10}
 return ok}
function week(e,d){const w=wk(d);let c=0,p=0;for(let i=0;i<7;i++){const x=add(w,i);if(occ(e,x)){p++;if(e.done&&e.done[x])c++}}return{c,p}}
const weekOk=(e,d)=>{const q=Math.round(+e.wq||0);return q>0&&week(e,d).c>=q};
function weeksStreak(e,t){const q=Math.round(+e.wq||0);if(!q)return 0;let n=0,w=add(wk(t),-7);for(let i=0;i<52;i++,w=add(w,-7)){if(week(e,w).c>=q)n++;else break}if(weekOk(e,t))n++;return n}
function chal(e,t){const c=e.ch;if(!c||!c.days||!c.start)return null;let done=0;for(let i=0;i<c.days;i++){const d=add(c.start,i);if(d>t)break;if(e.done&&e.done[d])done++}
 const day=Math.min(c.days,Math.max(0,Math.round((new Date(t+'T00:00:00Z')-new Date(c.start+'T00:00:00Z'))/864e5)+1)),pc=Math.min(100,Math.round(done/c.days*100));
 return{done,day,days:c.days,pc,msg:(MSG.find(m=>pc>=m[0])||MSG[4])[1],fin:done>=c.days}}
function html(e){const t=today(),T=tgt(e),n=cnt(e,t),q=Math.round(+e.wq||0),ch=chal(e,t),u=esc(e.unit||''),id=esc(e.id);let h='';
 if(T>1)h+=`<div class="hq2r"><button type="button" data-hq="dec" data-id="${id}" aria-label="Минус один">−</button><span><b>${n}</b> из ${T} ${u}</span><button type="button" data-hq="inc" data-id="${id}" aria-label="Плюс один">+</button></div>`;
 if(q){const w=week(e,t),ws=weeksStreak(e,t);h+=`<div class="hq2m"><span>Неделя: <b>${w.c}</b> из ${q}${w.c>=q?' ✓':''}</span>${ws?`<span>недель подряд с нормой <b>${ws}</b></span>`:''}</div>`}
 if(ch)h+=`<div class="hq2m"><span>Челлендж: день <b>${ch.day}</b> из ${ch.days}, отмечено ${ch.done}</span></div><div class="xbar"><i style="width:${ch.pc}%"></i></div><div class="xemp" style="padding:4px 0 0">${esc(ch.msg)}</div>`;
 const o=(v,l,cur)=>`<option value="${v}"${String(cur)===String(v)?' selected':''}>${l}</option>`;
 h+=`<details class="hq2d"><summary>Настроить привычку</summary><div class="hq2g"><label>Сколько раз в день<input type="number" min="1" max="999" value="${T}" data-hqf="tgt" data-id="${id}"></label><label>Единица (стаканов, страниц)<input value="${esc(e.unit||'')}" maxlength="20" data-hqf="unit" data-id="${id}"></label><label>Норма в неделю<select data-hqf="wq" data-id="${id}">${o(0,'Каждый день',q)}${[1,2,3,4,5,6].map(k=>o(k,k+' раз',q)).join('')}</select></label><label>Челлендж<select data-hqf="ch" data-id="${id}">${o(0,'Нет',e.ch?e.ch.days:0)}${[21,30,66].map(k=>o(k,k+' дней',e.ch?e.ch.days:0)).join('')}</select></label></div></details>`;
 return `<div class="hq2">${h}</div>`}
function field(e,k,v){if(k=='tgt'){e.tgt=Math.max(1,Math.min(999,Math.round(+v)||1));if(e.tgt<2)delete e.tgt;const t=today();if(e.done&&e.done[t]&&cnt(e,t)<tgt(e)&&e.cnt&&e.cnt[t])setCnt(e,t,cnt(e,t))}
 else if(k=='unit')e.unit=String(v).trim().slice(0,20);
 else if(k=='wq'){const q=Math.round(+v)||0;if(q)e.wq=q;else delete e.wq}
 else if(k=='ch'){const n=Math.round(+v)||0;if(n)e.ch={days:n,start:today()};else delete e.ch}}
const GN=['Утро','День','Вечер','Без времени'];
const grp=e=>{if(e.ad||!e.st||e.st=='00:00'&&e.en=='00:00')return 3;const h=+String(e.st).slice(0,2);return h<12?0:h<18?1:2};
const nm=s=>String(s||'').trim().toLowerCase();
function stacks(H){const out=[];for(let g=0;g<4;g++){const L=H.filter(e=>grp(e)==g).sort((a,b)=>String(a.st||'').localeCompare(String(b.st||'')));if(!L.length)continue;
 const used=new Set(),R=[],put=(e,from,dep)=>{if(used.has(e.id)||dep>10)return;used.add(e.id);R.push({e,after:from});L.filter(x=>!used.has(x.id)&&nm(x.cue)&&nm(x.cue)==nm(e.title)).forEach(x=>put(x,e.title,dep+1))};
 L.filter(e=>!(nm(e.cue)&&L.some(x=>x.id!=e.id&&nm(x.title)==nm(e.cue)))).forEach(e=>put(e,'',0));L.forEach(e=>put(e,'',0));out.push({g,name:GN[g],items:R})}return out}
const stkOn=()=>!(S.set&&S.set.stk===0);
function init(){document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-hq]');if(!b)return;const e=S.ev.find(x=>x.id==b.dataset.id);if(!e)return;const t=today(),n=cnt(e,t)+(b.dataset.hq=='inc'?1:-1);setCnt(e,t,n);save();render()});
 document.addEventListener('change',ev=>{const f=ev.target.closest&&ev.target.closest('[data-hqf]');if(!f)return;const e=S.ev.find(x=>x.id==f.dataset.id);if(!e)return;field(e,f.dataset.hqf,f.value);save();render()})}
if(typeof document!='undefined'&&document.addEventListener)init();
return{tgt,cnt,setCnt,week,weekOk,weeksStreak,chal,html,field,stacks,stkOn}})();
