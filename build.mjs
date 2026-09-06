#!/usr/bin/env node
// Compile les fichiers JSON de data/ en un seul data/db.js chargeable par
// index.html, y compris en ouverture locale (file://) ou fetch() est bloque.
// Usage : node build.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const DATA = 'data';
const ASSUREURS = join(DATA, 'assureurs');
const EXCLUS = new Set(['_TEMPLATE.json']);

const lire = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(`\n[ERREUR] ${p} : ${e.message}\n`);
    process.exit(1);
  }
};

const meta = lire(join(DATA, 'meta.json'));
const catalogue = lire(join(DATA, 'catalogue-prestations.json'));

const fichiers = readdirSync(ASSUREURS)
  .filter((f) => f.endsWith('.json') && !EXCLUS.has(basename(f)))
  .sort();

const assureurs = fichiers.map((f) => lire(join(ASSUREURS, f)));

// --- Controles de coherence ------------------------------------------------
const idsPrestations = new Set(catalogue.prestations.map((p) => p.id));
const idsGroupes = new Set(catalogue.groupes.map((g) => g.id));
const erreurs = [];
const alertes = [];

for (const p of catalogue.prestations) {
  if (!idsGroupes.has(p.groupe)) erreurs.push(`Prestation "${p.id}" : groupe inconnu "${p.groupe}"`);
  if (!['LAMal', 'LCA', 'MIXTE'].includes(p.categorie)) {
    erreurs.push(`Prestation "${p.id}" : categorie invalide "${p.categorie}"`);
  }
}

const vusAssureurs = new Set();
for (const a of assureurs) {
  if (vusAssureurs.has(a.id)) erreurs.push(`Assureur en double : "${a.id}"`);
  vusAssureurs.add(a.id);

  for (const prod of a.produits_lca ?? []) {
    const enveloppes = new Set((prod.enveloppes ?? []).map((e) => e.id));
    for (const c of prod.couvertures ?? []) {
      if (!idsPrestations.has(c.prestation_id)) {
        erreurs.push(`${a.id} / ${prod.id} : prestation_id inconnu "${c.prestation_id}"`);
      }
      if (c.enveloppe_id && !enveloppes.has(c.enveloppe_id)) {
        erreurs.push(`${a.id} / ${prod.id} : enveloppe_id inconnu "${c.enveloppe_id}"`);
      }
      if (typeof c.taux_remboursement !== 'number' || c.taux_remboursement < 0 || c.taux_remboursement > 1) {
        erreurs.push(`${a.id} / ${prod.id} / ${c.prestation_id} : taux_remboursement doit etre entre 0 et 1`);
      }
    }
  }

  if (a.source?.fiabilite && a.source.fiabilite !== 'verifie') {
    alertes.push(`${a.id} : source marquee "${a.source.fiabilite}"`);
  }
}

if (erreurs.length) {
  console.error('\nEchec de la compilation :');
  erreurs.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

// --- Ecriture --------------------------------------------------------------
const db = { meta, catalogue, assureurs, genere_le: new Date().toISOString() };
const sortie = `// Fichier genere automatiquement par build.mjs - NE PAS EDITER A LA MAIN.
// Source de verite : data/meta.json, data/catalogue-prestations.json, data/assureurs/*.json
window.DB = ${JSON.stringify(db, null, 2)};
`;
writeFileSync(join(DATA, 'db.js'), sortie);

console.log(`OK - ${assureurs.length} assureur(s), ${catalogue.prestations.length} prestations -> data/db.js`);
if (alertes.length) {
  console.log('\nA verifier :');
  alertes.forEach((a) => console.log('  ! ' + a));
}
