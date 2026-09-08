/** Dates au format `YYYY-MM-DD`, en heure locale (pas en UTC : sinon la
 *  journee de l'utilisateur bascule au mauvais moment selon son fuseau). */

export function jourLocal(date: Date = new Date()): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
}

export function debutDuMois(date: Date = new Date()): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-01`;
}

const MOIS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
];

export function libelleMois(date: Date = new Date()): string {
  return `${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}

/** `2026-09-08` -> `8 sept.` */
export function libelleCourt(iso: string): string {
  const [, mois, jour] = iso.split('-');
  const index = Number(mois) - 1;
  const abrege = MOIS[index]?.slice(0, 4) ?? '';
  return `${Number(jour)} ${abrege}.`;
}
