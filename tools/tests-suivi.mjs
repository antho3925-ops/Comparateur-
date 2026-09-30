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
  c({ id: '1', nom: 'Dupont', prenom: 'Marie', type: 'maladie', montant: 85.4, baseSignee: true, statut: 'accepte', police: true, commissionne: true, montantCommission: 300, compagnie: 'CSS', dateSignature: '2026-03-01' }),
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
ok('points acquis : 100 (maladie ; Everlife non payé, LPP non reçu, refusé perdu)', t.points === 100, JSON.stringify(t));
ok('points en attente : 97.5 (30 Everlife + 67.5 LPP pour 45\'000)', t.pointsEnAttente === 97.5);
ok('complémentaires maladie : 85.40 (refusé exclu)', Math.abs(t.montantParType.maladie - 85.4) < 1e-9);
ok('LPP : 45000', t.montantParType.lpp === 45000);
ok('complémentaires en cours : 85.40 (refusé exclu)', Math.abs(t.parType.maladie.montantActif - 85.4) < 1e-9);
ok('Everlife : aucun montant cumulé', t.montantParType.everlife === 0);
ok('à policer : 1 (le refusé ne compte pas)', t.aPolicer === 1, JSON.stringify(t));
ok('à commissionner : 1 (refusé exclu, LPP sans argent reçu pas encore dû)', t.aCommissionner === 1);
ok('Everlife : montant ignoré', c({ nom: 'A', type: 'everlife', montant: 200 }).montant === null);
ok('Everlife : 1 contrat signé', t.parType.everlife.signes === 1);
ok('LPP : 1 signé (transmis compte)', t.parType.lpp.signes === 1);
ok('moyenne complémentaire : 85.40 (le refusé ne compte pas)', Math.abs(t.parType.maladie.moyenne - 85.4) < 1e-9, JSON.stringify(t.parType.maladie));
const t2 = M.totaux([...base, c({ nom: 'X', type: 'maladie', montant: 114.6, statut: 'signe' }), c({ nom: 'Y', type: 'maladie', statut: 'signe' })]);
ok('moyenne sur deux contrats en cours : 100.00 (sans montant ignoré)', Math.abs(t2.parType.maladie.moyenne - 100) < 1e-9);
ok('moyenne sans aucun montant : null', M.totaux([c({ nom: 'Z', type: 'maladie' })]).parType.maladie.moyenne === null);
ok('commissions : 750 (les 100 du contrat refusé ne comptent pas)', t.commissions === 750);
ok('commissions perçues : 300', t.commissionsPercues === 300);
ok('commissions à recevoir : 450 (le refusé ne compte pas)', t.commissionsAttendues === 450, JSON.stringify(t));
ok('tri par commission : Rochat en tête (675 calculés sur 45\'000)', M.trier(base, 'commission')[0].id === '3');
ok('commission notée sans être commissionné : conservée',
  c({ nom: 'A', montantCommission: '120', commissionne: false }).montantCommission === 120);

console.log('\n\x1b[1mAnnulation et LPP\x1b[0m');
const an = [
  c({ nom: 'A', type: 'maladie', montantCommission: 300, statut: 'signe' }),
  c({ nom: 'B', type: 'maladie', montantCommission: 500, statut: 'annule' }),
  c({ nom: 'C', type: 'maladie', montantCommission: 200, statut: 'refuse', commissionne: true }),
];
const ta = M.totaux(an);
ok('annulé : commission retirée du total (300)', ta.commissions === 300, JSON.stringify(ta));
ok('refusé déjà coché commissionné : rien de perçu', ta.commissionsPercues === 0);
ok('à recevoir : 300', ta.commissionsAttendues === 300);
const avant = M.totaux([an[0], { ...an[1], statut: 'signe' }]);
ok('passer un contrat à annulé retire sa commission (800 → 300)', avant.commissions === 800 && ta.commissions === 300);
ok('perçu + à recevoir = total', ta.commissionsPercues + ta.commissionsAttendues === ta.commissions);

