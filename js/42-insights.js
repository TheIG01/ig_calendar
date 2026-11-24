/* v2.28 (I05): автоинсайты в окне «Отчёт клиенту» — перерасход/недобор к плану, сдвиг часов к прошлому периоду, слабый день недели. Только для вас, в текст клиенту не попадают. Настройка S.set.rins (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.rins===0);
const H=m=>(m/60).toFixed(m%60?1:0).replace('.',',')+' ч';
const times=x=>x>=1.95?'в '+(Math.round(x*2)/2).toString().replace('.',',')+' раза':'на '+Math.round((x-1)*100)+'%';
const WD=['понедельникам','вторникам','средам','четвергам','пятницам'];
/* план vs факт по услугам: перерасход ≥ +30% и недобор < 50% (только если период ≥ 7 дней и план ≥ 1 ч) */
function plan(norms,svc,a,b,planMin,days){const o=[];if(days(a,b)<7)return o;
  Object.keys(norms).forEach(k=>{const p=planMin(norms[k],a,b),f=(svc&&svc[k])||0;if(p<60)return;
    if(f>=p*1.3)o.push({k:'over',w:f/p,t:'На «'+k+'» ушло '+times(f/p)+' больше плана: '+H(f)+' при плане '+H(p)});
    else if(f<p*.5)o.push({k:'low',w:p/Math.max(f,1),t:'По «'+k+'» сделано меньше половины плана: '+H(f)+' из '+H(p)})});return o}
/* общий сдвиг часов к прошлому периоду (≥30% и ≥2 ч разницы) */
function shift(cur,prev){if(!prev||cur+prev<=0)return[];const d=cur-prev;if(Math.abs(d)<120)return[];
  if(!prev)return[{k:'new',w:1,t:'Раньше в этом периоде часов не было — сейчас '+H(cur)}];
  const p=Math.round(Math.abs(d)/prev*100);if(p<30)return[];
  return[{k:'shift',w:p/100,t:'Всего часов '+(d>0?'на '+p+'% больше':'на '+p+'% меньше')+', чем в прошлый раз ('+H(cur)+' и '+H(prev)+')'}]}
/* слабый будний день: g — матрица 7×24 минут (HEAT.grid); нужно ≥10 ч за Пн–Пт */
function weak(g){const s=g.slice(0,5).map(r=>r.reduce((x,y)=>x+y,0)),sum=s.reduce((x,y)=>x+y,0);if(sum<600)return[];
  const avg=sum/5,m=Math.min(...s),i=s.indexOf(m);if(m>=avg*.6)return[];
  return[{k:'weak',w:1-m/avg,t:'По '+WD[i]+' вы работаете на '+Math.round((1-m/avg)*100)+'% меньше обычного'}]}
/* всё вместе: не больше n строк, самые заметные первыми */
function list(o,n=3){const r=[].concat(plan(o.norms||{},o.svc,o.a,o.b,o.planMin,o.days),shift(o.cur,o.prev),o.grid?weak(o.grid):[]);
  r.sort((x,y)=>y.w-x.w);return r.slice(0,n).map(x=>x.t)}
function html(a){const s='<div class="xn">Что заметно</div>';
  return s+(a.length?'<ul style="margin:0 0 8px;padding-left:18px;font-size:13px;line-height:1.5">'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<div class="xemp">Пока всё ровно — заметных отклонений нет.</div>')}
window.INS={on,plan,shift,weak,list,html};
})();
