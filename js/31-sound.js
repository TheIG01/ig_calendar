// v2.13.4 · N30: звуки фокуса — шумы синтезом Web Audio (файлов нет), автостарт с таймером
(()=>{
const KEY='igsnd',DEF={auto:1,kind:'rain',vol:35};
const KINDS={rain:['Дождь',1400],cafe:['Кафе',700],white:['Белый шум',18000]};
const load=()=>{try{return Object.assign({},DEF,JSON.parse(localStorage[KEY]||'{}'))}catch(e){return{...DEF}}};
let P=load(),ctx=null,gain=null,src=null,bufs={},preview=0,autoT0=null;

const keep=()=>{try{localStorage[KEY]=JSON.stringify(P)}catch(e){}};

function audio(){
 if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  ctx=new AC();gain=ctx.createGain();gain.connect(ctx.destination)}
 if(ctx.state=='suspended')ctx.resume();
 return ctx;
}

// Шумы генерируются один раз на вид: белый, коричневый (дождь), розовый (кафе)
function noise(kind){
 if(bufs[kind])return bufs[kind];
 const sr=ctx.sampleRate,n=sr*4,b=ctx.createBuffer(1,n,sr),d=b.getChannelData(0);
 let x=0,b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
 for(let i=0;i<n;i++){
  const w=Math.random()*2-1;
  if(kind=='white')d[i]=w*0.5;
  else if(kind=='rain'){x=(x+0.02*w)/1.02;d[i]=x*3.5}
  else{
   b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.969*b2+w*0.153852;
   b3=0.8665*b3+w*0.3104856;b4=0.55*b4+w*0.5329522;b5=-0.7616*b5-w*0.016898;
   d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926;
  }
 }
 return bufs[kind]=b;
}

function stop(){if(src){try{src.stop()}catch(e){}src.disconnect();src=null}}

function play(){
 const c=audio();if(!c)return;
 stop();
 const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=(KINDS[P.kind]||KINDS.rain)[1];
 src=c.createBufferSource();src.buffer=noise(KINDS[P.kind]?P.kind:'rain');src.loop=true;
 src.connect(f);f.connect(gain);gain.gain.value=P.vol/100;src.start();
}

// Каждую секунду: автостарт при новом таймере, остановка когда таймер закончился (если не предпрослушивание)
function sync(){
 const T=S.timer;
 if(T&&P.auto&&autoT0!==T.t0){autoT0=T.t0;preview=0;play()}
 if(!T){autoT0=null;if(src&&!preview)stop()}
}

// Первое касание страницы создаёт аудио-контекст: так браузер разрешает звук позже
document.addEventListener('pointerdown',()=>{audio()},{once:true,passive:true});
setInterval(sync,1000);

const KL=()=>Object.keys(KINDS).map(k=>`<option value="${k}" ${P.kind==k?'selected':''}>${KINDS[k][0]}</option>`).join('');
const open=()=>XT.show('Звуки фокуса',
 `<p class="xn">Тихий фон для таймера. Звук создаётся в браузере, файлов не нужно.</p>`+
 `<label class="xn" style="display:flex;gap:8px;align-items:center;min-height:44px"><input type="checkbox" data-sn="auto" ${P.auto?'checked':''}> Включать вместе с таймером</label>`+
 `<label class="xn" style="display:flex;gap:8px;align-items:center;min-height:44px">Звук <select data-sn="kind" style="min-height:44px">${KL()}</select></label>`+
 `<label class="xn" style="display:flex;gap:8px;align-items:center;min-height:44px">Громкость <input type="range" min="0" max="100" step="5" data-sn="vol" value="${P.vol}" aria-label="Громкость звука" style="flex:1"> <span id="snv">${P.vol}%</span></label>`+
 `<button data-sn="prev" class="xpri" style="min-height:44px">${src?'■ Остановить':'▶ Послушать'}</button>`);

document.addEventListener('change',e=>{const t=e.target.closest('[data-sn]');if(!t)return;const k=t.dataset.sn;
 if(k=='auto')P.auto=t.checked?1:0;
 else if(k=='kind'){P.kind=t.value;delete bufs[t.value];if(src){preview=1;play()}}
 else if(k=='vol'){P.vol=+t.value;if(gain)gain.gain.value=P.vol/100;const s=document.getElementById('snv');if(s)s.textContent=P.vol+'%'}
 keep()});

document.addEventListener('input',e=>{const t=e.target.closest('[data-sn="vol"]');if(!t)return;
 P.vol=+t.value;if(gain)gain.gain.value=P.vol/100;const s=document.getElementById('snv');if(s)s.textContent=P.vol+'%';keep()});

document.addEventListener('click',e=>{const b=e.target.closest('[data-sn="prev"]');if(!b)return;
 if(src){stop();preview=0}else{preview=1;play()}
 open()});

const m=XT.menu;XT.menu=function(){m();const b=q('#xb'),bt=document.createElement('button');
 bt.innerHTML=ic('sparkle',16)+' Звуки фокуса';bt.onclick=open;b.insertBefore(bt,b.firstChild)};

window.XSN={open};
})();
