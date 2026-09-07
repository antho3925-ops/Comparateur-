// Routes de l'interface web. Chaque route renvoie du JSON ; le rendu est fait
// par le navigateur.

import {
  aujourdhui, maintenant, estJourValide, decale, lundiDe, cleSemaine, cleMois,
  joursSemaine, joursMois, libelleJour, libelleSemaine, libelleMois,
  semaineVoisine, moisVoisin,
} from './dates.mjs';
import {
  INDICATEURS, CLES, CLES_CLASSEES, normaliserSaisie, normaliserObjectifs,
  bilanPeriode, bilanEquipe, classement, saisieVide,
} from './domaine.mjs';
import {
  conseillerParIdentifiant, conseillersActifs, objectifsDe, saisieDuJour, journaliser,
} from './stockage.mjs';
import { normaliserIdentifiant, poserCookie, effacerCookie } from './sessions.mjs';

const JOURS_HISTORIQUE = 21;

export class ErreurHttp extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * Le jour d'ancrage d'une période consultée : par défaut aujourd'hui, sinon
 * celui demandé, jamais dans le futur — on ne consulte pas des chiffres qui
 * n'existent pas encore. Semaine et mois se naviguent séparément, chacun avec
 * son propre point d'ancrage.
 */
function jourDemande(url, parametre, jourCourant) {
  const brut = url.searchParams.get(parametre);
  if (!brut) return jourCourant;
  if (!estJourValide(brut)) throw new ErreurHttp(400, 'Date invalide.');
  return brut > jourCourant ? jourCourant : brut;
}

function exigerConseiller(session) {
  if (!session || session.role !== 'conseiller') throw new ErreurHttp(401, 'Connexion requise.');
  return session;
}

function exigerAdmin(session) {
  if (!session || session.role !== 'admin') throw new ErreurHttp(401, 'Accès administrateur requis.');
  return session;
}

// --- Connexion --------------------------------------------------------------

export async function connexion({ corps, etat, securite, reponse, securise }) {
  const identifiant = normaliserIdentifiant(corps.identifiant);
  if (!identifiant) throw new ErreurHttp(400, 'Identifiant invalide.');

  const conseiller = conseillerParIdentifiant(etat, identifiant);
  if (!conseiller) throw new ErreurHttp(404, 'Identifiant inconnu. Demandez au responsable d’équipe de vous créer un accès.');
  if (!conseiller.actif) throw new ErreurHttp(403, 'Cet accès a été désactivé.');

  const { valeur, duree } = securite.creerJeton('conseiller', identifiant);
  poserCookie(reponse, valeur, duree, securise);
  return { role: 'conseiller', identifiant, nom: conseiller.nom };
}

export async function connexionAdmin({ corps, securite, reponse, securise, cleClient }) {
  if (!securite.essaiAutorise(cleClient)) {
    throw new ErreurHttp(429, 'Trop de tentatives. Réessayez dans cinq minutes.');
  }
  if (!securite.codeAdminValide(corps.code)) {
    securite.compterEchec(cleClient);
    throw new ErreurHttp(401, 'Code incorrect.');
  }
  securite.oublierEchecs(cleClient);
  const { valeur, duree } = securite.creerJeton('admin', 'admin');
  poserCookie(reponse, valeur, duree, securise);
  return { role: 'admin' };
}

export async function deconnexion({ reponse, securise }) {
  effacerCookie(reponse, securise);
  return { role: null };
}

export async function session({ session: s, etat }) {
  if (!s) return { role: null };
  if (s.role === 'admin') return { role: 'admin' };
  const conseiller = conseillerParIdentifiant(etat, s.identifiant);
  if (!conseiller || !conseiller.actif) return { role: null };
  return { role: 'conseiller', identifiant: conseiller.identifiant, nom: conseiller.nom };
}

// --- Espace conseiller ------------------------------------------------------

/**
 * Tableau d'un conseiller. Le conseiller ne voit que le sien ; l'administrateur
 * peut consulter celui de n'importe qui, en lecture seule.
 */
