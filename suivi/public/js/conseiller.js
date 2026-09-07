// Page personnelle du conseiller : saisie du jour, écarts de la semaine et du
// mois, historique figé.

import {
  appeler, el, vider, formater, afficherMessage, heure,
  tuileEcart, poserBandeau, suivreEnDirect, majPastilleDirect,
} from './commun.js';

const etat = {
  donnees: null,
  ancreSemaine: null,
  ancreMois: null,
  saisieEnCours: false,
  modifieDepuisChargement: false,
};

/** Jour courant à Genève, tel que le navigateur peut le calculer. */
function jourSuisse() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

const noeuds = {
  messageGlobal: document.getElementById('message-global'),
  messageSaisie: document.getElementById('message-saisie'),
  grilleSaisie: document.getElementById('grille-saisie'),
  formulaire: document.getElementById('formulaire-saisie'),
  bouton: document.getElementById('bouton-enregistrer'),
  horodatage: document.getElementById('horodatage-saisie'),
  libelleJour: document.getElementById('libelle-jour'),
  libelleSemaine: document.getElementById('libelle-semaine'),
  libelleMois: document.getElementById('libelle-mois'),
  tuilesSemaine: document.getElementById('tuiles-semaine'),
  tuilesMois: document.getElementById('tuiles-mois'),
  historique: document.getElementById('historique'),
};

// --- Chargement -------------------------------------------------------------

async function charger() {
  const parametres = new URLSearchParams();
  if (etat.ancreSemaine) parametres.set('semaine', etat.ancreSemaine);
  if (etat.ancreMois) parametres.set('mois', etat.ancreMois);
  const suffixe = parametres.toString() ? `?${parametres}` : '';

  try {
    etat.donnees = await appeler(`/api/conseiller${suffixe}`);
  } catch (erreur) {
    if (erreur.statut === 401) {
      window.location.href = '/';
      return;
    }
    afficherMessage(noeuds.messageGlobal, erreur.message);
    return;
  }
  afficherMessage(noeuds.messageGlobal, '');
  rendre();
}

function rendre() {
  const d = etat.donnees;
  poserBandeau(d.conseiller.nom, 'Conseiller');
  document.title = `${d.conseiller.nom} — Suivi de performance`;

  noeuds.libelleJour.textContent = d.libelleJourConsulte;
  rendreSaisie(d);
  rendrePeriode(noeuds.tuilesSemaine, d.semaine.bilan.lignes);
  rendrePeriode(noeuds.tuilesMois, d.mois.bilan.lignes);
  noeuds.libelleSemaine.textContent = `${d.semaine.libelle}${d.semaine.encours ? ' — semaine en cours' : ''}`;
  noeuds.libelleMois.textContent = `${d.mois.libelle}${d.mois.encours ? ' — mois en cours' : ''}`;
  rendreHistorique(d);
}

// --- Saisie du jour ---------------------------------------------------------

function rendreSaisie(d) {
  // On ne réécrit pas les champs sous les doigts du conseiller : tant qu'il a
  // une modification non enregistrée, seuls les libellés sont rafraîchis.
  if (etat.modifieDepuisChargement) return;

  vider(noeuds.grilleSaisie);
  for (const indicateur of d.indicateurs) {
    const valeur = d.saisie ? d.saisie[indicateur.cle] : 0;
    noeuds.grilleSaisie.append(el('div', { class: 'champ' }, [
      el('label', { for: `champ-${indicateur.cle}` }, [
        indicateur.libelle,
        el('span', { class: 'unite', texte: indicateur.format === 'montant' ? ' (CHF)' : '' }),
      ]),
      el('input', {
        type: 'number',
        id: `champ-${indicateur.cle}`,
        name: indicateur.cle,
        min: '0',
        step: '1',
        inputmode: 'numeric',
        value: String(valeur),
        disabled: !d.modifiable,
        oninput: () => { etat.modifieDepuisChargement = true; },
      }),
    ]));
  }

  noeuds.bouton.disabled = !d.modifiable;
  noeuds.horodatage.textContent = d.saisieMaj
    ? `Dernier enregistrement à ${heure(d.saisieMaj)}.`
    : 'Aucun chiffre enregistré pour aujourd’hui.';

  if (!d.modifiable) {
    afficherMessage(noeuds.messageSaisie,
      'Consultation seule : cette journée est figée.', 'info');
  } else if (!d.saisie) {
    afficherMessage(noeuds.messageSaisie, '');
  }
}

