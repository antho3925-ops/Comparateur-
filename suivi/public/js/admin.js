// Espace administrateur : vue d'équipe, chiffres individuels, classement,
// objectifs et gestion des accès.

import {
  appeler, el, vider, formater, formaterSigne, classeEcart, afficherMessage,
  heure, tuileEcart, poserBandeau, suivreEnDirect, majPastilleDirect,
} from './commun.js';

const etat = {
  donnees: null,
  onglet: 'equipe',
  ancreSemaine: null,
  ancreMois: null,
  ancreJour: null,
  // Un objectif en cours de frappe ne doit pas être écrasé par un
  // rafraîchissement temps réel provoqué par la saisie d'un conseiller.
  objectifsEnEdition: new Set(),
};

const porte = document.getElementById('porte');
const tableauDeBord = document.getElementById('tableau-de-bord');
const panneaux = document.getElementById('panneaux');
const messageGlobal = document.getElementById('message-global');
const messageAction = document.getElementById('message-action');

// --- Entrée -----------------------------------------------------------------

const formulaireAdmin = document.getElementById('formulaire-admin');
const champCode = document.getElementById('code');
const messageAdmin = document.getElementById('message-admin');

formulaireAdmin.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  const bouton = formulaireAdmin.querySelector('button');
  bouton.disabled = true;
  afficherMessage(messageAdmin, '');
  try {
    await appeler('/api/connexion-admin', { methode: 'POST', corps: { code: champCode.value } });
    champCode.value = '';
    await ouvrirTableauDeBord();
  } catch (erreur) {
    afficherMessage(messageAdmin, erreur.message);
    champCode.select();
  } finally {
    bouton.disabled = false;
  }
});

async function demarrer() {
  const session = await appeler('/api/session').catch(() => ({ role: null }));
  if (session.role === 'admin') await ouvrirTableauDeBord();
  else porte.hidden = false;
}

async function ouvrirTableauDeBord() {
  porte.hidden = true;
  tableauDeBord.hidden = false;
  poserBandeau('Responsable d’équipe', null);
  await charger();
  suivreEnDirect(() => charger({ menagerLaSaisie: true }), majPastilleDirect);
}

// --- Chargement -------------------------------------------------------------

async function charger({ menagerLaSaisie = false } = {}) {
  const parametres = new URLSearchParams();
  if (etat.ancreSemaine) parametres.set('semaine', etat.ancreSemaine);
  if (etat.ancreMois) parametres.set('mois', etat.ancreMois);
  if (etat.ancreJour) parametres.set('jour', etat.ancreJour);
  const suffixe = parametres.toString() ? `?${parametres}` : '';

  try {
    etat.donnees = await appeler(`/api/admin/tableau${suffixe}`);
  } catch (erreur) {
    if (erreur.statut === 401) {
      tableauDeBord.hidden = true;
      porte.hidden = false;
      return;
    }
    afficherMessage(messageGlobal, erreur.message);
    return;
  }
  afficherMessage(messageGlobal, '');
  rendre(menagerLaSaisie);
}

/**
 * Un rafraîchissement temps réel ne doit pas effacer ce que le responsable est
 * en train de taper : tant qu'un champ du panneau a le focus, on garde le
 * rendu en place. Les données restent à jour et le prochain rendu les prendra.
 */
function saisieEnCours() {
  const actif = document.activeElement;
  return Boolean(actif && panneaux.contains(actif)
    && ['INPUT', 'SELECT', 'TEXTAREA'].includes(actif.tagName));
}

document.getElementById('onglets').addEventListener('click', (evenement) => {
  const bouton = evenement.target.closest('[data-onglet]');
  if (!bouton) return;
  // Une confirmation appartient à l'onglet où l'action a eu lieu.
  afficherMessage(messageAction, '');
  etat.onglet = bouton.dataset.onglet;
  for (const autre of document.querySelectorAll('[data-onglet]')) {
    autre.setAttribute('aria-selected', String(autre === bouton));
  }
  rendre();
});

