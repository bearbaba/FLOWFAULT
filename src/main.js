import './style.css';
import { project } from './project.js';
import { classifyTx, parseValue, verifyStored } from '../lib/verification.js';
import { runWorkerA, runWorkerB } from '../lib/workers.js';
import { createClient } from 'genlayer-stable';
import { studionet } from 'genlayer-stable/chains';

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const explorer = 'https://explorer-studio.genlayer.com/tx/';
const pendingKey = project.id + '-pending-tx-v1';
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const CHAIN = 61999;
let config = null, account = '', busy = false, checking = false;

const steps=[
 {key:'open_case',name:'Create case',role:'Owner',tip:'Lock the agreement and assign two different worker wallets.'},
 {key:'submit_evidence',name:'Worker A',role:'Worker A',tip:'Switch to Worker A. Generate the correct extraction and sign it.'},
 {key:'submit_evidence',name:'Worker B',role:'Worker B',tip:'Switch to Worker B. For the demo, generate the faulty report (27).'},
 {key:'open_dispute',name:'Open dispute',role:'Owner',tip:'Switch back to Owner. Compare the two signed artifacts and open a dispute.'},
 {key:'adjudicate',name:'AI decision',role:'Any wallet',tip:'Request GenLayer comparative AI consensus and verify the actual verdict.'},
 {key:'submit_rework',name:'Submit rework',role:'Responsible worker',tip:'Only the worker named in the final REWORK verdict may submit a replacement.'}
];
let activeStep=0,activeCaseId=null,liveCase=null,liveReceipt=null;
const shortAddr=v=>v&&ADDRESS.test(v)?v.slice(0,6)+'…'+v.slice(-4):'—';
function doneSteps(){
 if(!liveCase)return [false,false,false,false,false,false];
 const complete=liveCase.stage==='DECIDED';
 return [true,!!liveCase.a_sha256,!!liveCase.b_sha256,!!liveCase.dispute,complete,!!liveReceipt];
}
function suggestedStep(){
 const done=doneSteps();
 const index=done.findIndex(v=>!v);
 return index<0?5:index;
}
function paintSteps(){
 const done=doneSteps();
 $('stepNav').innerHTML=steps.map((s,i)=>
  '<button type="button" class="step '+(activeStep===i?'selected ':'')+(done[i]?'finished':'')+'" data-go-step="'+i+'" aria-current="'+(activeStep===i?'step':'false')+'">'+
  '<span class="stepIndex">'+(done[i]?'✓':String(i+1).padStart(2,'0'))+'</span>'+
  '<span>'+esc(s.name)+'</span></button>'
 ).join('');
 for(const b of $('stepNav').querySelectorAll('[data-go-step]'))b.onclick=()=>goStep(Number(b.dataset.goStep));
 const current=steps[activeStep];
 for(const panel of document.querySelectorAll('[data-action]'))panel.hidden=panel.dataset.action!==current.key;
 const roleAddress=current.role==='Owner'?liveCase?.owner:current.role==='Worker A'?liveCase?.worker_a:current.role==='Worker B'?liveCase?.worker_b:
  current.role==='Responsible worker'?(liveCase?.verdict==='REWORK_B'?liveCase?.worker_b:liveCase?.verdict==='REWORK_A'?liveCase?.worker_a:null):null;
 $('stepIntro').innerHTML='<div><div class="stepKicker">STEP '+(activeStep+1)+' OF 6 · '+esc(current.role)+'</div>'+
  '<h2>'+esc(current.name)+'</h2><p>'+esc(current.tip)+'</p>'+
  (roleAddress?'<p class="roleWallet">Required wallet <strong>'+esc(shortAddr(roleAddress))+'</strong></p>':'')+
  (done[activeStep]?'<p class="stepDone">✓ This step is already confirmed on-chain for the selected case.</p>':'')+
  (activeStep===5&&liveCase&& !['REWORK_B','REWORK_A'].includes(liveCase.verdict)?'<p class="stepWarning">This verdict does not authorize a replacement. Review the case instead.</p>':'')+
  '</div>';
 for(const btn of document.querySelectorAll('[data-worker]')){
  btn.hidden=(activeStep===1?btn.dataset.worker!=='A':activeStep===2?btn.dataset.worker!=='B_FAULT':true);
 }
 for(const b of document.querySelectorAll('[data-sign]')){
  b.disabled=busy||!config?.configured||!!(done[activeStep]&&activeStep!==0)||
    !!(activeStep===5&&liveCase&&!['REWORK_A','REWORK_B'].includes(liveCase.verdict));
 }
 for(const key of ['submit_evidence','open_dispute','adjudicate','submit_rework']){
  const field=$('f_'+key+'_case_id');
  if(field&&activeCaseId&&(!field.value||Number(field.value)!==activeCaseId))field.value=String(activeCaseId);
 }
 const caseTitle=liveCase?'Case #'+liveCase.id:'No case yet';
 $('caseTitle').textContent=caseTitle;
 $('caseStatus').textContent=liveCase?
  (liveReceipt?'Rework submitted · Receipt #'+liveReceipt.id:liveCase.stage+' · '+liveCase.verdict):
  'Create a case or load the latest one.';
 $('caseStatus').className='caseStatus'+(liveReceipt?' ready':'');
 $('caseRoles').textContent=liveCase?
  'Owner '+shortAddr(liveCase.owner)+' · A '+shortAddr(liveCase.worker_a)+' · B '+shortAddr(liveCase.worker_b):'Three distinct wallets are required.';
 $('homeCase').textContent=liveCase?
  ('#'+liveCase.id+' · '+(liveReceipt?'Receipt #'+liveReceipt.id:liveCase.verdict==='PENDING'?liveCase.stage:liveCase.verdict)):'No case';
 if(liveCase&&liveReceipt){$('caseComplete').hidden=false;$('caseComplete').textContent=
  'Case #'+liveCase.id+' · '+liveCase.verdict+' · Receipt #'+liveReceipt.id+' · REWORK SUBMITTED (not independently verified)';}
 else $('caseComplete').hidden=true;
}
function goStep(i){
 activeStep=Math.max(0,Math.min(5,i));
 paintSteps();
 showPage('workflow');
 window.scrollTo({top:0,behavior:'smooth'});
}
async function refreshProgress(recommend=false){
 if(!config?.configured)return;
 try{
  const totals=await api('court','totals');
  const newest=Number(totals?.cases||0);
  const id=activeCaseId||newest;
  if(!id){liveCase=null;liveReceipt=null;activeCaseId=null;}
  else{
    const result=await api('court','get_case',[id]);
    if(result?.id!==id)throw Error('Case readback did not match selected ID.');
    liveCase=result;activeCaseId=id;
    const raw=await api('gate','receipt_for',[id]);
    liveReceipt=raw&&typeof raw==='object'&&raw.case_id===id?raw:null;
  }
  if(recommend)activeStep=suggestedStep();
  paintSteps();
  $('caseRefreshLabel').textContent='Latest-final state';
 }catch(e){
  $('caseRefreshLabel').textContent='Chain read unavailable · Retry';
 }
}
function proposeNext(record,proof){
 const step=Number.isSafeInteger(record.step)?record.step:
  record.method==='open_case'?0:record.method==='submit_evidence'?(record.actor===liveCase?.worker_a?1:2):
  record.method==='open_dispute'?3:record.method==='adjudicate'?4:5;
 let next=step+1;
 let message=next<steps.length?'Verified. Continue to '+steps[next].name+'.':'Recovery receipt verified. You can inspect the on-chain record.';
 if(step===4&&!['REWORK_A','REWORK_B'].includes(liveCase?.verdict)){
  next=-1;message='The AI verdict does not authorize rework. Review the finalized case.';
 }
 if(step===5)next=-1;
 $('txNextWrap').hidden=false;
 $('txNextText').textContent=message;
 $('txNext').textContent=next===-1?'View verified record →':'Continue · '+steps[next].name+' →';
 $('txNext').onclick=()=>{
  if(next===-1){
   $('readMethod').value=step===5?'3':'0';
   $('readId').value=String(activeCaseId||record.args[0]||1);
   showPage('verify');handleRead().catch(e=>{$('readResult').textContent='Read unavailable: '+e.message});
  }else goStep(next);
 };
}


