// Règles métier de la plateforme : indicateurs, agrégation par période,
// écarts aux objectifs et classement. Fonctions pures — aucune entrée/sortie.

import { cleSemaine, cleMois, joursSemaine, joursMois } from './dates.mjs';

/**
 * Les six indicateurs saisis chaque jour.
 *
 * `hebdomadaire` dit si l'indicateur porte un objectif de semaine ; le montant
 * transféré des avoirs LPP n'en a pas, seulement un objectif mensuel.
 * Aucun indicateur n'a d'objectif journalier.
 *
 * `sens` dit dans quelle direction va la réussite. Cinq indicateurs sont des
 * cibles : plus on en fait, mieux c'est, et l'objectif est un minimum à
 * atteindre. Les rendez-vous valides non signés sont un plafond : ce sont des
 * affaires manquées, l'objectif est un maximum à ne pas franchir, et le
 * dépasser est un mauvais résultat, pas un exploit.
 */
export const INDICATEURS = [
  {
    cle: 'maladie',
    libelle: "Contrats d'assurance maladie signés",
    court: 'Maladie',
    unite: 'contrat',
    format: 'nombre',
    hebdomadaire: true,
    sens: 'cible',
  },
  {
    cle: 'lpp_comptes',
    libelle: 'Comptes LPP ouverts',
    court: 'Comptes LPP',
    unite: 'compte',
    format: 'nombre',
    hebdomadaire: true,
    sens: 'cible',
  },
  {
    cle: 'everlife',
    libelle: 'Contrats Everlife signés',
    court: 'Everlife',
    unite: 'contrat',
    format: 'nombre',
    hebdomadaire: true,
    sens: 'cible',
  },
  {
    cle: 'rdv_pris',
    libelle: 'Rendez-vous pris dans la journée',
    court: 'RDV pris',
    unite: 'rendez-vous',
    format: 'nombre',
    hebdomadaire: true,
    sens: 'cible',
  },
  {
    cle: 'rdv_non_signes',
    libelle: 'Rendez-vous valides non signés',
    court: 'RDV non signés',
    unite: 'rendez-vous',
    format: 'nombre',
    hebdomadaire: true,
    sens: 'plafond',
  },
  {
    cle: 'lpp_montant',
    libelle: 'Montant transféré des avoirs LPP',
    court: 'Avoirs LPP',
    unite: 'CHF',
    format: 'montant',
    hebdomadaire: false,
    sens: 'cible',
  },
];

export const CLES = INDICATEURS.map((i) => i.cle);
export const CLES_HEBDO = INDICATEURS.filter((i) => i.hebdomadaire).map((i) => i.cle);

export function indicateur(cle) {
  return INDICATEURS.find((i) => i.cle === cle) || null;
}

/** Une saisie vide — sert de valeur par défaut partout. */
export function saisieVide() {
  return Object.fromEntries(CLES.map((c) => [c, 0]));
}

/**
 * Normalise une saisie reçue du navigateur : entiers positifs uniquement.
 * Renvoie { valeurs } ou { erreur }.
 */
export function normaliserSaisie(brut) {
  if (!brut || typeof brut !== 'object') return { erreur: 'Saisie illisible.' };
  const valeurs = saisieVide();
  for (const ind of INDICATEURS) {
    if (!(ind.cle in brut) || brut[ind.cle] === '' || brut[ind.cle] === null) continue;
    const n = Number(brut[ind.cle]);
    if (!Number.isFinite(n)) return { erreur: `« ${ind.libelle} » n'est pas un nombre.` };
    if (n < 0) return { erreur: `« ${ind.libelle} » ne peut pas être négatif.` };
    if (!Number.isInteger(n)) return { erreur: `« ${ind.libelle} » doit être un nombre entier.` };
    if (n > 100000000) return { erreur: `« ${ind.libelle} » dépasse la valeur maximale admise.` };
    valeurs[ind.cle] = n;
  }
  return { valeurs };
}

/** Objectifs vides : rien de fixé tant que l'administrateur n'a rien saisi. */
export function objectifsVides() {
  const o = {};
  for (const ind of INDICATEURS) {
    o[ind.cle] = { mensuel: null };
    if (ind.hebdomadaire) o[ind.cle].hebdomadaire = null;
  }
  return o;
}

