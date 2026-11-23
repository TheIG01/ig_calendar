// Автотесты чистых функций. Запуск: node tests/run.js
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let ok=0,bad=0;const t=(n,f)=>{try{f();ok++}catch(e){bad++;console.log('✗',n,'—',e.message)}};
const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((m||'')+' ждали '+JSON.stringify(b)+', получили '+JSON.stringify(a))};
// вырезает top-level оператор, начинающийся с `start`, до ближайшей границы, где код компилируется
function cut(src,start){const L=src.split('\n'),i=L.findIndex(l=>l.startsWith(start));if(i<0)throw new Error('нет '+start);
for(let j=i;j<L.length;j++){const nx=L[j+1]||'';if(j+1<L.length&&!/^(function|const|let|async function|\/\/|\/\*|\(\(|if\()/.test(nx))continue;const s=L.slice(i,j+1).join('\n');try{new vm.Script(s);return s}catch(e){}}throw new Error('не вырезано '+start)}
const W=R('worker.js'),C=R('js/00-core.js'),SH=R('shared/core.js');
const pre=`const pad=n=>String(n).padStart(2,'0'),P=s=>new Date(s+'T00:00:00Z'),iso=d=>d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate()),add=(s,n)=>{const d=P(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)},tm=s=>{const[a,b]=s.split(':');return a*60+ +b},hm=m=>pad(Math.floor(m/60)%24)+':'+pad(m%60);let S={set:{tz:3,ws:1},cats:{}};`;
function load(src){const c={};vm.createContext(c);vm.runInContext(pre+cut(src,'const occ=')+'\n'+cut(src,'const WA_=')+'\n'+cut(src,'function parse(')+'\nthis.occ=occ;this.parse=parse;',c);return c}
let site,wk;
t('загрузка parse/occ сайта',()=>{site=load(C)});
t('загрузка parse/occ бота',()=>{wk=load(W)});
t('A14: parse сайта = parse бота (текст)',()=>{eq(cut(C,'function parse(')===cut(W,'function parse('),true)});
t('A14: occ сайта = occ бота (текст)',()=>{const n=x=>x.replace(/\s+/g,'');eq(n(cut(C,'const occ='))===n(cut(W,'const occ=')),true)});
if(site)for(const [n,c] of [['сайт',site],['бот',wk]]){if(!c)continue;
 t(n+': occ без повтора',()=>{const e={date:'2026-11-23',st:'10:00',en:'11:00'};eq(!!c.occ(e,'2026-11-23'),true);eq(!!c.occ(e,'2026-11-24'),false)});
 t(n+': occ ежедневно через день',()=>{const e={date:'2026-11-23',st:'10:00',en:'11:00',rep:{t:'daily',n:2}};eq(!!c.occ(e,'2026-11-25'),true);eq(!!c.occ(e,'2026-11-24'),false)});
 t(n+': occ исключение и конец',()=>{const e={date:'2026-11-23',st:'10:00',en:'11:00',ex:['2026-11-24'],rep:{t:'daily',n:1,end:'2026-11-26'}};eq(!!c.occ(e,'2026-11-24'),false);eq(!!c.occ(e,'2026-11-27'),false);eq(!!c.occ(e,'2026-11-26'),true)});
 t(n+': occ ежемесячно',()=>{const e={date:'2026-01-31',st:'10:00',en:'11:00',rep:{t:'monthly',n:1}};eq(!!c.occ(e,'2026-03-31'),true)});
 t(n+': parse «завтра в 15:00 созвон на 1ч»',()=>{const r=c.parse('завтра в 15:00 созвон на 1ч','2026-11-23',new Date());const x=Array.isArray(r)?r[0]:r;eq(x.date,'2026-11-24');eq(x.st,'15:00');eq(x.en,'16:00')});
 t(n+': parse длительность 90 минут',()=>{const r=c.parse('сегодня в 10:00 встреча на 90 мин','2026-11-23',new Date());const x=Array.isArray(r)?r[0]:r;eq(x.st,'10:00');eq(x.en,'11:30')});
}

for(const [n,c] of [['сайт',site],['бот',wk]]){if(!c)continue;
 t(n+': 2-й вторник месяца',()=>{const e={date:'2026-11-10',st:'10:00',en:'11:00',rep:{t:'monthly',n:1,mo:{ord:2,wd:2}}};eq(!!c.occ(e,'2026-11-10'),true);eq(!!c.occ(e,'2026-11-17'),false);eq(!!c.occ(e,'2026-12-08'),true)});
 t(n+': последний рабочий день месяца',()=>{const e={date:'2026-11-01',st:'10:00',en:'11:00',rep:{t:'monthly',n:1,mo:{ord:-1,wd:8}}};eq(!!c.occ(e,'2026-11-30'),true);eq(!!c.occ(e,'2026-11-27'),false)});
 t(n+': разбор «каждый 2-й вторник»',()=>{const r=c.parse('каждый 2-й вторник созвон в 10:00','2026-11-23',new Date());const x=Array.isArray(r)?r[0]:r;eq(x.rep.t,'monthly');eq(x.rep.mo,{ord:2,wd:2})});
 t(n+': разбор «каждый последний рабочий день месяца»',()=>{const r=c.parse('каждый последний рабочий день месяца отчёт','2026-11-23',new Date());const x=Array.isArray(r)?r[0]:r;eq(x.rep.mo,{ord:-1,wd:8})});
}
// слияние
function loadMerge(){const c={S:{ev:[],goals:[],proj:[],tpl:[],inbox:[]}};vm.createContext(c);vm.runInContext(R('js/04-merge.js')+'\nthis.mergeS=mergeS;this.stampM=stampM;this.sySj=sySj;',c);return c}
let M;t('загрузка слияния',()=>{M=loadMerge()});
if(M){const ev=(id,m,x)=>({id,_m:m,t:x||id});
 t('merge: объединяет разные этапы',()=>{const r=M.mergeS({u:2,ev:[ev('a',1)]},{u:1,ev:[ev('b',1)]});eq(r.ev.map(x=>x.id).sort(),['a','b'])});
 t('merge: побеждает более новая правка',()=>{const r=M.mergeS({u:1,ev:[ev('a',1,'старый')]},{u:2,ev:[ev('a',5,'новый')]});eq(r.ev[0].t,'новый')});
 t('merge: удаление не воскресает',()=>{const r=M.mergeS({u:5,ev:[],del:{eva:9}},{u:1,ev:[ev('a',3)]});eq(r.ev.length,0)});
 t('merge: правка после удаления сохраняется',()=>{const r=M.mergeS({u:1,ev:[],del:{eva:2}},{u:3,ev:[ev('a',7)]});eq(r.ev.length,1)});
 t('merge: пустые входы',()=>{const r=M.mergeS(null,undefined);eq(r.ev,[])});
 t('merge: не меняет исходные объекты',()=>{const a={u:2,ev:[ev('a',1)]},j=JSON.stringify(a);M.mergeS(a,{u:1,ev:[ev('b',1)]});eq(JSON.stringify(a),j)});
 t('нет alert/prompt/confirm в js/',()=>{const fs=require('fs'),bad=[];fs.readdirSync(__dirname+'/../js').forEach(f=>{const x=fs.readFileSync(__dirname+'/../js/'+f,'utf8');if(/(^|[^\w.])(alert|prompt|confirm)\(/.test(x))bad.push(f)});eq(bad,[])});
 t('ui: файл 11-ui.js и css/08.css подключены',()=>{const fs=require('fs'),h=fs.readFileSync(__dirname+'/../index.html','utf8'),w=fs.readFileSync(__dirname+'/../sw.js','utf8');eq(/11-ui\.js/.test(h)&&/08\.css/.test(h)&&/11-ui\.js/.test(w)&&/08\.css/.test(w),true)});

 t('v2.4: 12-settings.js подключён; тема по времени; проверка файла темы',()=>{const fs=require('fs'),h=R('index.html'),w=R('sw.js');eq(/12-settings\.js/.test(h)&&/12-settings\.js/.test(w),true);
  const c={};vm.createContext(c);const S12=R('js/12-settings.js');
  const m=S12.match(/const thVal=[\s\S]*?Object\.keys\(r\)\.length\?r:null\};/)[0];
  vm.runInContext("const TH=['light','dark','sleep','study','auto','time'],FN=['inter','manrope','system','serif'];"+m+";this.f=thVal",c);
  eq(c.f({igTheme:1,ac:'#ABCDEF',fs:99,r:10,font:'x'}),{ac:'#abcdef',r:10});eq(c.f({ac:'#fff'}),null);eq(c.f(null),null);
  const th=C.match(/function themeNow\(s\)\{[\s\S]*?return s\.theme\}/)[0];vm.runInContext(th+";this.n=themeNow",c);
  eq(c.n({theme:'dark'}),'dark');eq(['light','sleep'].includes(c.n({theme:'time'})),true)});
 t('v2.4: у вызовов sv2 в 12-settings нет inline-алертов',()=>{eq(/\b(alert|confirm|prompt)\(/.test(R('js/12-settings.js').replace(/ui\.(confirm|prompt)\(/g,'')),false)});
}
console.log(`Тесты: ${ok} ок, ${bad} ошибок`);process.exit(bad?1:0);
t('v2.5.1: 11-ui.js подключён раньше 00-core.js (иначе пустой сайт)',()=>{const h=R('index.html');eq(h.indexOf('js/11-ui.js')>0&&h.indexOf('js/11-ui.js')<h.indexOf('js/00-core.js'),true)});
