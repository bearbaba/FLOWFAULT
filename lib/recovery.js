export const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
export const FINAL_STATES = ['RESOLVED','UPSTREAM_VERIFIED_B_REVIEW_REQUIRED'];
export function recoveryActions(c, r, actor='') {
 const role = c?.verdict === 'REWORK_A' ? 'A' : c?.verdict === 'REWORK_B' ? 'B' : '';
 const eligible = c?.stage === 'DECIDED' && !!role;
 const responsible = eligible && String(c['worker_'+role.toLowerCase()]).toLowerCase() === actor.toLowerCase();
 return {
  role,
  submit: !!responsible && ['NOT_STARTED','FAIL','REVIEW'].includes(r?.state) && r.attempts.length < 2,
  assess: !!eligible && r?.state === 'SUBMITTED',
  finalize: !!eligible && r?.state === 'PASS'
 };
}
export function verifyRecoveryWrite(record, recovery, attempt) {
 if (!recovery || !attempt || recovery.case_id !== record.caseId || attempt.case_id !== record.caseId ||
     recovery.latest_attempt !== attempt.id || attempt.snapshot?.id !== record.caseId ||
     !['A','B'].includes(attempt.role)) return false;
 if(record.method==='submit_revision') return attempt.status==='SUBMITTED' && recovery.state==='SUBMITTED' &&
   attempt.new_output===record.args[1] && attempt.new_sha256===record.args[2] &&
   attempt.actor.toLowerCase()===record.actor.toLowerCase() && attempt.id>record.priorAttempt;
 if(record.method==='assess_revision') return attempt.id===record.args[0] &&
   ['PASS','FAIL','REVIEW'].includes(attempt.status) && recovery.state===attempt.status &&
   attempt.assessment?.verdict===attempt.status;
 if(record.method==='finalize_recovery') return attempt.id===record.args[1] && attempt.status==='PASS' &&
   recovery.state===(attempt.role==='B'?'RESOLVED':'UPSTREAM_VERIFIED_B_REVIEW_REQUIRED') &&
   recovery.resolution?.attempt_id===attempt.id && recovery.resolution?.revision_sha256===attempt.new_sha256 &&
   recovery.resolution?.snapshot_sha256===attempt.snapshot_sha256;
 return false;
}