/**
 * Normalise les objectifs d'un conseiller. Une valeur vide ou nulle signifie
 * « pas d'objectif fixé » et se distingue d'un objectif à zéro.
 */
export function normaliserObjectifs(brut) {
  if (!brut || typeof brut !== 'object') return { erreur: 'Objectifs illisibles.' };
  const objectifs = objectifsVides();
  for (const ind of INDICATEURS) {
    const recu = brut[ind.cle];
    if (!recu || typeof recu !== 'object') continue;
    const portees = ind.hebdomadaire ? ['hebdomadaire', 'mensuel'] : ['mensuel'];
    for (const portee of portees) {
      const v = recu[portee];
      if (v === undefined || v === null || v === '') continue;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
        return { erreur: `Objectif ${portee} de « ${ind.libelle} » invalide.` };
      }
      objectifs[ind.cle][portee] = n;
    }
  }
  return { objectifs };
}

/** Somme des saisies d'un conseiller sur une liste de jours. */
export function cumuler(saisies, identifiant, jours) {
  const total = saisieVide();
  let joursSaisis = 0;
  for (const jour of jours) {
    const duJour = saisies[jour] && saisies[jour][identifiant];
    if (!duJour) continue;
    joursSaisis += 1;
    for (const cle of CLES) total[cle] += Number(duJour[cle]) || 0;
  }
  return { total, joursSaisis };
}

/**
 * Écart au sens de la plateforme : toujours une valeur chiffrée, jamais un
 * pourcentage. `objectif` à null signifie qu'aucun objectif n'est fixé.
 *
 * L'écart brut est le même dans les deux sens — réalisé moins objectif — mais
 * sa lecture s'inverse :
 *   cible   : l'objectif est un minimum. Atteint dès que l'écart est positif
 *             ou nul ; `reste` dit combien il en manque.
 *   plafond : l'objectif est un maximum. Respecté tant que l'écart est négatif
 *             ou nul ; `marge` dit ce qu'il reste avant de le franchir,
 *             `exces` de combien il est franchi.
 */
export function ecart(realise, objectif, sens = 'cible') {
  if (objectif === null || objectif === undefined) {
    return {
      realise, objectif: null, ecart: null, reste: null, marge: null, exces: null,
      atteint: null, depasse: false, sens,
    };
  }
  const e = realise - objectif;
  if (sens === 'plafond') {
    return {
      realise,
      objectif,
      ecart: e,
      reste: null,
      marge: e < 0 ? -e : 0,
      exces: e > 0 ? e : 0,
      atteint: e <= 0,
      depasse: e > 0,
      sens,
    };
  }
  return {
    realise,
    objectif,
    ecart: e,
    reste: e < 0 ? -e : 0,
    marge: null,
    exces: null,
    atteint: e >= 0,
    depasse: false,
    sens,
  };
}

/**
 * Tableau d'un conseiller sur une période : pour chaque indicateur, le réalisé,
 * l'objectif de la portée demandée et l'écart chiffré.
 */
export function bilanPeriode(saisies, identifiant, jours, objectifs, portee) {
  const { total, joursSaisis } = cumuler(saisies, identifiant, jours);
  const lignes = INDICATEURS.map((ind) => {
    const applicable = portee === 'mensuel' || ind.hebdomadaire;
    const objectif = applicable && objectifs && objectifs[ind.cle]
      ? (objectifs[ind.cle][portee] ?? null)
      : null;
    return {
      cle: ind.cle,
      libelle: ind.libelle,
      court: ind.court,
      format: ind.format,
      unite: ind.unite,
      applicable,
      ...ecart(total[ind.cle], objectif, ind.sens),
    };
  });
  return { total, joursSaisis, lignes };
}

/**
 * Classement de l'équipe sur une période — réservé à l'administrateur.
 *
 * Chaque conseiller est classé indicateur par indicateur sur son réalisé (ex
 * æquo au même rang). Le rang général est la somme de ces rangs : le plus
 * petit total passe premier. Un décompte de rangs, et non un pourcentage, ce
 * qui évite de comparer des contrats à des francs.
 *
 * Les rendez-vous valides non signés restent hors du rang général. Ils sont
 * classés — à l'envers, le moins nombreux en tête, puisque c'est un plafond —
 * mais ne pèsent pas sur les points : un plafond respecté n'est pas une
 * performance, c'est la normale.
 */
