/**
 * Enveloppe autour de RevenueCat.
 *
 * Le SDK est un module natif : il n'existe pas dans Expo Go, et il n'est pas
 * configure tant que les cles ne sont pas renseignees. Tout passe donc par un
 * import dynamique protege, et l'app reste utilisable sans lui (`disponible`
 * vaut alors false). C'est ce qui permet de developper tout le reste avant de
 * brancher les abonnements, comme demande dans la spec.
 */

import { Platform } from 'react-native';

import { REVENUECAT_ANDROID, REVENUECAT_IOS } from '../config';
import { estPalier, type Palier } from '../metier/paliers';

import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

export type { CustomerInfo, PurchasesOffering, PurchasesPackage };

/** Identifiants des entitlements declares dans le tableau de bord RevenueCat. */
export const ENTITLEMENTS: Record<Exclude<Palier, 'gratuit'>, string> = {
  standard: 'standard',
  premium: 'premium',
};

type ModulePurchases = typeof import('react-native-purchases').default;

let module: ModulePurchases | null = null;
let configure = false;

function cleApi(): string {
  return Platform.OS === 'ios' ? REVENUECAT_IOS : REVENUECAT_ANDROID;
}

async function charger(): Promise<ModulePurchases | null> {
  if (module) return module;
  if (!cleApi()) return null;

  try {
    module = (await import('react-native-purchases')).default;
    return module;
  } catch {
    // Expo Go, ou build sans le module natif : on continue sans abonnements.
    return null;
  }
}

/** Deduit le palier des entitlements actifs. Premium l'emporte sur Standard. */
export function palierDepuisClient(info: CustomerInfo | null): Palier {
  const actifs = info?.entitlements.active ?? {};
  if (ENTITLEMENTS.premium in actifs) return 'premium';
  if (ENTITLEMENTS.standard in actifs) return 'standard';
  return 'gratuit';
}

export type Achats = {
  disponible: boolean;
  palier: Palier;
};

/**
 * Configure le SDK et associe l'utilisateur RevenueCat a l'id Supabase :
 * c'est cet identifiant que le webhook retrouve pour ecrire users.palier.
 */
export async function initialiserAchats(idUtilisateur: string): Promise<Achats> {
  const purchases = await charger();
  if (!purchases) return { disponible: false, palier: 'gratuit' };

  try {
    if (!configure) {
      purchases.configure({ apiKey: cleApi(), appUserID: idUtilisateur });
      configure = true;
    } else {
      await purchases.logIn(idUtilisateur);
    }

    const info = await purchases.getCustomerInfo();
    return { disponible: true, palier: palierDepuisClient(info) };
  } catch (erreur) {
    console.warn('RevenueCat indisponible', erreur);
    return { disponible: false, palier: 'gratuit' };
  }
}

export async function ecouterChangements(
  surChangement: (palier: Palier) => void,
): Promise<() => void> {
  const purchases = await charger();
  if (!purchases) return () => {};

  const ecouteur = (info: CustomerInfo) => surChangement(palierDepuisClient(info));
  purchases.addCustomerInfoUpdateListener(ecouteur);

  return () => purchases.removeCustomerInfoUpdateListener(ecouteur);
}

export async function offreCourante(): Promise<PurchasesOffering | null> {
  const purchases = await charger();
  if (!purchases) return null;

  try {
    const offres = await purchases.getOfferings();
    return offres.current;
  } catch (erreur) {
    console.warn('offres illisibles', erreur);
    return null;
  }
}

export class AchatAnnule extends Error {
  constructor() {
    super('achat_annule');
    this.name = 'AchatAnnule';
  }
}

export async function acheter(paquet: PurchasesPackage): Promise<Palier> {
  const purchases = await charger();
  if (!purchases) throw new Error('achats_indisponibles');

  try {
    const { customerInfo } = await purchases.purchasePackage(paquet);
    return palierDepuisClient(customerInfo);
  } catch (erreur) {
    if ((erreur as { userCancelled?: boolean }).userCancelled) throw new AchatAnnule();
    throw erreur;
  }
}

export async function restaurer(): Promise<Palier> {
  const purchases = await charger();
  if (!purchases) throw new Error('achats_indisponibles');

  const info = await purchases.restorePurchases();
  return palierDepuisClient(info);
}

/** Palier associe a un paquet RevenueCat, deduit de son identifiant produit. */
export function palierDuPaquet(paquet: PurchasesPackage): Palier {
  const identifiant = paquet.identifier.toLowerCase();
  const trouve = (['premium', 'standard'] as const).find((p) => identifiant.includes(p));
  return estPalier(trouve) ? trouve : 'gratuit';
}
