import { debutDuMois, jourLocal } from '../metier/dates';
import { supabase } from '../supabase/client';
import type { MesurePoids } from '../supabase/types';

/** Une seule mesure par jour : une nouvelle saisie remplace celle du jour. */
export async function enregistrerPoids(
  idUtilisateur: string,
  poids: number,
  jour: string = jourLocal(),
): Promise<MesurePoids> {
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert(
      { user_id: idUtilisateur, poids, date: jour },
      { onConflict: 'user_id,date' },
    )
    .select()
    .single();

  if (error) throw error;
  return data as MesurePoids;
}

export async function dernierPoids(idUtilisateur: string): Promise<MesurePoids | null> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', idUtilisateur)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as MesurePoids | null) ?? null;
}

export async function historiquePoids(
  idUtilisateur: string,
  limite = 60,
): Promise<MesurePoids[]> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', idUtilisateur)
    .order('date', { ascending: false })
    .limit(limite);

  if (error) throw error;
  return (data ?? []) as MesurePoids[];
}

/** Premiere mesure du mois en cours : la reference du classement perte de poids. */
export async function poidsDebutDeMois(
  idUtilisateur: string,
): Promise<MesurePoids | null> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', idUtilisateur)
    .gte('date', debutDuMois())
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as MesurePoids | null) ?? null;
}
