import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
import {TransactionHashVariant} from 'genlayer-stable/types';
const a=process.env.FLOWFAULT_COURT_ADDRESS,b=process.env.FLOWFAULT_RECOVERY_ADDRESS;
if(!/^0x[a-f0-9]{40}$/i.test(a||'')||!/^0x[a-f0-9]{40}$/i.test(b||'')){
 console.error('PENDING STUDIO: provide both real deployed addresses. No transaction sent.');
 process.exit(2);
}
const c=createClient({chain:studionet});
for(const [label,address,method] of [['court',a,'totals'],['recovery',b,'stats']]){
 try{
  const schema=await c.getContractSchema({address});
  if(!schema)throw Error('Empty deployed schema');
  const result=await c.readContract({address,functionName:method,args:[],transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
  console.log(label,'schema available; latest-final read:',result);
 }catch(e){console.error(label,'UNVERIFIED',e.message);process.exitCode=1}
}
