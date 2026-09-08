import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { SUPABASE_CONFIGURE } from '../config';
import { supabase } from '../supabase/client';
import type { Utilisateur } from '../supabase/types';

type ValeurAuth = {
  session: Session | null;
  profil: Utilisateur | null;
  /** Vrai tant qu'on ne sait pas encore si quelqu'un est connecte. */
  chargement: boolean;
  /** L'utilisateur est connecte mais n'a pas encore fini l'onboarding. */
  onboardingRequis: boolean;
  rechargerProfil: () => Promise<void>;
};

const ContexteAuth = createContext<ValeurAuth | null>(null);

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  const chargerProfil = useCallback(async (idUtilisateur: string | undefined) => {
    if (!idUtilisateur) {
      setProfil(null);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', idUtilisateur)
      .maybeSingle();

    if (error) {
      console.warn('profil illisible', error.message);
      setProfil(null);
      return;
    }

    setProfil((data as Utilisateur | null) ?? null);
  }, []);

  useEffect(() => {
    if (!SUPABASE_CONFIGURE) {
      setChargement(false);
      return;
    }

    let actif = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!actif) return;
      setSession(data.session);
      await chargerProfil(data.session?.user.id);
      if (actif) setChargement(false);
    });

    const { data: abonnement } = supabase.auth.onAuthStateChange(
      async (_evenement, nouvelleSession) => {
        if (!actif) return;
        setSession(nouvelleSession);
        await chargerProfil(nouvelleSession?.user.id);
        if (actif) setChargement(false);
      },
    );

    return () => {
      actif = false;
      abonnement.subscription.unsubscribe();
    };
  }, [chargerProfil]);

  const rechargerProfil = useCallback(async () => {
    await chargerProfil(session?.user.id);
  }, [chargerProfil, session?.user.id]);

  const valeur = useMemo<ValeurAuth>(
    () => ({
      session,
      profil,
      chargement,
      onboardingRequis: Boolean(session) && profil === null,
      rechargerProfil,
    }),
    [session, profil, chargement, rechargerProfil],
  );

  return <ContexteAuth.Provider value={valeur}>{children}</ContexteAuth.Provider>;
}

export function useAuth(): ValeurAuth {
  const valeur = useContext(ContexteAuth);
  if (!valeur) throw new Error('useAuth doit etre utilise dans FournisseurAuth');
  return valeur;
}
