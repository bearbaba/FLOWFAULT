/**
 * Independent read-only attestation of the signed V2.2 PASS -> RESOLVED proof.
 * Does not sign transactions, write chain state, or infer acceptance from a
 * leader's GenVM output. Reads only public latest-final contract state.
 *
 * FLOWFAULT_VERIFIED_RECOVERY_ADDRESS=0x6a9E026adfD607f087626B06e293e7b277AD3966
 * FLOWFAULT_COURT_ADDRESS=0x02A5476d786f55a215B33d77bdb071acB787182b
 * npm run verify:recovery:v22
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
import {TransactionHashVariant} from 'genlayer-stable/types';

const address=process.env.FLOWFAULT_VERIFIED_RECOVERY_ADDRESS;
const court=process.env.FLOWFAULT_COURT_ADDRESS;
const caseId=Number(process.env.FLOWFAULT_VERIFY_CASE||'3');
const expectedVersion='2.2.0';
const addr=/^0x[0-9a-fA-F]{40}$/;
const require=(ok,message)=>{if(!ok)throw Error(message)};
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const same=(a,b)=>String(a).toLowerCase()===String(b);
const normalize=s=>s.replace(/\r\n/g,'\n').replace(/\n+$/,'');
// The frozen Court case fields are shallow scalars; Python canonical JSON sorts these keys.
const canonical=x=>JSON.stringify(x,Object.keys(x).sort());
require(addr.test(address||'')&&addr.test(court||'')&&!same(address,court),'Set distinct contract and Court addresses');
require(Number.isSafeInteger(caseId)&&caseId>0,'Invalid Court case ID');

const client=createClient({chain:studionet});
const read=async(addr,fn,args=[])=>{
 const raw=await client.readContract({address:addr,functionName:fn,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
 return typeof raw==='string'?JSON.parse(raw):raw;
};
const [deployed,stats,recovery,original]=await Promise.all([
 client.getContractCode(address),read(address,'stats'),read(address,'get_recovery',[caseId]),read(court,'get_case',[caseId])
]);
const source=readFileSync('contracts/verified_recovery_v22.py','utf8');
const archive=readFileSync('contracts/verified_recovery_v22_deployed.py','utf8');
require(deployed===archive,'On-chain contract source differs from exact deployment archive');
require(normalize(deployed)===normalize(source),'Deployed and developer sources differ beyond line endings');
const policyChecks={
 version:stats?.version===expectedVersion,
 citation:stats?.citation_mode==='DETERMINISTIC_REFERENCE_IDS',
 max_attempts:stats?.max_attempts===2,
 max_assessment_runs:stats?.max_assessment_runs===3,
 retry:stats?.retry_policy==='FORMAT_REVIEW_ONLY',
 criteria:JSON.stringify(stats?.criteria)===JSON.stringify(['agreement','source','dependency']),
 court:same(stats?.court,court)
};
require(Object.values(policyChecks).every(Boolean),
 'Unexpected deployed policy: '+JSON.stringify({policyChecks,observed:stats}));
require(original.id===caseId&&original.stage==='DECIDED'&&['REWORK_A','REWORK_B'].includes(original.verdict),
 'Original Court case is not a frozen single-worker decision');
require(recovery.state==='RESOLVED'&&Array.isArray(recovery.attempts)&&recovery.attempts.length>0&&
 recovery.attempts.length<=2&&recovery.latest_attempt===recovery.resolution?.attempt_id&&
 recovery.resolution.scope==='FROZEN_EVIDENCE_ONLY','Missing independently finalized hash-bound resolution');

const id=recovery.latest_attempt;
const attempt=await read(address,'get_attempt',[id]);
require(attempt.id===id&&attempt.case_id===caseId&&attempt.role==='B'&&
 same(attempt.actor,original.worker_b)&&attempt.status==='PASS'&&
 attempt.assessment.verdict==='PASS'&&
 attempt.new_sha256===sha(attempt.new_output)&&
 attempt.new_sha256===recovery.resolution.revision_sha256&&
 attempt.snapshot_sha256===recovery.resolution.snapshot_sha256,
 'Attempt not linked to signed B worker, matching source digests and RESOLVED receipt');
require(canonical(attempt.snapshot)===canonical(original)&&sha(canonical(original))===attempt.snapshot_sha256,
 'Court snapshot does not match frozen source and original commitment');
require(attempt.assessment_runs===1&&attempt.assessment_history.length===1&&
 attempt.assessment_history[0].run===1&&attempt.assessment_history[0].verdict==='PASS'&&
 attempt.assessment_history[0].format_fallback===false,'Assessment not first-run PASS');

const evidence={
 agreement:original.task_spec,source:original.source_data,
 original_a:original.a_output,original_b:original.b_output,revision:attempt.new_output
};
const bank={};
for(const field of Object.keys(evidence)){
 const raw=evidence[field];
 require(typeof raw==='string','Invalid evidence value '+field);
 const parts=raw.match(/[\s\S]{1,240}/g)||[];
 if(parts.length>1&&parts.at(-1).length<8)parts[parts.length-2]+=parts.pop();
 parts.slice(0,64).forEach((quote,index)=>{
  if(quote.length>=8&&quote.length<=300)bank[field+':'+(index+1)]={field,quote};
 });
}
const checks=attempt.assessment.checks;
require(Array.isArray(checks)&&checks.length===3,'AI PASS requires three specific checks');
const seen=new Set();
for(const c of checks){
 require(['agreement','source','dependency'].includes(c.criterion)&&!seen.has(c.criterion),
   'Wrong or duplicate assessment criterion');
 seen.add(c.criterion);
 require(c.result==='PASS'&&typeof c.reason==='string'&&c.reason.length>=12&&c.reason.length<=500,
  'Invalid PASS or empty reason');
 require(Array.isArray(c.references)&&c.references.length>=2&&c.references.length<=4,
  'Invalid reference list');
 const ids=new Set(),fields=[];
 for(const ref of c.references){
  const key=ref.ref_id,expected=bank[key];
  require(expected&&!ids.has(key)&&ref.field===expected.field&&ref.quote===expected.quote,
   'Forged, duplicate, or nonliteral reference ID: '+String(key));
  ids.add(key);fields.push(ref.field);
 }
 require(fields.includes('revision')&&
  (c.criterion==='agreement'?fields.includes('agreement'):
   c.criterion==='source'?fields.includes('source'):
   fields.includes('original_a')||fields.includes('agreement')),
  'Missing required frozen citation field for '+c.criterion);
}
console.log(JSON.stringify({
 verified:true,network:'GenLayer Studionet',address,court,case_id:caseId,
 version:stats.version,citation_mode:stats.citation_mode,source_sha256:sha(deployed),
 current_state:recovery.state,attempt_id:id,assessment:attempt.assessment.verdict,
 criteria:checks.map(x=>x.criterion+':'+x.result),
 revision_sha256:attempt.new_sha256,snapshot_sha256:attempt.snapshot_sha256,
 assessment_runs:attempt.assessment_runs,finality:'LATEST_FINAL',signature_status:'READ_ONLY_STATE',
 caveat:'Does not independently inspect transaction-level validator vote data; see signed tx links in docs/evidence/v22-case-3-pass-resolved.json'
},null,2));
