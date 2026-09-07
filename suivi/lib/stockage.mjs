// Persistance de l'état. Un seul fichier JSON, écrit de façon atomique
// (écriture dans un fichier temporaire puis renommage) pour qu'une coupure
// n'ampute jamais le fichier en place. Les écritures sont sérialisées :
// le serveur est mono-processus, une file suffit à éviter les entrelacs.

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { objectifsVides } from './domaine.mjs';

const ETAT_INITIAL = () => ({
  version: 1,
  conseillers: [],
  saisies: {},
  objectifs: {},
  journal: [],
});

export class Stockage {
  constructor(chemin) {
    this.chemin = chemin;
    this.etat = ETAT_INITIAL();
    this.file = Promise.resolve();
    this.abonnes = new Set();
  }

  async charger() {
    if (!existsSync(this.chemin)) {
      await mkdir(dirname(this.chemin), { recursive: true });
      await this.#ecrire();
      return this.etat;
    }
    const brut = await readFile(this.chemin, 'utf8');
    const lu = JSON.parse(brut);
    this.etat = { ...ETAT_INITIAL(), ...lu };
    return this.etat;
  }

  async #ecrire() {
    const temporaire = `${this.chemin}.${randomUUID()}.tmp`;
    await writeFile(temporaire, `${JSON.stringify(this.etat, null, 2)}\n`, 'utf8');
    await rename(temporaire, this.chemin);
  }

  /**
   * Applique une modification puis enregistre. `muter` reçoit l'état et peut
   * renvoyer une valeur, transmise à l'appelant. Une exception laisse l'état
   * en mémoire tel que la mutation l'a laissé — les mutations valident donc
   * avant de modifier.
   */
  async modifier(muter, evenement = 'etat') {
    const tache = this.file.then(async () => {
      const resultat = muter(this.etat);
      await this.#ecrire();
      this.diffuser(evenement);
      return resultat;
    });
    this.file = tache.catch(() => {});
    return tache;
  }

  lire() {
    return this.etat;
  }

  // --- Diffusion temps réel -------------------------------------------------

  abonner(envoyer) {
    this.abonnes.add(envoyer);
    return () => this.abonnes.delete(envoyer);
  }

  diffuser(evenement) {
    for (const envoyer of this.abonnes) {
      try {
        envoyer(evenement);
      } catch {
        this.abonnes.delete(envoyer);
      }
    }
  }
}

// --- Accès typés sur l'état ------------------------------------------------

export function conseillerParIdentifiant(etat, identifiant) {
  if (typeof identifiant !== 'string') return null;
  const cle = identifiant.trim().toLowerCase();
  return etat.conseillers.find((c) => c.identifiant === cle) || null;
}

export function conseillersActifs(etat) {
  return etat.conseillers.filter((c) => c.actif);
}

export function objectifsDe(etat, identifiant) {
  return { ...objectifsVides(), ...(etat.objectifs[identifiant] || {}) };
}

export function saisieDuJour(etat, identifiant, jour) {
  return (etat.saisies[jour] && etat.saisies[jour][identifiant]) || null;
}

export function journaliser(etat, entree) {
  etat.journal.push(entree);
  // Le journal sert au contrôle, pas à l'archivage : on garde les 5000
  // dernières entrées, largement de quoi couvrir plusieurs mois d'équipe.
  if (etat.journal.length > 5000) etat.journal.splice(0, etat.journal.length - 5000);
}
