/* v2.25 (I02): экспорт отчёта в CSV (Excel и Google Таблицы). Чистые функции CSV.*, настройка S.set.rcsv (0 — выкл). */
(()=>{
const on=()=>!(S.set&&S.set.rcsv===0);
/* Ячейка: защита от формул (= + - @), кавычки и разделитель ; */
function cell(v){let s=v==null?'':String(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return/[";\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
const line=a=>a.map(cell).join(';');
const num=m=>(Math.round(m/60*100)/100).toString().replace('.',',');
const ru=d=>d.split('-').reverse().join('.');
const HEAD=['Дата','Клиент','Проект','Услуга','Этап','Начало','Конец','Часы'];
/* rows: [дата, клиент, проект, услуга, название, начало, конец, минуты] → текст с BOM и итогом */
function build(rows){const out=[line(HEAD)];let sum=0;
  rows.slice().sort((x,y)=>(x[0]+x[5]).localeCompare(y[0]+y[5])).forEach(r=>{sum+=r[7];out.push(line([ru(r[0]),r[1],r[2],r[3],r[4],r[5],r[6],num(r[7])]))});
  out.push(line(['Итого','','','','','','',num(sum)]));
  return '\ufeff'+out.join('\r\n')}
const name=(w,a,b)=>'otchet-'+String(w||'').replace(/^[cp]:/,'').replace(/[^\wа-яё-]+/gi,'_').slice(0,30)+'-'+a+'_'+b+'.csv';
window.CSV={on,cell,line,num,build,name};
})();