noeuds.formulaire.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  if (etat.saisieEnCours) return;
  etat.saisieEnCours = true;
  noeuds.bouton.disabled = true;

  const valeurs = {};
  for (const indicateur of etat.donnees.indicateurs) {
    const champ = document.getElementById(`champ-${indicateur.cle}`);
    valeurs[indicateur.cle] = champ.value === '' ? 0 : Number(champ.value);
  }

  try {
    const resultat = await appeler('/api/saisie', { methode: 'PUT', corps: { valeurs } });
    etat.modifieDepuisChargement = false;
    afficherMessage(noeuds.messageSaisie,
      `Chiffres enregistrés à ${heure(resultat.maj)}. Vous pouvez encore les corriger jusqu’à ce soir.`,
      'succes');
    await charger();
  } catch (erreur) {
    afficherMessage(noeuds.messageSaisie, erreur.message, 'erreur');
  } finally {
    etat.saisieEnCours = false;
    noeuds.bouton.disabled = !(etat.donnees && etat.donnees.modifiable);
  }
});

// --- Tuiles d'écart ---------------------------------------------------------

function rendrePeriode(conteneur, lignes) {
  vider(conteneur);
  for (const ligne of lignes) conteneur.append(tuileEcart(ligne));
}

// --- Historique -------------------------------------------------------------

function rendreHistorique(d) {
  const table = vider(noeuds.historique);
  table.append(el('thead', {}, el('tr', {}, [
    el('th', { texte: 'Journée' }),
    ...d.indicateurs.map((i) => el('th', { class: 'nombre', texte: i.court })),
    el('th', { texte: '' }),
  ])));

  const corps = el('tbody');
  for (const jour of d.historique) {
    corps.append(el('tr', {}, [
      el('td', { texte: jour.libelle }),
      ...d.indicateurs.map((i) => el('td', {
        class: 'nombre',
        texte: jour.saisi ? formater(jour.valeurs[i.cle], i.format) : '—',
      })),
      el('td', {}, el('span', {
        class: `puce ${jour.fige ? 'non' : 'oui'}`,
        texte: jour.fige ? 'figée' : 'ouverte',
      })),
    ]));
  }
  table.append(corps);
}

// --- Navigation de période --------------------------------------------------

document.addEventListener('click', (evenement) => {
  const bouton = evenement.target.closest('[data-nav]');
  if (!bouton || !etat.donnees) return;
  const actions = {
    'semaine-precedente': () => { etat.ancreSemaine = etat.donnees.semaine.precedente; },
    'semaine-suivante': () => { etat.ancreSemaine = etat.donnees.semaine.suivante; },
    'semaine-courante': () => { etat.ancreSemaine = null; },
    'mois-precedent': () => { etat.ancreMois = etat.donnees.mois.precedent; },
    'mois-suivant': () => { etat.ancreMois = etat.donnees.mois.suivant; },
    'mois-courant': () => { etat.ancreMois = null; },
  };
  const action = actions[bouton.dataset.nav];
  if (!action) return;
  action();
  charger();
});

// --- Mise à jour en direct --------------------------------------------------

/**
 * Un onglet laissé ouvert pendant la nuit afficherait encore le formulaire de
 * la veille, prérempli des chiffres de la veille : le conseiller croirait
 * corriger sa journée passée alors qu'il ouvrirait la nouvelle. On surveille le
 * basculement de date et on repart d'un formulaire propre.
 */
function surveillerChangementDeJour() {
  setInterval(async () => {
    if (!etat.donnees || jourSuisse() === etat.donnees.aujourdhui) return;
    etat.modifieDepuisChargement = false;
    await charger();
    // Le message vient après le rendu : celui-ci remet la zone à blanc.
    afficherMessage(noeuds.messageSaisie,
      'Nous avons changé de journée : les chiffres d’hier sont désormais figés '
      + 'et le formulaire repart à zéro.', 'info');
  }, 30000);
}

charger();
suivreEnDirect(() => charger(), majPastilleDirect);
surveillerChangementDeJour();
