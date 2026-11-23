// v2.11: цели проекта. Запуск: node tests/proj-goals.js
const assert=require('assert');
global.S={goals:[],set:{}};
global.gpc=g=>g.pv!=null?g.pv:0;   // заглушка: процент берём из поля pv
const M=require('../js/29-proj-goals.js');
let ok=0,bad=0;const t=(n,f)=>{try{f();ok++}catch(e){bad++;console.log('✗',n,'—',e.message)}};
const P={id:'p1'};
t('подцель берёт проект корневой цели',()=>{
 S.goals=[{id:'a',proj:'p1'},{id:'b',par:'a'},{id:'c',par:'b'}];
 assert.equal(M.goalProj(S.goals[2]),'p1');
});
t('верхние цели проекта без подцелей-корней',()=>{
 S.goals=[{id:'a',proj:'p1'},{id:'b',par:'a',proj:'p1'},{id:'x',proj:'p2'}];
 assert.deepEqual(M.projTop(P).map(g=>g.id),['a']);
});
t('цель с пропавшим родителем считается верхней',()=>{
 S.goals=[{id:'b',par:'zzz',proj:'p1'}];
 assert.deepEqual(M.projTop(P).map(g=>g.id),['b']);
});
t('прогресс проекта = среднее верхних целей',()=>{
 S.goals=[{id:'a',proj:'p1',pv:40},{id:'b',proj:'p1',pv:80},{id:'x',proj:'p2',pv:100}];
 assert.equal(M.projGoalPct(P),60);
});
t('нет целей → null',()=>{S.goals=[];assert.equal(M.projGoalPct(P),null)});
t('полоска: часы и цели — среднее',()=>{S.goals=[{id:'a',proj:'p1',pv:50}];assert.equal(M.projMixPct(P,10,60*15),75)});
t('полоска: только часы',()=>{S.goals=[];assert.equal(M.projMixPct(P,10,300),50)});
t('полоска: ни плана, ни целей → null',()=>{S.goals=[];assert.equal(M.projMixPct(P,0,300),null)});
console.log(`Цели проекта: ${ok} ок, ${bad} ошибок`);
process.exitCode=bad?1:0;
