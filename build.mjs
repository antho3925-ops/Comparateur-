#!/usr/bin/env node
// Compile les fichiers JSON de data/ en un seul data/db.js chargeable par
// index.html, y compris en ouverture locale (file://) ou fetch() est bloque.
// Usage : node build.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

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
  if (!['remboursement', 'prestation_versee'].includes(p.nature)) {
    erreurs.push(`Prestation "${p.id}" : nature invalide "${p.nature}"`);
  }
}

const vusAssureurs = new Set();
let aCompleterTotal = 0;
let plafondAPreciserTotal = 0;
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
      // Une couverture "a_completer" vient d'une brochure qui dit QUE la prestation
      // est couverte sans dire COMBIEN : taux inconnu, donc null exige et jamais 0.
      if (c.statut === 'a_completer') {
        if (c.taux_remboursement !== null) {
          erreurs.push(`${a.id} / ${prod.id} / ${c.prestation_id} : statut "a_completer" impose taux_remboursement: null`);
        }
        aCompleterTotal++;
      } else if (typeof c.taux_remboursement !== 'number' || c.taux_remboursement < 0 || c.taux_remboursement > 1) {
        erreurs.push(`${a.id} / ${prod.id} / ${c.prestation_id} : taux_remboursement doit etre entre 0 et 1, ou statut "a_completer"`);
      }

      // Cas intermediaire : le taux est connu mais le plafond depend de l'option
      // souscrite par l'assure. On ne choisit pas un montant a sa place.
      if (c.franchise_prestation != null
          && (typeof c.franchise_prestation !== 'number' || c.franchise_prestation < 0)) {
        erreurs.push(`${a.id} / ${prod.id} / ${c.prestation_id} : franchise_prestation doit etre un nombre positif`);
      }
      if (c.plafond_a_preciser) {
        if (c.plafond_annuel != null) {
          erreurs.push(`${a.id} / ${prod.id} / ${c.prestation_id} : plafond_a_preciser impose plafond_annuel: null`);
        }
        plafondAPreciserTotal++;
      }
    }
  }

  if (a.source?.fiabilite && a.source.fiabilite !== 'verifie') {
    alertes.push(`${a.id} : source marquee "${a.source.fiabilite}"`);
  }
  const trous = (a.produits_lca ?? []).flatMap((prod) =>
    (prod.couvertures ?? []).filter((c) => c.statut === 'a_completer').map(() => prod.id)
  );
  if (trous.length) {
    alertes.push(`${a.id} : ${trous.length} couverture(s) sans taux ni plafond, a completer depuis les conditions particulieres`);
  }
}

if (erreurs.length) {
  console.error('\nEchec de la compilation :');
  erreurs.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

// --- Inventaire des logos --------------------------------------------------
// Recense les logos reellement presents dans assets/logos/, pour que la page
// n'ait jamais a sonder des fichiers absents (chaque essai rate salit la console).
const DOSSIER_LOGOS = join('assets', 'logos');
const EXT_LOGOS = ['.svg', '.png', '.jpg', '.jpeg', '.webp'];
const logos = {};
if (existsSync(DOSSIER_LOGOS)) {
  const presents = readdirSync(DOSSIER_LOGOS);
  for (const a of assureurs) {
    for (const ext of EXT_LOGOS) {
      const nom = a.id + ext;
      if (presents.includes(nom)) { logos[a.id] = `${DOSSIER_LOGOS}/${nom}`; break; }
    }
  }
  const orphelins = presents
    .filter((f) => EXT_LOGOS.includes(extname(f).toLowerCase()))
    .filter((f) => !assureurs.some((a) => a.id === basename(f, extname(f))));
  if (orphelins.length) {
    alertes.push(`assets/logos : ${orphelins.join(', ')} ne correspond(ent) a aucun identifiant d'assureur`);
  }
}

// --- Ecriture --------------------------------------------------------------
const db = { meta, catalogue, assureurs, logos, genere_le: new Date().toISOString() };
const sortie = `// Fichier genere automatiquement par build.mjs - NE PAS EDITER A LA MAIN.
// Source de verite : data/meta.json, data/catalogue-prestations.json, data/assureurs/*.json
window.DB = ${JSON.stringify(db, null, 2)};
`;
writeFileSync(join(DATA, 'db.js'), sortie);

console.log(`OK - ${assureurs.length} assureur(s), ${catalogue.prestations.length} prestations -> data/db.js`);
const sansLogo = assureurs.filter((a) => !logos[a.id]).length;
console.log(`     ${Object.keys(logos).length}/${assureurs.length} logo(s) trouve(s) dans assets/logos/`
  + (sansLogo ? ` — les ${sansLogo} autres s'affichent en toutes lettres` : ''));
if (aCompleterTotal) console.log(`     dont ${aCompleterTotal} couverture(s) au statut "a_completer"`);
if (plafondAPreciserTotal) console.log(`     dont ${plafondAPreciserTotal} couverture(s) au taux connu mais au plafond dependant de l'option souscrite`);
if (alertes.length) {
  console.log('\nA verifier :');
  alertes.forEach((a) => console.log('  ! ' + a));
}