export async function tableauConseiller({ session: s, etat, url }) {
  if (!s) throw new ErreurHttp(401, 'Connexion requise.');

  let identifiant = s.identifiant;
  if (s.role === 'admin') {
    identifiant = normaliserIdentifiant(url.searchParams.get('identifiant'));
    if (!identifiant) throw new ErreurHttp(400, 'Conseiller non précisé.');
  }

  const conseiller = conseillerParIdentifiant(etat, identifiant);
  if (!conseiller) throw new ErreurHttp(404, 'Conseiller inconnu.');

  const jourCourant = aujourdhui();
  // La saisie porte toujours sur aujourd'hui : c'est la seule journée ouverte.
  const jour = jourCourant;
  const ancreSemaine = jourDemande(url, 'semaine', jourCourant);
  const ancreMois = jourDemande(url, 'mois', jourCourant);
  const objectifs = objectifsDe(etat, identifiant);
  const saisie = saisieDuJour(etat, identifiant, jour);

  const historique = [];
  for (let i = 0; i < JOURS_HISTORIQUE; i += 1) {
    const j = decale(jourCourant, -i);
    const s2 = saisieDuJour(etat, identifiant, j);
    historique.push({
      jour: j,
      libelle: libelleJour(j),
      fige: j !== jourCourant,
      saisi: Boolean(s2),
      valeurs: s2 ? extraireValeurs(s2) : saisieVide(),
    });
  }

  return {
    role: s.role,
    conseiller: { identifiant: conseiller.identifiant, nom: conseiller.nom },
    indicateurs: INDICATEURS,
    aujourdhui: jourCourant,
    jour,
    libelleJourConsulte: libelleJour(jour),
    // Un conseiller ne modifie que le jour même. L'administrateur ne modifie
    // jamais une saisie, pas même celle du jour.
    modifiable: s.role === 'conseiller' && jour === jourCourant,
    saisie: saisie ? extraireValeurs(saisie) : null,
    saisieMaj: saisie ? saisie.maj : null,
    objectifs,
    semaine: {
      cle: cleSemaine(ancreSemaine),
      ancre: ancreSemaine,
      libelle: libelleSemaine(ancreSemaine),
      debut: lundiDe(ancreSemaine),
      encours: cleSemaine(ancreSemaine) === cleSemaine(jourCourant),
      precedente: semaineVoisine(ancreSemaine, -1),
      suivante: semaineVoisine(ancreSemaine, 1),
      bilan: bilanPeriode(etat.saisies, identifiant, joursSemaine(ancreSemaine), objectifs, 'hebdomadaire'),
    },
    mois: {
      cle: cleMois(ancreMois),
      ancre: ancreMois,
      libelle: libelleMois(ancreMois),
      encours: cleMois(ancreMois) === cleMois(jourCourant),
      precedent: moisVoisin(ancreMois, -1),
      suivant: moisVoisin(ancreMois, 1),
      bilan: bilanPeriode(etat.saisies, identifiant, joursMois(ancreMois), objectifs, 'mensuel'),
    },
    historique,
  };
}

/**
 * Enregistre la saisie du jour. Le jour n'est jamais transmis par le
 * navigateur : le serveur écrit toujours sur la date courante, ce qui rend le
 * gel des journées passées structurel plutôt que déclaratif.
 */
export async function enregistrerSaisie({ session: s, corps, stockage }) {
  exigerConseiller(s);
  const { valeurs, erreur } = normaliserSaisie(corps.valeurs ?? corps);
  if (erreur) throw new ErreurHttp(400, erreur);

  const jour = aujourdhui();
  return stockage.modifier((etat) => {
    const conseiller = conseillerParIdentifiant(etat, s.identifiant);
    if (!conseiller || !conseiller.actif) throw new ErreurHttp(403, 'Accès désactivé.');

    if (!etat.saisies[jour]) etat.saisies[jour] = {};
    const precedente = etat.saisies[jour][s.identifiant] || null;
    etat.saisies[jour][s.identifiant] = { ...valeurs, maj: maintenant() };

    journaliser(etat, {
      horodatage: maintenant(),
      auteur: s.identifiant,
      action: precedente ? 'saisie-modifiee' : 'saisie-creee',
      jour,
      valeurs,
    });

    return { jour, valeurs, maj: etat.saisies[jour][s.identifiant].maj };
  }, 'saisie');
}

// --- Espace administrateur --------------------------------------------------

export async function tableauAdmin({ session: s, etat, url }) {
  exigerAdmin(s);
  const jourCourant = aujourdhui();
  const jour = jourDemande(url, 'jour', jourCourant);
  const ancreSemaine = jourDemande(url, 'semaine', jourCourant);
  const ancreMois = jourDemande(url, 'mois', jourCourant);
  const actifs = conseillersActifs(etat);
  const objectifsParConseiller = Object.fromEntries(
    etat.conseillers.map((c) => [c.identifiant, objectifsDe(etat, c.identifiant)]),
  );

  const jsem = joursSemaine(ancreSemaine);
  const jmois = joursMois(ancreMois);

  return {
    role: 'admin',
    indicateurs: INDICATEURS,
    clesClassees: CLES_CLASSEES,
    aujourdhui: jourCourant,
    jour,
    libelleJourConsulte: libelleJour(jour),
    conseillers: etat.conseillers.map((c) => ({
      identifiant: c.identifiant,
      nom: c.nom,
      actif: c.actif,
      objectifs: objectifsParConseiller[c.identifiant],
    })),
    jourEquipe: actifs.map((c) => {
      const saisie = saisieDuJour(etat, c.identifiant, jour);
      return {
        identifiant: c.identifiant,
        nom: c.nom,
        saisi: Boolean(saisie),
        maj: saisie ? saisie.maj : null,
        valeurs: saisie ? extraireValeurs(saisie) : saisieVide(),
      };
    }),
    semaine: {
      cle: cleSemaine(ancreSemaine),
      ancre: ancreSemaine,
      libelle: libelleSemaine(ancreSemaine),
      encours: cleSemaine(ancreSemaine) === cleSemaine(jourCourant),
      precedente: semaineVoisine(ancreSemaine, -1),
      suivante: semaineVoisine(ancreSemaine, 1),
      equipe: bilanEquipe(etat.saisies, actifs, jsem, objectifsParConseiller, 'hebdomadaire'),
      classement: classement(etat.saisies, actifs, jsem, objectifsParConseiller, 'hebdomadaire'),
    },
    mois: {
      cle: cleMois(ancreMois),
      ancre: ancreMois,
      libelle: libelleMois(ancreMois),
      encours: cleMois(ancreMois) === cleMois(jourCourant),
      precedent: moisVoisin(ancreMois, -1),
      suivant: moisVoisin(ancreMois, 1),
      equipe: bilanEquipe(etat.saisies, actifs, jmois, objectifsParConseiller, 'mensuel'),
      classement: classement(etat.saisies, actifs, jmois, objectifsParConseiller, 'mensuel'),
    },
  };
}

