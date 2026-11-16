/** Read-only release gate: exact source, constructor binding and optional case evidence. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
import {TransactionHashVariant} from 'genlayer-stable/types';
const address=process.env.FLOWFAULT_VERIFIED_RECOVERY_ADDRESS,court=process.env.FLOWFAULT_COURT_ADDRESS;
if(![address,court].every(a=>/^0x[0-9a-fA-F]{40}$/.test(a||''))||address.toLowerCase()===court.toLowerCase())throw Error('Set distinct recovery and Court addresses');
const client=createClient({chain:studionet});
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const read=async(method,args=[])=>{const raw=await client.readContract({address,functionName:method,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});return typeof raw==='string'?JSON.parse(raw):raw;};
const local=readFileSync('contracts/verified_recovery.py','utf8');
const deployed=await client.getContractCode(address);
const archived=readFileSync('contracts/verified_recovery_deployed.py','utf8');
const normalize=s=>s.replace(/\r\n/g,'\n').replace(/\n+$/,'');
if(archived!==deployed)throw Error('Exact deployed archive mismatch');
if(normalize(local)!==normalize(deployed))throw Error('Source differs beyond line endings');
const stats=await read('stats');
if(stats.version!=='2.0.0'||stats.max_attempts!==2||stats.court.toLowerCase()!==court.toLowerCase()||JSON.stringify(stats.criteria)!==JSON.stringify(['agreement','source','dependency']))throw Error('Unexpected deployment configuration');
console.log(JSON.stringify({address,court,source_sha256:sha(local),deployed_sha256:sha(deployed),exact_source_match:local===deployed,exact_archive_match:true,line_endings_normalized_match:true,stats},null,2));
if(process.env.FLOWFAULT_VERIFY_CASE){
 const id=Number(process.env.FLOWFAULT_VERIFY_CASE);
 if(!Number.isSafeInteger(id)||id<=0)throw Error('Invalid case ID');
 const recovery=await read('get_recovery',[id]);
 const attempts=[];
 for(const attemptId of recovery.attempts){
  const attempt=await read('get_attempt',[attemptId]);
  if(attempt.id!==attemptId||attempt.case_id!==id||sha(attempt.new_output)!==attempt.new_sha256)throw Error('Evidence identity or digest mismatch');
  attempts.push(attempt);
 }
 console.log(JSON.stringify({recovery,attempts},null,2));
}
