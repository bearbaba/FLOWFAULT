/**
 * Read-only, address-scoped GenLayer deployment attestation.
 * No writes, wallet interaction, arbitrary addresses, or private data.
 * The source of a GenLayer intelligent contract is public chain state.
 */
import {createClient} from 'genlayer-stable';
import {studionet} from 'genlayer-stable/chains';
import {TransactionHashVariant} from 'genlayer-stable/types';
import {createHash} from 'node:crypto';

const client=createClient({chain:studionet});
const ADDRESS=/^0x[0-9a-fA-F]{40}$/;
const sha256=s=>createHash('sha256').update(s,'utf8').digest('hex');
const normalize=s=>s.replace(/\r\n/g,'\n').replace(/\n+$/,'');
const parse=v=>typeof v==='string'?JSON.parse(v):v;

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'GET only'});
  const address=process.env.FLOWFAULT_VERIFIED_RECOVERY_ADDRESS||'';
  const court=process.env.FLOWFAULT_COURT_ADDRESS||'';
  if(!ADDRESS.test(address)||!ADDRESS.test(court)||address.toLowerCase()===court.toLowerCase())
    return res.status(503).json({ok:false,error:'Release address or Court binding is not configured'});
  try {
    const [code,raw,schema]=await Promise.all([
      client.getContractCode(address),
      client.readContract({address,functionName:'stats',args:[],
        transactionHashVariant:TransactionHashVariant.LATEST_FINAL}),
      client.getContractSchema(address)
    ]);
    if(typeof code!=='string'||code.length<100)
      throw Error('No deployed source returned');
    const stats=parse(raw);
    const methods=Object.keys(schema?.methods||{});
    return res.status(200).json({
      ok:true,address,court,finality:'LATEST_FINAL',stats,methods,
      deployed_code_sha256:sha256(code),
      normalized_code_sha256:sha256(normalize(code)),
      // Public immutable contract source, emitted solely for exact independent comparison.
      deployed_source:code
    });
  } catch(e) {
    return res.status(502).json({ok:false,error:'V2.1 attestation failed: '+String(e?.message||e).slice(0,240)});
  }
}
