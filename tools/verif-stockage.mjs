#!/usr/bin/env node
/**
 * Verifie dans un vrai navigateur (Chromium, via Playwright) que le suivi des
 * contrats garde ses donnees sur l'appareil, et seulement la :
 *   - deux appareils ouvrant le meme lien ont chacun leurs propres contrats ;
 *   - les saisies et modifications survivent a la fermeture du navigateur ;
 *   - deux onglets ouverts ne s'ecrasent pas l'un l'autre ;
 *   - aucune donnee ne part sur le reseau.
 * Teste en lien partage (http) et en fichier ouvert directement (file://).
 *
 *   node build.mjs && node tools/exporter.mjs && node tools/verif-stockage.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, rmSync, mkdtempSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }

const SP = mkdtempSync(join(tmpdir(), 'suivi-'));
copyFileSync('dist/suivi.html', join(SP, 'suivi.html'));
const page = readFileSync(SP + '/suivi.html');
const srv = createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(page); }).listen(8765);
const URLS = { lien: 'http://localhost:8765/suivi.html', fichier: 'file://' + SP + '/suivi.html' };
const res = [];
const ok = (n, c) => { res.push([n, c]); console.log((c ? '  ok    ' : '  ECHEC ') + n); };

async function ajouter(p, nom, montant) {
  await p.click('#btn-nouveau');
  await p.click('.choix-type input[value="lpp"] + span');
  await p.fill('#c-nom', nom); await p.fill('#c-montant', String(montant));
  await p.click('#btn-enregistrer');
}
const noms = async (p) => (await p.locator('#lignes tr[data-id] .client .n').allInnerTexts()).sort().join(',');

for (const [mode, url] of Object.entries(URLS)) {
  console.log(`\n== ${mode} : ${url}`);
  // 1. Deux appareils = deux navigateurs distincts
  const dirA = SP + '/appareil-A-' + mode, dirB = SP + '/appareil-B-' + mode;
  let A = await chromium.launchPersistentContext(dirA);
  let B = await chromium.launchPersistentContext(dirB);
  const requetes = [];
  for (const ctx of [A, B]) ctx.on('request', (r) => requetes.push(r.url()));
  let pa = await A.newPage(); await pa.goto(url);
  let pb = await B.newPage(); await pb.goto(url);
  await ajouter(pa, 'Moi', 100000);
  await pb.reload();
  ok('appareil B ne voit pas le contrat de A', (await noms(pb)) === '');
  await ajouter(pb, 'Collegue', 50000);
  await pa.reload();
  ok('appareil A ne voit que le sien', (await noms(pa)) === 'Moi');
  ok('appareil B ne voit que le sien', (await noms(pb)) === 'Collegue');
  ok('aucune requête réseau hors chargement de la page', requetes.every((u) => u === url || u.startsWith('data:')));

  // 2. Fermer complètement le navigateur puis rouvrir
  await A.close();
  A = await chromium.launchPersistentContext(dirA); pa = await A.newPage(); await pa.goto(url);
  ok('après fermeture : le contrat est toujours là', (await noms(pa)) === 'Moi');
  // modification
  await pa.click('tr:has-text("Moi") [data-modifier]');
  await pa.fill('#c-montant', '200000'); await pa.selectOption('#c-statut', 'argent_recu');
  await pa.click('#btn-enregistrer');
  await pa.click('tr:has-text("Moi") [data-bascule="police"]');
  await A.close();
  A = await chromium.launchPersistentContext(dirA); pa = await A.newPage(); await pa.goto(url);
  const ligne = pa.locator('tr:has-text("Moi")');
  ok('après fermeture : modification conservée (200000, argent reçu, policé)',
    (await ligne.locator('td[data-l="Montant CHF"]').innerText()) === "200'000.00"
    && (await ligne.locator('.statut').innerText()) === 'Argent reçu'
    && (await ligne.locator('[data-bascule="police"]').getAttribute('aria-pressed')) === 'true');
  // fermeture brutale juste après saisie (sans quitter proprement la page)
  await ajouter(pa, 'Juste', 1000);
  await A.close();
  A = await chromium.launchPersistentContext(dirA); pa = await A.newPage(); await pa.goto(url);
  ok('fermeture immédiate après saisie : rien de perdu', (await noms(pa)) === 'Juste,Moi');

  // 3. Deux onglets ouverts en même temps sur le même appareil
  const onglet2 = await A.newPage(); await onglet2.goto(url);
  await ajouter(onglet2, 'Onglet2', 3000);
  await pa.click('tr:has-text("Juste") [data-bascule="police"]');   // onglet 1 modifie sans avoir rechargé
  await onglet2.reload();
  ok('deux onglets : le contrat saisi dans l\'autre onglet n\'est pas écrasé', (await noms(onglet2)) === 'Juste,Moi,Onglet2');
  await A.close(); await B.close();
}
srv.close();
rmSync(SP, { recursive: true, force: true });
const reussies = res.filter((r) => r[1]).length;
console.log(`\n${reussies}/${res.length} vérifications réussies`);
process.exit(reussies === res.length ? 0 : 1);
