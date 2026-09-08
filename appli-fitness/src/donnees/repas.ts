import { File } from 'expo-file-system';

import { jourLocal } from '../metier/dates';
import { supabase } from '../supabase/client';
import type { Aliment, AnalyseRepas, Repas } from '../supabase/types';

export async function listerRepasDuJour(
  idUtilisateur: string,
  jour: string = jourLocal(),
): Promise<Repas[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', idUtilisateur)
    .eq('date', jour)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Repas[];
}

export async function compterRepasDuJour(
  idUtilisateur: string,
  jour: string = jourLocal(),
): Promise<number> {
  const { count, error } = await supabase
    .from('meals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', idUtilisateur)
    .eq('date', jour);

  if (error) throw error;
  return count ?? 0;
}

/** Envoie la photo a l'Edge Function, qui detient seule la cle du modele. */
export async function analyserPhoto(
  imageBase64: string,
  typeMime = 'image/jpeg',
): Promise<AnalyseRepas> {
  const { data, error } = await supabase.functions.invoke<AnalyseRepas>('analyser-repas', {
    body: { image_base64: imageBase64, type_mime: typeMime },
  });

  if (error) throw error;
  if (!data) throw new Error('analyse_vide');
  return data;
}

/** Depose la photo dans le dossier prive de l'utilisateur et renvoie son chemin. */
export async function televerserPhoto(
  idUtilisateur: string,
  uriLocale: string,
): Promise<string> {
  const chemin = `${idUtilisateur}/${Date.now()}.jpg`;
  const contenu = await new File(uriLocale).arrayBuffer();

  const { error } = await supabase.storage
    .from('photos-repas')
    .upload(chemin, contenu, { contentType: 'image/jpeg' });

  if (error) throw error;
  return chemin;
}

/** Le bucket est prive : l'affichage passe par une URL signee, courte duree. */
export async function urlPhoto(chemin: string, secondes = 3600): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('photos-repas')
    .createSignedUrl(chemin, secondes);

  if (error) return null;
  return data.signedUrl;
}

export class QuotaAtteint extends Error {
  constructor() {
    super('quota_photos_atteint');
    this.name = 'QuotaAtteint';
  }
}

export type NouveauRepas = {
  photo_url: string | null;
  aliments: Aliment[];
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
};

export async function enregistrerRepas(
  idUtilisateur: string,
  repas: NouveauRepas,
  jour: string = jourLocal(),
): Promise<Repas> {
  const { data, error } = await supabase
    .from('meals')
    .insert({ ...repas, user_id: idUtilisateur, date: jour })
    .select()
    .single();

  if (error) {
    // Le declencheur en base rejette l'insertion au-dela du quota du palier.
    if (error.message.includes('quota_photos_atteint')) throw new QuotaAtteint();
    throw error;
  }

  return data as Repas;
}

export async function supprimerRepas(id: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}

export function totauxAliments(aliments: readonly Aliment[]) {
  const somme = (champ: keyof Aliment) =>
    aliments.reduce((total, a) => total + (Number(a[champ]) || 0), 0);

  return {
    calories: Math.round(somme('calories')),
    proteines: Math.round(somme('proteines') * 10) / 10,
    glucides: Math.round(somme('glucides') * 10) / 10,
    lipides: Math.round(somme('lipides') * 10) / 10,
  };
}
