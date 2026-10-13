// node --test test/. Uses throwaway keys generated per run. No real key exists in this repo.
import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync} from 'node:crypto';import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,cpSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
const root=process.cwd();
function setup(){
  const d=mkdtempSync(join(tmpdir(),'ext-'));cpSync(root,d,{recursive:true,filter:s=>!s.includes('.git')});
  const {publicKey,privateKey}=generateKeyPairSync('ed25519');const der=publicKey.export({type:'spki',format:'der'});
  const pem=privateKey.export({type:'pkcs8',format:'pem'});
  writeFileSync(join(d,'keys/public-keys.json'),JSON.stringify({keys:[{keyId:'k1',hex:der.subarray(der.length-32).toString('hex')}]}));
  return {d,pem};
}
const run=(d,cmd,args,env={})=>spawnSync('node',[join(d,'tools',cmd),...args],{cwd:d,env:{...process.env,...env},encoding:'utf8'});
test('build, sign, verify round trip with all packages hashed',()=>{
  const {d,pem}=setup();
  assert.equal(run(d,'build-index.mjs',['--key-id','k1']).status,0);
  assert.equal(run(d,'sign.mjs',[],{SOMNIA_CATALOG_KEY:pem}).status,0);
  const v=run(d,'verify.mjs',[]);assert.equal(v.status,0,v.stderr);
});
test('tampered index fails',()=>{
  const {d,pem}=setup();run(d,'build-index.mjs',['--key-id','k1']);run(d,'sign.mjs',[],{SOMNIA_CATALOG_KEY:pem});
  const p=join(d,'catalog/index.json');writeFileSync(p,readFileSync(p,'utf8').replace('"serial": 1','"serial": 2'));
  assert.notEqual(run(d,'verify.mjs',[]).status,0);
});
test('tampered package fails',()=>{
  const {d,pem}=setup();run(d,'build-index.mjs',['--key-id','k1']);run(d,'sign.mjs',[],{SOMNIA_CATALOG_KEY:pem});
  const e=JSON.parse(readFileSync(join(d,'catalog/index.json'),'utf8')).extensions[0];
  const f=join(d,/main\/(packages\/.+)$/.exec(e.download)[1]);writeFileSync(f,Buffer.concat([readFileSync(f),Buffer.from('x')]));
  assert.notEqual(run(d,'verify.mjs',[]).status,0);
});
test('wrong key fails; no pinned keys fails; serial increments from prev',()=>{
  const {d,pem}=setup();run(d,'build-index.mjs',['--key-id','k1']);
  const other=generateKeyPairSync('ed25519').privateKey.export({type:'pkcs8',format:'pem'});
  run(d,'sign.mjs',[],{SOMNIA_CATALOG_KEY:other});assert.notEqual(run(d,'verify.mjs',[]).status,0);
  writeFileSync(join(d,'keys/public-keys.json'),'{"keys":[]}');assert.notEqual(run(d,'verify.mjs',[]).status,0);
  run(d,'build-index.mjs',['--key-id','k1','--prev',join(d,'catalog/index.json'),'--out',join(d,'next.json')]);
  assert.equal(JSON.parse(readFileSync(join(d,'next.json'),'utf8')).serial,2);
});
test('days over 30 refused; sign without key refused',()=>{
  const {d}=setup();assert.notEqual(run(d,'build-index.mjs',['--key-id','k1','--days','60']).status,0);
  assert.notEqual(run(d,'sign.mjs',[],{SOMNIA_CATALOG_KEY:''}).status,0);
});
test('lint passes on shipped entries',()=>{const r=run(root,'lint-entries.mjs',[]);assert.equal(r.status,0,r.stderr);});
