// v2.10 «Матрёшка целей»: несколько целей на этап (поле gx), журнал по всей ветке цели.
// Этап: goal — основная цель, gx — доп. цели. Без gx поведение прежнее.
// egs() объявлена в js/00-core.js (нужна при первой отрисовке).

// Убирает цель id из этапа; основной становится первая из оставшихся.
function unG(e,id){const L=egs(e).filter(x=>x!=id);e.goal=L[0]||'';if(L.length>1)e.gx=L.slice(1);else delete e.gx}

// Переключение цели в окне этапа (вкл/выкл), без закрытия окна.
function tgG(id){const cur=egs(dd),L=cur.includes(id)?cur.filter(x=>x!=id):[...cur,id];dd.goal=L[0]||'';if(L.length>1)dd.gx=L.slice(1);else delete dd.gx;dre()}

// Журнал ветки: записи цели, выполненные этапы (сама цель и все подцели любой глубины).
function gjour(g,lim=20){const t=today(),out=[],seen=new Set();
 const walk=(x,dep)=>{if(!x||seen.has(x.id)||dep>30)return;seen.add(x.id);
  (x.log||[]).forEach(l=>{if(l.d&&l.d<=t)out.push({d:l.d,v:+l.v||0,t:l.n||'',g:x.t})});
  S.ev.forEach(e=>{if(!egs(e).includes(x.id))return;Object.keys(e.done||{}).forEach(d=>{if(d<=t)out.push({d,v:+e.val||0,t:e.title||'Без названия',g:x.t})})});
  S.goals.filter(k=>k.par==x.id).forEach(k=>walk(k,dep+1))};
 walk(g,0);return out.sort((a,b)=>b.d.localeCompare(a.d)).slice(0,lim)};
if(typeof window!='undefined')window.gjour=gjour;

// Блок «Журнал ветки» в окне цели.
function gjHTML(g){const J=gjour(g,12),u=g.u?' '+esc(g.u):'';
 return `<div class="ds"><label>Журнал ветки</label>${J.length?J.map(x=>`<div class="row"><small>${fd(x.d,{day:'numeric',month:'short'})}</small><b>${x.v?'+'+(+x.v).toLocaleString('ru')+u:'✓'}</b><span class="sp">${esc(x.t)}${x.g!=g.t?' · <i>'+esc(x.g)+'</i>':''}</span></div>`).join(''):'<small style="color:var(--mut)">Записей пока нет. Отмечайте выполненные этапы или записывайте прогресс: история появится здесь, даже по мелким шагам.</small>'}</div>`}
