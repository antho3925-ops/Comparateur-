// Fonctions partagées par les trois pages : appels au serveur, formatage des
// chiffres, fabrique d'éléments et connexion au flux temps réel.

export async function appeler(chemin, options = {}) {
  const reponse = await fetch(chemin, {
    method: options.methode || 'GET',
    headers: options.corps ? { 'Content-Type': 'application/json' } : undefined,
    body: options.corps ? JSON.stringify(options.corps) : undefined,
    credentials: 'same-origin',
  });

  let donnees = null;
  try {
    donnees = await reponse.json();
  } catch {
    donnees = null;
  }

  if (!reponse.ok) {
    const erreur = new Error((donnees && donnees.erreur) || `Erreur ${reponse.status}.`);
    erreur.statut = reponse.status;
    throw erreur;
  }
  return donnees;
}

// --- Formatage --------------------------------------------------------------

const NOMBRE = new Intl.NumberFormat('fr-CH');
const MONTANT = new Intl.NumberFormat('fr-CH', { maximumFractionDigits: 0 });

/** Un nombre d'unités, ou un montant en francs selon le format de l'indicateur. */
export function formater(valeur, format) {
  if (valeur === null || valeur === undefined) return '—';
  if (format === 'montant') return `${MONTANT.format(valeur)} CHF`;
  return NOMBRE.format(valeur);
}

/** Le même, signé : sert aux écarts, jamais aux valeurs réalisées. */
export function formaterSigne(valeur, format) {
  if (valeur === null || valeur === undefined) return '—';
  const signe = valeur > 0 ? '+' : valeur < 0 ? '−' : '±';
  return `${signe}${formater(Math.abs(valeur), format)}`;
}

/**
 * Texte de l'écart. La plateforme n'affiche jamais de pourcentage : l'écart est
 * toujours un nombre de contrats, de rendez-vous ou de francs.
 *
 * Sur un plafond — les rendez-vous valides non signés — la lecture s'inverse :
 * rester en dessous est la réussite, le franchir est le mauvais résultat.
 */
export function texteEcart(ligne) {
  const plafond = ligne.sens === 'plafond';
  // « pas de plafond », mais « pas d'objectif » : l'élision devant la voyelle.
  if (!ligne.applicable) return plafond ? 'pas de plafond à cette échéance' : 'pas d’objectif à cette échéance';
  if (ligne.objectif === null) return `${plafond ? 'plafond' : 'objectif'} non fixé`;

  if (plafond) {
    if (ligne.ecart > 0) return `plafond dépassé de ${formater(ligne.exces, ligne.format)}`;
    if (ligne.ecart === 0) return 'plafond atteint tout juste, à ne pas franchir';
    return `${formater(ligne.marge, ligne.format)} de marge sous le plafond`;
  }

  if (ligne.ecart === 0) return 'objectif atteint, tout juste';
  if (ligne.ecart > 0) return `objectif dépassé de ${formater(ligne.ecart, ligne.format)}`;
  return `il manque ${formater(ligne.reste, ligne.format)}`;
}

export function classeEcart(ligne) {
  if (!ligne.applicable || ligne.objectif === null) return 'sans-objectif';
  if (ligne.depasse) return 'depasse';
  return ligne.atteint ? 'atteint' : 'manque';
}

/** « objectif » pour une cible, « plafond » pour un maximum à ne pas franchir. */
export function motCible(ligne) {
  return ligne.sens === 'plafond' ? 'plafond' : 'objectif';
}

export function heure(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-CH', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich',
  });
}

// --- DOM --------------------------------------------------------------------

export function el(balise, attributs = {}, enfants = []) {
  const noeud = document.createElement(balise);
  for (const [cle, valeur] of Object.entries(attributs)) {
    if (valeur === null || valeur === undefined || valeur === false) continue;
    if (cle === 'class') noeud.className = valeur;
    else if (cle === 'texte') noeud.textContent = valeur;
    else if (cle.startsWith('on')) noeud.addEventListener(cle.slice(2), valeur);
    else noeud.setAttribute(cle, valeur === true ? '' : String(valeur));
  }
  for (const enfant of [].concat(enfants)) {
    if (enfant === null || enfant === undefined || enfant === false) continue;
    noeud.append(typeof enfant === 'string' ? document.createTextNode(enfant) : enfant);
  }
  return noeud;
}

