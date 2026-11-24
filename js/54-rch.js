/* v2.40 (F08): куда слать напоминания этапа — Telegram и/или сайт (системные). Поле e.rch={tg:0|1,web:0|1}; нет поля = везде.
   Настройка S.set.rch (0 — выбор каналов скрыт, напоминания идут везде). */
(()=>{
const on=()=>!(S.set&&S.set.rch===0);
/* Чистая функция: можно ли слать напоминание этапа e по каналу ch ('tg' | 'web') */
const allow=(e,ch)=>!(on()&&e&&e.rch&&e.rch[ch]===0);
const flip=(d,ch)=>{d.rch=d.rch||{};d.rch[ch]=d.rch[ch]===0?1:0;if(d.rch.tg!==0&&d.rch.web!==0)delete d.rch;return d.rch};
function ui(d){if(!on()||!d||!d.rem||!d.rem.length)return'';
  const b=(ch,t)=>{const a=allow(d,ch);return `<button class="pl ${a?'on':''}" data-rch="${ch}" aria-pressed="${a?'true':'false'}" aria-label="${t}: напоминание ${a?'включено':'выключено'}">${t}</button>`};
  return `<div class="pills"><small style="color:var(--mut)">Куда:</small>${b('tg','Telegram')}${b('web','Сайт')}</div>`}
if(typeof document!='undefined'&&document.addEventListener)document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rch]');if(b&&typeof dd!='undefined'&&dd){flip(dd,b.dataset.rch);if(typeof dre=='function')dre()}});
if(typeof window!='undefined')window.RCH={on,allow,flip,ui};
})();