function rendre(menagerLaSaisie = false) {
  if (menagerLaSaisie && (saisieEnCours() || etat.objectifsEnEdition.size > 0)) return;
  const rendus = {
    equipe: rendreEquipe,
    conseillers: rendreParConseiller,
    classement: rendreClassement,
    objectifs: rendreObjectifs,
    acces: rendreAcces,
  };
  vider(panneaux).append(rendus[etat.onglet](etat.donnees));
}

// --- Fragments réutilisables ------------------------------------------------

function navigationPeriode(portee) {
  const p = etat.donnees[portee === 'semaine' ? 'semaine' : 'mois'];
  const aller = (ancre) => {
    if (portee === 'semaine') etat.ancreSemaine = ancre;
    else etat.ancreMois = ancre;
    charger();
  };
  return el('div', { class: 'actions navigation-periode' }, [
    el('button', {
      class: 'discret',
      texte: '←',
      title: portee === 'semaine' ? 'Semaine précédente' : 'Mois précédent',
      onclick: () => aller(portee === 'semaine' ? p.precedente : p.precedent),
    }),
    el('button', {
      class: 'discret',
      texte: portee === 'semaine' ? 'Semaine en cours' : 'Mois en cours',
      onclick: () => aller(null),
    }),
    el('button', {
      class: 'discret',
      texte: '→',
      title: portee === 'semaine' ? 'Semaine suivante' : 'Mois suivant',
      onclick: () => aller(portee === 'semaine' ? p.suivante : p.suivant),
    }),
  ]);
}

function carte(titre, periode, contenu, actions) {
  return el('section', { class: 'carte' }, [
    el('header', {}, [
      el('h2', { texte: titre }),
      periode ? el('span', { class: 'periode', texte: periode }) : null,
      actions || null,
    ]),
    ...[].concat(contenu),
  ]);
}

function tuiles(lignes) {
  return el('div', { class: 'tuiles' }, lignes.map(tuileEcart));
}

function libellePeriode(p) {
  return `${p.libelle}${p.encours ? ' — en cours' : ''}`;
}

function defilable(table) {
  return el('div', { class: 'defilable' }, table);
}

// --- Onglet « Équipe » ------------------------------------------------------

function rendreEquipe(d) {
  const saisisAujourdhui = d.jourEquipe.filter((c) => c.saisi).length;

  return el('div', {}, [
    carte('Équipe — semaine', libellePeriode(d.semaine),
      tuiles(d.semaine.equipe.lignes), navigationPeriode('semaine')),
    carte('Équipe — mois', libellePeriode(d.mois),
      tuiles(d.mois.equipe.lignes), navigationPeriode('mois')),
    carte(
      'Saisies du jour',
      `${d.libelleJourConsulte} — ${saisisAujourdhui} sur ${d.jourEquipe.length} conseillers ont saisi`,
      d.jourEquipe.length
        ? defilable(tableJour(d))
        : el('p', { class: 'vide', texte: 'Aucun conseiller actif.' }),
    ),
  ]);
}

function tableJour(d) {
  const total = Object.fromEntries(d.indicateurs.map((i) => [i.cle, 0]));
  for (const c of d.jourEquipe) {
    for (const i of d.indicateurs) total[i.cle] += c.valeurs[i.cle];
  }

  return el('table', {}, [
    el('thead', {}, el('tr', {}, [
      el('th', { texte: 'Conseiller' }),
      ...d.indicateurs.map((i) => el('th', { class: 'nombre', texte: i.court })),
      el('th', { texte: 'Saisie' }),
    ])),
    el('tbody', {}, d.jourEquipe.map((c) => el('tr', {}, [
      el('td', { texte: c.nom }),
      ...d.indicateurs.map((i) => el('td', {
        class: 'nombre',
        texte: c.saisi ? formater(c.valeurs[i.cle], i.format) : '—',
      })),
      el('td', {}, el('span', {
        class: `puce ${c.saisi ? 'oui' : 'non'}`,
        texte: c.saisi ? `à ${heure(c.maj)}` : 'en attente',
      })),
    ]))),
    el('tfoot', {}, el('tr', {}, [
      el('td', { texte: 'Total équipe' }),
      ...d.indicateurs.map((i) => el('td', { class: 'nombre', texte: formater(total[i.cle], i.format) })),
      el('td', { texte: '' }),
    ])),
  ]);
}

