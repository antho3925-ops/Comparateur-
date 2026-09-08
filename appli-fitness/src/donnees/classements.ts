import { debutDuMois } from '../metier/dates';
import { supabase } from '../supabase/client';
import type { LigneClassementExercice, LigneClassementPoids } from '../supabase/types';

/**
 * Les classements passent par des fonctions security definer : les tables
 * restent fermees par RLS, seules les lignes agregees des participants sortent.
 */

export async function classementPertePoids(
  mois: string = debutDuMois(),
  limite = 50,
): Promise<LigneClassementPoids[]> {
  const { data, error } = await supabase.rpc('classement_perte_poids', {
    p_mois: mois,
    p_limite: limite,
  });

  if (error) throw error;
  return (data ?? []) as LigneClassementPoids[];
}

export async function classementExercice(
  exercice: string,
  limite = 50,
): Promise<LigneClassementExercice[]> {
  const { data, error } = await supabase.rpc('classement_exercice', {
    p_exercice: exercice,
    p_limite: limite,
  });

  if (error) throw error;
  return (data ?? []) as LigneClassementExercice[];
}

export async function exercicesClasses(): Promise<
  { exercice: string; nb_athletes: number }[]
> {
  const { data, error } = await supabase.rpc('exercices_classes');
  if (error) throw error;
  return (data ?? []) as { exercice: string; nb_athletes: number }[];
}
