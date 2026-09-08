import { supabase } from '../supabase/client';
import type { Objectif } from '../metier/calories';
import type { Utilisateur } from '../supabase/types';

export type CreationProfil = {
  username: string;
  email: string | null;
  auth_provider: string | null;
  objectif: Objectif;
  taille_cm: number;
};

export class UsernamePris extends Error {
  constructor() {
    super('username_pris');
    this.name = 'UsernamePris';
  }
}

/** Normalise le nom public : minuscules, tirets bas, alphanumerique. */
export function normaliserUsername(saisie: string): string {
  return saisie
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 20);
}

export function usernameValide(username: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

export async function creerProfil(
  idUtilisateur: string,
  profil: CreationProfil,
): Promise<Utilisateur> {
  const { data, error } = await supabase
    .from('users')
    .insert({ ...profil, id: idUtilisateur })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new UsernamePris();
    throw error;
  }

  return data as Utilisateur;
}

export async function majProfil(
  idUtilisateur: string,
  champs: Partial<Pick<Utilisateur, 'objectif' | 'taille_cm' | 'calories_objectif' | 'username'>>,
): Promise<Utilisateur> {
  const { data, error } = await supabase
    .from('users')
    .update(champs)
    .eq('id', idUtilisateur)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new UsernamePris();
    throw error;
  }

  return data as Utilisateur;
}
