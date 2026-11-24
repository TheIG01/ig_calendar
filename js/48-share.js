/* v2.34 (L07): «Поделиться» из Android/Chrome → во входящие. Manifest: share_target (?st=заголовок&sx=текст&su=ссылка) и ярлыки «Входящие», «Привычки».
   Настройка S.set.shr (0 — не принимать). */
(()=>{
const on=()=>!(S.set&&S.set.shr===0);
/* Строка запроса → одна запись во входящие (до 300 знаков); пусто, если делиться нечем */
function compose(search){const p=new URLSearchParams(search||''),g=k=>String(p.get(k)||'').trim();
  const t=g('st'),x=g('sx'),u=g('su'),o=[];
  [t,x,u].forEach(s=>{if(s&&!o.some(y=>y.includes(s)))o.push(s)});
  return o.join(' ').slice(0,300)}
function take(search){if(!on())return'';const v=compose(search);if(!v)return'';(S.inbox=S.inbox||[]).push({id:uid(),t:v});return v}
function init(){const v=take(location.search);if(v){save();render();toast('Во входящие: '+v.slice(0,40),1)}}
if(typeof location!='undefined'&&typeof setTimeout=='function')setTimeout(init,1000);
window.SHR={on,compose,take};
})();
