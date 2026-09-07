// Sauvegardes quotidiennes.
//
// Le disque de l'hébergeur protège d'un redémarrage, pas d'une fausse
// manœuvre : un fichier corrompu ou une donnée effacée par erreur se propage à
// la copie unique. Une copie datée par journée donne de quoi revenir en
// arrière, et coûte quelques kilo-octets.
//
// Ce n'est pas une sauvegarde hors site pour autant : elle vit sur le même
// disque que l'original. Le bouton « Télécharger la sauvegarde » de l'espace
// administrateur sert à cela.

import { copyFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { aujourdhui, decale } from './dates.mjs';

const HEURE = 3600000;

/** Nom d'une copie : suivi-2026-09-07.json. */
const nomCopie = (jour) => `suivi-${jour}.json`;

/**
 * Fait la copie du jour si elle n'existe pas encore, puis efface celles qui
 * ont dépassé l'âge retenu. Renvoie le nom du fichier écrit, ou null.
 */
export async function sauvegarderSiNecessaire(chemin, dossier, joursGardes = 30) {
  if (!existsSync(chemin)) return null;
  await mkdir(dossier, { recursive: true });

  const jour = aujourdhui();
  const destination = join(dossier, nomCopie(jour));
  let ecrite = null;

  if (!existsSync(destination)) {
    await copyFile(chemin, destination);
    ecrite = nomCopie(jour);
  }

  const limite = nomCopie(decale(jour, -joursGardes));
  for (const nom of await readdir(dossier)) {
    // La comparaison de chaînes suffit : le nom porte la date en tête à queue.
    if (/^suivi-\d{4}-\d{2}-\d{2}\.json$/.test(nom) && nom < limite) {
      await unlink(join(dossier, nom)).catch(() => {});
    }
  }
  return ecrite;
}

/**
 * Lance la copie au démarrage puis la reprend chaque heure. Une heure suffit :
 * la copie du jour se fait dès le premier passage après minuit, et les
 * suivantes ne font rien.
 *
 * Une sauvegarde qui échoue ne doit jamais empêcher l'équipe de travailler :
 * l'erreur est signalée sur la console, et le serveur continue.
 */
export function programmerSauvegardes(chemin, dossier, joursGardes = 30) {
  const passer = () => sauvegarderSiNecessaire(chemin, dossier, joursGardes)
    .then((ecrite) => { if (ecrite) console.log(`Sauvegarde du jour : ${ecrite}`); })
    .catch((erreur) => console.error('Sauvegarde impossible :', erreur.message));

  passer();
  const minuterie = setInterval(passer, HEURE);
  minuterie.unref();
  return () => clearInterval(minuterie);
}