// --- Onglet « Par conseiller » ----------------------------------------------

function rendreParConseiller(d) {
  if (!d.semaine.classement.length) {
    return carte('Chiffres individuels', null,
      el('p', { class: 'vide', texte: 'Aucun conseiller actif. Créez des accès dans l’onglet « Accès ».' }));
  }
  return el('div', {}, [
    carte('Chiffres individuels — semaine', libellePeriode(d.semaine),
      defilable(tableIndividuelle(d, d.semaine.classement, 'hebdomadaire')),
      navigationPeriode('semaine')),
    carte('Chiffres individuels — mois', libellePeriode(d.mois),
      defilable(tableIndividuelle(d, d.mois.classement, 'mensuel')),
      navigationPeriode('mois')),
  ]);
}

/**
 * Chaque cellule porte le réalisé et, dessous, l'écart chiffré à l'objectif.
 * Jamais de pourcentage : un écart est un nombre de contrats, de rendez-vous
 * ou de francs.
 */
function tableIndividuelle(d, lignes, portee) {
  return el('table', {}, [
    el('thead', {}, el('tr', {}, [
      el('th', { texte: 'Conseiller' }),
      ...d.indicateurs.map((i) => el('th', {
        class: 'nombre',
        texte: portee === 'hebdomadaire' && !i.hebdomadaire ? `${i.court} (sans objectif)` : i.court,
      })),
    ])),
    el('tbody', {}, lignes.map((entree) => el('tr', {}, [
      el('td', { texte: entree.nom }),
      ...entree.bilan.lignes.map((ligne) => el('td', { class: 'nombre' }, [
        el('span', { texte: formater(ligne.realise, ligne.format) }),
        el('span', {
          class: `ecart-cellule ${classeEcart(ligne)}`,
          texte: ligne.objectif === null
            ? (ligne.applicable ? 'sans objectif' : '—')
            : `${formaterSigne(ligne.ecart, ligne.format)} / ${formater(ligne.objectif, ligne.format)}`,
        }),
      ])),
    ]))),
  ]);
}

// --- Onglet « Classement » --------------------------------------------------

function rendreClassement(d) {
  if (!d.semaine.classement.length) {
    return carte('Classement', null, el('p', { class: 'vide', texte: 'Aucun conseiller actif.' }));
  }
  const explication = el('p', {
    class: 'sous-titre',
    texte: 'Chaque conseiller est classé indicateur par indicateur sur son réalisé ; '
      + 'les points sont la somme de ces rangs et le plus petit total passe premier. '
      + 'Les rendez-vous valides non signés sont comptés mais n’entrent pas dans les points. '
      + 'Ce classement n’est visible que depuis l’espace administrateur.',
  });

  return el('div', {}, [
    carte('Classement de la semaine', libellePeriode(d.semaine),
      [explication, defilable(tableClassement(d, d.semaine.classement))],
      navigationPeriode('semaine')),
    carte('Classement du mois', libellePeriode(d.mois),
      defilable(tableClassement(d, d.mois.classement)),
      navigationPeriode('mois')),
  ]);
}

function tableClassement(d, lignes) {
  return el('table', {}, [
    el('thead', {}, el('tr', {}, [
      el('th', { texte: 'Rang' }),
      el('th', { texte: 'Conseiller' }),
      ...d.indicateurs.map((i) => el('th', {
        class: 'nombre',
        texte: d.clesClassees.includes(i.cle) ? i.court : `${i.court} (hors points)`,
      })),
      el('th', { class: 'nombre', texte: 'Points' }),
      el('th', { class: 'nombre', texte: 'Objectifs atteints' }),
    ])),
    el('tbody', {}, lignes.map((entree) => el('tr', {
      class: entree.rang <= 3 ? `podium-${entree.rang}` : '',
    }, [
      el('td', { class: 'rang', texte: String(entree.rang) }),
      el('td', { texte: entree.nom }),
      ...d.indicateurs.map((i) => el('td', { class: 'nombre' }, [
        el('span', { texte: formater(entree.bilan.total[i.cle], i.format) }),
        el('span', { class: 'ecart-cellule aucun', texte: `rang ${entree.rangs[i.cle]}` }),
      ])),
      el('td', { class: 'nombre', texte: String(entree.points) }),
      el('td', { class: 'nombre', texte: `${entree.objectifsAtteints} / ${entree.bilan.lignes.filter((l) => l.objectif !== null).length}` }),
    ]))),
  ]);
}

