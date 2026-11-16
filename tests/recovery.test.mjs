import test from 'node:test';
import assert from 'node:assert/strict';
import {recoveryActions,verifyRecoveryWrite} from '../lib/recovery.js';
const c={id:1,stage:'DECIDED',verdict:'REWORK_B',worker_a:'0xA',worker_b:'0xB'};
const r={case_id:1,attempts:[2],latest_attempt:2,state:'SUBMITTED'};
const a={id:2,case_id:1,snapshot:{id:1},role:'B',actor:'0xb',new_output:'revision',new_sha256:'digest',snapshot_sha256:'snapshot',status:'SUBMITTED'};
test('only responsible wallet can submit and at most twice',()=>{
 const state={...r,state:'NOT_STARTED',attempts:[]};
 assert.equal(recoveryActions(c,state,'0xb').submit,true);
 assert.equal(recoveryActions(c,state,'0xa').submit,false);
 assert.equal(recoveryActions(c,{...state,state:'FAIL',attempts:[1,2]},'0xb').submit,false);
 assert.equal(recoveryActions(c,r,'0xb').submit,false);
 assert.equal(recoveryActions({...c,verdict:'SHARED'},state,'0xb').submit,false);
});
test('assessment and finalization require the corresponding stored state',()=>{
 assert.equal(recoveryActions(c,r).assess,true);
 for(const state of ['FAIL','REVIEW','SUBMITTED','RESOLVED'])assert.equal(recoveryActions(c,{...r,state}).finalize,false);
 assert.equal(recoveryActions(c,{...r,state:'PASS'}).finalize,true);
});
test('submission readback binds case, actor, exact bytes, digest and newer attempt',()=>{
 const record={method:'submit_revision',caseId:1,args:[1,'revision','digest'],actor:'0xB',priorAttempt:1};
 assert.equal(verifyRecoveryWrite(record,r,a),true);
 for(const changes of [{case_id:2},{actor:'0xa'},{new_output:'different'},{new_sha256:'wrong'},{id:1}])assert.equal(verifyRecoveryWrite(record,r,{...a,...changes}),false);
});
test('assessment readback rejects stale and inconsistent results',()=>{
 const record={method:'assess_revision',caseId:1,args:[2]};
 const result={...a,status:'PASS',assessment:{verdict:'PASS'}};
 assert.equal(verifyRecoveryWrite(record,{...r,state:'PASS'},result),true);
 assert.equal(verifyRecoveryWrite(record,{...r,state:'REVIEW'},result),false);
 assert.equal(verifyRecoveryWrite({...record,args:[1]},{...r,state:'PASS'},result),false);
});
test('final record binds the exact attempt and both hashes',()=>{
 const record={method:'finalize_recovery',caseId:1,args:[1,2]};
 const result={...r,state:'RESOLVED',resolution:{attempt_id:2,revision_sha256:'digest',snapshot_sha256:'snapshot'}};
 assert.equal(verifyRecoveryWrite(record,result,{...a,status:'PASS'}),true);
 assert.equal(verifyRecoveryWrite(record,{...result,resolution:{...result.resolution,revision_sha256:'wrong'}},{...a,status:'PASS'}),false);
 assert.equal(verifyRecoveryWrite(record,result,{...a,status:'PASS',role:'A'}),false);
 assert.equal(verifyRecoveryWrite(record,{...result,state:'UPSTREAM_VERIFIED_B_REVIEW_REQUIRED'},{...a,status:'PASS',role:'A'}),true);
});
