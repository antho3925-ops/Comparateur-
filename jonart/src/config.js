// Réglages globaux lus au moment du build (jamais envoyés au navigateur).

/** Mode aperçu : filigrane, formulaire désactivé, noindex. */
export const PREVIEW = process.env.PREVIEW === 'true';

/**
 * Adresse publique du site. Sur Netlify, la variable URL est fournie automatiquement ;
 * SITE_URL permet de forcer le nom de domaine définitif.
 */
export const SITE_URL = process.env.SITE_URL || process.env.URL || 'http://localhost:4321';

/** Point d'envoi du formulaire de devis (fonction Netlify, voir netlify/functions/devis.mjs). */
export const FORM_ENDPOINT = '/api/devis';