// --- Onglet « Objectifs » ---------------------------------------------------

function rendreObjectifs(d) {
  if (!d.conseillers.length) {
    return carte('Objectifs', null, el('p', { class: 'vide', texte: 'Aucun conseiller enregistré.' }));
  }
  return el('div', {}, [
    el('section', { class: 'carte' }, [
      el('header', {}, el('h2', { texte: 'Objectifs par conseiller' })),
      el('p', {
        class: 'sous-titre',
        texte: 'Objectif hebdomadaire et mensuel pour les cinq premiers indicateurs, objectif '
          + 'mensuel seul pour le montant transféré des avoirs LPP. Aucun objectif journalier. '
          + 'Une case laissée vide signifie « pas d’objectif fixé » ; une modification prend effet '
          + 'immédiatement sur la période en cours.',
      }),
    ]),
    ...d.conseillers.map((conseiller) => carteObjectifs(d, conseiller)),
  ]);
}

function carteObjectifs(d, conseiller) {
  const champs = {};

  const rangee = (indicateur) => {
    champs[indicateur.cle] = {};
    const cellule = (portee) => {
      if (portee === 'hebdomadaire' && !indicateur.hebdomadaire) {
        return el('td', { class: 'sans', texte: 'pas d’objectif hebdomadaire' });
      }
      const valeur = conseiller.objectifs[indicateur.cle]
        ? conseiller.objectifs[indicateur.cle][portee]
        : null;
      const champ = el('input', {
        type: 'number',
        min: '0',
        step: '1',
        inputmode: 'numeric',
        value: valeur === null || valeur === undefined ? '' : String(valeur),
        placeholder: '—',
        'aria-label': `Objectif ${portee} — ${indicateur.libelle} — ${conseiller.nom}`,
        oninput: () => etat.objectifsEnEdition.add(conseiller.identifiant),
      });
      champs[indicateur.cle][portee] = champ;
      return el('td', {}, champ);
    };
    return el('tr', {}, [
      el('td', { texte: indicateur.libelle }),
      cellule('hebdomadaire'),
      cellule('mensuel'),
    ]);
  };

  const enregistrer = async (bouton) => {
    bouton.disabled = true;
    afficherMessage(messageAction, '');
    const objectifs = {};
    for (const indicateur of d.indicateurs) {
      objectifs[indicateur.cle] = {};
      for (const [portee, champ] of Object.entries(champs[indicateur.cle])) {
        objectifs[indicateur.cle][portee] = champ.value === '' ? null : Number(champ.value);
      }
    }
    try {
      await appeler(`/api/admin/objectifs/${encodeURIComponent(conseiller.identifiant)}`, {
        methode: 'PUT',
        corps: { objectifs },
      });
      etat.objectifsEnEdition.delete(conseiller.identifiant);
      afficherMessage(messageAction, `Objectifs de ${conseiller.nom} enregistrés.`, 'succes');
    } catch (erreur) {
      afficherMessage(messageAction, erreur.message, 'erreur');
    } finally {
      bouton.disabled = false;
    }
  };

  const bouton = el('button', { class: 'primaire', texte: 'Enregistrer les objectifs' });
  bouton.addEventListener('click', () => enregistrer(bouton));

  return el('section', { class: 'carte' }, [
    el('header', {}, [
      el('h2', { texte: conseiller.nom }),
      el('span', { class: 'periode', texte: conseiller.identifiant }),
      !conseiller.actif ? el('span', { class: 'puce inactif', texte: 'accès désactivé' }) : null,
    ]),
    defilable(el('table', { class: 'objectifs-table' }, [
      el('thead', {}, el('tr', {}, [
        el('th', { texte: 'Indicateur' }),
        el('th', { texte: 'Objectif hebdomadaire' }),
        el('th', { texte: 'Objectif mensuel' }),
      ])),
      el('tbody', {}, d.indicateurs.map(rangee)),
    ])),
    el('div', { class: 'barre-saisie' }, bouton),
  ]);
}