export async function creerConseiller({ session: s, corps, stockage }) {
  exigerAdmin(s);
  const identifiant = normaliserIdentifiant(corps.identifiant);
  if (!identifiant) {
    throw new ErreurHttp(400, 'Identifiant invalide : 2 à 32 caractères, lettres, chiffres, point, tiret ou soulignement.');
  }
  const nom = typeof corps.nom === 'string' ? corps.nom.trim() : '';
  if (nom.length < 2 || nom.length > 80) throw new ErreurHttp(400, 'Nom invalide.');

  return stockage.modifier((etat) => {
    if (conseillerParIdentifiant(etat, identifiant)) {
      throw new ErreurHttp(409, 'Cet identifiant existe déjà.');
    }
    const conseiller = { identifiant, nom, actif: true, cree: maintenant() };
    etat.conseillers.push(conseiller);
    etat.conseillers.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    journaliser(etat, {
      horodatage: maintenant(), auteur: 'admin', action: 'conseiller-cree', cible: identifiant,
    });
    return conseiller;
  }, 'conseillers');
}

export async function modifierConseiller({ session: s, corps, stockage, params }) {
  exigerAdmin(s);
  const identifiant = normaliserIdentifiant(params.identifiant);
  if (!identifiant) throw new ErreurHttp(400, 'Identifiant invalide.');

  return stockage.modifier((etat) => {
    const conseiller = conseillerParIdentifiant(etat, identifiant);
    if (!conseiller) throw new ErreurHttp(404, 'Conseiller inconnu.');

    if (typeof corps.nom === 'string') {
      const nom = corps.nom.trim();
      if (nom.length < 2 || nom.length > 80) throw new ErreurHttp(400, 'Nom invalide.');
      conseiller.nom = nom;
    }
    if (typeof corps.actif === 'boolean') conseiller.actif = corps.actif;

    etat.conseillers.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    journaliser(etat, {
      horodatage: maintenant(), auteur: 'admin', action: 'conseiller-modifie', cible: identifiant,
    });
    return conseiller;
  }, 'conseillers');
}

/**
 * Les objectifs sont modifiables à tout moment, y compris en cours de période :
 * les écarts affichés se recalculent alors sur l'objectif courant.
 */
export async function enregistrerObjectifs({ session: s, corps, stockage, params }) {
  exigerAdmin(s);
  const identifiant = normaliserIdentifiant(params.identifiant);
  if (!identifiant) throw new ErreurHttp(400, 'Identifiant invalide.');

  const { objectifs, erreur } = normaliserObjectifs(corps.objectifs ?? corps);
  if (erreur) throw new ErreurHttp(400, erreur);

  return stockage.modifier((etat) => {
    if (!conseillerParIdentifiant(etat, identifiant)) throw new ErreurHttp(404, 'Conseiller inconnu.');
    etat.objectifs[identifiant] = objectifs;
    journaliser(etat, {
      horodatage: maintenant(), auteur: 'admin', action: 'objectifs-modifies', cible: identifiant, objectifs,
    });
    return objectifs;
  }, 'objectifs');
}

export async function journalAdmin({ session: s, etat }) {
  exigerAdmin(s);
  return { journal: etat.journal.slice(-200).reverse() };
}

/**
 * Copie de tout l'état, à emporter. Le disque de l'hébergeur protège d'un
 * redémarrage ; cette copie-là protège de l'hébergeur lui-même.
 */
export async function telechargerSauvegarde({ session: s, etat, reponse }) {
  exigerAdmin(s);
  const contenu = Buffer.from(`${JSON.stringify(etat, null, 2)}\n`, 'utf8');
  reponse.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="suivi-${aujourdhui()}.json"`,
    'Content-Length': contenu.length,
    'Cache-Control': 'no-store',
  });
  reponse.end(contenu);
  return undefined;
}

// --- Utilitaires ------------------------------------------------------------

function extraireValeurs(saisie) {
  const valeurs = saisieVide();
  for (const cle of CLES) valeurs[cle] = Number(saisie[cle]) || 0;
  return valeurs;
}
