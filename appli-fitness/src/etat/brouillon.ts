/**
 * Repas en cours de saisie, entre l'ecran photo et l'ecran de correction.
 *
 * Il transite par un module plutot que par les parametres de navigation :
 * une analyse complete (aliments, macros, chemin de la photo) depasse ce qu'on
 * met raisonnablement dans une URL.
 */

import type { AnalyseRepas } from '../supabase/types';

export type Brouillon = {
  analyse: AnalyseRepas;
  /** Chemin dans le bucket, ou null si le televersement a echoue. */
  cheminPhoto: string | null;
  /** URI locale, pour l'apercu immediat sans aller-retour reseau. */
  uriLocale: string;
};

let brouillon: Brouillon | null = null;

export function poserBrouillon(valeur: Brouillon): void {
  brouillon = valeur;
}

export function lireBrouillon(): Brouillon | null {
  return brouillon;
}

export function viderBrouillon(): void {
  brouillon = null;
}
