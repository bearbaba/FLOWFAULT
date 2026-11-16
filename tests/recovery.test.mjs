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

test('V2.1 retries only a frozen malformed-format REVIEW and only by the signing worker',()=>{
 const policy={version:'2.1.0',retry_policy:'FORMAT_REVIEW_ONLY',max_assessment_runs:3};
 const fallback={verdict:'REVIEW',checks:[],reason:'Assessment format or evidence references could not be verified.'};
 const current={...a,id:2,actor:'0xb',status:'REVIEW',assessment:fallback,assessment_runs:1};
 const state={...r,state:'REVIEW'};
 assert.equal(recoveryActions(c,state,'0xb',current,policy).retry,true);
 assert.equal(recoveryActions(c,state,'0xa',current,policy).retry,false);
 assert.equal(recoveryActions(c,state,'0xb',{...current,assessment_runs:3},policy).retry,false);
 assert.equal(recoveryActions(c,state,'0xb',{...current,assessment:{...fallback,checks:[{criterion:'source',result:'REVIEW'}]}},policy).retry,false);
 assert.equal(recoveryActions(c,state,'0xb',{...current,assessment:{...fallback,reason:'Real semantic uncertainty'}},policy).retry,false);
 assert.equal(recoveryActions(c,state,'0xb',current,{...policy,version:'2.0.0'}).retry,false);
 assert.equal(recoveryActions(c,{...state,latest_attempt:4},'0xb',current,policy).retry,false);
});

test('V2.1 finalized retry must increment the audit log and preserve the previous evidence hash',()=>{
 const record={method:'retry_format_review',caseId:1,args:[2],priorAssessmentRuns:1,priorAssessmentHash:'old-review-hash'};
 const outcome={...a,status:'PASS',assessment:{verdict:'PASS'},assessment_runs:2,
   assessment_history:[
     {run:1,verdict:'REVIEW',format_fallback:true,assessment_sha256:'old-review-hash'},
     {run:2,verdict:'PASS',format_fallback:false,assessment_sha256:'new-pass-hash'}
   ]};
 assert.equal(verifyRecoveryWrite(record,{...r,state:'PASS'},outcome),true);
 assert.equal(verifyRecoveryWrite(record,{...r,state:'REVIEW'},outcome),false);
 assert.equal(verifyRecoveryWrite(record,{...r,state:'PASS'},{...outcome,assessment_runs:1}),false);
 assert.equal(verifyRecoveryWrite(record,{...r,state:'PASS'},{...outcome,assessment_history:[{...outcome.assessment_history[0],assessment_sha256:'tampered'},outcome.assessment_history[1]]}),false);
 assert.equal(verifyRecoveryWrite(record,{...r,state:'PASS'},{...outcome,assessment_history:outcome.assessment_history.slice(0,1)}),false);
});

test('ordinary V2 assessments remain supported, including conservative semantic REVIEW',()=>{
 const old={...r,state:'REVIEW'};
 assert.equal(recoveryActions(c,old,'0xb').retry,false);
 assert.equal(recoveryActions(c,old,'0xb').submit,true);
 assert.equal(recoveryActions(c,{...r,state:'SUBMITTED'}).assess,true);
});

test('V2.1 restricts initial assessment to the worker who signed the current attempt',()=>{
 const policy={version:'2.1.0',retry_policy:'FORMAT_REVIEW_ONLY',max_assessment_runs:3};
 assert.equal(recoveryActions(c,r,'0xb',{...a,actor:'0xb'},policy).assess,true);
 assert.equal(recoveryActions(c,r,'0xa',{...a,actor:'0xb'},policy).assess,false);
 assert.equal(recoveryActions(c,r,'0xb',{...a,actor:'0xa'},policy).assess,false);
 assert.equal(recoveryActions(c,r).assess,true); // deployed V2.0 interface retains old behavior
});

test('V2.2 signed retry uses identical format-only policy with deterministic citation IDs',()=>{
 const policy={version:'2.2.0',retry_policy:'FORMAT_REVIEW_ONLY',
   citation_mode:'DETERMINISTIC_REFERENCE_IDS',max_assessment_runs:3};
 const fallback={verdict:'REVIEW',checks:[],reason:'Assessment format or evidence references could not be verified.'};
 const attempt={...a,id:2,actor:'0xb',status:'REVIEW',assessment:fallback,assessment_runs:1};
 const state={...r,state:'REVIEW'};
 assert.equal(recoveryActions(c,state,'0xb',attempt,policy).retry,true);
 assert.equal(recoveryActions(c,state,'0xa',attempt,policy).retry,false);
 assert.equal(recoveryActions(c,state,'0xb',{...attempt,assessment_runs:3},policy).retry,false);
 assert.equal(recoveryActions(c,state,'0xb',{...attempt,status:'FAIL'},policy).retry,false);
 assert.equal(recoveryActions(c,{...state,latest_attempt:3},'0xb',attempt,policy).retry,false);
 assert.equal(recoveryActions(c,{...r,state:'SUBMITTED'},'0xb',{...attempt,status:'SUBMITTED'},policy).assess,true);
 assert.equal(recoveryActions(c,{...r,state:'SUBMITTED'},'0xa',{...attempt,status:'SUBMITTED'},policy).assess,false);
});
