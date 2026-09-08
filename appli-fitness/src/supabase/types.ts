/** Formes des tables telles que definies dans supabase/migrations. */

import type { Objectif } from '../metier/calories';
import type { Palier } from '../metier/paliers';

export type Utilisateur = {
  id: string;
  username: string;
  email: string | null;
  auth_provider: string | null;
  objectif: Objectif;
  taille_cm: number | null;
  calories_objectif: number | null;
  palier: Palier;
  created_at: string;
};

export type Aliment = {
  nom: string;
  quantite: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
};

export type Repas = {
  id: string;
  user_id: string;
  photo_url: string | null;
  aliments: Aliment[];
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  date: string;
  created_at: string;
};

export type MesurePoids = {
  id: string;
  user_id: string;
  poids: number;
  date: string;
};

export type PerfExercice = {
  id: string;
  user_id: string;
  exercice: string;
  poids_souleve: number;
  reps: number;
  date: string;
  created_at: string;
};

export type LigneClassementPoids = {
  rang: number;
  username: string;
  est_moi: boolean;
  pct_perdu: number;
  poids_depart: number;
  poids_actuel: number;
};

export type LigneClassementExercice = {
  rang: number;
  username: string;
  est_moi: boolean;
  un_rm_estime: number;
  poids_souleve: number;
  reps: number;
  date: string;
};

/** Reponse de l'Edge Function analyser-repas. */
export type AnalyseRepas = {
  plat: string;
  confiance: 'haute' | 'moyenne' | 'basse';
  aliments: Aliment[];
  totaux: {
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
  };
};
