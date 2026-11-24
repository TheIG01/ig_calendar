const SYK=['ev','goals','proj','tpl','inbox'];let SYH=new Map();
const sySj=x=>{const{u,...r}=x||{};return JSON.stringify(r)},syHs=x=>{const{_m,...r}=x;return JSON.stringify(r)},syCl=x=>JSON.parse(JSON.stringify(x));
function hInit(){SYH=new Map();SYK.forEach(k=>(S[k]||[]).forEach(x=>x&&x.id&&SYH.set(k+x.id,syHs(x))))}
function stampM(){const n=Date.now(),cur=new Set();S.del=S.del||{};SYK.forEach(k=>(S[k]||[]).forEach(x=>{if(!x||!x.id)return;const key=k+x.id;cur.add(key);const h=syHs(x);if(SYH.get(key)!==h){x._m=n;SYH.set(key,h)}}));[...SYH.keys()].forEach(key=>{if(!cur.has(key)){S.del[key]=n;SYH.delete(key)}});Object.keys(S.del).forEach(k=>{if(S.del[k]<n-5184e6)delete S.del[k]})}
function mergeS(a,b){a=a||{};b=b||{};const nw=(a.u||0)>=(b.u||0)?a:b,od=nw===a?b:a,R=syCl(nw),del={...(od.del||{}),...(nw.del||{})};Object.keys(od.del||{}).forEach(k=>{del[k]=Math.max(od.del[k]||0,(nw.del||{})[k]||0)});
SYK.forEach(k=>{const m=new Map();(nw[k]||[]).forEach(x=>x&&x.id&&m.set(x.id,x));(od[k]||[]).forEach(x=>{if(!x||!x.id)return;const p=m.get(x.id);if(p){if((x._m||0)>(p._m||0))m.set(x.id,x)}else if(x._m)m.set(x.id,x)});R[k]=[...m.values()].filter(x=>!(del[k+x.id]&&del[k+x.id]>=(x._m||0))).map(syCl)});
R.cats={...(od.cats||{}),...(nw.cats||{})};R.rep={...(od.rep||{}),...(nw.rep||{})};R.top={...(od.top||{}),...(nw.top||{})};R.wtop={...(od.wtop||{}),...(nw.wtop||{})};R.mrn={...(od.mrn||{}),...(nw.mrn||{})};if(nw.mrs||od.mrs)R.mrs=nw.mrs||od.mrs;R.eve={...(od.eve||{}),...(nw.eve||{})};R.del=del;R.u=Math.max(a.u||0,b.u||0);return R}
hInit();