const lpp = [
  c({ nom: 'D', type: 'lpp', montant: 40000, statut: 'transmis' }),
  c({ nom: 'E', type: 'lpp', montant: 20000, statut: 'accepte', fondsRecus: true, dateFondsRecus: '2026-09-15' }),
  c({ nom: 'F', type: 'lpp', montant: 99000, statut: 'annule' }),
  c({ nom: 'G', type: 'lpp', statut: 'signe' }),
];
const tl = M.totaux(lpp).parType.lpp;
ok('LPP : moyenne 30000 (annulé et sans montant exclus)', tl.moyenne === 30000, JSON.stringify(tl));
ok('LPP : montant en cours 60000', tl.montantActif === 60000);
ok('LPP : 40000 en attente de réception', tl.fondsAttente === 40000);
ok('LPP : 20000 reçus sur le libre passage', tl.fondsRecus === 20000);
ok('LPP annulé : ni en attente ni reçu', tl.fondsAttente + tl.fondsRecus === 60000);
ok('LPP : date de réception conservée', lpp[1].dateFondsRecus === '2026-09-15');
ok('ancienne sauvegarde : LPP « transmis » devient « transfert en attente »', lpp[0].statut === 'transfert_attente');
ok('ancienne sauvegarde : LPP coché « argent reçu » devient statut Argent reçu', lpp[1].statut === 'argent_recu');
ok('LPP : « transmis à la compagnie » absent des statuts', !M.STATUTS_PAR_TYPE.lpp.includes('transmis'));
ok('LPP : statuts Transfert en attente et Argent reçu',
  M.STATUTS_PAR_TYPE.lpp.includes('transfert_attente') && M.STATUTS_PAR_TYPE.lpp.includes('argent_recu'));
ok('maladie : « argent reçu » ramené à accepté', c({ nom: 'H', type: 'maladie', statut: 'argent_recu' }).statut === 'accepte');
ok('date de réception effacée hors Argent reçu',
  c({ nom: 'I', type: 'lpp', statut: 'transfert_attente', dateFondsRecus: '2026-09-01' }).dateFondsRecus === '');
const tp = M.totaux([
  c({ nom: 'J', type: 'lpp', montant: 10000, statut: 'proposition' }),
  c({ nom: 'K', type: 'lpp', montant: 5000, statut: 'transfert_attente' }),
]).parType.lpp;
ok('LPP : une simple proposition n\'est pas de l\'argent en attente', tp.fondsAttente === 5000);

console.log('\n\x1b[1mContrat perdu\x1b[0m');
const perdu = [
  c({ nom: 'L', type: 'maladie', montant: 90, baseSignee: true, montantCommission: 400, statut: 'signe' }),
  c({ nom: 'M', type: 'everlife', points: 25, montantCommission: 800, statut: 'annule', paiementDirect: true }),
  c({ nom: 'N', type: 'lpp', montant: 30000, points: 6, montantCommission: 900, statut: 'refuse' }),
];
const tpd = M.totaux(perdu);
ok('annulé ou refusé : points perdus (100 restent)', tpd.points === 100, JSON.stringify(tpd));
ok('annulé ou refusé : commissions perdues (400 restent)', tpd.commissions === 400);
ok('Everlife annulé : ni signé, ni paiement direct, ni points',
  tpd.parType.everlife.signes === 0 && tpd.parType.everlife.paiementDirect === 0 && tpd.parType.everlife.points === 0);
ok('LPP refusé : montant et points perdus', tpd.parType.lpp.montantActif === 0 && tpd.parType.lpp.points === 0);
ok('contrat perdu : toujours compté comme saisi', tpd.parType.everlife.nombre === 1);
const recapP = M.recapMensuel(perdu)[0].totaux;
ok('récapitulatif mensuel : mêmes pertes (100 pts, CHF 400)', recapP.points === 100 && recapP.commissions === 400);
ok('LPP : moyenne sur un seul transfert = son montant',
  M.totaux([lpp[0]]).parType.lpp.moyenne === 40000);

console.log('\n\x1b[1mPoints acquis\x1b[0m');
const pa = (x) => M.pointsAcquis(c(x));
ok('LPP transfert en attente : points pas encore acquis', !pa({ nom: 'A', type: 'lpp', statut: 'transfert_attente', points: 5 }));
ok('LPP signé : points pas encore acquis', !pa({ nom: 'A', type: 'lpp', statut: 'signe', points: 5 }));
ok('LPP argent reçu : points acquis', pa({ nom: 'A', type: 'lpp', statut: 'argent_recu', points: 5 }));
ok('Everlife non payé : points pas encore acquis', !pa({ nom: 'A', type: 'everlife', statut: 'signe', points: 5 }));
ok('Everlife client a payé : points acquis', pa({ nom: 'A', type: 'everlife', statut: 'signe', clientPaye: true }));
ok('Everlife paiement direct : points acquis', pa({ nom: 'A', type: 'everlife', statut: 'signe', paiementDirect: true }));
ok('Everlife payé mais annulé : points perdus', !pa({ nom: 'A', type: 'everlife', statut: 'annule', clientPaye: true }));
ok('LPP reçu puis refusé : points perdus', !pa({ nom: 'A', type: 'lpp', statut: 'refuse' }));
ok('maladie : points acquis dès la saisie', pa({ nom: 'A', type: 'maladie', statut: 'proposition' }));
ok('« client a payé » ignoré hors Everlife', c({ nom: 'A', type: 'lpp', clientPaye: true }).clientPaye === false);
const tev = M.totaux([
  c({ nom: 'A', type: 'everlife', points: 10, statut: 'signe', clientPaye: true }),
  c({ nom: 'B', type: 'everlife', points: 20, statut: 'signe', paiementDirect: true }),
  c({ nom: 'C', type: 'everlife', points: 40, statut: 'signe' }),
]).parType.everlife;
ok('Everlife : 30 points acquis, 40 en attente', tev.points === 30 && tev.pointsEnAttente === 40, JSON.stringify(tev));
ok('Everlife : 2 clients payés dont 1 en direct', tev.payes === 2 && tev.paiementDirect === 1);
const tlp = M.totaux([
  c({ nom: 'D', type: 'lpp', montant: 100000, statut: 'transfert_attente' }),
  c({ nom: 'E', type: 'lpp', montant: 40000, statut: 'argent_recu' }),
]).parType.lpp;
ok('LPP : 60 points acquis (40\'000 reçus), 150 en attente (100\'000)', tlp.points === 60 && tlp.pointsEnAttente === 150, JSON.stringify(tlp));

