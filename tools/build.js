// Сборка: node tools/build.js
// 1) вставляет shared/core.js (occ, parse) в js/00-core.js и worker.js
// 2) подставляет ?v=VERSION в index.html, имя кеша в sw.js, версию в worker.js
const fs=require('fs'),p=require('path'),R=f=>fs.readFileSync(p.join(__dirname,'..',f),'utf8'),Wr=(f,s)=>fs.writeFileSync(p.join(__dirname,'..',f),s);
const V=R('js/00-version.js').match(/VERSION='([^']+)'/)[1];
const sh=R('shared/core.js'),part=n=>{const m=sh.match(new RegExp('// @@'+n+'\\n([\\s\\S]*?)(?=\\n// @@|\\s*$)'));if(!m)throw new Error('нет @@'+n);return m[1].replace(/\n+$/,'')};
for(const f of['js/00-core.js','worker.js']){let s=R(f);
 for(const n of['occ','parse']){const re=new RegExp('/\\*@@BEGIN '+n+'\\*/[\\s\\S]*?/\\*@@END '+n+'\\*/');if(!re.test(s))throw new Error(f+': нет маркеров '+n);const b=part(n);s=s.replace(re,()=>'/*@@BEGIN '+n+'*/\n'+b+'\n/*@@END '+n+'*/')}
 if(f=='worker.js')s=s.replace(/const WVER='[^']*'/,"const WVER='"+V+"'");Wr(f,s)}
let h=R('index.html').replace(/(\.(?:css|js))\?v=[\d.]+/g,'$1?v='+V);Wr('index.html',h);
let sw=R('sw.js').replace(/const V='igcal-v[^']*'/,"const V='igcal-v"+V+"'");Wr('sw.js',sw);
console.log('Сборка OK, версия',V);