// --- Onglet « Accès » -------------------------------------------------------

function rendreAcces(d) {
  const champIdentifiant = el('input', {
    type: 'text', placeholder: 'p.dupont', autocapitalize: 'none', spellcheck: 'false',
    'aria-label': 'Identifiant du nouveau conseiller',
  });
  const champNom = el('input', {
    type: 'text', placeholder: 'Pauline Dupont', 'aria-label': 'Nom du nouveau conseiller',
  });

  const creer = async (bouton) => {
    bouton.disabled = true;
    afficherMessage(messageAction, '');
    try {
      await appeler('/api/admin/conseillers', {
        methode: 'POST',
        corps: { identifiant: champIdentifiant.value, nom: champNom.value },
      });
      champIdentifiant.value = '';
      champNom.value = '';
      await charger();
      afficherMessage(messageAction, 'Conseiller créé. Il peut se connecter avec son identifiant.', 'succes');
    } catch (erreur) {
      afficherMessage(messageAction, erreur.message, 'erreur');
    } finally {
      bouton.disabled = false;
    }
  };

  const boutonCreer = el('button', { class: 'primaire', texte: 'Créer l’accès' });
  boutonCreer.addEventListener('click', () => creer(boutonCreer));

  const basculer = async (conseiller) => {
    try {
      await appeler(`/api/admin/conseillers/${encodeURIComponent(conseiller.identifiant)}`, {
        methode: 'PATCH',
        corps: { actif: !conseiller.actif },
      });
      await charger();
    } catch (erreur) {
      afficherMessage(messageAction, erreur.message, 'erreur');
    }
  };

  const renommer = async (conseiller) => {
    const nom = window.prompt('Nouveau nom :', conseiller.nom);
    if (nom === null) return;
    try {
      await appeler(`/api/admin/conseillers/${encodeURIComponent(conseiller.identifiant)}`, {
        methode: 'PATCH',
        corps: { nom },
      });
      await charger();
    } catch (erreur) {
      afficherMessage(messageAction, erreur.message, 'erreur');
    }
  };

  return el('div', {}, [
    carte('Nouvel accès conseiller', null, [
      el('p', {
        class: 'sous-titre',
        texte: 'L’identifiant est la clé d’accès : il suffit à ouvrir la page personnelle, '
          + 'sans mot de passe. Choisissez-le en conséquence et désactivez l’accès au départ '
          + 'd’un collaborateur.',
      }),
      el('div', { class: 'grille-saisie' }, [
        el('div', { class: 'champ' }, [el('label', { texte: 'Identifiant' }), champIdentifiant]),
        el('div', { class: 'champ' }, [el('label', { texte: 'Nom et prénom' }), champNom]),
      ]),
      el('div', { class: 'barre-saisie' }, boutonCreer),
    ]),
    carte('Conseillers enregistrés', `${d.conseillers.length} au total`,
      d.conseillers.length
        ? defilable(el('table', {}, [
          el('thead', {}, el('tr', {}, [
            el('th', { texte: 'Nom' }),
            el('th', { texte: 'Identifiant' }),
            el('th', { texte: 'État' }),
            el('th', { texte: '' }),
          ])),
          el('tbody', {}, d.conseillers.map((conseiller) => el('tr', {}, [
            el('td', { texte: conseiller.nom }),
            el('td', { texte: conseiller.identifiant }),
            el('td', {}, el('span', {
              class: `puce ${conseiller.actif ? 'oui' : 'inactif'}`,
              texte: conseiller.actif ? 'actif' : 'désactivé',
            })),
            el('td', {}, [
              el('button', { class: 'discret', texte: 'Renommer', onclick: () => renommer(conseiller) }),
              ' ',
              el('button', {
                class: conseiller.actif ? 'discret danger' : 'discret',
                texte: conseiller.actif ? 'Désactiver' : 'Réactiver',
                onclick: () => basculer(conseiller),
              }),
            ]),
          ]))),
        ]))
        : el('p', { class: 'vide', texte: 'Aucun conseiller pour l’instant.' })),
  ]);
}

demarrer();
