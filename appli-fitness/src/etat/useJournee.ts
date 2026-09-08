import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '../auth/AuthContext';
import { dernierPoids } from '../donnees/poids';
import { listerRepasDuJour } from '../donnees/repas';
import {
  objectifCalorique,
  repartitionMacros,
  resumeJournee,
  type Macros,
  type ResumeJournee,
} from '../metier/calories';
import type { Repas } from '../supabase/types';

/** Valeur affichee tant qu'on ne connait ni le poids ni la taille. */
const OBJECTIF_PAR_DEFAUT = 2000;

export type Journee = {
  repas: Repas[];
  poids: number | null;
  objectifKcal: number;
  resume: ResumeJournee;
  ciblesMacros: Macros;
  chargement: boolean;
  erreur: string | null;
  recharger: () => Promise<void>;
};

/**
 * Ce que l'accueil affiche : les repas du jour, le poids courant, l'objectif.
 * Recharge a chaque retour sur l'ecran, pour refleter un repas ajoute entre-temps.
 */
export function useJournee(): Journee {
  const { session, profil } = useAuth();
  const [repas, setRepas] = useState<Repas[]>([]);
  const [poids, setPoids] = useState<number | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const idUtilisateur = session?.user.id;

  const recharger = useCallback(async () => {
    if (!idUtilisateur) return;
    setErreur(null);

    try {
      const [duJour, mesure] = await Promise.all([
        listerRepasDuJour(idUtilisateur),
        dernierPoids(idUtilisateur),
      ]);
      setRepas(duJour);
      setPoids(mesure?.poids ?? null);
    } catch (e) {
      console.warn('journee illisible', e);
      setErreur('Impossible de charger vos donnees du jour.');
    } finally {
      setChargement(false);
    }
  }, [idUtilisateur]);

  useFocusEffect(
    useCallback(() => {
      void recharger();
    }, [recharger]),
  );

  const objectifKcal =
    profil?.calories_objectif ??
    (poids && profil?.taille_cm
      ? objectifCalorique(poids, profil.taille_cm, profil.objectif)
      : OBJECTIF_PAR_DEFAUT);

  return {
    repas,
    poids,
    objectifKcal,
    resume: resumeJournee(objectifKcal, repas),
    ciblesMacros: repartitionMacros(
      objectifKcal,
      poids ?? 70,
      profil?.objectif ?? 'maintien',
    ),
    chargement,
    erreur,
    recharger,
  };
}
