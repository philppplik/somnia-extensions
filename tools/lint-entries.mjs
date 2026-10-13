#!/usr/bin/env node
// PR lint (no secrets): entries.json shape, package hashes, no version overwrite vs base, permission and source rules.
import {readFileSync,existsSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {sha256} from './lib.mjs';
const fail=m=>{console.error('FAIL: '+m);process.exit(1);};
const cur=JSON.parse(readFileSync('catalog/entries.json','utf8'));
if(cur.schemaVersion!==1||!Array.isArray(cur.extensions)||cur.extensions.length>200)fail('entries.json schema');
const PERMS=new Set(JSON.parse(readFileSync('tools/permissions.json','utf8')));
const HIGH=new Set(['project.write']);
const ids=new Set();
for(const e of cur.extensions){
  if(ids.has(e.id))fail('duplicate id '+e.id);ids.add(e.id);
  if(!/^[a-f0-9]{64}$/.test(e.sha256))fail(e.id+': sha256 format');
  const m=/\/somnia-extensions\/main\/(packages\/[\w.-]+\.zip)$/.exec(e.download||'');if(!m)fail(e.id+': download must be a packages/*.zip in this repo');
  if(!existsSync(m[1]))fail(e.id+': package file missing');if(sha256(readFileSync(m[1]))!==e.sha256)fail(e.id+': sha256 does not match the ZIP bytes');
  for(const p of e.permissions||[])if(!PERMS.has(p))fail(`${e.id}: unknown permission ${p}`);
  if(e.reviewed!==undefined&&typeof e.reviewed!=='boolean')fail(e.id+': reviewed must be boolean');
  if(e.reviewedBy!==undefined&&(e.reviewed!==true||typeof e.reviewedBy!=='string'||!e.reviewedBy.length||e.reviewedBy.length>80))fail(e.id+': reviewedBy needs reviewed:true and 1-80 chars');
  if((e.permissions||[]).some(p=>HIGH.has(p)))console.log(`NOTE ${e.id}: Tier 2/3 permissions, needs two reviewers (docs/REVIEW.md)`);
}
const base=process.env.BASE_REF;
if(base){let old;try{old=JSON.parse(execSync(`git show ${base}:catalog/entries.json`,{encoding:'utf8'}));}catch{old=null;}
  for(const o of old?.extensions??[]){const n=cur.extensions.find(e=>e.id===o.id);
    if(n&&n.version===o.version&&(n.sha256!==o.sha256))fail(`${o.id}@${o.version}: published versions are immutable, bump the version`);}}
console.log('OK entries');
