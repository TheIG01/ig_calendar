// ОБЩЕЕ ЯДРО сайта и бота. Правьте ТОЛЬКО здесь, затем: node tools/build.js
// @@occ
const occ=(e,d)=>{const r=e.rep||{t:'none'},n=r.n||1;if(d<e.date||(r.end&&d>r.end))return 0;if(e.ex&&e.ex.includes(d))return 0;const a=P(e.date),b=P(d),T=[e.st,e.en];
if(r.t=='none')return d==e.date?T:0;
if(r.t=='daily')return Math.round((b-a)/864e5)%n?0:T;
if(r.t=='weekly'){const w=b.getUTCDay(),ds=r.sched?Object.keys(r.sched).map(Number):r.days?.length?r.days:[a.getUTCDay()];return ds.includes(w)&&!(Math.round((P(wk(d))-P(wk(e.date)))/6048e5)%n)?(r.sched?.[w]||T):0}
if(r.t=='monthly'){if(((b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth())%n)return 0;if(!r.mo)return b.getUTCDate()==a.getUTCDate()?T:0;const o=r.mo,y=b.getUTCFullYear(),m=b.getUTCMonth(),dt=b.getUTCDate(),L=new Date(Date.UTC(y,m+1,0)).getUTCDate();if(o.wd==8){if(o.ord!=-1)return 0;let x=L;while([0,6].includes(new Date(Date.UTC(y,m,x)).getUTCDay()))x--;return dt==x?T:0}return b.getUTCDay()==o.wd&&(o.ord==-1?dt+7>L:Math.ceil(dt/7)==o.ord)?T:0}
return b.getUTCDate()==a.getUTCDate()&&b.getUTCMonth()==a.getUTCMonth()&&!((b.getUTCFullYear()-a.getUTCFullYear())%n)?T:0};
// @@parse
const WA_='(?:понедельник\\S*|вторник\\S*|сред\\S*|четверг\\S*|пятниц\\S*|суббот\\S*|воскресень\\S*|пн|вт|ср|чт|пт|сб|вс)(?=[\\s,.!?])',WN_=s=>({во:0,вс:0,по:1,пн:1,вт:2,ср:3,че:4,чт:4,пя:5,пт:5,су:6,сб:6})[s.slice(0,2).toLowerCase()],MI_=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
function parse(t,today,now){let d=today,st='09:00',du=60,x=' '+t.replace(/[,;]/g,' ')+' ',hd=0,ht=0,e2=null,r,rp=null,ad=0;
const T=(a,b)=>pad(+a)+':'+pad(+(b||0)),R=(re,f)=>{if(rp)return;const m=x.match(re);if(m){rp=f(m);x=x.replace(m[0],' ');hd=1}};
if(r=x.match(/\s(?:весь\s+день|важная\s+дата|без\s+времени)/i)){ad=1;x=x.replace(r[0],' ')}
R(/\s(?:кажд\S+\s+)?последн\S*\s+рабоч\S*\s+день(?:\s+месяц\S*)?/i,()=>({t:'monthly',mo:{ord:-1,wd:8}}));
R(new RegExp('\\sкажд\\S+\\s+(\\d|перв\\S*|втор\\S*|трет\\S*|четв\\S*|пят\\S*|последн\\S*)[-\\s]?(?:й|го|я|е|ый|ая|ое|ий)?\\s+('+WA_+')','i'),m=>({t:'monthly',mo:{ord:/^\d/.test(m[1])?+m[1]:/^перв/i.test(m[1])?1:/^втор/i.test(m[1])?2:/^трет/i.test(m[1])?3:/^четв/i.test(m[1])?4:/^пят/i.test(m[1])?5:-1,wd:WN_(m[2])}}));
R(/\s(?:кажд\S+\s+день|ежедневно)/i,()=>({t:'daily'}));
R(/\s(?:по\s+будням|в\s+будни|кажд\S+\s+будн\S+(?:\s+день)?)/i,()=>({t:'weekly',days:[1,2,3,4,5]}));
R(/\s(?:по\s+выходным|кажд\S+\s+выходн\S*)/i,()=>({t:'weekly',days:[6,0]}));
R(new RegExp('\\sкажд\\S+\\s+('+WA_+')','i'),m=>({t:'weekly',days:[WN_(m[1])]}));
R(new RegExp('\\sпо\\s+((?:'+WA_+'[\\s,и]*)+)','i'),m=>({t:'weekly',days:[...new Set((m[1].match(/[а-я]+/gi)||[]).filter(w=>w!='и').map(w=>WN_(w)))].filter(v=>v!=null)}));
R(/\sкажд\S+\s+(\d+)\s*(дн|недел|месяц)\S*/i,m=>({t:/^дн/i.test(m[2])?'daily':/^н/i.test(m[2])?'weekly':'monthly',n:+m[1],days:[]}));
R(/\sкажд\S+\s+недел\S*/i,()=>({t:'weekly',days:[]}));
R(/\sкажд\S+\s+месяц\S*/i,()=>({t:'monthly'}));
R(/\s(?:кажд\S+\s+год\S*|ежегодно)/i,()=>({t:'yearly'}));
if(r=x.match(/(?:\s(?:в|с))?\s*(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/)||x.match(/\sс\s+(\d{1,2})(?::(\d{2}))?\s+до\s+(\d{1,2})(?::(\d{2}))?/)){st=T(r[1],r[2]);e2=T(r[3],r[4]);x=x.replace(r[0],' ');ht=1}
else if(r=x.match(/через\s+(\d+)\s*(мин|час)\S*/i)){const n=+r[1]*(/^ч/i.test(r[2])?60:1),tt=now.getUTCHours()*60+now.getUTCMinutes()+n;st=hm(tt%1440);if(tt>=1440)d=add(d,1);ht=hd=1;x=x.replace(r[0],' ')}
else if(r=x.match(/(?:\s(?:в|к))?\s+(\d{1,2}):(\d{2})/)){st=T(r[1],r[2]);ht=1;x=x.replace(r[0],' ')}
else if(r=x.match(/\s(?:в|к)\s+(\d{1,2})(?=\s)/)){st=T(r[1]);ht=1;x=x.replace(r[0],' ')}
else if(r=x.match(/\sв\s+полдень/i)){st='12:00';ht=1;x=x.replace(r[0],' ')}
if(!ht&&(r=x.match(/\s(утром|днём|днем|вечером|ночью)(?=[\s.!?])/i))){st={утром:'09:00',днём:'13:00',днем:'13:00',вечером:'19:00',ночью:'23:00'}[r[1].toLowerCase()];ht=1;x=x.replace(r[0],' ')}
if(r=x.match(/на\s+(\d+(?:[.,]\d+)?)\s*(ч|мин)\S*/i)){const v=parseFloat(r[1].replace(',','.'));du=/^ч/i.test(r[2])?v*60:v;x=x.replace(r[0],' ')}
if(rp&&rp.days&&rp.days.length){let i=0;while(i<7&&!rp.days.includes(P(add(today,i)).getUTCDay()))i++;d=add(today,i)}
else if(/послезавтра/i.test(x)){d=add(today,2);hd=1;x=x.replace(/послезавтра/i,' ')}
else if(r=x.match(/завтр\S*/i)){d=add(today,1);hd=1;x=x.replace(r[0],' ')}
else if(/сегодня/i.test(x)){hd=1;x=x.replace(/сегодня/i,' ')}
else if(r=x.match(/через\s+(\d+)\s*(дн|недел)\S*/i)){d=add(today,+r[1]*(/^н/i.test(r[2])?7:1));hd=1;x=x.replace(r[0],' ')}
else if(r=x.match(new RegExp('\\s(?:в|во|на)\\s+('+WA_+')','i'))){d=add(today,(WN_(r[1])-P(today).getUTCDay()+7)%7||7);hd=1;x=x.replace(r[0],' ')}
else if(r=x.match(/\sна\s+выходных/i)){d=add(today,(6-P(today).getUTCDay()+7)%7);hd=1;x=x.replace(r[0],' ')}
else if(r=x.match(new RegExp('(\\d{1,2})\\s+('+MI_.join('|')+')\\S*','i'))){const y=+today.slice(0,4),mi=MI_.indexOf(r[2].toLowerCase().slice(0,3)==='мая'?'мая':r[2].toLowerCase().slice(0,3));let c=`${y}-${pad(mi+1)}-${pad(r[1])}`;if(c<today)c=`${y+1}-${pad(mi+1)}-${pad(r[1])}`;d=c;hd=1;x=x.replace(r[0],' ')}
else if(r=x.match(/(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/)){const y=r[3]?(+r[3]<100?2000+ +r[3]:+r[3]):+today.slice(0,4);let c=`${y}-${pad(r[2])}-${pad(r[1])}`;if(!r[3]&&c<today)c=`${y+1}-${pad(r[2])}-${pad(r[1])}`;d=c;hd=1;x=x.replace(r[0],' ')}
else if(r=x.match(/(\d{1,2})\s+числа/i)){let y=+today.slice(0,4),m=+today.slice(5,7),c=`${y}-${pad(m)}-${pad(r[1])}`;if(c<today){m++;if(m>12){m=1;y++}c=`${y}-${pad(m)}-${pad(r[1])}`}d=c;hd=1;x=x.replace(r[0],' ')}
let ti=x.replace(/\s+/g,' ').trim().replace(/^(?:(?:в|во|на|с|по|к|и)\s+)+/i,'').replace(/(?:\s+(?:в|во|на|с|по|к|и))+$/i,'');ti=ti.charAt(0).toUpperCase()+ti.slice(1);
const en=e2||hm(Math.min(1439,tm(st)+du));let rep=null;if(rp){rep={t:rp.t,n:rp.n||1};if(rp.mo)rep.mo=rp.mo;if(rp.t=='weekly'){const ds=rp.days&&rp.days.length?rp.days:[P(d).getUTCDay()];rep.sched=Object.fromEntries(ds.map(w=>[w,[st,en]]))}}
return{date:d,st:ad?'00:00':st,en:ad?'00:00':en,title:ti,hd,ht,rep,ad}}
