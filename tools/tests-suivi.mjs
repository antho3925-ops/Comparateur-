#!/usr/bin/env node
/**
 * Tests du modele de suivi des contrats (js/suivi-modele.js).
 *
 *   node tools/tests-suivi.mjs
 */
import { readFileSync } from 'node:fs';

(0, eval)(readFileSync('js/suivi-modele.js', 'utf8'));
const M = globalThis.SuiviModele;

let reussis = 0;
const echecs = [];
function ok(nom, condition, detail) {
  if (condition) { reussis += 1; console.log('  \x1b[32mok\x1b[0m   ' + nom); }
  else { echecs.push(nom); console.log('  \x1b[31mECHEC\x1b[0m ' + nom + (detail ? '\n        ' + detail : '')); }
}

const T0 = '2026-01-01T00:00:00.000Z';
const c = (x) => M.normaliser(x, T0);

console.log('\n\x1b[1mNormalisation\x1b[0m');
ok('sans nom ni prénom : rejeté', c({ montant: 100 }) === null);
ok('prénom seul : accepté', c({ prenom: 'Léa' })?.prenom === 'Léa');
ok('montant à la suisse « 1\'250,50 » lu 1250.5', c({ nom: 'A', montant: "1'250,50" }).montant === 1250.5);
ok('montant vide : null, pas zéro', c({ nom: 'A', montant: '' }).montant === null);
ok('type inconnu : maladie', c({ nom: 'A', type: 'auto' }).type === 'maladie');
ok('statut inconnu : proposition', c({ nom: 'A', statut: 'xyz' }).statut === 'proposition');
ok('date mal formée : vide', c({ nom: 'A', dateSignature: '31.12.2026' }).dateSignature === '');
ok('policé « oui » lu vrai', c({ nom: 'A', police: 'oui' }).police === true);
ok('paiement direct retenu sur Everlife', c({ nom: 'A', type: 'everlife', paiementDirect: true }).paiementDirect === true);
ok('paiement direct ignoré hors Everlife', c({ nom: 'A', type: 'lpp', paiementDirect: true }).paiementDirect === false);
ok('espaces retirés', c({ nom: '  Dupont ' }).nom === 'Dupont');

const base = [
  c({ id: '1', nom: 'Dupont', prenom: 'Marie', type: 'maladie', montant: 85.4, points: 12, statut: 'accepte', police: true, commissionne: true, montantCommission: 300, compagnie: 'CSS', dateSignature: '2026-03-01' }),
  c({ id: '2', nom: 'Martin', prenom: 'Paul', type: 'everlife', montant: 200, points: 30, statut: 'signe', montantCommission: 450, dateSignature: '2026-05-10' }),
  c({ id: '3', nom: 'Rochat', prenom: 'Luc', type: 'lpp', montant: 45000, points: 8, statut: 'transmis', police: true, dateSignature: '2026-04-02' }),
  c({ id: '4', nom: 'Favre', prenom: 'Anne', type: 'maladie', montant: 60, points: 5, statut: 'refuse', montantCommission: 100 }),
];

console.log('\n\x1b[1mFiltres et tri\x1b[0m');
ok('filtre type LPP : 1', M.filtrer(base, { type: 'lpp' }).length === 1);
ok('filtre non policé : 2', M.filtrer(base, { police: 'non' }).length === 2);
ok('filtre commissionné : 1', M.filtrer(base, { commissionne: 'oui' }).length === 1);
ok('recherche « marie dup » : Dupont', M.filtrer(base, { recherche: 'marie dup' })[0]?.id === '1');
ok('recherche par compagnie « css »', M.filtrer(base, { recherche: 'css' }).length === 1);
ok('tri par montant : LPP en tête', M.trier(base, 'montant')[0].id === '3');
ok('tri récent : Martin (mai) en tête', M.trier(base, 'recent')[0].id === '2');
ok('tri par nom : Dupont, Favre, Martin, Rochat',
  M.trier(base, 'nom').map((x) => x.id).join() === '1,4,2,3');

console.log('\n\x1b[1mTotaux\x1b[0m');
const t = M.totaux(base);
ok('points : 55', t.points === 55);
ok('complémentaires maladie : 145.40', Math.abs(t.montantParType.maladie - 145.4) < 1e-9);
ok('LPP : 45000', t.montantParType.lpp === 45000);
ok('à policer : 1 (le refusé ne compte pas)', t.aPolicer === 1, JSON.stringify(t));
ok('à commissionner : 2 (le refusé ne compte pas)', t.aCommissionner === 2);
ok('commissions notées : 850', t.commissions === 850);
ok('commissions perçues : 300', t.commissionsPercues === 300);
ok('commissions à recevoir : 450 (le refusé ne compte pas)', t.commissionsAttendues === 450, JSON.stringify(t));
ok('tri par commission : Martin en tête', M.trier(base, 'commission')[0].id === '2');
ok('commission notée sans être commissionné : conservée',
  c({ nom: 'A', montantCommission: '120', commissionne: false }).montantCommission === 120);

console.log('\n\x1b[1mCSV\x1b[0m');
const csv = M.versCsv([c({ nom: 'Dupont; "fils"', prenom: 'Jean', montant: 12.5, note: 'ligne1\nligne2' })]);
ok('BOM UTF-8 en tête', csv.charCodeAt(0) === 0xfeff);
ok('en-tête au point-virgule', csv.split('\r\n')[0].startsWith('﻿Nom;Prénom;Type'));
ok('CSV : Commission CHF juste après Points', csv.includes(';Points;Commission CHF;'));
ok('champ à point-virgule et guillemets échappé', csv.includes('"Dupont; ""fils"""'));
const csvE = M.versCsv([c({ nom: 'E', type: 'everlife', paiementDirect: true }), c({ nom: 'M' })]).split('\r\n');
ok('CSV : colonne Paiement direct, oui pour Everlife, vide sinon',
  csvE[0].includes('Paiement direct') && csvE[1].endsWith(';oui;') && csvE[2].endsWith(';;'), csvE.join(' / '));
ok('saut de ligne dans la note protégé', csv.includes('"ligne1\nligne2"'));

console.log('\n\x1b[1mSauvegarde\x1b[0m');
const json = JSON.stringify({ version: 1, contrats: [...base, { montant: 3 }] });
const lu = M.lireSauvegarde(json);
ok('relecture : 4 contrats, 1 rejeté', lu.contrats.length === 4 && lu.rejetes === 1);
ok('tableau nu accepté', M.lireSauvegarde(JSON.stringify(base)).contrats.length === 4);
let erreur = '';
try { M.lireSauvegarde('pas du json'); } catch (e) { erreur = e.message; }
ok('fichier illisible : message clair', erreur.includes('illisible'));

const plusRecent = { ...base[1], statut: 'accepte', modifie: '2026-06-01T00:00:00.000Z' };
const plusVieux = { ...base[0], statut: 'annule', modifie: '2025-01-01T00:00:00.000Z' };
const nouveau = c({ id: '9', nom: 'Nouveau' });
const f = M.fusionner(base, [plusRecent, plusVieux, nouveau]);
ok('fusion : 1 ajouté, 1 mis à jour', f.ajoutes === 1 && f.maj === 1);
ok('fusion : la version récente l\'emporte', f.contrats.find((x) => x.id === '2').statut === 'accepte');
ok('fusion : la version ancienne est ignorée', f.contrats.find((x) => x.id === '1').statut === 'accepte');
ok('fusion : 5 contrats au total', f.contrats.length === 5);

console.log(`\n${reussis} réussi(s), ${echecs.length} échec(s)\n`);
process.exit(echecs.length ? 1 : 0);