console.log('\n\x1b[1mBarème des points\x1b[0m');
const pm = (prime, base = true) => c({ nom: 'A', type: 'maladie', montant: prime, baseSignee: base, points: 999 }).points;
ok('maladie 24.95 : 0 point', pm(24.95) === 0);
ok('maladie 25.00 : 50 points', pm(25) === 50);
ok('maladie 50.00 : 50 points', pm(50) === 50);
ok('maladie 50.05 : 100 points', pm(50.05) === 100);
ok('maladie 120 : 100 points', pm(120) === 100);
ok('maladie sans base : 0 point', pm(120, false) === 0);
ok('maladie sans montant : pas de points', pm(null) === null);
ok('maladie : points saisis à la main ignorés', pm(30) === 50);
const cm = M.totaux([c({ nom: 'B', type: 'maladie', montant: 80, montantCommission: 250, statut: 'signe' })]);
ok('complémentaire seule : commission comptée, 0 point', cm.commissions === 250 && cm.points === 0);
const pl = (montant) => c({ nom: 'C', type: 'lpp', montant, statut: 'argent_recu', points: 999 }).points;
ok('LPP 100\'000 : 150 points', pl(100000) === 150);
ok('LPP 200\'000 : 300 points', pl(200000) === 300);
ok('LPP 50\'000 : 75 points', pl(50000) === 75);
ok('LPP 45\'000 : 67.5 points', pl(45000) === 67.5);
ok('LPP 12\'345 : 18.52 points (arrondi au centième)', pl(12345) === 18.52);
ok('Everlife : points saisis conservés', c({ nom: 'D', type: 'everlife', points: 42 }).points === 42);

const clp = (montant, montantCommission = 9999) => c({ nom: 'F', type: 'lpp', montant, montantCommission }).montantCommission;
ok('commission LPP 100\'000 : 1500', clp(100000) === 1500);
ok('commission LPP 45\'000 : 675', clp(45000) === 675);
ok('commission LPP 12\'345 : 185.18 (arrondi au centime)', clp(12345) === 185.18);
ok('commission LPP sans montant : aucune', clp(null) === null);
ok('commission LPP : montant saisi à la main remplacé par le calcul', clp(20000, 50) === 300);

console.log('\n\x1b[1mCommission Everlife automatique\x1b[0m');
const ev = (x) => M.commissionEverlife(c({ nom: 'E', type: 'everlife', ...x }));
ok('proposition : pas de commission', ev({ statut: 'proposition' }) === null);
ok('signé : 150', ev({ statut: 'signe' }) === 150);
ok('client a payé : 400', ev({ statut: 'signe', clientPaye: true }) === 400);
ok('paiement direct : 400', ev({ statut: 'signe', paiementDirect: true }) === 400);
ok('annulé : aucune', ev({ statut: 'annule', clientPaye: true }) === null);
const aj = (actuelle, x) => M.commissionEverlifeAjustee(actuelle, c({ nom: 'E', type: 'everlife', ...x }));
ok('150 automatique passe à 400 au paiement', aj(150, { statut: 'signe', clientPaye: true }) === 400);
ok('vide rempli à 150 à la signature', aj(null, { statut: 'signe' }) === 150);
ok('montant saisi à la main (275) jamais écrasé', aj(275, { statut: 'signe', clientPaye: true }) === 275);
ok('400 redescend à 150 si « payé » est décoché', aj(400, { statut: 'signe' }) === 150);

