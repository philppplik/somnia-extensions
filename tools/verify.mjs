#!/usr/bin/env node
// Verifies index.json + .sig against pinned public keys, expiry window and package hashes. Needs no secret.
// usage: node tools/verify.mjs [--keys keys/public-keys.json] [--index catalog/index.json] [--sig catalog/index.json.sig] [--no-packages] [--prev-serial N]
import {readFileSync,existsSync} from 'node:fs';
import {sha256,verifyWith,loadKeys,DAY,MAX_VALIDITY_DAYS} from './lib.mjs';
const a=process.argv.slice(2),arg=(n,d)=>{const i=a.indexOf('--'+n);return i>=0?a[i+1]:d;};
const fail=m=>{console.error('FAIL: '+m);process.exit(1);};
const keys=loadKeys(arg('keys','keys/public-keys.json'));if(!keys.length)fail('no public keys pinned');
const payload=readFileSync(arg('index','catalog/index.json'),'utf8'),sig=readFileSync(arg('sig','catalog/index.json.sig'),'utf8');
if(!verifyWith(keys,payload,sig))fail('signature does not verify');
const idx=JSON.parse(payload);if(idx.schemaVersion!==2||!keys.some(k=>k.keyId===idx.keyId))fail('schema or keyId');
const iss=Date.parse(idx.issuedAt),exp=Date.parse(idx.expiresAt);
if(!(exp>iss)||exp-iss>MAX_VALIDITY_DAYS*DAY)fail('validity window');
if(Date.now()>=exp)fail('index expired');
const prev=arg('prev-serial');if(prev!==undefined&&!(idx.serial>Number(prev)))fail('serial not increasing');
if(!a.includes('--no-packages'))for(const e of idx.extensions){
  const m=/\/somnia-extensions\/main\/(packages\/.+)$/.exec(e.download);if(!m)fail(`${e.id}: download is not in this repo`);
  if(!existsSync(m[1]))fail(`${e.id}: package missing`);if(sha256(readFileSync(m[1]))!==e.sha256)fail(`${e.id}: sha256 mismatch`);
}
console.log(`OK serial ${idx.serial}, ${idx.extensions.length} extensions`);
