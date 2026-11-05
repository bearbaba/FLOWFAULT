/** Pure, deterministic post-finality checks. Never infer SUCCESS from tx finality alone. */
export function parseValue(v) {
 if(typeof v==='string'){
   try{if(/^\s*[{[]/.test(v))return JSON.parse(v)}catch{}
 }
 return v;
}
export function classifyTx(raw){
 const status=String(raw?.status||raw?.statusName||'').toUpperCase();
 const exec=String(raw?.execution||raw?.txExecutionResultName||'').toUpperCase();
 if(/ERROR|REVERT|CANCEL|UNDETERMINED|FAILED/.test(status+' '+exec))return 'error';
 if(status==='FINALIZED' && (exec==='SUCCESS'||exec==='FINISHED_WITH_RETURN'))return 'success';
 if(status==='FINALIZED' && exec==='FINISHED_WITH_ERROR')return 'error';
 return 'pending';
}
const same=(a,b)=>String(a).toLowerCase()===String(b).toLowerCase();
export function verifyStored(r,x){
 if(!x||typeof x!=='object')return false;
 const a=r.args||[],actor=r.actor||'';
 switch(r.method){
 case 'open_case':
   return Number.isSafeInteger(r.prior)&&r.prior>=0&&Number.isSafeInteger(x.id)&&x.id>r.prior&&
    same(x.owner,actor)&&same(x.worker_a,a[0])&&same(x.worker_b,a[1])&&
    x.task_spec===a[2]&&x.source_data===a[3]&&x.stage==='OPEN'&&x.verdict==='PENDING'&&
    /^[0-9a-f]{64}$/.test(x.source_sha256||'');
 case 'submit_evidence':{
   if(x.id!==a[0]||x.stage!=='OPEN'||!(/^[0-9a-f]{64}$/.test(a[2]||'')))return false;
   const role=same(x.worker_a,actor)?'a':same(x.worker_b,actor)?'b':null;
   return !!role&&x[role+'_output']===a[1]&&x[role+'_sha256']===a[2];
 }
 case 'open_dispute':
   return x.id===a[0]&&same(x.owner,actor)&&x.dispute===a[1]&&x.stage==='DISPUTED'&&x.verdict==='PENDING'&&/^[0-9a-f]{64}$/.test(x.a_sha256||'')&&/^[0-9a-f]{64}$/.test(x.b_sha256||'');
 case 'adjudicate':
   return x.id===a[0]&&x.stage==='DECIDED'&&['REWORK_A','REWORK_B','SHARED','UNVERIFIABLE'].includes(x.verdict);
 case 'submit_rework':
   return Number.isSafeInteger(x.id)&&x.id>0&&x.case_id===a[0]&&same(x.actor,actor)&&['A','B'].includes(x.role)&&/^[0-9a-f]{64}$/.test(x.original_sha256||'')&&x.original_sha256!==x.new_sha256&&x.new_output===a[1]&&x.new_sha256===a[2]&&x.status==='REWORK_SUBMITTED_NOT_VERIFIED';
 default:return false;
 }
}