export function vider(noeud) {
  while (noeud.firstChild) noeud.removeChild(noeud.firstChild);
  return noeud;
}

export function afficherMessage(noeud, texte, genre = 'erreur') {
  if (!noeud) return;
  noeud.className = `message ${genre}`;
  noeud.textContent = texte || '';
}

// --- Les bascules se voient -------------------------------------------------

const DUREE_FETE = 1200;

const succesConnus = new Map();       // période -> Map<indicateur, atteint>
const fetesEnCours = new Map();       // « période|indicateur » -> fin prévue
const alertesEnCours = new Map();     // idem, pour un plafond franchi
const bandeauxEnCours = new Map();    // période -> fin prévue

/**
 * Anime les tuiles qui viennent de basculer : fête quand un objectif est
 * atteint, alerte quand un plafond est franchi. La comparaison se fait sur
 * l'état précédent de la même période : au premier affichage on se contente de
 * mémoriser, sinon toute la page se mettrait à fêter au chargement, ce qui ne
 * voudrait plus rien dire.
 *
 * Une fête a une échéance plutôt qu'un simple déclenchement : un rendu peut en
 * chasser un autre — l'enregistrement recharge la page, et l'événement temps
 * réel qu'il provoque la recharge encore — et la tuile reconstruite doit
 * reprendre l'animation là où elle en était plutôt que de l'escamoter.
 *
 * Renvoie l'état de la période : bouclée ou non, et si elle vient de l'être.
 */
export function signalerBascules(conteneur, lignes, portee) {
  const precedent = succesConnus.get(portee);
  succesConnus.set(portee, new Map(lignes.map((l) => [l.cle, l.atteint === true])));
  const maintenant = Date.now();

  for (const ligne of lignes) {
    const cle = `${portee}|${ligne.cle}`;
    const avant = precedent ? precedent.get(ligne.cle) : undefined;

    if (ligne.atteint === true && avant === false) fetesEnCours.set(cle, maintenant + DUREE_FETE);
    if (ligne.depasse && avant === true) alertesEnCours.set(cle, maintenant + DUREE_FETE);
    if (ligne.atteint !== true) fetesEnCours.delete(cle);
    if (!ligne.depasse) alertesEnCours.delete(cle);

    const tuile = conteneur.querySelector(`[data-cle="${ligne.cle}"]`);
    if (!tuile) continue;

    const finFete = fetesEnCours.get(cle);
    if (finFete > maintenant) feter(tuile, finFete - maintenant);

    const finAlerte = alertesEnCours.get(cle);
    if (finAlerte > maintenant) alerter(tuile, finAlerte - maintenant);
  }

  const avecObjectif = lignes.filter((l) => l.objectif !== null);
  const toutAtteint = avecObjectif.length > 0 && avecObjectif.every((l) => l.atteint === true);
  const boucleAvant = Boolean(precedent) && avecObjectif.length > 0
    && avecObjectif.every((l) => precedent.get(l.cle) === true);

  if (!toutAtteint) bandeauxEnCours.delete(portee);
  else if (precedent && !boucleAvant) bandeauxEnCours.set(portee, maintenant + DUREE_FETE);

  return { toutAtteint, anime: (bandeauxEnCours.get(portee) ?? 0) > maintenant };
}

function feter(tuile, reste) {
  tuile.classList.add('celebre');
  tuile.append(el('span', { class: 'balayage' }, el('i')), etincelles());
  // La classe est retirée pour qu'une bascule suivante rejoue l'animation :
  // une classe qui reste ne se rejoue jamais.
  setTimeout(() => {
    tuile.classList.remove('celebre');
    for (const decor of tuile.querySelectorAll('.etincelles, .balayage')) decor.remove();
  }, reste);
}

/**
 * Un plafond franchi n'est pas une fête : la tuile passe au rouge et se
 * signale sobrement, sans éclat ni étincelles.
 */
function alerter(tuile, reste) {
  tuile.classList.add('alerte');
  setTimeout(() => tuile.classList.remove('alerte'), reste);
}

