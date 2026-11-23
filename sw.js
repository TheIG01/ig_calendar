// IG calendar: полноценная работа без интернета.
// Страница: сначала сеть (3 с), иначе кеш. Остальное и шрифты: из кеша, обновляются в фоне.
const V='igcal-v2.8.1',F='igfonts-v1',SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png','./css/00.css','./css/01.css','./css/02.css','./css/03.css','./css/04.css','./css/05.css','./css/06.css','./css/07.css','./css/08.css','./js/00-version.js','./js/00-views.js','./js/00-core.js','./js/01-ics.js','./js/02-menu.js','./js/03-hub.js','./js/04-merge.js','./js/05-focus.js','./js/06-tz.js','./js/07-smart.js','./js/08-tools.js','./js/09-diag.js','./js/10-data.js','./js/11-ui.js','./js/12-settings.js','./js/13-edit.js','./js/14-layers.js','./js/15-quick.js','./js/16-series.js','./js/17-links.js','./js/18-palette.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x!=F).map(x=>caches.delete(x)))).then(()=>clients.claim()))});
self.addEventListener('message',e=>{if(e.data=='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{const q=e.request,u=new URL(q.url);if(q.method!='GET')return;
if(/fonts\.(googleapis|gstatic)\.com$/.test(u.host)){e.respondWith(caches.open(F).then(c=>c.match(q).then(m=>m||fetch(q).then(r=>{c.put(q,r.clone());return r}).catch(()=>m))));return}
if(u.origin!=location.origin)return;
if(q.mode=='navigate'){e.respondWith(new Promise(ok=>{let d=0;const fb=()=>caches.match('./index.html',{ignoreSearch:true}).then(m=>m||caches.match('./',{ignoreSearch:true})).then(m=>{if(!d){d=1;ok(m||new Response('Офлайн',{status:503}))}});const t=setTimeout(fb,3000);fetch(q).then(r=>{clearTimeout(t);if(r.ok)caches.open(V).then(c=>c.put('./index.html',r.clone()));if(!d){d=1;ok(r)}}).catch(()=>{clearTimeout(t);fb()})}));return}
e.respondWith(caches.match(q,{ignoreSearch:true}).then(m=>{const f=fetch(q).then(r=>{if(r.ok)caches.open(V).then(c=>c.put(q,r.clone()));return r}).catch(()=>m);return m||f}))});
