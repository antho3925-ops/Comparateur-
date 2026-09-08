/**
 * Objectif calorique et repartition des macros.
 *
 * L'onboarding ne demande que taille, poids et objectif (spec), donc l'age et
 * le sexe manquent pour un Mifflin-St Jeor exact. On utilise la formule avec
 * une constante moyenne (age 30, moyenne homme/femme) : c'est une estimation
 * de depart, que l'utilisateur peut remplacer par sa propre valeur depuis le
 * profil (users.calories_objectif).
 *
 * Module pur : testable sans simulateur.
 */

export type Objectif = 'perte_poids' | 'prise_muscle' | 'maintien';

export const LIBELLES_OBJECTIF: Record<Objectif, string> = {
  perte_poids: 'Perte de poids',
  prise_muscle: 'Prise de muscle',
  maintien: 'Maintien',
};

/** Plancher de securite : on ne propose jamais un objectif sous ce seuil. */
export const CALORIES_MINIMUM = 1200;

/** Coefficient d'activite d'une personne qui suit ses seances. */
const FACTEUR_ACTIVITE = 1.45;

const AJUSTEMENT: Record<Objectif, number> = {
  perte_poids: -0.2,
  prise_muscle: 0.1,
  maintien: 0,
};

/** Mifflin-St Jeor, constante moyennee faute d'age et de sexe. */
export function metabolismeDeBase(poidsKg: number, tailleCm: number): number {
  return Math.round(10 * poidsKg + 6.25 * tailleCm - 228);
}

export function besoinDeMaintien(poidsKg: number, tailleCm: number): number {
  return Math.round(metabolismeDeBase(poidsKg, tailleCm) * FACTEUR_ACTIVITE);
}

export function objectifCalorique(
  poidsKg: number,
  tailleCm: number,
  objectif: Objectif,
): number {
  const maintien = besoinDeMaintien(poidsKg, tailleCm);
  const cible = Math.round(maintien * (1 + AJUSTEMENT[objectif]));
  return Math.max(CALORIES_MINIMUM, cible);
}

export type Macros = {
  proteines: number;
  glucides: number;
  lipides: number;
};

/** Proteines a la masse corporelle, lipides a 25 % des calories, le reste en glucides. */
export function repartitionMacros(
  calories: number,
  poidsKg: number,
  objectif: Objectif,
): Macros {
  const parKilo = objectif === 'perte_poids' ? 2 : objectif === 'prise_muscle' ? 1.8 : 1.6;
  const proteines = Math.round(poidsKg * parKilo);
  const lipides = Math.round((calories * 0.25) / 9);
  const restant = calories - proteines * 4 - lipides * 9;
  const glucides = Math.max(0, Math.round(restant / 4));
  return { proteines, glucides, lipides };
}

export type LigneRepas = {
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
};

export type ResumeJournee = {
  consommees: number;
  restantes: number;
  depassement: boolean;
  /** Part de l'objectif deja consommee, bornee a 1 pour la barre de progression. */
  progression: number;
  macros: Macros;
};

export function resumeJournee(objectif: number, repas: readonly LigneRepas[]): ResumeJournee {
  const total = (champ: keyof LigneRepas) =>
    repas.reduce((somme, r) => somme + (Number(r[champ]) || 0), 0);

  const consommees = Math.round(total('calories'));
  const restantes = objectif - consommees;

  return {
    consommees,
    restantes,
    depassement: restantes < 0,
    progression: objectif > 0 ? Math.min(1, consommees / objectif) : 0,
    macros: {
      proteines: Math.round(total('proteines')),
      glucides: Math.round(total('glucides')),
      lipides: Math.round(total('lipides')),
    },
  };
}

/** Pourcentage perdu depuis le poids de reference (positif = perte). */
export function pourcentagePerdu(poidsDepart: number, poidsActuel: number): number {
  if (poidsDepart <= 0) return 0;
  return Math.round(((poidsDepart - poidsActuel) / poidsDepart) * 1000) / 10;
}
