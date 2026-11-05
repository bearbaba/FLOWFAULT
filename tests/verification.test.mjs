import test from 'node:test';
import assert from 'node:assert/strict';
import {parseValue,classifyTx,verifyStored} from '../lib/verification.js';
const sha=(c)=>c.repeat(64);
test('JSON parsing and finality never accept FINALIZED alone',()=>{
 assert.deepEqual(parseValue('{"ok":true}'),{ok:true});
 assert.equal(parseValue('BAD_OUTPUT'),'BAD_OUTPUT');
 assert.equal(classifyTx({status:'FINALIZED',execution:'SUCCESS'}),'success');
 assert.equal(classifyTx({status:'FINALIZED',execution:'FINISHED_WITH_ERROR'}),'error');
 assert.equal(classifyTx({status:'FINALIZED'}),'pending');
 assert.equal(classifyTx({status:'ACCEPTED',execution:'SUCCESS'}),'pending');
});
test('new case requires correct owner, fields and a newer case ID',()=>{
 const r={method:'open_case',actor:'0xAAA',prior:2,args:['0xbbb','0xccc','task','source']};
 const x={id:3,owner:'0xaaa',worker_a:'0xBBB',worker_b:'0xccc',task_spec:'task',source_data:'source',source_sha256:sha('a'),stage:'OPEN',verdict:'PENDING'};
 assert.equal(verifyStored(r,x),true);
 assert.equal(verifyStored({...r,prior:null},x),false);
 assert.equal(verifyStored({...r,prior:3},x),false);
 assert.equal(verifyStored(r,{...x,owner:'0xother'}),false);
 assert.equal(verifyStored(r,{...x,source_data:'other'}),false);
 assert.equal(verifyStored(r,{...x,stage:'DISPUTED'}),false);
});
test('worker evidence must match sender, payload, hash and open stage',()=>{
 const r={method:'submit_evidence',actor:'0xbbb',args:[3,'{"approvedTotal":20}',sha('b')]};
 const x={id:3,stage:'OPEN',worker_a:'0xbbb',worker_b:'0xccc',a_output:r.args[1],a_sha256:r.args[2]};
 assert.equal(verifyStored(r,x),true);
 assert.equal(verifyStored({...r,actor:'0xccc'},x),false);
 assert.equal(verifyStored(r,{...x,a_sha256:sha('c')}),false);
 assert.equal(verifyStored(r,{...x,stage:'DECIDED'}),false);
});
test('dispute must record both hashes, owner and pending verdict',()=>{
 const r={method:'open_dispute',actor:'0xaaa',args:[3,'A signed dispute']};
 const x={id:3,owner:'0xaaa',dispute:r.args[1],stage:'DISPUTED',verdict:'PENDING',a_sha256:sha('a'),b_sha256:sha('b')};
 assert.equal(verifyStored(r,x),true);
 assert.equal(verifyStored(r,{...x,b_sha256:''}),false);
 assert.equal(verifyStored({...r,actor:'0xbbb'},x),false);
});
test('AI verdict must be an on-chain decided value',()=>{
 for(const verdict of ['REWORK_A','REWORK_B','SHARED','UNVERIFIABLE'])
  assert.equal(verifyStored({method:'adjudicate',args:[3]},{id:3,stage:'DECIDED',verdict}),true);
 assert.equal(verifyStored({method:'adjudicate',args:[3]},{id:3,stage:'DECIDED',verdict:'PENDING'}),false);
});
test('receipt is a signed submission, not a verified correction',()=>{
 const r={method:'submit_rework',actor:'0xccc',args:[3,'corrected',sha('e')]};
 const x={id:2,case_id:3,actor:'0xccc',role:'B',original_sha256:sha('d'),new_sha256:sha('e'),new_output:'corrected',status:'REWORK_SUBMITTED_NOT_VERIFIED'};
 assert.equal(verifyStored(r,x),true);
 assert.equal(verifyStored(r,{...x,status:'FIXED'}),false);
 assert.equal(verifyStored(r,{...x,original_sha256:sha('e')}),false);
 assert.equal(verifyStored({...r,actor:'0xaaa'},x),false);
});
test('unrelated method cannot verify FLOWFAULT state',()=>{
 assert.equal(verifyStored({method:'legacy_method'},{}),false);
});
