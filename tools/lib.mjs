import {createHash,createPublicKey,verify as edVerify,sign as edSign} from 'node:crypto';
import {readFileSync} from 'node:fs';
export const sha256=b=>createHash('sha256').update(b).digest('hex');
export const DAY=86400000;
export const MAX_VALIDITY_DAYS=30;
export const sign=(pem,payload)=>edSign(null,Buffer.from(payload),pem).toString('base64');
export function verifyWith(publicKeys,payload,sigB64){
  if(!/^[A-Za-z0-9+/]{86}==$/.test(sigB64.trim()))return null;
  for(const k of publicKeys){const key=createPublicKey({key:Buffer.concat([Buffer.from('302a300506032b6570032100','hex'),Buffer.from(k.hex,'hex')]),format:'der',type:'spki'});
    if(edVerify(null,Buffer.from(payload),key,Buffer.from(sigB64.trim(),'base64')))return k.keyId;}
  return null;
}
export const loadKeys=p=>JSON.parse(readFileSync(p,'utf8')).keys;
