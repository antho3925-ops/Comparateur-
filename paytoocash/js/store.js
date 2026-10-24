// Accès aux données : Supabase si configuré, sinon le JSON de démo.
// Toutes les pages reçoivent la même forme normalisée :
//   { source, boutique, categories[], articles[] }

import { CONFIG } from './config.js';
import { ICONES_PAR_DEFAUT } from './icons.js';
import { slugify, JOURS } from './util.js';

const JSON_URL = 'catalogue-paytoocash.json';
const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

export const ARTICLE_FIELDS = [
  'titre', 'marque', 'categorie_id', 'type', 'prix', 'prix_note', 'etat', 'garantie', 'garantie_jusqu_au',
  'facture', 'inclus', 'specs', 'stockage', 'couleur', 'matiere', 'poids', 'ram', 'photos', 'disponible',
];
export const BOUTIQUE_FIELDS = ['nom', 'adresse', 'tel', 'email', 'facebook', 'slogan', 'atout', 'horaires', 'horaires_note', 'vitrine'];

// Mardi-samedi 10h-19h (carte du magasin).
export const HORAIRES_PAR_DEFAUT = JOURS.map((jour) => ({
  jour, ouvert: !['lundi', 'dimanche'].includes(jour), de: '10:00', a: '19:00',
}));

export const isConfigured = () => Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

let clientPromise = null;
export function getClient() {
  if (!isConfigured()) return null;
  clientPromise ??= import(SUPABASE_JS).then(({ createClient }) =>
    createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY));
  return clientPromise;
}

export async function loadSeed() {
  const r = await fetch(JSON_URL, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Impossible de lire ${JSON_URL} (${r.status})`);
  return r.json();
}

// Convertit le JSON de départ dans la forme utilisée par le site.
export function seedToData(seed) {
  const noms = [...seed.categories];
  const categories = noms.map((nom, i) => ({
    id: slugify(nom), nom, slug: slugify(nom), icone: ICONES_PAR_DEFAUT[nom] || 'carton', image_url: null, ordre: i,
  }));
  const parNom = Object.fromEntries(categories.map((c) => [c.nom, c]));
  const base = Date.UTC(2026, 0, 1);
  const articles = seed.articles.map((a) => ({
    id: a.id,
    titre: a.titre,
    marque: a.marque ?? null,
    categorie_id: parNom[a.categorie]?.id ?? null,
    type: a.type ?? null,
    prix: a.prix ?? null,
    prix_note: a.prix_note ?? null,
    etat: a.etat ?? null,
    garantie: a.garantie ?? null,
    garantie_jusqu_au: a.garantie_jusqu_au ?? null,
    facture: a.facture ?? null,
    inclus: a.inclus ?? null,
    specs: a.specs ?? null,
    stockage: a.stockage ?? null,
    couleur: a.couleur ?? null,
    matiere: a.matiere ?? null,
    poids: a.poids ?? null,
    ram: a.ram ?? null,
    photos: a.photos ?? (a.photo ? [a.photo] : []),
    disponible: a.disponible !== false,
    // Plus l'identifiant est grand, plus l'article est récent.
    created_at: new Date(base + a.id * 60000).toISOString(),
  }));
  const b = seed.boutique || {};
  const boutique = {
    nom: b.nom || 'Paytoocash',
    adresse: b.adresse || '',
    tel: b.tel || '',
    email: b.email || '',
    facebook: b.facebook || '',
    slogan: b.slogan || '',
    atout: b.atout || '',
    horaires: HORAIRES_PAR_DEFAUT,
    // Conserve la remarque d'origine : elle contient « à confirmer »,
    // elle reste donc visible uniquement dans l'admin.
    horaires_note: b.horaires && /confirmer/i.test(b.horaires) ? b.horaires : '',
    vitrine: (seed.vitrines || []).map(({ titre, categorie, texte, icone, lien, photo }) => ({ titre, categorie, texte, icone, lien, photo })),
  };
  return { source: 'json', boutique, categories, articles };
}

function relier(data) {
  const parId = new Map(data.categories.map((c) => [String(c.id), c]));
  for (const a of data.articles) {
    a.categorie = a.categorie_id != null ? parId.get(String(a.categorie_id)) ?? null : null;
    a.photos = Array.isArray(a.photos) ? a.photos.filter(Boolean) : [];
  }
  // Ancien format : une seule bannière (objet) au lieu d'une liste.
  const v = data.boutique.vitrine;
  data.boutique.vitrine = Array.isArray(v) ? v.filter((x) => x && x.titre) : v?.titre ? [v] : [];
  if (!Array.isArray(data.boutique.horaires) || data.boutique.horaires.length !== 7) {
    data.boutique.horaires = HORAIRES_PAR_DEFAUT;
  }
  return data;
}

export async function loadFromSupabase(sb) {
  const [c, a, b] = await Promise.all([
    sb.from('categories').select('*').order('ordre').order('nom'),
    sb.from('articles').select('*').order('created_at', { ascending: false }),
    sb.from('boutique').select('*').eq('id', 1).maybeSingle(),
  ]);
  for (const r of [c, a, b]) if (r.error) throw r.error;
  return { source: 'supabase', boutique: b.data || {}, categories: c.data, articles: a.data };
}

let cache = null;
export function loadData() {
  cache ??= (async () => {
    if (isConfigured()) {
      try {
        const sb = await getClient();
        const data = await loadFromSupabase(sb);
        // Base encore vide : on montre le catalogue de démo.
        if (data.categories.length || data.articles.length) return relier(data);
      } catch (e) {
        console.warn('Supabase indisponible, lecture du catalogue de démo.', e);
      }
    }
    return relier(seedToData(await loadSeed()));
  })();
  return cache;
}

export { relier };