function etincelles() {
  const groupe = el('div', { class: 'etincelles' });
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const distance = 26 + (i % 3) * 9;
    groupe.append(el('span', {
      style: `--dx:${(Math.cos(angle) * distance).toFixed(1)}px;`
        + `--dy:${(Math.sin(angle) * distance).toFixed(1)}px;`
        + `animation-delay:${150 + i * 22}ms`,
    }));
  }
  return groupe;
}

export function bandeauSucces(texte, anime) {
  return el('div', { class: `bandeau-succes ${anime ? 'celebre' : ''}` }, [
    el('span', { class: 'medaille', texte: '🏅' }),
    el('span', { texte }),
  ]);
}

// --- Temps réel -------------------------------------------------------------

/**
 * Ouvre le flux d'événements du serveur et rappelle `surChangement` à chaque
 * modification de l'état. EventSource se reconnecte tout seul ; on signale
 * simplement l'état de la liaison pour que la pastille « en direct » ne mente
 * pas.
 */
export function suivreEnDirect(surChangement, surEtatLiaison) {
  let flux = null;

  const ouvrir = () => {
    flux = new EventSource('/api/flux');
    flux.addEventListener('pret', () => surEtatLiaison && surEtatLiaison(true));
    for (const evenement of ['saisie', 'objectifs', 'conseillers', 'etat']) {
      flux.addEventListener(evenement, () => surChangement(evenement));
    }
    flux.onerror = () => surEtatLiaison && surEtatLiaison(false);
  };

  ouvrir();

  // Au retour d'un onglet mis en veille, on resynchronise sans attendre le
  // prochain événement.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) surChangement('reveil');
  });

  return () => flux && flux.close();
}

/**
 * Tuile d'un indicateur : réalisé, objectif, écart chiffré. Trois lignes
 * plutôt qu'une seule, pour qu'un montant en francs ne se coupe pas en deux.
 */
export function tuileEcart(ligne) {
  return el('div', {
    class: `tuile ${classeEcart(ligne)} ${ligne.format === 'montant' ? 'montant' : ''}`,
    'data-cle': ligne.cle,
  }, [
    ligne.atteint === true
      ? el('span', {
        class: 'sceau',
        title: ligne.sens === 'plafond' ? 'Plafond respecté' : 'Objectif atteint',
        texte: '✓',
      })
      : null,
    ligne.depasse
      ? el('span', { class: 'sceau alerte', title: 'Plafond dépassé', texte: '!' })
      : null,
    el('div', { class: 'nom', texte: ligne.libelle }),
    el('div', { class: 'realise', texte: formater(ligne.realise, ligne.format) }),
    el('div', {
      class: 'cible',
      texte: ligne.objectif === null
        ? '\u00a0'
        : `${motCible(ligne)} : ${formater(ligne.objectif, ligne.format)}`,
    }),
    el('div', { class: 'ecart' }, [
      ligne.objectif !== null && ligne.ecart !== 0
        ? el('span', { texte: `${formaterSigne(ligne.ecart, ligne.format)} · ` })
        : null,
      el('span', { class: 'mot', texte: texteEcart(ligne) }),
    ]),
  ]);
}

export function poserBandeau(nom, roleTexte) {
  const cible = document.querySelector('[data-qui]');
  // Le bandeau ne se reconstruit pas à chaque rendu : la pastille « en direct »
  // y vit, et la remplacer la ferait clignoter à chaque rafraîchissement.
  if (!cible || cible.dataset.pose === '1') return;
  cible.dataset.pose = '1';
  vider(cible).append(
    el('span', { class: 'pastille-direct hors', 'data-direct': '', texte: 'hors ligne' }),
    el('span', {}, [roleTexte ? `${roleTexte} · ` : '', el('strong', { texte: nom })]),
    el('button', {
      class: 'discret',
      texte: 'Se déconnecter',
      onclick: async () => {
        await appeler('/api/deconnexion', { methode: 'POST' });
        window.location.href = '/';
      },
    }),
  );
}

export function majPastilleDirect(enLigne) {
  const pastille = document.querySelector('[data-direct]');
  if (!pastille) return;
  pastille.classList.toggle('hors', !enLigne);
  pastille.textContent = enLigne ? 'en direct' : 'reconnexion…';
}