console.log('\n\x1b[1mCommission LPP\x1b[0m');
const cl = M.totaux([
  c({ nom: 'A', type: 'lpp', montant: 80000, statut: 'transfert_attente' }),
  c({ nom: 'B', type: 'lpp', montant: 40000, statut: 'argent_recu' }),
  c({ nom: 'C', type: 'lpp', montant: 60000, statut: 'argent_recu', commissionne: true }),
  c({ nom: 'D', type: 'lpp', montant: 50000, statut: 'annule' }),
]);
ok('LPP : commission comptée seulement argent reçu (1500)', cl.commissions === 1500, JSON.stringify(cl));
ok('LPP : 1200 en attente de l\'argent, hors total', cl.commissionsEnAttenteFonds === 1200);
ok('LPP : 900 perçus, 600 à recevoir', cl.commissionsPercues === 900 && cl.commissionsAttendues === 600);
ok('LPP : à commissionner seulement une fois l\'argent reçu (1)', cl.aCommissionner === 1);
ok('LPP annulé : ni comptée ni en attente', cl.commissions + cl.commissionsEnAttenteFonds === 2700);
const ce = M.totaux([c({ nom: 'E', type: 'everlife', montantCommission: 150, statut: 'signe' })]);
ok('Everlife non payé : commission inchangée, comptée (150)', ce.commissions === 150 && ce.commissionsEnAttenteFonds === 0);
ok('maladie : commission comptée dès la saisie', M.commissionAcquise(c({ nom: 'F', type: 'maladie' })));

console.log('\n\x1b[1mMois\x1b[0m');
const mois = [
  c({ nom: 'A', type: 'maladie', montant: 100, baseSignee: true, dateSignature: '2026-08-14', montantCommission: 200, commissionne: true }),
  c({ nom: 'B', type: 'everlife', points: 20, statut: 'signe', clientPaye: true, dateSignature: '2026-09-02', montantCommission: 500 }),
  c({ nom: 'C', type: 'lpp', montant: 30000, points: 5, statut: 'argent_recu', dateSignature: '2026-09-30' }),
  c({ nom: 'D', type: 'maladie', points: 3 }),
];
ok('mois de signature', M.moisDe(mois[0]) === '2026-08');
ok('sans signature : mois de saisie', M.moisDe(mois[3]) === '2026-01');
ok('libellé « Septembre 2026 »', M.libelleMois('2026-09') === 'Septembre 2026');
ok('décalage décembre → janvier', M.decalerMois('2026-12', 1) === '2027-01');
ok('décalage janvier → décembre', M.decalerMois('2026-01', -1) === '2025-12');
const sept = M.totaux(M.filtrer(mois, { mois: '2026-09' }));
ok('septembre : 65 points (20 Everlife payé + 45 LPP reçu, août non repris)', sept.points === 65, JSON.stringify(sept));
ok('septembre : commission du mois 950 (500 Everlife + 450 LPP)', sept.commissions === 950);
ok('septembre : 1 Everlife signé', sept.parType.everlife.signes === 1);
ok('tous les mois : 165 points', M.totaux(M.filtrer(mois, { mois: 'tous' })).points === 165);
const recap = M.recapMensuel(mois);
ok('récap : 3 mois, le plus récent en tête', recap.length === 3 && recap[0].mois === '2026-09', recap.map((r) => r.mois).join());
ok('récap août : 200 perçus, 0 à recevoir',
  recap[1].totaux.commissionsPercues === 200 && recap[1].totaux.commissionsAttendues === 0);
ok('récap septembre : 950 à recevoir', recap[0].totaux.commissionsAttendues === 950);

console.log('\n\x1b[1mRappel de sauvegarde\x1b[0m');
const now = new Date('2026-09-30T10:00:00Z');
const rs = (x) => M.rappelSauvegarde({ nbContrats: 3, maintenant: now, ...x });
ok('aucun contrat : pas de rappel', M.rappelSauvegarde({ nbContrats: 0, maintenant: now }) === null);
ok('jamais exporté : rappel', rs({})?.jamais === true);
ok('exporté il y a 6 jours : pas de rappel', rs({ derniere: '2026-09-24T09:00:00Z' }) === null);
ok('exporté il y a 7 jours : rappel', rs({ derniere: '2026-09-23T09:00:00Z' })?.jours === 7);
ok('ancien format « 20.09.2026 » compris : rappel (9 à 10 jours selon le fuseau)', rs({ derniere: '20.09.2026' })?.jours >= 9);
ok('« plus tard » : masqué jusqu\'au lendemain', rs({ reporteJusqua: '2026-10-01T10:00:00Z' }) === null);
ok('report expiré : rappel de retour', rs({ reporteJusqua: '2026-09-29T10:00:00Z' })?.jamais === true);

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
