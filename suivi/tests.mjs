#!/usr/bin/env node
// Suite de tests de la plateforme de suivi.
//
//   node suivi/tests.mjs
//
// Les tests de dates et de règles métier sont unitaires ; les tests d'accès
// démarrent un vrai serveur sur un port libre, avec un dossier de données
// jetable, et parlent HTTP comme le ferait un navigateur.

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  aujourdhui, cleSemaine, cleMois, lundiDe, decale, joursSemaine, joursMois,
  libelleSemaine, libelleMois, libelleJour, moisVoisin, semaineVoisine, estJourValide,
} from './lib/dates.mjs';
import {
  INDICATEURS, CLES, CLES_CLASSEES, indicateur, normaliserSaisie, normaliserObjectifs,
  ecart, cumuler, bilanPeriode, bilanEquipe, classement,
} from './lib/domaine.mjs';
import { normaliserIdentifiant } from './lib/sessions.mjs';
import { demarrer } from './serveur.mjs';

let reussis = 0;
const echecs = [];

function verifier(intitule, condition) {
  if (condition) {
    reussis += 1;
  } else {
    echecs.push(intitule);
    console.error(`  ÉCHEC  ${intitule}`);
  }
}

function egal(intitule, obtenu, attendu) {
  const a = JSON.stringify(obtenu);
  const b = JSON.stringify(attendu);
  if (a === b) reussis += 1;
  else {
    echecs.push(intitule);
    console.error(`  ÉCHEC  ${intitule}\n         obtenu  ${a}\n         attendu ${b}`);
  }
}

function section(titre) {
  console.log(`\n${titre}`);
}

// ===========================================================================
section('Dates — semaines ISO et fuseau suisse');
// ===========================================================================

egal('2026-09-07 est un lundi, semaine 2026-S37', cleSemaine('2026-09-07'), '2026-S37');
egal('2026-09-13 (dimanche) appartient encore à 2026-S37', cleSemaine('2026-09-13'), '2026-S37');
egal('2026-09-14 (lundi) ouvre 2026-S38', cleSemaine('2026-09-14'), '2026-S38');
egal('1er janvier 2026 (jeudi) tombe en 2026-S01', cleSemaine('2026-01-01'), '2026-S01');
egal('1er janvier 2027 (vendredi) reste en 2026-S53', cleSemaine('2027-01-01'), '2026-S53');
egal('4 janvier 2027 (lundi) ouvre 2027-S01', cleSemaine('2027-01-04'), '2027-S01');
egal('1er janvier 2023 (dimanche) appartient à 2022-S52', cleSemaine('2023-01-01'), '2022-S52');

