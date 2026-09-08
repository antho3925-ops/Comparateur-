/**
 * Programme d'entrainement (palier Premium).
 *
 * Rotation simple pousser / tirer / jambes, dont le volume s'adapte a
 * l'objectif : series plus longues en perte de poids, plus lourdes en prise
 * de muscle. La seance du jour se deduit de la date, donc elle est stable
 * pour tout le monde et ne demande aucun etat cote serveur.
 *
 * Module pur : testable sans simulateur.
 */

import type { Objectif } from './calories';

export type Exercice = {
  readonly nom: string;
  readonly series: number;
  readonly reps: string;
};

export type Seance = {
  readonly nom: string;
  readonly repos: boolean;
  readonly exercices: readonly Exercice[];
};

const SPLIT: readonly { nom: string; mouvements: readonly string[] }[] = [
  { nom: 'Pousser', mouvements: ['Developpe couche', 'Developpe militaire', 'Dips', 'Extensions triceps'] },
  { nom: 'Tirer', mouvements: ['Tractions', 'Rowing barre', 'Tirage horizontal', 'Curl biceps'] },
  { nom: 'Jambes', mouvements: ['Squat', 'Souleve de terre', 'Presse a cuisses', 'Mollets debout'] },
];

/** Jours de repos dans le cycle de 7 jours (indices 3 et 6). */
const CYCLE = [0, 1, 2, -1, 0, 1, -1] as const;

const VOLUME: Record<Objectif, { series: number; reps: string }> = {
  perte_poids: { series: 4, reps: '12-15' },
  prise_muscle: { series: 5, reps: '5-8' },
  maintien: { series: 4, reps: '8-12' },
};

/** Nombre de jours ecoules depuis le 1er janvier 1970, en heure locale. */
export function indexDuJour(date: Date): number {
  const minuit = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(minuit.getTime() / 86_400_000);
}

export function seanceDuJour(objectif: Objectif, date: Date = new Date()): Seance {
  const position = ((indexDuJour(date) % CYCLE.length) + CYCLE.length) % CYCLE.length;
  const bloc = CYCLE[position];

  if (bloc === -1) {
    return { nom: 'Repos', repos: true, exercices: [] };
  }

  const { nom, mouvements } = SPLIT[bloc];
  const { series, reps } = VOLUME[objectif];

  return {
    nom,
    repos: false,
    exercices: mouvements.map((mouvement) => ({ nom: mouvement, series, reps })),
  };
}

/** 1RM estime par la formule d'Epley, celle qui sert au classement. */
export function unRmEstime(poidsSouleve: number, reps: number): number {
  if (poidsSouleve <= 0 || reps <= 0) return 0;
  return Math.round(poidsSouleve * (1 + reps / 30) * 10) / 10;
}

/** Exercices proposes par defaut dans l'onglet classement performance. */
export const EXERCICES_PHARES: readonly string[] = [
  'Squat',
  'Developpe couche',
  'Souleve de terre',
  'Tractions',
];
