import test from 'node:test';
import assert from 'node:assert/strict';
process.env.FLOWFAULT_COURT_ADDRESS='0x'+'1'.repeat(40);
process.env.FLOWFAULT_RECOVERY_ADDRESS='0x'+'2'.repeat(40);
delete process.env.FLOWFAULT_VERIFIED_RECOVERY_ADDRESS;
const {default:handler}=await import('../api/state.js');
async function call(query,method='GET'){
 let code=200,body;
 const res={setHeader(){},status(v){code=v;return this},json(v){body=v;return this}};
 await handler({query,method},res);return {code,body};
}
test('optional V2 is disabled without its separate address',async()=>{
 const {body}=await call({op:'config'});
 assert.equal(body.configured,true);assert.equal(body.recoveryConfigured,false);
 assert.equal((await call({scope:'recovery',method:'stats'})).code,400);
});
test('allowlist excludes inherited method and scope keys',async()=>{
 for(const method of ['constructor','toString','hasOwnProperty','__proto__'])assert.equal((await call({scope:'court',method})).code,400);
 for(const scope of ['constructor','__proto__','toString'])assert.equal((await call({scope,method:'stats'})).code,400);
});
test('invalid read arguments and write HTTP methods rejected',async()=>{
 assert.equal((await call({scope:'court',method:'get_case',a0:'0'})).code,400);
 assert.equal((await call({scope:'court',method:'totals',a0:'1'})).code,400);
 assert.equal((await call({},'POST')).code,405);
});
