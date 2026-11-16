import './recovery.css';
import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
import {classifyTx,parseValue} from '../lib/verification.js';
import {ADDRESS,recoveryActions,verifyRecoveryWrite} from '../lib/recovery.js';
const $=id=>document.getElementById(id);
const KEY='flowfault-verified-recovery-pending-v2';
let config, actor='', data=null, busy=false, linked=false;
const message=s=>{$('message').textContent=s;};
const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),v=>v.toString(16).padStart(2,'0')).join('');
function pending(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function controls(){
 const actions=recoveryActions(data?.c,data?.r,actor), blocked=busy||!!pending()||!linked;
 for(const k of ['submit','assess','finalize']) $(k).disabled=blocked||!actions[k];
 $('load').disabled=busy; $('connect').disabled=busy; $('recheck').hidden=!pending(); $('recheck').disabled=busy;
 $('export').disabled=!data||busy;
}
async function api(scope,method,args=[]){
 const params=new URLSearchParams({scope,method});args.forEach((a,i)=>params.set('a'+i,a));
 const response=await fetch('/api/state?'+params,{cache:'no-store'}),j=await response.json();
 if(!response.ok||!j.ok||j.finality!=='LATEST_FINAL')throw Error(j.error||'Finalized read unavailable');
 return parseValue(j.value);
}
async function configuration(){
 linked=false;
 const response=await fetch('/api/state?op=config',{cache:'no-store'});
 if(!response.ok)throw Error('Configuration unavailable');
 config=await response.json();
 if(!config.recoveryConfigured||!ADDRESS.test(config.recovery||'')){
  $('deployment').textContent='Verified recovery deployment pending. Original FLOWFAULT cases remain accessible. Signing is disabled.';return;
 }
 const stats=await api('recovery','stats');
 if(stats.version!=='2.0.0'||stats.max_attempts!==2||String(stats.court).toLowerCase()!==config.court.toLowerCase()||
    JSON.stringify(stats.criteria)!==JSON.stringify(['agreement','source','dependency']))throw Error('Recovery contract configuration does not match this release');
 linked=true;$('deployment').textContent='Studionet 61999 · Verified recovery V2 · Court binding confirmed';
}
function add(parent,tag,text,cls){const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;parent.append(el);return el;}
function render(){
 const {c,r,attempts}=data,role=recoveryActions(c,r).role;
 $('casePanel').hidden=false;$('agreement').textContent=c.task_spec;$('state').textContent=r.state;
 $('role').textContent=role?'Responsible worker '+role+': '+c['worker_'+role.toLowerCase()]+(role==='A'?' · A verification leaves downstream B review required.':''):'This case has no single-worker recovery authorization.';
 $('source').textContent=JSON.stringify({source:c.source_data,worker_a:c.a_output,worker_b:c.b_output},null,2);
 $('original').textContent=role?c[role.toLowerCase()+'_output']:'No eligible artifact';
 $('latest').textContent=attempts.at(-1)?.new_output||'No revision submitted';
 $('history').replaceChildren();
 if(!attempts.length)add($('history'),'p','No verified-recovery attempts. V1 receipts do not count as V2 assessments.');
 for(const a of attempts){
  const article=add($('history'),'article','','attempt');
  add(article,'h3','Attempt '+a.round+' · '+a.status);
  add(article,'p','Signed by '+a.actor+' · SHA-256 '+a.new_sha256,'mono');
  add(article,'pre',a.new_output);
  for(const c of a.assessment?.checks||[]){
   const check=add(article,'div','','check');add(check,'strong',c.criterion.toUpperCase()+' · '+c.result);add(check,'p',c.reason);
   for(const ref of c.references||[])add(check,'p',ref.field+': “'+ref.quote+'”','reference');
  }
  if(a.assessment?.reason)add(article,'p',a.assessment.reason);
 }
 controls();
}
async function load(caseId=Number($('caseId').value)){
 if(!Number.isSafeInteger(caseId)||caseId<=0||caseId>99999999)throw Error('Enter a positive Case ID');
 data=null;controls();$('casePanel').hidden=true;
 const c=await api('court','get_case',[caseId]);
 const r=linked?await api('recovery','get_recovery',[caseId]):{case_id:caseId,attempts:[],latest_attempt:0,state:'DEPLOYMENT_PENDING'};
 if(c.id!==caseId||r.case_id!==caseId||!Array.isArray(r.attempts)||r.attempts.length>2)throw Error('Mismatched case readback');
 const attempts=[];
 for(const id of r.attempts){
  const a=await api('recovery','get_attempt',[id]);
  if(a.id!==id||a.case_id!==caseId||a.snapshot?.id!==caseId||await hash(a.new_output)!==a.new_sha256)throw Error('Attempt identity or content digest mismatch');
  attempts.push(a);
 }
 data={c,r,attempts};$('caseId').value=caseId;render();return data;
}
async function connect(){
 if(!window.ethereum)throw Error('A browser wallet is required for signing');
 [actor]=await window.ethereum.request({method:'eth_requestAccounts'});
 if(!ADDRESS.test(actor||''))throw Error('No valid wallet selected');
 $('connect').textContent=actor.slice(0,6)+'…'+actor.slice(-4);controls();
}
async function sign(method){
 if(busy||pending())return;busy=true;controls();
 try{
  if(!actor)await connect();
  await configuration();if(!linked)throw Error('Verified recovery is not deployed');
  const {c,r}=await load(), actions=recoveryActions(c,r,actor);
  const key={submit_revision:'submit',assess_revision:'assess',finalize_recovery:'finalize'}[method];
  if(!actions[key])throw Error('This action is not authorized in the current state');
  if(parseInt(await window.ethereum.request({method:'eth_chainId'}),16)!==61999)throw Error('Switch your wallet to GenLayer Studionet 61999');
  let args;
  if(method==='submit_revision'){
   const text=$('revision').value;
   if(text.length<8||text.length>1200)throw Error('Revision must contain 8–1200 characters');
   const digest=await hash(text);$('digest').textContent='SHA-256 '+digest;args=[c.id,text,digest];
  }else args=method==='assess_revision'?[r.latest_attempt]:[c.id,r.latest_attempt];
  const accounts=await window.ethereum.request({method:'eth_accounts'});
  if(accounts[0]?.toLowerCase()!==actor.toLowerCase())throw Error('Wallet changed; reconnect before signing');
  const record={method,args,caseId:c.id,actor,priorAttempt:r.latest_attempt,address:config.recovery,chainId:61999};
  message('Review '+method+' in your wallet. This sends a Studionet transaction.');
  const tx=await createClient({chain:studionet,account:actor,provider:window.ethereum}).writeContract({address:config.recovery,functionName:method,args,value:0n});
  if(!/^0x[0-9a-fA-F]{64}$/.test(tx||''))throw Error('No valid transaction hash returned');
  record.hash=tx;localStorage.setItem(KEY,JSON.stringify(record));
  message('Transaction submitted. Check pending transaction to verify finality and stored state.');
 }catch(e){message(e.message)}finally{busy=false;controls()}
}
async function recheck(){
 const p=pending();if(!p||busy)return;busy=true;controls();
 try{
  await configuration();
  if(!linked||p.chainId!==61999||p.address.toLowerCase()!==config.recovery.toLowerCase())throw Error('Pending transaction belongs to another deployment; inspect its transaction before continuing');
  $('txLink').href='https://explorer-studio.genlayer.com/tx/'+p.hash;$('txLink').hidden=false;
  const response=await fetch('/api/tx?hash='+encodeURIComponent(p.hash),{cache:'no-store'}),tx=await response.json();
  if(!response.ok||!tx.ok)throw Error('Transaction status unavailable; pending transaction retained');
  const status=classifyTx(tx);
  if(status==='error'){localStorage.removeItem(KEY);message('Transaction failed or was undetermined. No successful action is claimed. Refresh the case before retrying.');await load(p.caseId);return;}
  if(status!=='success'){message('Waiting for finalized execution. No new signature is needed.');return;}
  const {r,attempts}=await load(p.caseId);
  if(!verifyRecoveryWrite(p,r,attempts.at(-1)))throw Error('Finalized transaction does not yet match the expected stored result. Pending record retained.');
  localStorage.removeItem(KEY);message('Verified on-chain: '+r.state+'. '+(r.state==='PASS'?'Confirm verified recovery to persist the final resolution.':''));
 }catch(e){message(e.message)}finally{busy=false;controls()}
}
$('connect').onclick=()=>connect().catch(e=>message(e.message));
$('load').onclick=async()=>{if(busy)return;busy=true;controls();try{await configuration();await load();message('Loaded finalized evidence.')}catch(e){message(e.message)}finally{busy=false;controls()}};
$('submit').onclick=()=>sign('submit_revision');$('assess').onclick=()=>sign('assess_revision');$('finalize').onclick=()=>sign('finalize_recovery');$('recheck').onclick=recheck;
$('export').onclick=()=>{if(!data)return;const blob=new Blob([JSON.stringify({network:61999,court:config.court,recovery:config.recovery,observedAt:new Date().toISOString(),...data},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='flowfault-case-'+data.c.id+'-evidence.json';a.click();URL.revokeObjectURL(u)};
window.ethereum?.on?.('accountsChanged',()=>{actor='';$('connect').textContent='Connect wallet';controls()});
window.ethereum?.on?.('chainChanged',()=>message('Network changed. Studionet 61999 is required for signing.'));
configuration().catch(e=>{linked=false;$('deployment').textContent='Deployment verification unavailable';message(e.message)}).finally(controls);