function notice(title, detail, phase=0, hash='') {
  $('txTitle').textContent=title;
  $('txMessage').textContent=detail;
  $('txBadge').textContent=phase===3?'VERIFIED':phase===2?'TRACKING':phase===1?'SIGNING':/failed|error|unavailable/i.test(title)?'ATTENTION':'READY';
  $('txBadge').className='txBadge '+(phase===3?'isGood':phase>=1?'isActive':'');
  $('activity').classList.toggle('engaged',phase>=1||!!hash);
  for(let n=1;n<=3;n++)$('phase'+n).className=n<phase?'done':n===phase?'current':'';
  $('txExplorer').hidden=!hash;
  $('txHashText').textContent=hash?shortAddr(hash)+' · saved transaction':'No transaction sent yet';
  if(hash)$('txExplorer').href=explorer+encodeURIComponent(hash);
  if(phase!==3)$('txNextWrap').hidden=true;
}
function setBusy(v) {
  busy=v;
  document.querySelectorAll('button[data-sign]').forEach(b=>b.disabled=v||!config?.configured);
  if($('stepNav'))paintSteps();
}
function showPage(name) {
  for(const p of ['overview','workflow','verify']) $(p).hidden = p!==name;
  for(const e of document.querySelectorAll('[data-page]')) e.classList.toggle('active',e.dataset.page===name);
  $('breadcrumb').textContent=name[0].toUpperCase()+name.slice(1);
  if(location.hash!=='#'+name) history.replaceState(null,'','#'+name);
}
for(const e of document.querySelectorAll('[data-page]'))
  e.addEventListener('click',()=>{showPage(e.dataset.page);window.scrollTo(0,0)});
