/* v2.27 (I04): тепловая карта «день недели × час» и золотые часы в отчёте клиенту. Чистые функции HEAT.*, настройка S.set.rht (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.rht===0);
const DN=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const tm=s=>{const p=String(s||'0:0').split(':');return(+p[0]||0)*60+(+p[1]||0)};
const wd=d=>(new Date(Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))).getUTCDay()+6)%7;
/* rows: [дата,…,начало(5),конец(6),минуты(7)] → матрица 7×24 в минутах; ночные этапы переходят на следующий день недели */
function grid(rows){const g=Array.from({length:7},()=>Array(24).fill(0));
  (rows||[]).forEach(r=>{let s=tm(r[5]),e=tm(r[6]),w=wd(r[0]);if(e<=s)e+=1440;
    for(let m=s;m<e;){const h=Math.floor(m/60),nx=Math.min(e,(h+1)*60);g[(w+Math.floor(h/24))%7][h%24]+=nx-m;m=nx}});return g}
const total=g=>g.reduce((a,r)=>a+r.reduce((x,y)=>x+y,0),0);
const max=g=>Math.max(0,...g.map(r=>Math.max(...r)));
/* Уровень 0–4 для цвета */
const lvl=(v,mx)=>!v||!mx?0:Math.max(1,Math.ceil(v/mx*4));
/* Золотые часы: окно из n подряд идущих часов с максимумом минут (по всем дням); null, если данных мало (<3 ч всего) */
function golden(g,n=2){if(total(g)<180)return null;const h=Array(24).fill(0);g.forEach(r=>r.forEach((v,i)=>h[i]+=v));
  let best=-1,at=0;for(let i=0;i+n<=24;i++){const s=h.slice(i,i+n).reduce((x,y)=>x+y,0);if(s>best){best=s;at=i}}
  return{from:at,to:at+n,min:best,share:Math.round(best/total(g)*100)}}
/* Самый загруженный день недели: {d, name, min} */
function topDay(g){const s=g.map(r=>r.reduce((x,y)=>x+y,0));const m=Math.max(...s);if(!m)return null;const i=s.indexOf(m);return{d:i,name:DN[i],min:m}}
const p2=n=>String(n).padStart(2,'0')+':00';
function txt(g){const o=golden(g);if(!o)return'';const t=topDay(g);
  return 'Золотые часы: '+p2(o.from)+'–'+p2(o.to)+' ('+o.share+'% работы)'+(t?' · самый плотный день: '+t.name:'')}
/* HTML-карта: показываем часы 6–23 (остальное, если есть данные, тоже) */
function html(g){const mx=max(g);if(!mx)return'';let a=6,b=23;for(let h=0;h<24;h++)if(g.some(r=>r[h]>0)){a=Math.min(a,h);b=Math.max(b,h)}
  let o='<div class="xn">Когда вы работаете чаще всего</div><div class="hmap" role="img" aria-label="'+esc(txt(g)||'Тепловая карта работы по дням и часам')+'" style="display:grid;grid-template-columns:28px repeat('+(b-a+1)+',1fr);gap:2px;font-size:10px">';
  o+='<span></span>';for(let h=a;h<=b;h++)o+='<span style="text-align:center;color:var(--mut)">'+(h%3==0?h:'')+'</span>';
  g.forEach((r,i)=>{o+='<span style="color:var(--mut);line-height:18px">'+DN[i]+'</span>';for(let h=a;h<=b;h++){const l=lvl(r[h],mx);o+='<span title="'+DN[i]+' '+p2(h)+': '+Math.round(r[h]/6)/10+' ч" style="height:18px;border-radius:4px;background:'+(l?'color-mix(in srgb,var(--ac,#2f6bff) '+(l*25)+'%,transparent)':'var(--bd,#e3e7ef)')+'"></span>'}});
  return o+'</div><div class="xn" style="font-size:12px">'+esc(txt(g))+'</div>'}
window.HEAT={on,grid,total,max,lvl,golden,topDay,txt,html,DN};
})();
