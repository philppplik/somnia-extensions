#!/usr/bin/env node
// Builds catalog/index.json (schema 2) from entries.json + revoked.json. Does NOT sign.
// usage: node tools/build-index.mjs --key-id k1 [--prev <path to previous published index.json>] [--days 30] [--out catalog/index.json]
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {MAX_VALIDITY_DAYS,DAY} from './lib.mjs';
const a=process.argv.slice(2),arg=(n,d)=>{const i=a.indexOf('--'+n);return i>=0?a[i+1]:d;};
const keyId=arg('key-id');if(!keyId)throw new Error('--key-id required');
const days=Number(arg('days',String(MAX_VALIDITY_DAYS)));if(!(days>0&&days<=MAX_VALIDITY_DAYS))throw new Error('days must be 1..30');
const prevPath=arg('prev');let serial=1;
if(prevPath&&existsSync(prevPath)){const p=JSON.parse(readFileSync(prevPath,'utf8'));if(!Number.isSafeInteger(p.serial))throw new Error('previous index has no serial');serial=p.serial+1;}
const entries=JSON.parse(readFileSync('catalog/entries.json','utf8')),rev=JSON.parse(readFileSync('catalog/revoked.json','utf8'));
const now=Date.now(),iso=t=>new Date(t).toISOString().replace(/\.\d+Z$/,'Z');
const out={schemaVersion:2,serial,issuedAt:iso(now),expiresAt:iso(now+days*DAY),keyId,extensions:entries.extensions,revoked:rev.revoked};
writeFileSync(arg('out','catalog/index.json'),JSON.stringify(out,null,2)+'\n');console.log(`built serial ${serial}, ${out.extensions.length} extensions, ${out.revoked.length} revocations`);