export const CLES_CLASSEES = CLES.filter((c) => c !== 'rdv_non_signes');

export function classement(saisies, conseillers, jours, objectifsParConseiller, portee) {
  const bilans = conseillers.map((c) => ({
    identifiant: c.identifiant,
    nom: c.nom,
    bilan: bilanPeriode(saisies, c.identifiant, jours, objectifsParConseiller[c.identifiant], portee),
  }));

  const rangsParIndicateur = {};
  for (const cle of CLES) {
    // Sur un plafond, le meilleur est celui qui en a le moins : le tri
    // s'inverse, sans quoi « rang 1 » désignerait le plus mauvais.
    const plafond = indicateur(cle).sens === 'plafond';
    const tries = [...bilans].sort((a, b) => (plafond
      ? a.bilan.total[cle] - b.bilan.total[cle]
      : b.bilan.total[cle] - a.bilan.total[cle]));
    const rangs = {};
    let rangPrecedent = 0;
    let valeurPrecedente = null;
    tries.forEach((entree, index) => {
      const valeur = entree.bilan.total[cle];
      const rang = valeur === valeurPrecedente ? rangPrecedent : index + 1;
      rangs[entree.identifiant] = rang;
      rangPrecedent = rang;
      valeurPrecedente = valeur;
    });
    rangsParIndicateur[cle] = rangs;
  }

  const lignes = bilans.map((entree) => {
    const rangs = Object.fromEntries(CLES.map((c) => [c, rangsParIndicateur[c][entree.identifiant]]));
    const points = CLES_CLASSEES.reduce((s, c) => s + rangs[c], 0);
    const objectifsAtteints = entree.bilan.lignes
      .filter((l) => l.atteint === true).length;
    return { ...entree, rangs, points, objectifsAtteints };
  });

  lignes.sort((a, b) => (
    a.points - b.points
    || b.objectifsAtteints - a.objectifsAtteints
    || a.nom.localeCompare(b.nom, 'fr')
  ));

  let rangPrecedent = 0;
  let pointsPrecedents = null;
  lignes.forEach((ligne, index) => {
    ligne.rang = ligne.points === pointsPrecedents ? rangPrecedent : index + 1;
    rangPrecedent = ligne.rang;
    pointsPrecedents = ligne.points;
  });

  return lignes;
}

/** Totaux de l'équipe entière sur une période, objectifs additionnés compris. */
export function bilanEquipe(saisies, conseillers, jours, objectifsParConseiller, portee) {
  const total = saisieVide();
  const objectifsCumules = Object.fromEntries(CLES.map((c) => [c, null]));

  for (const conseiller of conseillers) {
    const { total: t } = cumuler(saisies, conseiller.identifiant, jours);
    for (const cle of CLES) total[cle] += t[cle];

    const objectifs = objectifsParConseiller[conseiller.identifiant];
    if (!objectifs) continue;
    for (const ind of INDICATEURS) {
      if (portee === 'hebdomadaire' && !ind.hebdomadaire) continue;
      const v = objectifs[ind.cle] ? (objectifs[ind.cle][portee] ?? null) : null;
      if (v === null) continue;
      objectifsCumules[ind.cle] = (objectifsCumules[ind.cle] ?? 0) + v;
    }
  }

  const lignes = INDICATEURS.map((ind) => ({
    cle: ind.cle,
    libelle: ind.libelle,
    court: ind.court,
    format: ind.format,
    unite: ind.unite,
    applicable: portee === 'mensuel' || ind.hebdomadaire,
    ...ecart(total[ind.cle], objectifsCumules[ind.cle], ind.sens),
  }));

  return { total, lignes };
}

/** Périodes utiles autour d'un jour : clés et listes de jours. */
export function periodes(jour) {
  return {
    semaine: { cle: cleSemaine(jour), jours: joursSemaine(jour) },
    mois: { cle: cleMois(jour), jours: joursMois(jour) },
  };
}
