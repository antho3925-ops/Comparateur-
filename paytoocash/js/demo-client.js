// Base de démonstration en mémoire, utilisée par /admin tant que Supabase
// n'est pas configuré. Elle imite la petite partie de l'API Supabase dont
// l'admin se sert : toutes les fonctions sont utilisables, mais rien n'est
// enregistré en ligne et tout est réinitialisé au rechargement de la page.

import { ARTICLE_FIELDS } from './store.js';

export function creerClientDemo(data) {
  const catId = new Map(data.categories.map((c, i) => [c.id, i + 1]));
  const ilya = (h) => new Date(Date.now() - h * 3600e3).toISOString();
  const articles = data.articles.map((a) => ({
    ...Object.fromEntries(ARTICLE_FIELDS.map((k) => [k, a[k] ?? null])),
    id: a.id, categorie_id: catId.get(a.categorie_id) ?? null, photos: a.photos,
    reserve_jusqu_au: null, created_at: a.created_at, updated_at: a.created_at,
  }));
  // Une réservation et une demande d'estimation d'exemple, pour montrer l'onglet « Demandes ».
  const resa = articles.find((a) => a.disponible && a.titre.includes('Switch')) || articles[0];
  resa.reserve_jusqu_au = new Date(Date.now() + 15 * 3600e3).toISOString();
  const db = {
    categories: data.categories.map((c, i) => ({ id: i + 1, nom: c.nom, slug: c.slug, icone: c.icone, image_url: null, ordre: i, created_at: ilya(500) })),
    articles,
    boutique: [{ id: 1, ...data.boutique }],
    reservations: [{ id: 1, article_id: resa.id, article_titre: resa.titre, nom: 'Client exemple', tel: '06 00 00 00 00', created_at: ilya(9), expire_at: resa.reserve_jusqu_au, annulee: false }],
    estimations: [{ id: 1, nom: 'Client exemple', tel: '06 00 00 00 00', objet: 'Exemple : PS4 Pro 1 To', etat: 'Très bon état',
      details: 'Documents : Facture d’achat, Boîte d’origine. 2 manettes.', prix_souhaite: '150 €', photos: [], traitee: false, created_at: ilya(2) }],
  };
  const suivant = (t) => Math.max(0, ...db[t].map((r) => Number(r.id) || 0)) + 1;
  const fichiers = new Map();

  function requete(table) {
    let op = 'select', donnees = null, unique = false, retour = false;
    const filtres = [];
    const q = {
      select() { retour = true; return q; },
      order() { return q; }, limit() { return q; },
      gte(k, v) { filtres.push((r) => String(r[k]) >= String(v)); return q; },
      eq(k, v) { filtres.push((r) => String(r[k]) === String(v)); return q; },
      maybeSingle() { unique = true; return q; },
      insert(d) { op = 'insert'; donnees = d; return q; },
      update(d) { op = 'update'; donnees = d; return q; },
      upsert(d) { op = 'upsert'; donnees = d; return q; },
      delete() { op = 'delete'; return q; },
      then(ok, ko) { return Promise.resolve().then(executer).then(ok, ko); },
    };
    function executer() {
      const lignes = db[table];
      const vise = () => lignes.filter((r) => filtres.every((f) => f(r)));
      let res;
      if (op === 'select') res = vise();
      else if (op === 'insert') {
        res = [].concat(donnees).map((d) => {
          const r = { created_at: new Date().toISOString(), ...structuredClone(d), id: suivant(table) };
          if (table === 'categories' && lignes.some((c) => c.nom === r.nom)) throw new Error('duplicate key');
          lignes.push(r); return r;
        });
      } else if (op === 'update') { res = vise(); res.forEach((r) => Object.assign(r, structuredClone(donnees))); }
      else if (op === 'upsert') {
        res = [].concat(donnees).map((d) => {
          const r = lignes.find((x) => x.id === d.id);
          if (r) return Object.assign(r, structuredClone(d));
          lignes.push(structuredClone(d)); return d;
        });
      } else if (op === 'delete') {
        res = vise(); db[table] = lignes.filter((r) => !res.includes(r));
        if (table === 'categories') db.articles.forEach((a) => { if (res.some((c) => c.id === a.categorie_id)) a.categorie_id = null; });
      }
      const copie = structuredClone(res);
      return { data: unique ? copie[0] ?? null : (op === 'select' || retour ? copie : null), error: null };
    }
    return q;
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: { user: { email: 'demo' } } } }),
      signInWithPassword: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
    },
    rpc: async (fn) => ({ data: fn === 'is_admin' ? true : null, error: null }),
    from: requete,
    storage: {
      from: () => ({
        upload: async (path, file) => { fichiers.set(path, URL.createObjectURL(file)); return { error: null }; },
        getPublicUrl: (path) => ({ data: { publicUrl: fichiers.get(path) || '' } }),
        remove: async () => ({ error: null }),
        createSignedUrls: async (paths) => ({ data: paths.map((p) => ({ signedUrl: fichiers.get(p) || '' })) }),
      }),
    },
  };
}
