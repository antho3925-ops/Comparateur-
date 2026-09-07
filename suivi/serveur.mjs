#!/usr/bin/env node
// Serveur de la plateforme de suivi. Node seul, sans dépendance : le dépôt
// n'en a aucune et cet outil n'a pas besoin d'en introduire.
//
//   node suivi/serveur.mjs            écoute sur http://localhost:8080
//   PORT=3000 node suivi/serveur.mjs
//   SUIVI_CODE_ADMIN=… node suivi/serveur.mjs

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Stockage } from './lib/stockage.mjs';
import { installerEquipeInitiale } from './lib/installation.mjs';
import { programmerSauvegardes } from './lib/sauvegarde.mjs';
import { Securite, lireCookie } from './lib/sessions.mjs';
import * as api from './lib/api.mjs';
import { ErreurHttp } from './lib/api.mjs';

const RACINE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(RACINE, 'public');
const PORT = Number(process.env.PORT) || 8080;
// Là où vivent l'état et la configuration. Même variable que pour
// suivi/gestion.mjs, sans quoi la commande de gestion et le serveur
// travailleraient chacun sur un dossier différent sans le dire.
const DONNEES = process.env.SUIVI_DONNEES || join(RACINE, 'data');
const HOTE = process.env.HOTE || '0.0.0.0';
// Derrière un reverse proxy TLS, poser SUIVI_HTTPS=1 pour que le cookie de
// session porte l'attribut Secure.
const SECURISE = process.env.SUIVI_HTTPS === '1';
const TAILLE_MAX_CORPS = 64 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const PAGES = {
  '/': 'index.html',
  '/conseiller': 'conseiller.html',
  '/admin': 'admin.html',
};

// Table de routage : méthode + motif -> gestionnaire.
const ROUTES = [
  ['POST', /^\/api\/connexion$/, api.connexion],
  ['POST', /^\/api\/connexion-admin$/, api.connexionAdmin],
  ['POST', /^\/api\/deconnexion$/, api.deconnexion],
  ['GET', /^\/api\/session$/, api.session],
  ['GET', /^\/api\/conseiller$/, api.tableauConseiller],
  ['PUT', /^\/api\/saisie$/, api.enregistrerSaisie],
  ['GET', /^\/api\/admin\/tableau$/, api.tableauAdmin],
  ['GET', /^\/api\/admin\/journal$/, api.journalAdmin],
  ['GET', /^\/api\/admin\/sauvegarde$/, api.telechargerSauvegarde],
  ['POST', /^\/api\/admin\/conseillers$/, api.creerConseiller],
  ['PATCH', /^\/api\/admin\/conseillers\/(?<identifiant>[^/]+)$/, api.modifierConseiller],
  ['PUT', /^\/api\/admin\/objectifs\/(?<identifiant>[^/]+)$/, api.enregistrerObjectifs],
];

export async function demarrer({
  port = PORT,
  hote = HOTE,
  dossierDonnees = DONNEES,
  equipeInitiale = join(RACINE, 'equipe-initiale.json'),
  accesInitial = join(RACINE, 'acces-initial.json'),
} = {}) {
  const stockage = new Stockage(join(dossierDonnees, 'suivi.json'));
  await stockage.charger();
  const installes = await installerEquipeInitiale(stockage, equipeInitiale);
  const securite = await Securite.charger(join(dossierDonnees, 'config.json'), {
    empreinteInitiale: await lireEmpreinteInitiale(accesInitial),
  });
  const arreterSauvegardes = programmerSauvegardes(
    join(dossierDonnees, 'suivi.json'), join(dossierDonnees, 'sauvegardes'));

  const serveur = createServer((requete, reponse) => {
    traiter(requete, reponse, { stockage, securite }).catch((erreur) => {
      if (!reponse.headersSent) envoyerJson(reponse, 500, { erreur: 'Erreur interne.' });
      else reponse.end();
      console.error(erreur);
    });
  });

  serveur.on('close', arreterSauvegardes);
  await new Promise((resoudre) => serveur.listen(port, hote, resoudre));
  return { serveur, stockage, securite, installes, port: serveur.address().port };
}

/**
 * Empreinte du code administrateur livrée avec l'installation, s'il y en a une.
 * Elle ne sert qu'à la toute première configuration : une fois config.json
 * écrit, ce fichier n'est plus jamais consulté. Absent ou illisible, on
 * l'ignore et le premier démarrage tire un code au hasard, comme avant.
 */
async function lireEmpreinteInitiale(chemin) {
  try {
    const { administrateur } = JSON.parse(await readFile(chemin, 'utf8'));
    if (!administrateur) return null;
    const { sel, empreinte } = administrateur;
    const valide = (v) => typeof v === 'string' && /^[0-9a-f]+$/.test(v) && v.length >= 32;
    return valide(sel) && valide(empreinte) ? { sel, empreinte } : null;
  } catch {
    return null;
  }
}

async function traiter(requete, reponse, contexte) {
  const url = new URL(requete.url, `http://${requete.headers.host || 'localhost'}`);
  const chemin = url.pathname;

  reponse.setHeader('X-Content-Type-Options', 'nosniff');
  reponse.setHeader('Referrer-Policy', 'same-origin');

  if (chemin === '/api/flux') return flux(requete, reponse, contexte);

  for (const [methode, motif, gestionnaire] of ROUTES) {
    const trouve = motif.exec(chemin);
    if (!trouve) continue;
    if (requete.method !== methode) return envoyerJson(reponse, 405, { erreur: 'Méthode non autorisée.' });
    return appeler(requete, reponse, contexte, gestionnaire, trouve.groups || {}, url);
  }

  if (chemin.startsWith('/api/')) return envoyerJson(reponse, 404, { erreur: 'Route inconnue.' });
  if (requete.method !== 'GET' && requete.method !== 'HEAD') {
    return envoyerJson(reponse, 405, { erreur: 'Méthode non autorisée.' });
  }
  return fichier(chemin, reponse);
}