window.addEventListener('hashchange',()=>showPage(location.hash.slice(1)||'overview'));

function renderMeta() {
  document.title=project.name+' — GenLayer Studionet';
  $('brandName').textContent=project.name;
  $('category').textContent=project.eyebrow;
  $('heroTitle').textContent=project.title;
  $('heroSub').textContent=project.intro;
  $('featureText').textContent=project.feature;
  $('boundaries').textContent=project.boundaries;
  $('sourceLink').href='https://github.com/'+project.repo;
  $('githubLink').href='https://github.com/'+project.repo;
}
function makeField(key, title, kind, method) {
  const id='f_'+method+'_'+key;
  const options=kind.startsWith('select:')?kind.slice(7).split(','):[];
  const input=options.length
   ? '<select id="'+id+'" required>'+options.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('')+'</select>'
   : kind==='textarea' ? '<textarea id="'+id+'" rows="4" required></textarea>'
   : '<input id="'+id+'" type="'+(kind==='number'?'number':'text')+'" '+(kind==='number'?'min="0" step="1"':'')+' '+(kind==='address'?'placeholder="0x..."':'')+' required>';
  return '<label class="'+(kind==='textarea'?'wide':'')+'">'+esc(title)+input+'</label>';
}
function renderForms(){
  $('forms').innerHTML=project.forms.map(f=>
    '<section class="action" data-action="'+esc(f.key)+'" hidden>'+
    '<div class="actionTop"><span class="pill">'+esc(f.scope.toUpperCase())+' · '+esc(f.method)+'</span><span class="safeHint">Studionet · Test GEN only</span></div>'+
    '<form id="form_'+esc(f.key)+'"><div class="fieldGrid">'+f.fields.map(x=>makeField(x[0],x[1],x[2],f.key)).join('')+'</div>'+
    '<div class="actions">'+
    (f.preset?'<button class="outline" type="button" data-preset="'+esc(f.preset)+'" data-target="'+esc(f.key)+'">Use sample data</button>':'')+
    (f.key==='submit_evidence'?
      '<button class="outline" type="button" data-worker="A">Generate Worker A output</button>'+
      '<button class="outline" type="button" data-worker="B_FAULT">Generate faulty Worker B (27)</button>':'')+
    (f.key==='submit_rework'?'<button class="outline" type="button" data-rework="correct">Generate corrected output</button>':'')+
    '<button class="primary signAction" type="submit" data-sign>Review & sign →</button>'+
    '</div></form><p class="hint">You approve every transaction in your own wallet. No automatic retries or duplicate signing.</p></section>'
  ).join('');
  for(const f of project.forms){
    $('form_'+f.key).addEventListener('submit',ev=>{ev.preventDefault();startSign(f)});
  }
  for(const button of document.querySelectorAll('[data-preset]')){
    button.addEventListener('click',()=>{
      const target=button.dataset.target;
      for(const [k,v] of Object.entries(project.samples[button.dataset.preset]||{})){
        const field=$('f_'+target+'_'+k);
        if(field)field.value=String(v);
      }
      notice('Draft loaded','Review all fields and wallet roles before signing. This action has not submitted a transaction.');
    });
  }
  for(const b of document.querySelectorAll('[data-worker]'))
    b.addEventListener('click',()=>generateWorkerDraft(b.dataset.worker));
  for(const b of document.querySelectorAll('[data-rework]'))
    b.addEventListener('click',()=>generateReworkDraft());
}
function updateAccount(v=''){
  account=v;
  $('walletBtn').textContent=v?v.slice(0,6)+'…'+v.slice(-4)+' · Disconnect':'Connect wallet';
  $('walletIdentity').textContent=v?'Connected wallet: '+v:'No wallet connected.';
}
async function connect(){
  if(account){updateAccount();return}
  if(!window.ethereum) throw Error('An EIP-1193 wallet (such as MetaMask) is required to sign.');
  const a=await window.ethereum.request({method:'eth_requestAccounts'});
  if(!ADDRESS.test(a?.[0]||''))throw Error('No valid wallet account.');
  updateAccount(a[0]);
  notice('Wallet connected','No transaction submitted. Review the role and arguments.');
}
$('walletBtn').onclick=()=>connect().catch(e=>notice('Wallet connection failed',e.message));
window.ethereum?.on?.('accountsChanged',a=>{updateAccount(a?.[0]||'');notice('Wallet changed','Please review the active role before signing again.')});
window.ethereum?.on?.('chainChanged',()=>notice('Network changed','Studionet 61999 is required for contract writes.'));
async function ensureWallet() {
  if(!account)await connect();
  if(!account)throw Error('Connect your wallet first');
  const desired='0x'+CHAIN.toString(16);
  let chain=await window.ethereum.request({method:'eth_chainId'});
  if(parseInt(chain,16)!==CHAIN){
    try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:desired}]})}
    catch(e){
      if(e?.code!==4902)throw Error('Switch wallet to Studionet 61999 first');
      await window.ethereum.request({method:'wallet_addEthereumChain',params:[{
        chainId:desired, chainName:'GenLayer Studionet',
        rpcUrls:['https://studio.genlayer.com/api'],
        nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},
        blockExplorerUrls:['https://explorer-studio.genlayer.com']
      }]});
    }
  }
  chain=await window.ethereum.request({method:'eth_chainId'});
  if(parseInt(chain,16)!==CHAIN)throw Error('Wallet not on Studionet 61999');
  return createClient({chain:studionet,account,provider:window.ethereum});
}
async function api(scope,method,inputs=[]) {
  const u=new URL('/api/state',location.origin);
  u.searchParams.set('scope',scope);u.searchParams.set('method',method);
  for(let i=0;i<inputs.length;i++) u.searchParams.set('a'+i,String(inputs[i]));
  const response=await fetch(u,{cache:'no-store'});
  const json=await response.json();
  if(!response.ok||!json.ok)throw Error(json.error||'Chain read unavailable');
  return parseValue(json.value);
}
async function sha256(s){
  const bytes=new TextEncoder().encode(s);
  const d=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('');
}
function numberField(v){if(!/^(0|[1-9][0-9]*)$/.test(v)||!Number.isSafeInteger(Number(v)))throw Error('Invalid whole number');return Number(v)}
function argValues(f){
 return f.fields.map(([key,,kind])=>{
   const v=$('f_'+f.key+'_'+key).value.trim();
   if(!v) throw Error('Missing '+key);
   if(kind==='number')return numberField(v);
   if(kind==='address'&&!ADDRESS.test(v))throw Error('Invalid wallet address in '+key);
   return v;
 });
}
async function validateCaseWrite(f,values){
  const signer=account.toLowerCase();
  const norm=v=>String(v||'').toLowerCase();
  if(f.key==='open_case'){
    if(norm(values[0])===norm(values[1])||norm(values[0])===signer||norm(values[1])===signer)
      throw Error('Case owner, Worker A and Worker B must be three distinct wallets.');
    return;
  }
  const c=await api('court','get_case',[values[0]]);
  if(f.key==='submit_evidence'){
    if(c.stage!=='OPEN')throw Error('Evidence window closed.');
    if(signer===norm(c.worker_a)){if(c.a_sha256)throw Error('Worker A evidence already frozen.')}
    else if(signer===norm(c.worker_b)){
      if(!c.a_sha256)throw Error('Worker A must sign evidence first.');
      if(c.b_sha256)throw Error('Worker B evidence already frozen.');
    }else throw Error('Use the assigned Worker A or B wallet.');
  }else if(f.key==='open_dispute'){
    if(signer!==norm(c.owner))throw Error('Use the case owner wallet.');
    if(c.stage!=='OPEN'||!c.a_sha256||!c.b_sha256)
      throw Error('Both signed worker artifacts are required before a dispute.');
  }else if(f.key==='adjudicate'){
    if(c.stage!=='DISPUTED'||c.verdict!=='PENDING')
      throw Error('No pending dispute to adjudicate.');
  }else if(f.key==='submit_rework'){
    const perm=await api('court','recovery_permission',[values[0],signer]);
    if(perm.allowed!==true||norm(perm.actor)!==signer)
      throw Error('Verdict does not authorize this wallet for rework.');
    if(perm.original_sha256===values[2])throw Error('Replacement hash must differ from the original.');
  }
}

