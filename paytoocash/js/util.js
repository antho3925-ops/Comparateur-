// Fonctions utilitaires partagées par toutes les pages.

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Minuscules, sans accents : pour la recherche et les identifiants.
export const norm = (v) =>
  String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const slugify = (v) => norm(v).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'categorie';

const prixFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 });
export const formatPrix = (p) => (p == null || p === '' || Number.isNaN(Number(p)) ? '' : prixFmt.format(Number(p)));

// Un texte contenant « à confirmer » n'est jamais montré au public.
const A_CONFIRMER = /[àa]\s+confirmer/i;
export const aConfirmer = (v) => typeof v === 'string' && A_CONFIRMER.test(v);
export const pub = (v) => (v == null || v === '' || aConfirmer(v) ? null : v);

export const CHAMPS = {
  titre: 'Titre', marque: 'Marque', type: 'Type', prix: 'Prix', prix_note: 'Note sur le prix',
  etat: 'État', garantie: 'Garantie', garantie_jusqu_au: "Garantie jusqu'au", facture: 'Facture',
  inclus: 'Inclus', specs: 'Caractéristiques', stockage: 'Stockage', couleur: 'Couleur',
  matiere: 'Matière', poids: 'Poids', ram: 'Mémoire vive',
};

// Liste des champs « à vérifier » d'un article (affichés seulement dans l'admin).
export function aVerifier(a) {
  const out = [];
  for (const [k, label] of Object.entries(CHAMPS)) {
    if (k === 'prix_note' ? (a.prix_note && String(a.prix_note).trim()) : aConfirmer(a[k])) out.push(label);
  }
  return out;
}

// 07 86 06 65 87 -> +33786066587
export function telIntl(tel) {
  const d = String(tel ?? '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) return '+33' + d.slice(1);
  return d;
}
export const telHref = (tel) => 'tel:' + telIntl(tel);
// « ?&body= » est la forme comprise à la fois par iOS et Android.
export const smsHref = (tel, body) => `sms:${telIntl(tel)}?&body=${encodeURIComponent(body)}`;
export const mapsHref = (adresse) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(adresse);
export const facebookHref = (fb) => (/^https?:\/\//.test(fb || '') ? fb : 'https://www.facebook.com/' + encodeURIComponent(fb || ''));

export const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const hFmt = (t) => (t || '').replace(/^0(\d)/, '$1').replace(':00', 'h').replace(':', 'h');

export function plageTexte(h) {
  if (!h || !h.ouvert) return 'Fermé';
  return `${hFmt(h.de)} – ${hFmt(h.a)}`;
}

// Index du jour (lundi = 0) et minutes écoulées, à l'heure de Paris.
function maintenantParis() {
  const parts = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false })
    .formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { jour: JOURS.indexOf(norm(get('weekday'))), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}
const toMin = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };

export function statutOuverture(horaires) {
  if (!Array.isArray(horaires) || horaires.length !== 7) return null;
  const { jour, minutes } = maintenantParis();
  if (jour < 0) return null;
  const h = horaires[jour];
  if (h?.ouvert && minutes >= toMin(h.de) && minutes < toMin(h.a)) {
    return { ouvert: true, texte: `Ouvert · ferme à ${hFmt(h.a)}`, jour };
  }
  for (let i = 0; i < 7; i++) {
    const j = (jour + i) % 7, d = horaires[j];
    if (!d?.ouvert) continue;
    if (i === 0 && minutes >= toMin(d.de)) continue;
    const quand = i === 0 ? "aujourd'hui" : i === 1 ? 'demain' : JOURS[j];
    return { ouvert: false, texte: `Fermé · ouvre ${quand} à ${hFmt(d.de)}`, jour };
  }
  return { ouvert: false, texte: 'Fermé', jour };
}

export const qs = (sel, el = document) => el.querySelector(sel);
export const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];
export const param = (k) => new URLSearchParams(location.search).get(k);
