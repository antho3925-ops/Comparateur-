import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '../auth/AuthContext';
import { TOUT_DEBLOQUE } from '../config';
import { PALIERS, type DefinitionPalier, type Palier } from '../metier/paliers';

import { ecouterChangements, initialiserAchats } from './revenuecat';

type ValeurAbonnement = {
  /** Ce que l'utilisateur a reellement paye. */
  palierReel: Palier;
  /** Palier applique par l'interface : force a premium en mode developpement. */
  palier: Palier;
  definition: DefinitionPalier;
  /** Faux dans Expo Go ou sans cles RevenueCat : le paywall se met en veille. */
  achatsDisponibles: boolean;
  /** Vrai quand les limites sont levees par EXPO_PUBLIC_TOUT_DEBLOQUE. */
  modeToutDebloque: boolean;
  rafraichir: () => Promise<void>;
};

const ContexteAbonnement = createContext<ValeurAbonnement | null>(null);

export function FournisseurAbonnement({ children }: { children: ReactNode }) {
  const { session, profil } = useAuth();
  const [palierAchats, setPalierAchats] = useState<Palier | null>(null);
  const [achatsDisponibles, setAchatsDisponibles] = useState(false);

  const idUtilisateur = session?.user.id;

  const rafraichir = useCallback(async () => {
    if (!idUtilisateur) {
      setPalierAchats(null);
      setAchatsDisponibles(false);
      return;
    }

    const { disponible, palier } = await initialiserAchats(idUtilisateur);
    setAchatsDisponibles(disponible);
    setPalierAchats(disponible ? palier : null);
  }, [idUtilisateur]);

  useEffect(() => {
    void rafraichir();
  }, [rafraichir]);

  useEffect(() => {
    if (!idUtilisateur) return;

    let arreter: (() => void) | undefined;
    void ecouterChangements(setPalierAchats).then((fn) => {
      arreter = fn;
    });

    return () => arreter?.();
  }, [idUtilisateur]);

  // RevenueCat fait foi quand il repond ; sinon on retombe sur le palier mis en
  // cache cote serveur par le webhook, qui est aussi celui qu'appliquent les
  // quotas en base.
  const palierReel: Palier = palierAchats ?? profil?.palier ?? 'gratuit';
  const palier: Palier = TOUT_DEBLOQUE ? 'premium' : palierReel;

  const valeur = useMemo<ValeurAbonnement>(
    () => ({
      palierReel,
      palier,
      definition: PALIERS[palier],
      achatsDisponibles,
      modeToutDebloque: TOUT_DEBLOQUE,
      rafraichir,
    }),
    [palierReel, palier, achatsDisponibles, rafraichir],
  );

  return (
    <ContexteAbonnement.Provider value={valeur}>{children}</ContexteAbonnement.Provider>
  );
}

export function useAbonnement(): ValeurAbonnement {
  const valeur = useContext(ContexteAbonnement);
  if (!valeur) throw new Error('useAbonnement doit etre utilise dans FournisseurAbonnement');
  return valeur;
}
