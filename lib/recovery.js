export const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
export const FINAL_STATES = ['RESOLVED','UPSTREAM_VERIFIED_B_REVIEW_REQUIRED'];
export const FORMAT_REVIEW_REASON = 'Assessment format or evidence references could not be verified.';
export function recoveryActions(c, r, actor='', latestAttempt=null, policy=null) {
 const role = c?.verdict === 'REWORK_A' ? 'A' : c?.verdict === 'REWORK_B' ? 'B' : '';
 const eligible = c?.stage === 'DECIDED' && !!role;
 const responsible = eligible && String(c['worker_'+role.toLowerCase()]).toLowerCase() === actor.toLowerCase();
 return {
  role,
  submit: !!responsible && ['NOT_STARTED','FAIL','REVIEW'].includes(r?.state) && r.attempts.length < 2,
  assess: !!eligible && r?.state === 'SUBMITTED' &&
    (!['2.1.0','2.2.0'].includes(policy?.version) || (!!responsible && latestAttempt?.actor?.toLowerCase()===actor.toLowerCase())),
  retry: !!responsible && ['2.1.0','2.2.0'].includes(policy?.version) && policy?.retry_policy==='FORMAT_REVIEW_ONLY' &&
    r?.state==='REVIEW' && latestAttempt?.id===r?.latest_attempt &&
    latestAttempt?.actor?.toLowerCase()===actor.toLowerCase() &&
    latestAttempt?.status==='REVIEW' && latestAttempt?.assessment?.verdict==='REVIEW' &&
    Array.isArray(latestAttempt?.assessment?.checks) && latestAttempt.assessment.checks.length===0 &&
    latestAttempt?.assessment?.reason===FORMAT_REVIEW_REASON &&
    Number.isInteger(latestAttempt?.assessment_runs) && latestAttempt.assessment_runs>0 &&
    latestAttempt.assessment_runs<policy.max_assessment_runs,
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
 if(record.method==='retry_format_review') return attempt.id===record.args[0] &&
   Number.isInteger(record.priorAssessmentRuns) && record.priorAssessmentRuns>0 &&
   attempt.assessment_runs===record.priorAssessmentRuns+1 &&
   Array.isArray(attempt.assessment_history) &&
   attempt.assessment_history.length===attempt.assessment_runs &&
   attempt.assessment_history[record.priorAssessmentRuns-1]?.format_fallback===true &&
   attempt.assessment_history[record.priorAssessmentRuns-1]?.assessment_sha256===record.priorAssessmentHash &&
   attempt.assessment_history.at(-1)?.verdict===attempt.status &&
   ['PASS','FAIL','REVIEW'].includes(attempt.status) &&
   recovery.state===attempt.status && attempt.assessment?.verdict===attempt.status;
 if(record.method==='finalize_recovery') return attempt.id===record.args[1] && attempt.status==='PASS' &&
   recovery.state===(attempt.role==='B'?'RESOLVED':'UPSTREAM_VERIFIED_B_REVIEW_REQUIRED') &&
   recovery.resolution?.attempt_id===attempt.id && recovery.resolution?.revision_sha256===attempt.new_sha256 &&
   recovery.resolution?.snapshot_sha256===attempt.snapshot_sha256;
 return false;
}
