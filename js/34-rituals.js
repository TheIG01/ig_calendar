// v2.18 N11 «Главные 3 недели» и N13 «Вечерний итог» (с серией дней). Данные: S.wtop{начало недели:[{t,d}]}, S.eve{дата:{a,b,c}}.
window.RT=(function(){
const wkey=()=>wk(today());
const wlist=()=>{S.wtop=S.wtop||{};return S.wtop[wkey()]||[]};
function wAdd(t){t=String(t||'').trim().slice(0,120);const L=wlist();if(!t||L.length>=3)return false;S.wtop[wkey()]=[...L,{t,d:0}];return true}
function wTog(i){const L=wlist();if(!L[i])return;L[i].d=L[i].d?0:1}
function wDel(i){const L=wlist();if(!L[i])return;L.splice(i,1);S.wtop[wkey()]=L}
const has=x=>!!x&&['a','b','c'].some(k=>String(x[k]||'').trim());
function eveSet(k,v,d){if(!['a','b','c'].includes(k))return;d=d||today();S.eve=S.eve||{};const e=S.eve[d]||{};e[k]=String(v||'').slice(0,500);if(has(e))S.eve[d]=e;else delete S.eve[d]}
function eveStreak(t){t=t||today();const E=S.eve||{};let d=has(E[t])?t:add(t,-1),n=0;while(has(E[d])){n++;d=add(d,-1)}return n}
const on=k=>!(S.set&&S.set[k]===0);
function weekHTML(){if(!on('wt'))return '';const L=wlist(),done=L.filter(x=>x.d).length;
 return `<div class="xk rt"><h5>Главные 3 недели${L.length?` <small>${done}/${L.length}</small>`:''}</h5>${L.map((x,i)=>`<div class="rtl"><label><input type="checkbox" data-rt="tog" data-i="${i}"${x.d?' checked':''}> <span${x.d?' style="text-decoration:line-through;opacity:.6"':''}>${esc(x.t)}</span></label><button type="button" data-rt="del" data-i="${i}" aria-label="Убрать из главных">×</button></div>`).join('')||'<div class="xemp">Три результата, ради которых эта неделя. Всё остальное вторично</div>'}${L.length<3?`<div class="rta"><input id="rtw" data-rt-in="1" maxlength="120" placeholder="Что главное на этой неделе?" aria-label="Главное на неделе"><button type="button" data-rt="add" aria-label="Добавить">+</button></div>`:''}</div>`}
function eveHTML(){if(!on('ev'))return '';const t=today(),n=tzNow(),h=n.getUTCHours(),e=(S.eve||{})[t]||{},y=(S.eve||{})[add(t,-1)],st=eveStreak(t),open=h>=18&&!has(e);
 const ta=(k,l)=>`<label class="rtf">${l}<textarea rows="2" maxlength="500" data-rtf="${k}">${esc(e[k]||'')}</textarea></label>`;
 const hint=h<12&&y&&String(y.b||'').trim()?`<div class="gf" role="status"><b>Со вчерашнего дня</b><div>${esc(y.b)}</div></div>`:'';
 return hint+`<details class="xk rt"${open?' open':''}><summary>Вечерний итог${st?` · серия ${st} дн.`:''}</summary>${ta('a','Что получилось')}${ta('b','Что перенести на завтра')}${ta('c','За что благодарны')}<small>Сохраняется само. Запись за день продлевает серию.</small></details>`}
// v2.21 K04 утренний ритуал (3–5 шагов, серия) и N12 «фокус-вопрос». Данные: S.mrs[шаги], S.mrn{дата:{d:[индексы],f:'главное'}}.
const DSTEPS=['Стакан воды','Взгляд на план дня','Зарядка'];
const mSteps=()=>Array.isArray(S.mrs)&&S.mrs.length>=3?S.mrs.slice(0,5):DSTEPS;
function setSteps(txt){const L=String(txt||'').split('\n').map(x=>x.trim().slice(0,60)).filter(Boolean).slice(0,5);S.mrs=L.length>=3?L:undefined;if(!S.mrs)delete S.mrs;return mSteps()}
const mRec=d=>((S.mrn||{})[d||today()])||{d:[],f:''};
function mTog(i,d){d=d||today();if(!(i>=0&&i<mSteps().length))return;S.mrn=S.mrn||{};const r=mRec(d),s=new Set(r.d);s.has(i)?s.delete(i):s.add(i);const n={d:[...s].sort(),f:r.f||''};if(n.d.length||n.f)S.mrn[d]=n;else delete S.mrn[d]}
function mFocus(v,d){d=d||today();S.mrn=S.mrn||{};const r=mRec(d),n={d:r.d,f:String(v||'').trim().slice(0,200)};if(n.d.length||n.f)S.mrn[d]=n;else delete S.mrn[d]}
const mAll=d=>{const n=mSteps().length,r=mRec(d);return n>0&&r.d.filter(i=>i<n).length>=n};
function mStreak(t){t=t||today();let d=mAll(t)?t:add(t,-1),n=0;while(mAll(d)){n++;d=add(d,-1)}return n}
function morningHTML(){if(!on('mr'))return '';const t=today(),h=tzNow().getUTCHours(),r=mRec(t),L=mSteps(),st=mStreak(t),open=h<12&&!mAll(t);
 const foc=r.f?`<div class=\"gf\" role=\"status\"><b>Главное сегодня</b><div>${esc(r.f)}</div></div>`:'';
 return foc+`<details class=\"xk rt\"${open?' open':''}><summary>Утренний ритуал${st?` · серия ${st} дн.`:''} <small>${r.d.filter(i=>i<L.length).length}/${L.length}</small></summary>${L.map((x,i)=>`<div class=\"rtl\"><label><input type=\"checkbox\" data-rt=\"mtog\" data-i=\"${i}\"${r.d.includes(i)?' checked':''}> <span>${esc(x)}</span></label></div>`).join('')}<label class=\"rtf\">Что сегодня главное?<input maxlength=\"200\" data-rtm=\"f\" value=\"${esc(r.f||'')}\" placeholder=\"Одно дело, ради которого день удался\"></label><details><summary>Изменить шаги</summary><label class=\"rtf\">Один шаг на строке, от 3 до 5<textarea rows=\"4\" data-rtm=\"steps\">${esc(L.join('\n'))}</textarea></label></details></details>`}
function init(){document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-rt]');if(!b)return;const a=b.dataset.rt,i=+b.dataset.i;
  if(a=='add'){const inp=document.querySelector('#rtw');if(inp&&wAdd(inp.value)){save();render()}return}
  if(a=='del')wDel(i);else if(a=='tog')wTog(i);else if(a=='mtog')mTog(i);else return;save();render()});
 document.addEventListener('keydown',ev=>{if(ev.key=='Enter'&&ev.target.dataset&&ev.target.dataset.rtIn){if(wAdd(ev.target.value)){save();render()}}});
 document.addEventListener('change',ev=>{const m=ev.target.closest&&ev.target.closest('[data-rtm]');if(m){if(m.dataset.rtm=='f')mFocus(m.value);else setSteps(m.value);save();render();return}const f=ev.target.closest&&ev.target.closest('[data-rtf]');if(!f)return;eveSet(f.dataset.rtf,f.value);save()})}
if(typeof document!='undefined'&&document.addEventListener)init();
return{wAdd,wTog,wDel,wlist,eveSet,eveStreak,weekHTML,eveHTML,mSteps,setSteps,mTog,mFocus,mAll,mStreak,morningHTML}})();
