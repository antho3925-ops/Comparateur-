// Table des pages et de leurs adresses dans chaque langue.
// href() produit le bon format de lien selon le mode :
//   production -> /devis/        aperçu -> /devis.html (rendu relatif après le build)
import { PREVIEW } from '../config.js';

export const LANGS = ['fr', 'es'];

export const ROUTES = {
  home:            { fr: '',                 es: 'es' },
  presentation:    { fr: 'presentation',     es: 'es/presentacion' },
  realisations:    { fr: 'realisations',     es: 'es/proyectos' },
  devis:           { fr: 'devis',            es: 'es/presupuesto' },
  merci:           { fr: 'devis/merci',      es: 'es/presupuesto/gracias' },
  instagram:       { fr: 'instagram',        es: 'es/instagram' },
  mentions:        { fr: 'mentions-legales', es: 'es/aviso-legal' },
  confidentialite: { fr: 'confidentialite',  es: 'es/privacidad' },
};

/** Lien interne vers une page, dans la langue demandée (ancre optionnelle). */
export function href(key, lang, hash = '') {
  const slug = ROUTES[key][lang];
  const anchor = hash ? `#${hash}` : '';
  if (PREVIEW) {
    // En mode fichier, Astro écrit "es/index.astro" en "es.html" ; on suit la même règle.
    return `/${slug || 'index'}.html${anchor}`;
  }
  return `/${slug ? slug + '/' : ''}${anchor}`;
}
