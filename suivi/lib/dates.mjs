// Toutes les dates de la plateforme sont raisonnées dans le fuseau suisse.
// Le gel des saisies dépend de ce que « aujourd'hui » veut dire à Genève,
// pas de l'heure UTC du serveur : un serveur en UTC bascule de jour à 02h00
// suisses en été, ce qui rouvrirait la saisie de la veille pendant deux heures.

export const FUSEAU = 'Europe/Zurich';

const FORMAT_JOUR = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSEAU, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** Jour courant à Genève, au format AAAA-MM-JJ. */
export function aujourdhui(instant = new Date()) {
  return FORMAT_JOUR.format(instant);
}

/** Horodatage complet, pour le journal des modifications. */
export function maintenant(instant = new Date()) {
  return instant.toISOString();
}

export function estJourValide(jour) {
  return typeof jour === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(jour)
    && enUTC(jour) !== null;
}

function enUTC(jour) {
  const [a, m, j] = jour.split('-').map(Number);
  const t = Date.UTC(a, m - 1, j);
  const d = new Date(t);
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== m - 1 || d.getUTCDate() !== j) return null;
  return t;
}

function enJour(instantUTC) {
  return new Date(instantUTC).toISOString().slice(0, 10);
}

/** Décale un jour de n jours (n peut être négatif). */
export function decale(jour, n) {
  return enJour(enUTC(jour) + n * 86400000);
}

/** Jour de la semaine ISO : 1 = lundi … 7 = dimanche. */
export function jourSemaine(jour) {
  const d = new Date(enUTC(jour)).getUTCDay();
  return d === 0 ? 7 : d;
}

/** Lundi de la semaine contenant `jour`. */
export function lundiDe(jour) {
  return decale(jour, 1 - jourSemaine(jour));
}

/** Clé de semaine ISO 8601, par exemple 2026-S37. */
export function cleSemaine(jour) {
  const jeudi = decale(jour, 4 - jourSemaine(jour));
  const annee = Number(jeudi.slice(0, 4));
  const premier = enUTC(`${annee}-01-01`);
  const numero = Math.floor((enUTC(jeudi) - premier) / 86400000 / 7) + 1;
  return `${annee}-S${String(numero).padStart(2, '0')}`;
}

/** Clé de mois, par exemple 2026-09. */
export function cleMois(jour) {
  return jour.slice(0, 7);
}

/** Les sept jours de la semaine contenant `jour`, du lundi au dimanche. */
export function joursSemaine(jour) {
  const lundi = lundiDe(jour);
  return Array.from({ length: 7 }, (_, i) => decale(lundi, i));
}

/** Tous les jours du mois contenant `jour`. */
export function joursMois(jour) {
  const [a, m] = jour.split('-').map(Number);
  const jours = [];
  for (let d = new Date(Date.UTC(a, m - 1, 1)); d.getUTCMonth() === m - 1; d.setUTCDate(d.getUTCDate() + 1)) {
    jours.push(d.toISOString().slice(0, 10));
  }
  return jours;
}

/** Semaine précédente / suivante, à partir d'un jour quelconque de la semaine. */
export function semaineVoisine(jour, pas) {
  return decale(lundiDe(jour), pas * 7);
}

/** Premier jour du mois voisin. */
export function moisVoisin(jour, pas) {
  const [a, m] = jour.split('-').map(Number);
  const total = (a * 12 + (m - 1)) + pas;
  return `${String(Math.floor(total / 12)).padStart(4, '0')}-${String((total % 12) + 1).padStart(2, '0')}-01`;
}

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** « lundi 7 septembre 2026 ». */
export function libelleJour(jour, avecJourSemaine = true) {
  const [a, m, j] = jour.split('-').map(Number);
  const nom = avecJourSemaine ? `${JOURS[jourSemaine(jour) - 1]} ` : '';
  // En français le premier du mois s'écrit « 1er », les autres en cardinal.
  return `${nom}${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}`;
}

/** « du 7 au 13 septembre 2026 ». */
export function libelleSemaine(jour) {
  const lundi = lundiDe(jour);
  const dimanche = decale(lundi, 6);
  return `${libelleJour(lundi, false)} – ${libelleJour(dimanche, false)}`;
}

/** « septembre 2026 ». */
export function libelleMois(jour) {
  const [a, m] = jour.split('-').map(Number);
  return `${MOIS[m - 1]} ${a}`;
}
