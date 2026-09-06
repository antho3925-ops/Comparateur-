#!/usr/bin/env node
// Liste ce qui manque dans la base : couvertures connues mais non chiffrees.
// Usage : node tools/trous.mjs [id_assureur]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const filtre = process.argv[2];
const dossier = 'data/assureurs';
const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.json') && f !== '_TEMPLATE.json');

let totalTrous = 0;
for (const f of fichiers) {
  const a = JSON.parse(readFileSync(join(dossier, f), 'utf8'));
  if (filtre && a.id !== filtre) continue;

  const lignes = [];
  for (const p of a.produits_lca ?? []) {
    const manquantes = (p.couvertures ?? []).filter((c) => c.statut === 'a_completer');
    if (manquantes.length) {
      lignes.push(`  ${p.code_produit ?? '--'} ${p.nom}`);
      lignes.push(`     ${manquantes.map((c) => c.prestation_id).join(', ')}`);
    }
  }

  const chiffrees = (a.produits_lca ?? []).flatMap((p) => p.couvertures ?? [])
    .filter((c) => c.statut !== 'a_completer').length;
  const trous = (a.produits_lca ?? []).flatMap((p) => p.couvertures ?? [])
    .filter((c) => c.statut === 'a_completer').length;
  totalTrous += trous;

  console.log(`\n=== ${a.nom} (${a.id}) ===`);
  console.log(`${chiffrees} couverture(s) chiffree(s), ${trous} a completer\n`);
  if (lignes.length) {
    console.log('Produits dont il faut les conditions particulieres :');
    console.log(lignes.join('\n'));
  } else {
    console.log('Rien a completer.');
  }
}
console.log(`\nTotal a completer : ${totalTrous}`);
