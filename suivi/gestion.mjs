#!/usr/bin/env node
// Gestion des accès en ligne de commande, pour la mise en service et les
// arrivées suivantes. Tout se fait aussi depuis l'onglet « Accès » de l'espace
// administrateur ; cette commande sert quand il n'y a encore aucun accès, donc
// personne pour ouvrir cet onglet.
//
//   node suivi/gestion.mjs code-admin <code>
//   node suivi/gestion.mjs ajouter <identifiant> <nom complet>
//   node suivi/gestion.mjs renommer <identifiant> <nom complet>
//   node suivi/gestion.mjs desactiver <identifiant>
//   node suivi/gestion.mjs reactiver <identifiant>
//   node suivi/gestion.mjs lister
//
// À lancer serveur arrêté : le serveur garde l'état en mémoire et réécrirait
// le fichier par-dessus à sa prochaine modification.

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Stockage, conseillerParIdentifiant, journaliser } from './lib/stockage.mjs';
import { Securite, normaliserIdentifiant } from './lib/sessions.mjs';
import { maintenant } from './lib/dates.mjs';

const RACINE = dirname(fileURLToPath(import.meta.url));
const DOSSIER = process.env.SUIVI_DONNEES || join(RACINE, 'data');

const MODE_EMPLOI = `
Gestion des accès — plateforme de suivi de performance

  node suivi/gestion.mjs code-admin <code>            fixe le code de l'espace administrateur
  node suivi/gestion.mjs ajouter <id> <nom complet>   crée l'accès d'un conseiller
  node suivi/gestion.mjs renommer <id> <nom complet>  corrige un nom
  node suivi/gestion.mjs desactiver <id>              retire l'accès, garde les chiffres
  node suivi/gestion.mjs reactiver <id>               rend l'accès
  node suivi/gestion.mjs lister                       affiche les accès existants

L'identifiant s'écrit en minuscules à l'enregistrement ; la connexion, elle,
ne tient pas compte de la casse. À lancer serveur arrêté.
`;

class Refus extends Error {}

async function ouvrir() {
  const stockage = new Stockage(join(DOSSIER, 'suivi.json'));
  await stockage.charger();
  return stockage;
}

function exigerIdentifiant(brut) {
  const identifiant = normaliserIdentifiant(brut);
  if (!identifiant) {
    throw new Refus(`Identifiant invalide : « ${brut} ». Attendu : 2 à 32 caractères, `
      + 'lettres, chiffres, point, tiret ou soulignement.');
  }
  return identifiant;
}

function exigerNom(morceaux) {
  const nom = morceaux.join(' ').trim();
  if (nom.length < 2 || nom.length > 80) throw new Refus('Nom manquant ou invalide.');
  return nom;
}

const commandes = {
  async 'code-admin'([code]) {
    if (!code) throw new Refus('Code manquant : node suivi/gestion.mjs code-admin <code>');
    await Securite.charger(join(DOSSIER, 'config.json'), { codeAdmin: code });
    console.log('Code administrateur enregistré.');
    console.log('Seule son empreinte est stockée, jamais le code lui-même.');
    if (code.length < 12) {
      console.log('\nNote : un code de moins de douze caractères se devine vite. '
        + 'Il ouvre les chiffres de toute l’équipe et le classement.');
    }
  },

  async ajouter([brut, ...reste]) {
    const identifiant = exigerIdentifiant(brut);
    const nom = exigerNom(reste);
    const stockage = await ouvrir();
    await stockage.modifier((etat) => {
      if (conseillerParIdentifiant(etat, identifiant)) {
        throw new Refus(`L’identifiant « ${identifiant} » existe déjà.`);
      }
      etat.conseillers.push({ identifiant, nom, actif: true, cree: maintenant() });
      etat.conseillers.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      journaliser(etat, {
        horodatage: maintenant(), auteur: 'console', action: 'conseiller-cree', cible: identifiant,
      });
    });
    console.log(`Accès créé : ${nom} — identifiant « ${identifiant} ».`);
  },

  async renommer([brut, ...reste]) {
    const identifiant = exigerIdentifiant(brut);
    const nom = exigerNom(reste);
    const stockage = await ouvrir();
    await stockage.modifier((etat) => {
      const conseiller = conseillerParIdentifiant(etat, identifiant);
      if (!conseiller) throw new Refus(`Identifiant inconnu : « ${identifiant} ».`);
      conseiller.nom = nom;
      etat.conseillers.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      journaliser(etat, {
        horodatage: maintenant(), auteur: 'console', action: 'conseiller-modifie', cible: identifiant,
      });
    });
    console.log(`« ${identifiant} » s’appelle désormais ${nom}.`);
  },

  async desactiver([brut]) {
    await basculer(brut, false);
  },

  async reactiver([brut]) {
    await basculer(brut, true);
  },

  async lister() {
    const stockage = await ouvrir();
    const { conseillers } = stockage.lire();
    if (!conseillers.length) {
      console.log('Aucun accès conseiller enregistré.');
      return;
    }
    const largeur = Math.max(...conseillers.map((c) => c.identifiant.length));
    console.log(`${conseillers.length} accès :\n`);
    for (const c of conseillers) {
      console.log(`  ${c.identifiant.padEnd(largeur)}  ${c.nom}${c.actif ? '' : '   (désactivé)'}`);
    }
  },
};

async function basculer(brut, actif) {
  const identifiant = exigerIdentifiant(brut);
  const stockage = await ouvrir();
  await stockage.modifier((etat) => {
    const conseiller = conseillerParIdentifiant(etat, identifiant);
    if (!conseiller) throw new Refus(`Identifiant inconnu : « ${identifiant} ».`);
    conseiller.actif = actif;
    journaliser(etat, {
      horodatage: maintenant(), auteur: 'console', action: 'conseiller-modifie', cible: identifiant,
    });
  });
  console.log(`Accès de « ${identifiant} » ${actif ? 'réactivé' : 'désactivé'}.`);
}

const [commande, ...arguments_] = process.argv.slice(2);

if (!commande || commande === 'aide' || commande === '--help') {
  console.log(MODE_EMPLOI);
} else if (!commandes[commande]) {
  console.error(`Commande inconnue : « ${commande} ».`);
  console.error(MODE_EMPLOI);
  process.exitCode = 1;
} else {
  try {
    await commandes[commande](arguments_);
  } catch (erreur) {
    console.error(erreur instanceof Refus ? erreur.message : erreur);
    process.exitCode = 1;
  }
}
