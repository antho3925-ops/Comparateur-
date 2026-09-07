#!/usr/bin/env node
// Jeu de démonstration : une équipe fictive et six semaines d'activité, pour
// voir la plateforme remplie sans attendre que de vrais chiffres s'accumulent.
//
//   node suivi/demo.mjs           http://localhost:8090, code administrateur « demo »
//   PORT=9000 node suivi/demo.mjs
//
// Les données vivent dans suivi/demo-donnees/, à l'écart de suivi/data/ : la
// démonstration ne touche jamais aux chiffres réels de l'équipe. Le dossier est
// remis à neuf à chaque lancement.

import { rm, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { aujourdhui, decale, jourSemaine } from './lib/dates.mjs';
import { demarrer } from './serveur.mjs';

const RACINE = dirname(fileURLToPath(import.meta.url));
const DOSSIER = join(RACINE, 'demo-donnees');
const CODE_ADMIN = 'demo';
const JOURS_HISTORIQUE = 45;

const CONSEILLERS = [
  // « allant » module le volume d'affaires, « regularite » la fréquence des
  // journées saisies. De quoi obtenir un classement qui a du relief.
  { identifiant: 'a.roux', nom: 'Alice Roux', allant: 1.25, regularite: 0.97, exigence: 1.3 },
  { identifiant: 'b.dias', nom: 'Bruno Dias', allant: 1.05, regularite: 0.92, exigence: 1.0 },
  { identifiant: 'c.meyer', nom: 'Chloé Meyer', allant: 0.85, regularite: 0.88, exigence: 0.9 },
  // Spécialiste de la prévoyance : on ne lui demande pas d'Everlife.
  { identifiant: 'd.perret', nom: 'David Perret', allant: 1.00, regularite: 0.75, exigence: 1.1, dispense: ['everlife'] },
  // Arrivée récente : objectifs allégés le temps de la montée en charge.
  { identifiant: 'e.fontana', nom: 'Elena Fontana', allant: 0.70, regularite: 0.95, exigence: 0.6 },
];

const OBJECTIFS_TYPES = {
  maladie: { hebdomadaire: 8, mensuel: 32 },
  lpp_comptes: { hebdomadaire: 3, mensuel: 12 },
  everlife: { hebdomadaire: 3, mensuel: 12 },
  rdv_pris: { hebdomadaire: 25, mensuel: 100 },
  // Plafond, non cible : un maximum à ne pas franchir. Calé de sorte que la
  // démonstration montre les deux cas, tenu chez les uns, franchi chez les autres.
  rdv_non_signes: { hebdomadaire: 12, mensuel: 48 },
  lpp_montant: { mensuel: 250000 },
};

/**
 * Les objectifs se règlent conseiller par conseiller et indicateur par
 * indicateur. La démonstration en donne donc de différents à chacun — un
 * confirmé plus exigeant, une débutante ménagée, un spécialiste LPP dispensé
 * d'Everlife — plutôt que la même grille recopiée cinq fois, qui laisserait
 * croire à un réglage unique pour toute l'équipe.
 */
function objectifsDe(conseiller) {
  const objectifs = structuredClone(OBJECTIFS_TYPES);
  const echelle = conseiller.exigence;
  for (const [cle, portees] of Object.entries(objectifs)) {
    for (const portee of Object.keys(portees)) {
      // Le plafond suit l'inverse : plus on attend d'un conseiller, moins on
      // lui tolère d'affaires manquées.
      const facteur = cle === 'rdv_non_signes' ? 1 / echelle : echelle;
      const arrondi = cle === 'lpp_montant' ? 10000 : 1;
      portees[portee] = Math.max(1, Math.round((portees[portee] * facteur) / arrondi) * arrondi);
    }
  }
  for (const cle of conseiller.dispense || []) delete objectifs[cle];
  return objectifs;
}

/**
 * Générateur pseudo-aléatoire à graine : la démonstration doit montrer les
 * mêmes chiffres d'un lancement à l'autre, sinon on ne peut en parler.
 */
function tirage(graine) {
  let etat = graine >>> 0;
  return () => {
    etat = (etat * 1664525 + 1013904223) >>> 0;
    return etat / 4294967296;
  };
}

function graineDe(texte) {
  let n = 2166136261;
  for (const caractere of texte) {
    n ^= caractere.codePointAt(0);
    n = Math.imul(n, 16777619);
  }
  return n >>> 0;
}

function journeeDe(conseiller, jour) {
  const dé = tirage(graineDe(conseiller.identifiant + jour));
  const entre = (min, max) => min + Math.floor(dé() * (max - min + 1));
  const a = conseiller.allant;

  // Les rendez-vous pris tirent le reste : on signe une partie de ce qu'on a vu.
  const rdvPris = Math.max(0, Math.round(entre(3, 9) * a));
  const signes = Math.round(rdvPris * (0.35 + dé() * 0.3));

  return {
    maladie: Math.max(0, Math.round(signes * 0.55)),
    lpp_comptes: dé() < 0.55 ? entre(0, Math.max(1, Math.round(2 * a))) : 0,
    everlife: dé() < 0.5 ? entre(0, Math.max(1, Math.round(2 * a))) : 0,
    rdv_pris: rdvPris,
    rdv_non_signes: Math.max(0, rdvPris - signes - entre(0, 2)),
    // Un transfert d'avoirs LPP ne tombe pas tous les jours.
    lpp_montant: dé() < 0.22 ? entre(2, 14) * 10000 : 0,
  };
}

function construireEtat() {
  const jourCourant = aujourdhui();
  const saisies = {};
  const objectifs = {};

  for (const conseiller of CONSEILLERS) {
    objectifs[conseiller.identifiant] = objectifsDe(conseiller);
  }

  for (let i = JOURS_HISTORIQUE; i >= 0; i -= 1) {
    const jour = decale(jourCourant, -i);
    if (jourSemaine(jour) > 5) continue;  // pas de rendez-vous le week-end
    for (const conseiller of CONSEILLERS) {
      const dé = tirage(graineDe(`presence:${conseiller.identifiant}:${jour}`));
      if (dé() > conseiller.regularite) continue;   // absence, congé, formation
      if (!saisies[jour]) saisies[jour] = {};
      saisies[jour][conseiller.identifiant] = {
        ...journeeDe(conseiller, jour),
        maj: `${jour}T${String(15 + Math.floor(dé() * 4)).padStart(2, '0')}:40:00.000Z`,
      };
    }
  }

  // Elena n'a pas encore saisi sa journée : le tableau de bord doit montrer une
  // ligne « en attente », c'est le cas le plus courant en milieu de journée.
  if (saisies[jourCourant]) delete saisies[jourCourant]['e.fontana'];

  return {
    version: 1,
    // La démonstration a sa propre équipe : elle se déclare installée pour que
    // l'équipe de départ du dépôt ne vienne pas s'y ajouter.
    installe: true,
    conseillers: CONSEILLERS.map(({ identifiant, nom }) => ({
      identifiant, nom, actif: true, cree: `${decale(jourCourant, -120)}T08:00:00.000Z`,
    })),
    saisies,
    objectifs,
    journal: [],
  };
}

export async function preparer() {
  await rm(DOSSIER, { recursive: true, force: true });
  await mkdir(DOSSIER, { recursive: true });
  await writeFile(join(DOSSIER, 'suivi.json'), `${JSON.stringify(construireEtat(), null, 2)}\n`);
  return DOSSIER;
}

const lanceDirectement = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (lanceDirectement) {
  await preparer();
  process.env.SUIVI_CODE_ADMIN = CODE_ADMIN;
  const { port } = await demarrer({ port: Number(process.env.PORT) || 8090, dossierDonnees: DOSSIER });

  console.log(`\nDémonstration — http://localhost:${port}\n`);
  console.log('  Espace administrateur    code « demo »');
  console.log('  Identifiants conseillers ' + CONSEILLERS.map((c) => c.identifiant).join(', '));
  console.log('\n  Les chiffres sont fictifs et régénérés à chaque lancement.\n');
}
