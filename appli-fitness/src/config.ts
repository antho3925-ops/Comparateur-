/**
 * Reglages lus depuis l'environnement au moment du bundle.
 * Seules des valeurs publiques transitent ici : la cle du modele de vision
 * vit dans les secrets Supabase, pas dans l'app.
 */

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const REVENUECAT_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS ?? '';
export const REVENUECAT_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID ?? '';

/**
 * Mode de developpement demande par la spec : tout est deverrouille, on verifie
 * que l'appli marche, et les limites d'abonnement s'activent en dernier.
 * Les quotas restent appliques cote serveur : ce drapeau ne leve que le
 * verrouillage de l'interface.
 */
export const TOUT_DEBLOQUE = process.env.EXPO_PUBLIC_TOUT_DEBLOQUE === '1';

export const SUPABASE_CONFIGURE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
