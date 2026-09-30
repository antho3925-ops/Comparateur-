#!/usr/bin/env node
// Imprime le mode d'emploi du suivi en PDF (A4, emojis en couleur).
//   node tools/mode-emploi.mjs  ->  docs/mode-emploi-suivi.pdf
import { resolve } from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }

const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + resolve('docs/mode-emploi-suivi.html'));
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: 'docs/mode-emploi-suivi.pdf', format: 'A4', printBackground: true, preferCSSPageSize: true });
await b.close();
console.log('docs/mode-emploi-suivi.pdf');
