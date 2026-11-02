import {readFileSync} from 'node:fs';
import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
const client=createClient({chain:studionet});
const contracts=[
 {name:'HandoffCourt',path:'contracts/handoff_court.py',methods:['open_case','submit_evidence','open_dispute','adjudicate','get_case','recovery_permission','totals']},
 {name:'RecoveryGate',path:'contracts/recovery_gate.py',methods:['submit_rework','receipt_for','get_receipt','stats']}
];
for(const c of contracts){
 try{
  const source=readFileSync(c.path,'utf8');
  const schema=await client.getContractSchemaForCode({contractCode:source});
  const actual=schema?.methods||{};
  const missing=c.methods.filter(m=>!Object.hasOwn(actual,m));
  if(missing.length)throw Error('Methods missing from schema: '+missing.join(', '));
  console.log('SCHEMA OK',c.name,JSON.stringify({ctor:schema?.ctor,methods:Object.keys(actual)}));
 }catch(e){console.error('SCHEMA FAILED',c.name,String(e.message||e));process.exitCode=1}
}
