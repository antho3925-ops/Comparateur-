import { appeler, afficherMessage } from './commun.js';

const formulaire = document.getElementById('formulaire');
const champ = document.getElementById('identifiant');
const message = document.getElementById('message');
const bouton = formulaire.querySelector('button');

// Une session encore valable évite de redemander l'identifiant à chaque onglet.
appeler('/api/session')
  .then((s) => {
    if (s.role === 'conseiller') window.location.replace('/conseiller');
    else if (s.role === 'admin') window.location.replace('/admin');
  })
  .catch(() => {});

formulaire.addEventListener('submit', async (evenement) => {
  evenement.preventDefault();
  afficherMessage(message, '');
  bouton.disabled = true;
  try {
    await appeler('/api/connexion', {
      methode: 'POST',
      corps: { identifiant: champ.value },
    });
    window.location.href = '/conseiller';
  } catch (erreur) {
    afficherMessage(message, erreur.message);
    champ.select();
  } finally {
    bouton.disabled = false;
  }
});
