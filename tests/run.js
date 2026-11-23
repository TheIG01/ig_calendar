// Автотесты чистых функций. Запуск: node tests/run.js
const fs=require('fs'),vm=require('vm'),path=require('path'),R=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let ok=0,bad=0;const t=(n,f)=>{try{f();ok++}catch(e){bad++;console.log('✗',n,'—',e.message)}};
const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((m||'')+' ждали '+JSON.stringify(b)+', получили '+JSON.stringify(a))};
// вырезает top-level оператор, начинающийся с `start`, до ближайшей границы, где код компилируется
function cut(src,start){const L=src.split('\n'),i=L.findIndex(l=>l.startsWith(start));if(i<0)throw new Error('нет '+start);
for(let j=i;j<L.length;j++){const nx=L[j+1]||'';if(j+1<L.length&&!/^(function|const|let|async function|\/\/|\/\*|\(\(|if\()/.test(nx))continue;const s=L.slice(i,j+1).join('\n');try{new vm.Script(s);return s}catch(e){}}throw new Error('не вырезано '+start)}
const W=R('worker.js'),C=R('js/00-core.js');
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
}
console.log(`Тесты: ${ok} ок, ${bad} ошибок`);process.exit(bad?1:0);