egal('le lundi du 2026-09-10 est le 2026-09-07', lundiDe('2026-09-10'), '2026-09-07');
egal('le lundi du 2026-09-13 est le 2026-09-07', lundiDe('2026-09-13'), '2026-09-07');
egal('une semaine compte sept jours, du lundi au dimanche',
  joursSemaine('2026-09-10'), ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13']);

egal('février 2026 compte 28 jours', joursMois('2026-02-15').length, 28);
egal('février 2024, bissextile, compte 29 jours', joursMois('2024-02-15').length, 29);
egal('la clé de mois est le préfixe de la date', cleMois('2026-09-07'), '2026-09');

// Le passage à l'heure d'été suisse a lieu le dernier dimanche de mars.
egal('le lendemain du changement d’heure du 29 mars 2026 est le 30', decale('2026-03-29', 1), '2026-03-30');
egal('la veille du changement d’heure du 25 octobre 2026 est le 24', decale('2026-10-25', -1), '2026-10-24');
egal('la semaine du changement d’heure garde sept jours', joursSemaine('2026-03-29').length, 7);

egal('le mois précédant janvier est décembre de l’année d’avant', moisVoisin('2026-01-15', -1), '2025-12-01');
egal('le mois suivant décembre est janvier de l’année d’après', moisVoisin('2026-12-15', 1), '2027-01-01');
egal('la semaine précédente recule de sept jours depuis le lundi', semaineVoisine('2026-09-10', -1), '2026-08-31');

egal('le jour courant est au format AAAA-MM-JJ', /^\d{4}-\d{2}-\d{2}$/.test(aujourdhui()), true);
egal('une date inexistante est rejetée', estJourValide('2026-02-30'), false);
egal('un mois hors bornes est rejeté', estJourValide('2026-13-01'), false);
egal('un texte libre est rejeté', estJourValide('hier'), false);

egal('le libellé de semaine couvre lundi à dimanche',
  libelleSemaine('2026-09-10'), '7 septembre 2026 – 13 septembre 2026');
egal('le libellé de mois est en toutes lettres', libelleMois('2026-09-07'), 'septembre 2026');
egal('le libellé de jour nomme le jour de semaine', libelleJour('2026-09-07'), 'lundi 7 septembre 2026');

// ===========================================================================
section('Indicateurs et objectifs');
// ===========================================================================

egal('la plateforme suit six indicateurs', INDICATEURS.length, 6);
egal('les cinq premiers indicateurs portent un objectif hebdomadaire',
  INDICATEURS.filter((i) => i.hebdomadaire).map((i) => i.cle),
  ['maladie', 'lpp_comptes', 'everlife', 'rdv_pris', 'rdv_non_signes']);
egal('le montant transféré des avoirs LPP n’a pas d’objectif hebdomadaire',
  INDICATEURS.find((i) => i.cle === 'lpp_montant').hebdomadaire, false);

egal('aucun objectif journalier n’est défini nulle part',
  JSON.stringify(normaliserObjectifs({}).objectifs).includes('journalier'), false);

{
  const { objectifs } = normaliserObjectifs({
    maladie: { hebdomadaire: 5, mensuel: 20 },
    lpp_montant: { hebdomadaire: 999, mensuel: 250000 },
  });
  egal('un objectif hebdomadaire de contrats maladie est retenu', objectifs.maladie.hebdomadaire, 5);
  egal('un objectif hebdomadaire proposé pour les avoirs LPP est ignoré',
    'hebdomadaire' in objectifs.lpp_montant, false);
  egal('l’objectif mensuel des avoirs LPP est retenu', objectifs.lpp_montant.mensuel, 250000);
  egal('un objectif non fixé vaut null et non zéro', objectifs.everlife.mensuel, null);
}

egal('un objectif négatif est refusé',
  Boolean(normaliserObjectifs({ maladie: { mensuel: -1 } }).erreur), true);
egal('un objectif décimal est refusé',
  Boolean(normaliserObjectifs({ maladie: { mensuel: 2.5 } }).erreur), true);
egal('un objectif à zéro est un objectif, pas une absence',
  normaliserObjectifs({ maladie: { mensuel: 0 } }).objectifs.maladie.mensuel, 0);

// ===========================================================================
section('Saisie quotidienne — validation');
// ===========================================================================

egal('une saisie complète est acceptée',
  normaliserSaisie({ maladie: 3, lpp_comptes: 1, everlife: 2, rdv_pris: 7, rdv_non_signes: 2, lpp_montant: 45000 }).valeurs,
  { maladie: 3, lpp_comptes: 1, everlife: 2, rdv_pris: 7, rdv_non_signes: 2, lpp_montant: 45000 });
egal('un champ omis vaut zéro', normaliserSaisie({ maladie: 3 }).valeurs.everlife, 0);
egal('un champ vide vaut zéro', normaliserSaisie({ maladie: '' }).valeurs.maladie, 0);
egal('un nombre transmis en texte est converti', normaliserSaisie({ maladie: '4' }).valeurs.maladie, 4);
egal('un nombre négatif est refusé', Boolean(normaliserSaisie({ maladie: -1 }).erreur), true);
egal('un demi-contrat est refusé', Boolean(normaliserSaisie({ maladie: 1.5 }).erreur), true);
egal('un texte est refusé', Boolean(normaliserSaisie({ maladie: 'trois' }).erreur), true);
egal('une valeur aberrante est refusée', Boolean(normaliserSaisie({ lpp_montant: 1e12 }).erreur), true);

// ===========================================================================
section('Écarts — toujours chiffrés, jamais en pourcentage');
// ===========================================================================

// -- Cibles : l'objectif est un minimum à atteindre --------------------------

egal('12 réalisés sur 20 : il manque 8',
  [ecart(12, 20).ecart, ecart(12, 20).reste, ecart(12, 20).atteint], [-8, 8, false]);
egal('23 réalisés sur 20 : 3 de plus, objectif atteint',
  [ecart(23, 20).ecart, ecart(23, 20).reste, ecart(23, 20).atteint], [3, 0, true]);
egal('20 sur 20 : écart nul, objectif atteint',
  [ecart(20, 20).ecart, ecart(20, 20).atteint], [0, true]);
egal('une cible n’est jamais « dépassée » au sens négatif', ecart(23, 20).depasse, false);
egal('sans objectif fixé, il n’y a pas d’écart',
  [ecart(12, null).ecart, ecart(12, null).atteint], [null, null]);
egal('l’écart d’un montant est en francs, pas en points de pourcentage',
  ecart(180000, 250000).reste, 70000);

// -- Plafonds : l'objectif est un maximum à ne pas franchir ------------------

egal('les rendez-vous valides non signés sont un plafond',
  indicateur('rdv_non_signes').sens, 'plafond');
egal('les cinq autres indicateurs sont des cibles',
  INDICATEURS.filter((i) => i.sens !== 'plafond').map((i) => i.cle),
  ['maladie', 'lpp_comptes', 'everlife', 'rdv_pris', 'lpp_montant']);

egal('5 sous un plafond de 25 : plafond respecté',
  [ecart(5, 25, 'plafond').atteint, ecart(5, 25, 'plafond').depasse], [true, false]);
egal('et il reste 20 de marge', ecart(5, 25, 'plafond').marge, 20);
egal('15 sous un plafond de 25 reste un bon résultat',
  ecart(15, 25, 'plafond').atteint, true);
egal('40 pour un plafond de 25 : le plafond est franchi',
  [ecart(40, 25, 'plafond').atteint, ecart(40, 25, 'plafond').depasse], [false, true]);
egal('de 15 de trop', ecart(40, 25, 'plafond').exces, 15);
egal('exactement au plafond, il est encore respecté',
  [ecart(25, 25, 'plafond').atteint, ecart(25, 25, 'plafond').depasse], [true, false]);
egal('un plafond respecté n’a aucun excès', ecart(25, 25, 'plafond').exces, 0);
egal('un plafond franchi n’a plus de marge', ecart(40, 25, 'plafond').marge, 0);
egal('sans plafond fixé, rien n’est franchi',
  [ecart(40, null, 'plafond').atteint, ecart(40, null, 'plafond').depasse], [null, false]);

// ===========================================================================
section('Cumuls par période');
// ===========================================================================

const saisies = {
  '2026-09-07': {
    alice: { maladie: 3, lpp_comptes: 1, everlife: 0, rdv_pris: 5, rdv_non_signes: 2, lpp_montant: 40000 },
    bruno: { maladie: 1, lpp_comptes: 0, everlife: 2, rdv_pris: 4, rdv_non_signes: 1, lpp_montant: 0 },
  },
  '2026-09-08': {
    alice: { maladie: 2, lpp_comptes: 2, everlife: 1, rdv_pris: 3, rdv_non_signes: 0, lpp_montant: 15000 },
  },
  // Hors de la semaine du 7 septembre, mais dans le même mois.
  '2026-09-21': {
    alice: { maladie: 10, lpp_comptes: 0, everlife: 0, rdv_pris: 0, rdv_non_signes: 0, lpp_montant: 5000 },
  },
};

egal('la semaine d’Alice cumule ses deux journées',
  cumuler(saisies, 'alice', joursSemaine('2026-09-07')).total.maladie, 5);
egal('la semaine ne déborde pas sur les journées d’une autre semaine',
  cumuler(saisies, 'alice', joursSemaine('2026-09-07')).total.lpp_montant, 55000);
egal('le mois d’Alice reprend toutes ses journées de septembre',
  cumuler(saisies, 'alice', joursMois('2026-09-01')).total.maladie, 15);
egal('deux journées saisies sur la semaine',
  cumuler(saisies, 'alice', joursSemaine('2026-09-07')).joursSaisis, 2);
egal('un conseiller sans aucune saisie cumule zéro',
  cumuler(saisies, 'chloe', joursSemaine('2026-09-07')).total.maladie, 0);

const objectifsEquipe = {
  alice: {
    maladie: { hebdomadaire: 8, mensuel: 30 },
    lpp_comptes: { hebdomadaire: 2, mensuel: 8 },
    everlife: { hebdomadaire: 2, mensuel: 8 },
    rdv_pris: { hebdomadaire: 15, mensuel: 60 },
    rdv_non_signes: { hebdomadaire: 3, mensuel: 12 },
    lpp_montant: { mensuel: 200000 },
  },
  bruno: {
    maladie: { hebdomadaire: 4, mensuel: 16 },
    lpp_comptes: { hebdomadaire: 1, mensuel: 4 },
    everlife: { hebdomadaire: 1, mensuel: 4 },
    rdv_pris: { hebdomadaire: 10, mensuel: 40 },
    rdv_non_signes: { hebdomadaire: 2, mensuel: 8 },
    lpp_montant: { mensuel: 100000 },
  },
};

{
  const bilan = bilanPeriode(saisies, 'alice', joursSemaine('2026-09-07'), objectifsEquipe.alice, 'hebdomadaire');
  const maladie = bilan.lignes.find((l) => l.cle === 'maladie');
  egal('Alice a signé 5 contrats maladie sur un objectif de 8', [maladie.realise, maladie.objectif], [5, 8]);
  egal('il lui en manque 3', maladie.reste, 3);

  const nonSignes = bilan.lignes.find((l) => l.cle === 'rdv_non_signes');
  egal('Alice a 2 rendez-vous non signés sous un plafond de 3',
    [nonSignes.realise, nonSignes.objectif], [2, 3]);
  egal('son plafond est donc respecté', nonSignes.atteint, true);
  egal('avec 1 de marge', nonSignes.marge, 1);

  const montant = bilan.lignes.find((l) => l.cle === 'lpp_montant');
  egal('le montant LPP n’a pas d’objectif hebdomadaire à afficher', montant.applicable, false);
  egal('son objectif hebdomadaire est donc absent', montant.objectif, null);
  egal('mais le réalisé de la semaine reste affiché', montant.realise, 55000);
}

{
  const bilan = bilanPeriode(saisies, 'alice', joursMois('2026-09-01'), objectifsEquipe.alice, 'mensuel');
  const montant = bilan.lignes.find((l) => l.cle === 'lpp_montant');
  egal('le montant LPP porte bien un objectif mensuel', montant.objectif, 200000);
  egal('il manque 140 000 francs sur le mois', montant.reste, 140000);
  const lpp = bilan.lignes.find((l) => l.cle === 'lpp_comptes');
  egal('3 comptes LPP ouverts sur 8 visés', [lpp.realise, lpp.objectif], [3, 8]);
}

// ===========================================================================
section('Vue d’équipe');
// ===========================================================================

const equipe = [{ identifiant: 'alice', nom: 'Alice' }, { identifiant: 'bruno', nom: 'Bruno' }];

{
  const vue = bilanEquipe(saisies, equipe, joursSemaine('2026-09-07'), objectifsEquipe, 'hebdomadaire');
  egal('l’équipe a signé 6 contrats maladie sur la semaine', vue.total.maladie, 6);
  const maladie = vue.lignes.find((l) => l.cle === 'maladie');
  egal('les objectifs individuels s’additionnent en objectif d’équipe', maladie.objectif, 12);
  egal('il manque 6 contrats à l’équipe', maladie.reste, 6);
  const montant = vue.lignes.find((l) => l.cle === 'lpp_montant');
  egal('sur la semaine, l’équipe n’a pas d’objectif de montant LPP', montant.objectif, null);
}

{
  const vue = bilanEquipe(saisies, equipe, joursMois('2026-09-01'), objectifsEquipe, 'mensuel');
  const montant = vue.lignes.find((l) => l.cle === 'lpp_montant');
  egal('sur le mois, l’objectif de montant LPP de l’équipe vaut 300 000', montant.objectif, 300000);
  egal('l’équipe a transféré 60 000 francs', montant.realise, 60000);
}

// ===========================================================================
section('Classement — réservé à l’administrateur');
// ===========================================================================

{
  const rangs = classement(saisies, equipe, joursSemaine('2026-09-07'), objectifsEquipe, 'hebdomadaire');
  egal('les deux conseillers sont classés', rangs.length, 2);
  egal('Alice, en tête sur quatre indicateurs sur cinq comptés, passe première', rangs[0].nom, 'Alice');
  egal('le premier porte le rang 1', rangs[0].rang, 1);
  egal('le second porte le rang 2', rangs[1].rang, 2);
  egal('les rendez-vous non signés restent hors du calcul des points',
    CLES_CLASSEES.includes('rdv_non_signes'), false);
  egal('cinq indicateurs entrent dans les points', CLES_CLASSEES.length, 5);
  const alice = rangs.find((r) => r.nom === 'Alice');
  const bruno = rangs.find((r) => r.nom === 'Bruno');
  egal('Alice est première sur les contrats maladie', alice.rangs.maladie, 1);
  egal('Alice est deuxième sur Everlife', alice.rangs.everlife, 2);

  // Alice a 2 rendez-vous non signés, Bruno 1 : sur un plafond, c'est Bruno
  // qui passe premier — le moins nombreux, pas le plus nombreux.
  egal('sur le plafond, le moins nombreux passe premier',
    [bruno.bilan.total.rdv_non_signes, bruno.rangs.rdv_non_signes], [1, 1]);
  egal('et le plus nombreux passe second',
    [alice.bilan.total.rdv_non_signes, alice.rangs.rdv_non_signes], [2, 2]);
  egal('alors que sur une cible, c’est le plus nombreux qui mène',
    [alice.bilan.total.maladie > bruno.bilan.total.maladie, alice.rangs.maladie], [true, 1]);
}

{
  // Deux conseillers strictement identiques doivent partager le même rang.
  const memesSaisies = {
    '2026-09-07': {
      alice: { maladie: 2, lpp_comptes: 1, everlife: 1, rdv_pris: 3, rdv_non_signes: 1, lpp_montant: 1000 },
      bruno: { maladie: 2, lpp_comptes: 1, everlife: 1, rdv_pris: 3, rdv_non_signes: 1, lpp_montant: 1000 },
    },
  };
  const rangs = classement(memesSaisies, equipe, joursSemaine('2026-09-07'), objectifsEquipe, 'hebdomadaire');
  egal('à chiffres égaux, les deux conseillers sont ex æquo au rang 1',
    [rangs[0].rang, rangs[1].rang], [1, 1]);
}

{
  const rangs = classement({}, equipe, joursSemaine('2026-09-07'), objectifsEquipe, 'hebdomadaire');
  egal('sans aucune saisie, tout le monde est ex æquo', [rangs[0].rang, rangs[1].rang], [1, 1]);
}

// ===========================================================================
section('Identifiants');
// ===========================================================================

egal('un identifiant est normalisé en minuscules', normaliserIdentifiant('  P.Dupont  '), 'p.dupont');
egal('un identifiant avec espace est refusé', normaliserIdentifiant('p dupont'), null);
egal('un identifiant d’un seul caractère est refusé', normaliserIdentifiant('a'), null);
egal('un identifiant avec barre oblique est refusé', normaliserIdentifiant('a/../b'), null);
egal('un identifiant trop long est refusé', normaliserIdentifiant('a'.repeat(40)), null);

// ===========================================================================
section('Serveur — accès, gel des journées et cloisonnement');
// ===========================================================================

const dossier = await mkdtemp(join(tmpdir(), 'suivi-tests-'));
process.env.SUIVI_CODE_ADMIN = 'code-de-test-1234';
const { serveur, stockage, port } = await demarrer({ port: 0, hote: '127.0.0.1', dossierDonnees: join(dossier, 'data') });
const base = `http://127.0.0.1:${port}`;

/** Client HTTP minimal qui conserve son cookie, comme un navigateur. */
function client() {
  let cookie = null;
  return async function requete(chemin, options = {}) {
    const reponse = await fetch(base + chemin, {
      method: options.methode || 'GET',
      headers: {
        ...(options.corps ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: options.corps ? JSON.stringify(options.corps) : undefined,
    });
    const posee = reponse.headers.get('set-cookie');
    if (posee) cookie = posee.split(';')[0];
    let donnees = null;
    try { donnees = await reponse.json(); } catch { donnees = null; }
    return { statut: reponse.status, donnees };
  };
}

try {
  const admin = client();
  const alice = client();
  const bruno = client();
  const inconnu = client();

  // -- Accès administrateur --------------------------------------------------
  egal('un code administrateur erroné est refusé',
    (await admin('/api/connexion-admin', { methode: 'POST', corps: { code: 'faux' } })).statut, 401);
  egal('le bon code administrateur ouvre la session',
    (await admin('/api/connexion-admin', { methode: 'POST', corps: { code: 'code-de-test-1234' } })).statut, 200);

  // -- Création des conseillers ---------------------------------------------
  egal('l’administrateur crée un conseiller',
    (await admin('/api/admin/conseillers', { methode: 'POST', corps: { identifiant: 'a.roux', nom: 'Alice Roux' } })).statut, 200);
  await admin('/api/admin/conseillers', { methode: 'POST', corps: { identifiant: 'b.dias', nom: 'Bruno Dias' } });
  egal('un identifiant déjà pris est refusé',
    (await admin('/api/admin/conseillers', { methode: 'POST', corps: { identifiant: 'a.roux', nom: 'Autre' } })).statut, 409);
  egal('un identifiant invalide est refusé',
    (await admin('/api/admin/conseillers', { methode: 'POST', corps: { identifiant: 'a roux', nom: 'Autre' } })).statut, 400);

  // -- Connexion conseiller --------------------------------------------------
  egal('un identifiant inconnu ne donne accès à rien',
    (await inconnu('/api/connexion', { methode: 'POST', corps: { identifiant: 'personne' } })).statut, 404);
  egal('un conseiller se connecte avec son seul identifiant',
    (await alice('/api/connexion', { methode: 'POST', corps: { identifiant: 'a.roux' } })).statut, 200);
  egal('l’identifiant est insensible à la casse',
    (await bruno('/api/connexion', { methode: 'POST', corps: { identifiant: 'B.Dias' } })).statut, 200);

  // -- Cloisonnement ---------------------------------------------------------
  egal('un conseiller non connecté n’accède pas à son tableau',
    (await inconnu('/api/conseiller')).statut, 401);
  {
    const { donnees } = await alice('/api/conseiller?identifiant=b.dias');
    egal('un conseiller ne peut pas consulter la page d’un collègue', donnees.conseiller.identifiant, 'a.roux');
  }
  egal('un conseiller n’accède pas au tableau de bord d’équipe',
    (await alice('/api/admin/tableau')).statut, 401);
  egal('un conseiller ne fixe pas ses propres objectifs',
    (await alice('/api/admin/objectifs/a.roux', { methode: 'PUT', corps: { objectifs: {} } })).statut, 401);
  egal('un conseiller ne crée pas de conseiller',
    (await alice('/api/admin/conseillers', { methode: 'POST', corps: { identifiant: 'x.y', nom: 'X Y' } })).statut, 401);
  egal('le classement n’est accessible que par l’espace administrateur',
    (await bruno('/api/admin/tableau')).statut, 401);

  // -- Saisie du jour --------------------------------------------------------
  const jour = aujourdhui();
  egal('un conseiller enregistre ses chiffres du jour',
    (await alice('/api/saisie', {
      methode: 'PUT',
      corps: { valeurs: { maladie: 3, lpp_comptes: 1, everlife: 2, rdv_pris: 6, rdv_non_signes: 1, lpp_montant: 40000 } },
    })).statut, 200);
  {
    const { donnees } = await alice('/api/conseiller');
    egal('les chiffres saisis sont relus tels quels', donnees.saisie.maladie, 3);
    egal('la journée du jour est modifiable', donnees.modifiable, true);
  }
  egal('un conseiller corrige ses chiffres le jour même',
    (await alice('/api/saisie', { methode: 'PUT', corps: { valeurs: { maladie: 4 } } })).statut, 200);
  {
    const { donnees } = await alice('/api/conseiller');
    egal('la correction du jour même remplace la saisie', donnees.saisie.maladie, 4);
    egal('les champs non renvoyés retombent à zéro', donnees.saisie.everlife, 0);
  }
  egal('une saisie négative est rejetée par le serveur',
    (await alice('/api/saisie', { methode: 'PUT', corps: { valeurs: { maladie: -3 } } })).statut, 400);

  // -- Gel des journées passées ---------------------------------------------
  const veille = decale(jour, -1);
  await stockage.modifier((e) => {
    e.saisies[veille] = { 'a.roux': { maladie: 9, lpp_comptes: 9, everlife: 9, rdv_pris: 9, rdv_non_signes: 9, lpp_montant: 9, maj: '2026-01-01T00:00:00.000Z' } };
  });

  await alice('/api/saisie', { methode: 'PUT', corps: { valeurs: { maladie: 1 } } });
  egal('une saisie du jour n’écrase jamais celle de la veille',
    stockage.lire().saisies[veille]['a.roux'].maladie, 9);
  egal('la saisie du jour reste séparée de celle de la veille',
    stockage.lire().saisies[jour]['a.roux'].maladie, 1);
  {
    const { donnees } = await alice('/api/conseiller');
    const hier = donnees.historique.find((h) => h.jour === veille);
    egal('la veille apparaît dans l’historique du conseiller', hier.valeurs.maladie, 9);
    egal('la veille y est marquée figée', hier.fige, true);
    egal('le jour même n’est pas figé', donnees.historique[0].fige, false);
  }

  // -- L'administrateur ne modifie aucune saisie -----------------------------
  egal('l’administrateur ne dispose d’aucune route de saisie',
    (await admin('/api/saisie', { methode: 'PUT', corps: { valeurs: { maladie: 99 } } })).statut, 401);
  egal('aucune route ne permet d’écrire sur une journée passée',
    (await admin('/api/saisie?jour=' + veille, { methode: 'PUT', corps: { valeurs: { maladie: 99 } } })).statut, 401);
  egal('les chiffres de la veille sont restés intacts',
    stockage.lire().saisies[veille]['a.roux'].maladie, 9);

  // -- Objectifs -------------------------------------------------------------
  egal('l’administrateur fixe les objectifs d’un conseiller',
    (await admin('/api/admin/objectifs/a.roux', {
      methode: 'PUT',
      corps: {
        objectifs: {
          maladie: { hebdomadaire: 10, mensuel: 40 },
          lpp_comptes: { hebdomadaire: 3, mensuel: 12 },
          everlife: { hebdomadaire: 2, mensuel: 8 },
          rdv_pris: { hebdomadaire: 20, mensuel: 80 },
          rdv_non_signes: { hebdomadaire: 5, mensuel: 20 },
          lpp_montant: { hebdomadaire: 50000, mensuel: 300000 },
        },
      },
    })).statut, 200);
  {
    const { donnees } = await alice('/api/conseiller');
    const maladieSemaine = donnees.semaine.bilan.lignes.find((l) => l.cle === 'maladie');
    egal('le conseiller voit son objectif hebdomadaire', maladieSemaine.objectif, 10);
    egal('et l’écart chiffré qui l’en sépare', maladieSemaine.reste, 10 - maladieSemaine.realise);
    const montantSemaine = donnees.semaine.bilan.lignes.find((l) => l.cle === 'lpp_montant');
    egal('l’objectif hebdomadaire proposé pour les avoirs LPP n’est jamais retenu', montantSemaine.objectif, null);
    const montantMois = donnees.mois.bilan.lignes.find((l) => l.cle === 'lpp_montant');
    egal('son objectif mensuel, lui, est bien affiché', montantMois.objectif, 300000);
  }

  {
    // L'objectif est ramené sous le réalisé du moment : l'écart doit basculer
    // sans attendre la fin de la période.
    const avant = (await alice('/api/conseiller')).donnees.semaine.bilan.lignes.find((l) => l.cle === 'maladie');
    egal('avant modification, l’objectif de 10 n’est pas atteint', avant.atteint, false);
    egal('un objectif se modifie à tout moment',
      (await admin('/api/admin/objectifs/a.roux', {
        methode: 'PUT',
        corps: { objectifs: { maladie: { hebdomadaire: avant.realise, mensuel: 40 } } },
      })).statut, 200);
    const apres = (await alice('/api/conseiller')).donnees.semaine.bilan.lignes.find((l) => l.cle === 'maladie');
    egal('l’écart se recalcule aussitôt sur le nouvel objectif', apres.objectif, avant.realise);
    egal('l’objectif désormais atteint est signalé comme tel', apres.atteint, true);
    egal('et l’écart tombe à zéro', apres.ecart, 0);
    egal('les objectifs non renvoyés sont effacés, pas conservés',
      apres.objectif !== null && (await alice('/api/conseiller')).donnees.objectifs.rdv_pris.hebdomadaire, null);
  }
  egal('un objectif sur un conseiller inconnu est refusé',
    (await admin('/api/admin/objectifs/personne', { methode: 'PUT', corps: { objectifs: {} } })).statut, 404);

  // -- Tableau de bord administrateur ---------------------------------------
  {
    const { donnees } = await admin('/api/admin/tableau');
    egal('l’administrateur voit les deux conseillers', donnees.conseillers.length, 2);
    egal('il voit le classement de la semaine', donnees.semaine.classement.length, 2);
    egal('il voit le classement du mois', donnees.mois.classement.length, 2);
    egal('il voit les saisies du jour de chacun', donnees.jourEquipe.length, 2);
    const roux = donnees.jourEquipe.find((c) => c.identifiant === 'a.roux');
    egal('avec le détail des chiffres individuels', roux.valeurs.maladie, 1);
    const dias = donnees.jourEquipe.find((c) => c.identifiant === 'b.dias');
    egal('un conseiller sans saisie est signalé comme tel', dias.saisi, false);
    egal('l’administrateur consulte la page d’un conseiller donné',
      (await admin('/api/conseiller?identifiant=b.dias')).donnees.conseiller.nom, 'Bruno Dias');
    egal('mais sans pouvoir la modifier',
      (await admin('/api/conseiller?identifiant=b.dias')).donnees.modifiable, false);
  }

  // -- Désactivation ---------------------------------------------------------
  await admin('/api/admin/conseillers/b.dias', { methode: 'PATCH', corps: { actif: false } });
  {
    const desactive = client();
    egal('un accès désactivé ne permet plus de se connecter',
      (await desactive('/api/connexion', { methode: 'POST', corps: { identifiant: 'b.dias' } })).statut, 403);
    egal('la session ouverte d’un conseiller désactivé ne vaut plus rien',
      (await bruno('/api/session')).donnees.role, null);
    egal('et il ne peut plus rien enregistrer',
      (await bruno('/api/saisie', { methode: 'PUT', corps: { valeurs: { maladie: 1 } } })).statut, 403);
    const { donnees } = await admin('/api/admin/tableau');
    egal('un conseiller désactivé sort de la vue du jour', donnees.jourEquipe.length, 1);
    egal('il sort aussi du classement', donnees.semaine.classement.length, 1);
    egal('mais reste listé pour être réactivé', donnees.conseillers.length, 2);
  }
  await admin('/api/admin/conseillers/b.dias', { methode: 'PATCH', corps: { actif: true } });
  egal('un accès réactivé fonctionne de nouveau',
    (await client()('/api/connexion', { methode: 'POST', corps: { identifiant: 'b.dias' } })).statut, 200);

  // -- Déconnexion et pages --------------------------------------------------
  await alice('/api/deconnexion', { methode: 'POST' });
  egal('après déconnexion la session est vide', (await alice('/api/session')).donnees.role, null);
  egal('le tableau redevient inaccessible', (await alice('/api/conseiller')).statut, 401);

  egal('la page de connexion est servie', (await fetch(`${base}/`)).status, 200);
  egal('la page conseiller est servie', (await fetch(`${base}/conseiller`)).status, 200);
  egal('la page administrateur est servie', (await fetch(`${base}/admin`)).status, 200);
  egal('la feuille de style est servie', (await fetch(`${base}/styles.css`)).status, 200);
  egal('aucun fichier hors du dossier public n’est servi',
    (await fetch(`${base}/../lib/sessions.mjs`)).status, 404);
  egal('une route inconnue répond 404', (await fetch(`${base}/api/inexistant`)).status, 404);

  // -- Persistance -----------------------------------------------------------
  {
    const relu = JSON.parse(await (await import('node:fs/promises')).readFile(join(dossier, 'data', 'suivi.json'), 'utf8'));
    egal('l’état est écrit sur disque', relu.conseillers.length, 2);
    egal('les saisies y sont conservées', relu.saisies[veille]['a.roux'].maladie, 9);
    egal('les modifications sont journalisées', relu.journal.length > 0, true);
  }
} finally {
  serveur.close();
  await rm(dossier, { recursive: true, force: true });
}

// ===========================================================================

console.log(`\n${reussis} tests réussis, ${echecs.length} échec(s).`);
if (echecs.length) {
  console.error('\nTests en échec :');
  for (const intitule of echecs) console.error(`  - ${intitule}`);
  process.exitCode = 1;
}
