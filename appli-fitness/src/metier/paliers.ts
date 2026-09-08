/**
 * Les trois paliers de la spec, et les regles qui en decoulent.
 * Module pur : aucune dependance a React ou au reseau, donc testable tel quel.
 */

export type Palier = 'gratuit' | 'standard' | 'premium';

export type DefinitionPalier = {
  readonly cle: Palier;
  readonly nom: string;
  readonly prixMensuel: number;
  /** Photos de repas par jour. `null` = illimite. */
  readonly photosParJour: number | null;
  readonly exercices: boolean;
  readonly participeClassements: boolean;
  readonly arguments: readonly string[];
};

export const PALIERS: Record<Palier, DefinitionPalier> = {
  gratuit: {
    cle: 'gratuit',
    nom: 'Gratuit',
    prixMensuel: 0,
    photosParJour: 1,
    exercices: false,
    participeClassements: false,
    arguments: ['1 photo par jour', 'Classements en lecture seule'],
  },
  standard: {
    cle: 'standard',
    nom: 'Standard',
    prixMensuel: 5,
    photosParJour: 6,
    exercices: false,
    participeClassements: true,
    arguments: [
      '6 photos par jour (2 par repas)',
      'Participation aux classements',
    ],
  },
  premium: {
    cle: 'premium',
    nom: 'Premium',
    prixMensuel: 15,
    photosParJour: null,
    exercices: true,
    participeClassements: true,
    arguments: [
      'Photos illimitees',
      'Programme d\'entrainement personnalise',
      'Participation aux classements',
    ],
  },
};

export const ORDRE_PALIERS: readonly Palier[] = ['gratuit', 'standard', 'premium'];

export function estPalier(valeur: unknown): valeur is Palier {
  return typeof valeur === 'string' && valeur in PALIERS;
}

/** Photos encore disponibles aujourd'hui. `null` = illimite. */
export function photosRestantes(palier: Palier, dejaPrises: number): number | null {
  const quota = PALIERS[palier].photosParJour;
  if (quota === null) return null;
  return Math.max(0, quota - dejaPrises);
}

export function peutPrendrePhoto(palier: Palier, dejaPrises: number): boolean {
  const restantes = photosRestantes(palier, dejaPrises);
  return restantes === null || restantes > 0;
}

export function accesExercices(palier: Palier): boolean {
  return PALIERS[palier].exercices;
}

export function participeAuxClassements(palier: Palier): boolean {
  return PALIERS[palier].participeClassements;
}

/** Palier minimal a vendre pour debloquer une fonctionnalite donnee. */
export function palierRequisPour(fonction: 'exercices' | 'classements'): Palier {
  const cle = fonction === 'exercices' ? 'exercices' : 'participeClassements';
  const trouve = ORDRE_PALIERS.find((p) => PALIERS[p][cle]);
  return trouve ?? 'premium';
}
