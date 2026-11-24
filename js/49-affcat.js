/* v2.35 (K03): аффирмации 2.0 — категории (деньги, здоровье, фокус) и «любимые» с большим весом показа.
   Данные: x.c (категория) и x.fav в аффирмации, s.cat в расписании. Настройка S.set.afc (0 — как раньше). */
(()=>{
const on=()=>!(S.set&&S.set.afc===0);
const CATS=[['money','Деньги'],['health','Здоровье'],['focus','Фокус']],FAV=3;
const cname=c=>(CATS.find(x=>x[0]==c)||[0,''])[1];
/* Чистая функция: items — аффирмации, s — расписание, slot/dn — как в affPick, rnd — функция 0..1, enabled — включены ли категории */
function pick(items,s,slot,dn,rnd,enabled){
  const all=items.filter(x=>x.on!==0&&x.t),cat=enabled&&s.cat?all.filter(x=>x.c==s.cat):all;
  const L=s.pick=='one'?cat.filter(x=>x.id==s.one):(s.ids&&s.ids.length?cat.filter(x=>s.ids.includes(x.id)):cat);
  if(!L.length)return null;
  if(s.pick=='rand'||!s.pick){
    const w=L.map(x=>enabled&&x.fav?FAV:1),sum=w.reduce((a,b)=>a+b,0);let r=rnd()*sum;
    for(let i=0;i<L.length;i++){r-=w[i];if(r<0)return L[i].t}return L[L.length-1].t}
  const sn=slot[0]=='i'?+slot.slice(1):(s.times||[]).indexOf(slot.slice(1));
  return L[(dn*30+sn)%L.length].t}
/* Кнопки в карточке аффирмации и в расписании (без inline onclick: data-afc) */
function itemUI(x,i){if(!on())return'';
  return `<div class="pills"><button class="pl ${x.fav?'on':''}" data-afc="fav" data-i="${i}" aria-label="Любимая: показывается чаще" aria-pressed="${x.fav?'true':'false'}">★ Любимая</button>`
   +CATS.map(([k,v])=>`<button class="pl ${x.c==k?'on':''}" data-afc="c" data-i="${i}" data-v="${k}" aria-pressed="${x.c==k?'true':'false'}">${v}</button>`).join('')+`</div>`}
function schUI(s,i){if(!on())return'';
  return `<div class="pills"><small style="color:var(--mut)">Тема:</small><button class="pl ${s.cat?'':'on'}" data-afc="scat" data-i="${i}" data-v="">Любая</button>`
   +CATS.map(([k,v])=>`<button class="pl ${s.cat==k?'on':''}" data-afc="scat" data-i="${i}" data-v="${k}">${v}</button>`).join('')+`</div>`}
function act(b){const a=affM(),i=+b.dataset.i,v=b.dataset.v,m=b.dataset.afc;
  if(m=='fav'){const x=a.items[i];if(x)x.fav=x.fav?0:1}
  else if(m=='c'){const x=a.items[i];if(x)x.c=x.c==v?'':v}
  else if(m=='scat'){const s=a.sch[i];if(s)s.cat=v}
  else return;a_save(1)}
if(typeof document!='undefined'&&document.addEventListener)document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-afc]');if(b)act(b)});
if(typeof window!='undefined'){window.AFC={on,CATS,cname,pick,itemUI,schUI,FAV};
  window.affPick=(a,s,slot,dn)=>pick(a.items,s,slot,dn,Math.random,on())}
})();
