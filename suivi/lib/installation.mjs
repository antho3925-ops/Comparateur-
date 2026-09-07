// Amorçage de l'équipe de départ.
//
// Une installation neuve n'a aucun conseiller, donc personne ne peut se
// connecter, et l'administrateur devrait tout saisir à la main avant que
// l'outil serve à quelque chose. Le fichier equipe-initiale.json comble ce
// vide une fois pour toutes.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

import { normaliserIdentifiant } from './sessions.mjs';
import { conseillerParIdentifiant, journaliser } from './stockage.mjs';
import { maintenant } from './dates.mjs';

/**
 * Applique l'équipe de départ si — et seulement si — la base est vierge.
 *
 * Le drapeau `installe` fait de l'opération un événement unique : une équipe
 * réduite à zéro conseiller après des départs ne verra pas ressusciter les
 * anciens, et modifier le fichier après coup ne rejoue rien. La base reste la
 * seule source de vérité ; ce fichier n'est qu'un point de départ.
 *
 * Renvoie la liste des conseillers créés, vide si rien n'était à faire.
 */
export async function installerEquipeInitiale(stockage, chemin) {
  const etat = stockage.lire();
  if (etat.installe || etat.conseillers.length > 0) return [];
  if (!existsSync(chemin)) return [];

  let contenu;
  try {
    contenu = JSON.parse(await readFile(chemin, 'utf8'));
  } catch (erreur) {
    throw new Error(`Équipe de départ illisible (${chemin}) : ${erreur.message}`);
  }

  const candidats = Array.isArray(contenu.conseillers) ? contenu.conseillers : [];
  const retenus = [];
  for (const brut of candidats) {
    const identifiant = normaliserIdentifiant(brut && brut.identifiant);
    const nom = typeof (brut && brut.nom) === 'string' ? brut.nom.trim() : '';
    if (!identifiant || nom.length < 2 || nom.length > 80) {
      throw new Error(`Équipe de départ invalide : ${JSON.stringify(brut)}`);
    }
    if (retenus.some((c) => c.identifiant === identifiant)) {
      throw new Error(`Équipe de départ : « ${identifiant} » apparaît deux fois.`);
    }
    retenus.push({ identifiant, nom, actif: true, cree: maintenant() });
  }

  await stockage.modifier((e) => {
    // Le drapeau est posé même sans conseiller à créer : un fichier vide est
    // une réponse, pas une raison de reposer la question à chaque démarrage.
    e.installe = true;
    for (const conseiller of retenus) {
      if (conseillerParIdentifiant(e, conseiller.identifiant)) continue;
      e.conseillers.push(conseiller);
    }
    e.conseillers.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    if (retenus.length) {
      journaliser(e, {
        horodatage: maintenant(),
        auteur: 'installation',
        action: 'equipe-initiale',
        cibles: retenus.map((c) => c.identifiant),
      });
    }
  }, 'conseillers');

  return retenus;
}
