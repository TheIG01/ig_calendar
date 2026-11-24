// v2.8.2, G01: напоминание «Разобрать входящие» (вкладка «Сегодня» и доска).
// Настройка S.set.trd: 0 — выкл, иначе раз в N дней. Дата последнего разбора — S.set.trL.
(function(){
const trDays=()=>S.set.trd??7;
const dayDiff=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/864e5);
const triDue=()=>{const n=(S.inbox||[]).length,d=trDays();if(!n||!d)return false;return !S.set.trL||dayDiff(S.set.trL,today())>=d};
const triMark=()=>{S.set.trL=today()};
function triBanner(){
  if(!triDue())return '';
  const n=(S.inbox||[]).length;
  return `<div class="tri-b" role="status"><div><b>${ic('inbox',16)} Во входящих: ${n}</b><span>Разберите за пару минут: сегодня, завтра или в проект.</span></div><div class="tri-a"><button class="xpri" data-act="tri-open">Разобрать</button><button data-act="tri-later">Позже</button></div></div>`;
}
// Баннер кладём в окно хаба (вкладки «Сегодня» и «Доска») после каждого render().
function placeBanner(){
  const b=document.querySelector('.xpb');if(!b)return;
  const old=b.querySelector(':scope > .tri-b');if(old)old.remove();
  if(triDue())b.insertAdjacentHTML('afterbegin',triBanner());
}
const _render=window.render;
window.render=function(){const r=_render.apply(this,arguments);try{placeBanner()}catch(e){console.error('triage',e)}return r};

// Разбор, дошедший до пустых входящих, считается сделанным.
const _tri=XZ.tri;
XZ.tri=function(){if(!(S.inbox||[]).length){triMark();save()}return _tri.apply(this,arguments)};

const TRI_OPTS=[[0,'Выкл'],[3,'Раз в 3 дня'],[7,'Раз в неделю'],[14,'Раз в 2 недели']];
const _es=window.editSet;
window.editSet=()=>(typeof _es=='function'?_es():'')+
  `<div class="srow"><span>Напоминание «Разобрать входящие»</span><div class="seg" role="group" aria-label="Частота напоминания">${TRI_OPTS.map(([v,t])=>`<button class="${(S.set.trd??7)==v?'on':''}" aria-pressed="${(S.set.trd??7)==v}" data-act="tri-set" data-v="${v}">${t}</button>`).join('')}</div></div>`;

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act^="tri-"]');if(!b)return;
  const act=b.dataset.act;
  if(act=='tri-open'){XZ.tri()}
  else if(act=='tri-later'){triMark();save();render()}
  else if(act=='tri-set'){S.set.trd=+b.dataset.v;save();render()}
});
})();
