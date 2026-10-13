#!/usr/bin/env node
// Signs the exact bytes of catalog/index.json. Private key: PEM from env SOMNIA_CATALOG_KEY only (never a file in the repo).
import {readFileSync,writeFileSync} from 'node:fs';
import {createPrivateKey} from 'node:crypto';
import {sign} from './lib.mjs';
const pem=process.env.SOMNIA_CATALOG_KEY;if(!pem)throw new Error('SOMNIA_CATALOG_KEY is not set');
const payload=readFileSync('catalog/index.json','utf8');
writeFileSync('catalog/index.json.sig',sign(createPrivateKey(pem),payload)+'\n');console.log('signed catalog/index.json');
