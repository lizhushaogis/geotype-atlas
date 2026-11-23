const assert=require('node:assert/strict');const {axes,questions,types,score,rank}=require('./model');
assert.equal(questions.length,30);assert.equal(types.length,16);assert.equal(new Set(questions.map(q=>q.id)).size,30);
for(const [key] of axes){const qs=questions.filter(q=>q.axis===key);assert.equal(qs.length,6);assert.equal(qs.filter(q=>q.reverse).length,2);}
const neutral=Object.fromEntries(questions.map(q=>[q.id,50]));assert.deepEqual(score(neutral),[50,50,50,50,50]);
const high=Object.fromEntries(questions.map(q=>[q.id,q.reverse?0:100]));assert.deepEqual(score(high),[100,100,100,100,100]);
const low=Object.fromEntries(questions.map(q=>[q.id,q.reverse?100:0]));assert.deepEqual(score(low),[0,0,0,0,0]);
for(const t of types){assert.equal(t.center.length,5);assert.equal(rank(t.center)[0].type.id,t.id);assert.equal(rank(t.center)[0].distance,0);assert.match('v'+t.id,/^[a-z]{3,16}$/);}
console.log('PASS: dimensions, reverse scoring, neutral/extreme responses, all 16 prototype centers and backend result codes.');
