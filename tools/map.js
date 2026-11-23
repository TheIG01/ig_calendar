// Генерирует docs/MAP.md: node tools/map.js
const fs=require('fs'),p=require('path'),fl=['shared/core.js',...fs.readdirSync(p.join(__dirname,'../js')).sort().map(f=>'js/'+f),'worker.js','sw.js'];
let o='# MAP — карта кода (автогенерация: node tools/map.js)\n\nФормат: `функция — файл:строка`. ⚠ — определена присваиванием (window.x=).\n';
for(const f of fl){const L=fs.readFileSync(p.join(__dirname,'..',f),'utf8').split('\n'),r=[];L.forEach((l,i)=>{let m=l.match(/^(?:async )?function ([\w$]+)/)||l.match(/^(?:const|let) ([\w$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>/);if(m)r.push(`- ${m[1]} — ${f}:${i+1}`);else if(m=l.match(/^window\.([\w$]+)=function/))r.push(`- ⚠ ${m[1]} — ${f}:${i+1}`)});if(r.length)o+=`\n## ${f}\n`+r.join('\n')+'\n'}
fs.writeFileSync(p.join(__dirname,'../docs/MAP.md'),o);console.log('MAP OK');
