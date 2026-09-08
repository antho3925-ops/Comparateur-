import { jourLocal } from '../metier/dates';
import { supabase } from '../supabase/client';
import type { PerfExercice } from '../supabase/types';

export async function enregistrerPerf(
  idUtilisateur: string,
  perf: { exercice: string; poids_souleve: number; reps: number },
  jour: string = jourLocal(),
): Promise<PerfExercice> {
  const { data, error } = await supabase
    .from('exercises_log')
    .insert({ ...perf, user_id: idUtilisateur, date: jour })
    .select()
    .single();

  if (error) throw error;
  return data as PerfExercice;
}

export async function perfsDuJour(
  idUtilisateur: string,
  jour: string = jourLocal(),
): Promise<PerfExercice[]> {
  const { data, error } = await supabase
    .from('exercises_log')
    .select('*')
    .eq('user_id', idUtilisateur)
    .eq('date', jour)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as PerfExercice[];
}

export async function historiqueExercice(
  idUtilisateur: string,
  exercice: string,
  limite = 30,
): Promise<PerfExercice[]> {
  const { data, error } = await supabase
    .from('exercises_log')
    .select('*')
    .eq('user_id', idUtilisateur)
    .ilike('exercice', exercice)
    .order('date', { ascending: false })
    .limit(limite);

  if (error) throw error;
  return (data ?? []) as PerfExercice[];
}

export async function supprimerPerf(id: string): Promise<void> {
  const { error } = await supabase.from('exercises_log').delete().eq('id', id);
  if (error) throw error;
}