async function appeler(requete, reponse, contexte, gestionnaire, params, url) {
  try {
    const corps = await lireCorps(requete);
    const session = contexte.securite.lireJeton(lireCookie(requete));
    const resultat = await gestionnaire({
      requete,
      reponse,
      url,
      params,
      corps,
      session,
      etat: contexte.stockage.lire(),
      stockage: contexte.stockage,
      securite: contexte.securite,
      securise: SECURISE,
      cleClient: adresse(requete),
    });
    // Un gestionnaire qui a déjà répondu lui-même — un téléchargement, par
    // exemple — n'attend pas qu'on écrive une seconde réponse par-dessus.
    if (reponse.headersSent) return undefined;
    envoyerJson(reponse, 200, resultat ?? { ok: true });
  } catch (erreur) {
    if (reponse.headersSent) { reponse.end(); return undefined; }
    if (erreur instanceof ErreurHttp) return envoyerJson(reponse, erreur.code, { erreur: erreur.message });
    if (erreur instanceof SyntaxError) return envoyerJson(reponse, 400, { erreur: 'Corps de requête illisible.' });
    throw erreur;
  }
  return undefined;
}

/** Flux temps réel : chaque changement d'état réveille les navigateurs ouverts. */
function flux(requete, reponse, { stockage, securite }) {
  const session = securite.lireJeton(lireCookie(requete));
  if (!session) return envoyerJson(reponse, 401, { erreur: 'Connexion requise.' });

  reponse.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  reponse.write('retry: 3000\n\n');
  reponse.write('event: pret\ndata: {}\n\n');

  const desabonner = stockage.abonner((evenement) => {
    reponse.write(`event: ${evenement}\ndata: ${JSON.stringify({ a: Date.now() })}\n\n`);
  });
  // Un commentaire périodique tient la connexion ouverte à travers les proxys
  // qui coupent les flux inactifs.
  const battement = setInterval(() => reponse.write(': .\n\n'), 25000);

  const fermer = () => {
    clearInterval(battement);
    desabonner();
  };
  requete.on('close', fermer);
  requete.on('error', fermer);
  return undefined;
}

async function fichier(chemin, reponse) {
  const relatif = PAGES[chemin] || normalize(chemin).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  const complet = join(PUBLIC, relatif);
  // Comparer sur le séparateur : sans lui, un dossier voisin nommé
  // « public-autre » passerait le test de préfixe.
  if (complet !== PUBLIC && !complet.startsWith(PUBLIC + sep)) {
    return envoyerTexte(reponse, 403, 'Interdit');
  }

  try {
    const info = await stat(complet);
    if (!info.isFile()) return envoyerTexte(reponse, 404, 'Page introuvable');
    const contenu = await readFile(complet);
    reponse.writeHead(200, {
      'Content-Type': TYPES[extname(complet)] || 'application/octet-stream',
      'Content-Length': contenu.length,
      'Cache-Control': 'no-cache',
    });
    reponse.end(contenu);
  } catch {
    envoyerTexte(reponse, 404, 'Page introuvable');
  }
  return undefined;
}

function lireCorps(requete) {
  if (requete.method === 'GET' || requete.method === 'HEAD') return Promise.resolve({});
  return new Promise((resoudre, rejeter) => {
    const morceaux = [];
    let taille = 0;
    requete.on('data', (morceau) => {
      taille += morceau.length;
      if (taille > TAILLE_MAX_CORPS) {
        rejeter(new ErreurHttp(413, 'Requête trop volumineuse.'));
        requete.destroy();
        return;
      }
      morceaux.push(morceau);
    });
    requete.on('end', () => {
      const brut = Buffer.concat(morceaux).toString('utf8').trim();
      if (!brut) return resoudre({});
      try {
        const lu = JSON.parse(brut);
        return resoudre(lu && typeof lu === 'object' ? lu : {});
      } catch (erreur) {
        return rejeter(erreur);
      }
    });
    requete.on('error', rejeter);
  });
}

function envoyerJson(reponse, code, corps) {
  const contenu = Buffer.from(JSON.stringify(corps), 'utf8');
  reponse.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': contenu.length,
    'Cache-Control': 'no-store',
  });
  reponse.end(contenu);
}

function envoyerTexte(reponse, code, texte) {
  reponse.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  reponse.end(texte);
}

function adresse(requete) {
  return requete.socket.remoteAddress || 'inconnu';
}

const lanceDirectement = process.argv[1]
  && fileURLToPath(import.meta.url) === normalize(process.argv[1]);

if (lanceDirectement) {
  const { port, securite, installes } = await demarrer();
  console.log(`Suivi de performance — http://localhost:${port}`);
  if (installes.length) {
    console.log(`\n  Équipe de départ installée — ${installes.length} accès conseiller :`);
    for (const c of installes) console.log(`    ${c.identifiant.padEnd(16)} ${c.nom}`);
  }
  if (securite.codeGenere) {
    console.log(`\n  Code administrateur (affiché une seule fois) : ${securite.codeGenere}`);
    console.log('  Notez-le. Pour en fixer un vous-même : SUIVI_CODE_ADMIN=… node suivi/serveur.mjs\n');
  }
}