async function startSign(f) {
  if(busy)return;
  const prior=loadPending();
  if(prior){notice('Pending transaction still stored','Recheck the same transaction before signing another.',2,prior.hash);$('recheck').hidden=false;return}
  if(!config?.configured){notice('Studio deployment required','Configure both deployed contracts before any signing. No transaction sent.');return}
  setBusy(true);
  let values;
  try{
    values=argValues(f);
    if(f.key==='submit_evidence'||f.key==='submit_rework'){
      const outputIndex=f.key==='submit_evidence'?1:1;
      const hashIndex=2;
      const expected=await sha256(values[outputIndex]);
      if(values[hashIndex]!==expected)throw Error('Submitted digest differs from the exact output text. Click Generate or recalculate SHA-256.');
    }
    const contract=config[f.scope];
    if(!ADDRESS.test(contract||''))throw Error('Configured contract address unavailable');
    const sender=await ensureWallet();
    await validateCaseWrite(f,values);
    const record={form:f.key,scope:f.scope,method:f.method,args:values,actor:account.toLowerCase(),step:activeStep,hash:'',prior:null};
    if(f.key==='open_case'){
      const before=await api('court','totals');
      if(!Number.isSafeInteger(before?.cases)||before.cases<0)
        throw Error('Cannot verify case count before signing. No tx sent.');
      record.prior=before.cases;
    }
    notice('Confirm in wallet','Review '+f.method+' and the destination contract. No tx has been broadcast yet.',1);
    const hash=await sender.writeContract({address:contract,functionName:f.method,args:values,value:0n});
    if(!/^0x[0-9a-fA-F]{64}$/.test(hash||''))throw Error('No valid transaction hash returned');
    record.hash=hash;
    sessionStorage.setItem(pendingKey,JSON.stringify(record));
    $('recheck').hidden=false;
    setBusy(false);
    await follow(record);
  }catch(e){setBusy(false);notice('Not submitted',e?.message||String(e))}
}
function loadPending(){try{return JSON.parse(sessionStorage.getItem(pendingKey)||'null')}catch{return null}}
async function follow(record){
  if(checking)return;
  checking=true;setBusy(true);$('recheck').hidden=false;
  notice('Waiting for GenLayer finality','Do not sign the same transaction twice. Checking execution and persisted state.',2,record.hash);
  try{
    for(let attempt=0;attempt<65;attempt++){
      let response;
      try{
        const r=await fetch('/api/tx?hash='+encodeURIComponent(record.hash),{cache:'no-store'});
        response=await r.json();
        if(!r.ok||!response.ok)throw Error(response.error||'Transaction query failed');
      }catch(e){await new Promise(res=>setTimeout(res,3500));continue}
      const phase=classifyTx(response);
      if(phase==='error'){
        sessionStorage.removeItem(pendingKey);
        notice('FINALIZED · execution failed','Transaction was not executed successfully. Preserve the hash to debug.',2,record.hash);
        return;
      }
      if(phase==='success'){
        for(let k=0;k<7;k++){
          try{
            const proof=await verifyRecord(record);
            if(proof.ok){
              sessionStorage.removeItem(pendingKey);
              if(Number.isSafeInteger(proof.caseId))activeCaseId=proof.caseId;
              await refreshProgress(false);
              notice('FINALIZED / VERIFIED',proof.message,3,record.hash);
              proposeNext(record,proof);
              await fillDefaultReads();
              return;
            }
          }catch(e){}
          await new Promise(res=>setTimeout(res,2500));
        }
        notice('FINALIZED · state unverified','Execution succeeded but matching persisted state has NOT yet been established. Recheck the same hash; do not submit again.',2,record.hash);
        return;
      }
      await new Promise(res=>setTimeout(res,3600));
    }
    notice('Not yet confirmed','Transaction hash is stored; recheck it later. Never sign duplicate while pending.',2,record.hash);
  }finally{checking=false;setBusy(false)}
}
async function verifyRecord(record){
  const a=record.args;
  const read=(scope,method,...args)=>api(scope,method,args);
  if(record.method==='open_case'){
    if(!Number.isSafeInteger(record.prior)||record.prior<0)
      throw Error('Pre-sign case count missing; cannot correlate a new case.');
    const totals=await read('court','totals');
    if(!Number.isSafeInteger(totals?.cases)||totals.cases<=record.prior)return {ok:false};
    // A bounded scan of only NEW case IDs; old matching cases cannot verify this write.
    for(let id=totals.cases;id>record.prior&&id>totals.cases-50;id--){
      const x=await read('court','get_case',id);
      if(verifyStored(record,x))
        return {ok:true,caseId:id,message:'Case #'+id+' verified on-chain.'};
    }
    return {ok:false};
  }
  if(['submit_evidence','open_dispute','adjudicate'].includes(record.method)){
    const x=await read('court','get_case',a[0]);
    if(verifyStored(record,x))return {ok:true,message:record.method==='adjudicate'?
      'Persisted AI verdict: '+x.verdict:'Case #'+a[0]+' matches finalized state.'};
  }
  if(record.method==='submit_rework'){
    const x=await read('gate','receipt_for',a[0]);
    if(verifyStored(record,x))return {ok:true,message:'Recovery receipt #'+x.id+': '+x.status};
  }
  return {ok:false};
}
function renderReads(){
  $('readMethod').innerHTML=project.reads.map((r,i)=>'<option value="'+i+'">'+esc(r[0])+' · '+esc(r[2])+'</option>').join('');
}
async function handleRead(){
  const r=project.reads[Number($('readMethod').value)];
  const primary=numberField($('readId').value||'1');
  const secondary=numberField($('readOther').value||'1');
  const actor=$('readActor').value.trim();
  const args=r[3]==='none'?[]:r[3]==='id'?[primary]:r[3]==='two'?[primary,secondary]:r[3]==='actor2'?[primary,actor]:[primary,secondary,actor];
  if((r[3]==='actor'||r[3]==='actor2')&&!ADDRESS.test(actor))throw Error('Enter a wallet address for this live authorization read');
  const result=await api(r[1],r[2],args);
  $('readResult').textContent=JSON.stringify(result,null,2);
}
$('readForm').onsubmit=async e=>{e.preventDefault();$('readResult').textContent='Reading latest-final on-chain state…';try{await handleRead()}catch(err){$('readResult').textContent='READ FAILED: '+err.message}};
async function fillDefaultReads(){
  if(!$('verify').hidden){try{await handleRead()}catch{}}
}
async function refreshConfig(){
  try{
    const r=await fetch('/api/state?op=config',{cache:'no-store'});
    config=await r.json();
    if(!r.ok)throw Error('Config unavailable');
    $('network').textContent=config.configured?'Studionet 61999 · Court/Gate linked':'Studio deployment pending';
    $('network').classList.toggle('pending',!config.configured);
    $('deploymentState').textContent=config.configured?'LINKED':'SOURCE';
    if(!config.configured)notice('Waiting for Studio deployment','Both contracts need deployment, addresses and readback preflight before wallet signing.');
  }catch(e){
    config={configured:false};
    $('network').textContent='RPC / config unavailable';
    $('network').classList.add('pending');
    $('deploymentState').textContent='SOURCE';
    notice('Unavailable',e.message);
  }
  setBusy(false);
  if(config?.configured)await refreshProgress(true);
}
async function generateWorkerDraft(role) {
  try{
    const field=$('f_submit_evidence_case_id');
    const id=numberField(field.value);
    const c=await api('court','get_case',[id]);
    if(role==='A'){
      const result=runWorkerA(c.source_data);
      $('f_submit_evidence_output').value=result;
    } else {
      if(!c.a_output)throw Error('Worker A must first submit a finalized artifact.');
      $('f_submit_evidence_output').value=runWorkerB(c.a_output,role==='B_FAULT');
    }
    $('f_submit_evidence_output_sha256').value=await sha256($('f_submit_evidence_output').value);
    notice('Worker artifact generated','This is actual deterministic browser code output, not an AI verdict. Review and sign with the assigned worker wallet.');
  }catch(e){notice('Could not generate artifact',e.message)}
}
async function generateReworkDraft(){
 try{
  const id=numberField($('f_submit_rework_case_id').value);
  const c=await api('court','get_case',[id]);
  if(c.verdict==='REWORK_B'){
   $('f_submit_rework_new_output').value=runWorkerB(c.a_output,false);
  }else if(c.verdict==='REWORK_A'){
   $('f_submit_rework_new_output').value=runWorkerA(c.source_data);
  }else throw Error('Case has no single authorized recovery worker');
  $('f_submit_rework_new_sha256').value=await sha256($('f_submit_rework_new_output').value);
  notice('Revision draft generated','Only the assigned responsible worker can sign. This is an artifact submission, NOT proof of accepted correction.');
 }catch(e){notice('Cannot generate correction',e.message)}
}
$('recheck').onclick=async()=>{const record=loadPending();if(record)await follow(record);else notice('No pending hash','Previous status remains visible; no automatic retry was sent.')};
$('refreshCase').onclick=()=>refreshProgress(true);
$('startCase').onclick=()=>goStep(0);
renderMeta();renderForms();renderReads();paintSteps();
showPage(['overview','workflow','verify'].includes(location.hash.slice(1))?location.hash.slice(1):'overview');
refreshConfig().then(()=>{const r=loadPending();if(r?.hash){$('recheck').hidden=false;follow(r)}});
