// Sessions et accès administrateur.
//
// Les conseillers se connectent par identifiant seul, sans mot de passe :
// c'est le choix explicite du responsable d'équipe. La plateforme ne contient
// aucune donnée client, seulement des compteurs d'activité interne. La
// conséquence à assumer est qu'un identifiant connu suffit à voir la page d'un
// collègue — d'où le second rempart : la page administrateur, elle, est
// protégée par un code, et c'est elle seule qui expose le classement et les
// chiffres de toute l'équipe.

import {
  createHmac, randomBytes, timingSafeEqual, scryptSync,
} from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';

// Deux-points : le seul séparateur sûr ici, puisque les identifiants admettent
// le point, le tiret et le soulignement. Un point découperait « a.roux » en
// deux et rendrait tous les jetons illisibles.
const SEPARATEUR = ':';

const DUREE_CONSEILLER = 12 * 3600;      // une journée de travail
const DUREE_ADMIN = 4 * 3600;            // plus court : accès sensible
const NOM_COOKIE = 'suivi_session';

export class Securite {
  constructor(config) {
    this.secret = config.secret;
    this.adminSel = config.adminSel;
    this.adminEmpreinte = config.adminEmpreinte;
    this.tentatives = new Map();
  }

  /**
   * Charge — ou crée — la configuration de sécurité.
   *
   * Au premier démarrage, le code administrateur vient, dans l'ordre : de la
   * variable d'environnement SUIVI_CODE_ADMIN ; à défaut de l'empreinte livrée
   * avec l'installation ; à défaut d'un tirage au hasard, affiché une seule
   * fois sur la console.
   *
   * Une empreinte livrée n'est pas un code : elle vérifie un code proposé,
   * elle ne le révèle pas. Le code en clair n'est écrit nulle part.
   */
  static async charger(chemin, {
    codeAdmin = process.env.SUIVI_CODE_ADMIN,
    empreinteInitiale = null,
  } = {}) {
    let config = null;
    if (existsSync(chemin)) {
      config = JSON.parse(await readFile(chemin, 'utf8'));
    }

    let codeAffiche = null;
    if (!config) {
      config = { secret: randomBytes(32).toString('hex') };

      if (!codeAdmin && empreinteInitiale) {
        config.adminSel = empreinteInitiale.sel;
        config.adminEmpreinte = empreinteInitiale.empreinte;
      } else {
        const code = codeAdmin || randomBytes(9).toString('base64url');
        if (!codeAdmin) codeAffiche = code;
        const sel = randomBytes(16).toString('hex');
        config.adminSel = sel;
        config.adminEmpreinte = empreinte(code, sel);
      }

      await mkdir(dirname(chemin), { recursive: true });
      await writeFile(chemin, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    } else if (codeAdmin) {
      // La variable d'environnement fait autorité : elle permet de changer le
      // code sans supprimer le fichier de configuration.
      const attendu = empreinte(codeAdmin, config.adminSel);
      if (attendu !== config.adminEmpreinte) {
        config.adminEmpreinte = attendu;
        await writeFile(chemin, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
      }
    }

    const securite = new Securite(config);
    securite.codeGenere = codeAffiche;
    return securite;
  }

  // --- Code administrateur --------------------------------------------------

  /** Limite les essais : 5 par tranche de 5 minutes et par adresse. */
  essaiAutorise(cle) {
    const maintenant = Date.now();
    // Purge des fenêtres expirées : sans elle, la table grandirait d'une entrée
    // par adresse ayant tenté sa chance, sans jamais rien rendre.
    if (this.tentatives.size > 500) {
      for (const [autre, entree] of this.tentatives) {
        if (maintenant - entree.depuis > 300000) this.tentatives.delete(autre);
      }
    }
    const entree = this.tentatives.get(cle);
    if (!entree || maintenant - entree.depuis > 300000) {
      this.tentatives.set(cle, { depuis: maintenant, nombre: 0 });
      return true;
    }
    return entree.nombre < 5;
  }

  compterEchec(cle) {
    const entree = this.tentatives.get(cle);
    if (entree) entree.nombre += 1;
  }

  oublierEchecs(cle) {
    this.tentatives.delete(cle);
  }

  codeAdminValide(code) {
    if (typeof code !== 'string' || code.length === 0 || code.length > 200) return false;
    const attendu = Buffer.from(this.adminEmpreinte, 'hex');
    const propose = Buffer.from(empreinte(code, this.adminSel), 'hex');
    return attendu.length === propose.length && timingSafeEqual(attendu, propose);
  }

  // --- Jetons de session ----------------------------------------------------

  creerJeton(role, identifiant) {
    const duree = role === 'admin' ? DUREE_ADMIN : DUREE_CONSEILLER;
    const expiration = Math.floor(Date.now() / 1000) + duree;
    const corps = `${role}${SEPARATEUR}${identifiant}${SEPARATEUR}${expiration}`;
    return { valeur: `${corps}${SEPARATEUR}${this.#signer(corps)}`, duree };
  }

  lireJeton(jeton) {
    if (typeof jeton !== 'string') return null;
    const morceaux = jeton.split(SEPARATEUR);
    if (morceaux.length !== 4) return null;
    const [role, identifiant, expiration, signature] = morceaux;
    const corps = `${role}${SEPARATEUR}${identifiant}${SEPARATEUR}${expiration}`;
    const attendue = Buffer.from(this.#signer(corps), 'hex');
    let proposee;
    try {
      proposee = Buffer.from(signature, 'hex');
    } catch {
      return null;
    }
    if (attendue.length !== proposee.length || !timingSafeEqual(attendue, proposee)) return null;
    if (Number(expiration) * 1000 < Date.now()) return null;
    if (role !== 'admin' && role !== 'conseiller') return null;
    return { role, identifiant };
  }

  #signer(corps) {
    return createHmac('sha256', this.secret).update(corps).digest('hex');
  }
}

function empreinte(code, sel) {
  return scryptSync(code, sel, 32).toString('hex');
}

// --- Cookies ---------------------------------------------------------------

export function lireCookie(requete, nom = NOM_COOKIE) {
  const brut = requete.headers.cookie;
  if (!brut) return null;
  for (const morceau of brut.split(';')) {
    const separateur = morceau.indexOf('=');
    if (separateur < 0) continue;
    if (morceau.slice(0, separateur).trim() === nom) {
      return decodeURIComponent(morceau.slice(separateur + 1).trim());
    }
  }
  return null;
}

export function poserCookie(reponse, valeur, duree, securise) {
  const parties = [
    `${NOM_COOKIE}=${encodeURIComponent(valeur)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${duree}`,
  ];
  if (securise) parties.push('Secure');
  reponse.setHeader('Set-Cookie', parties.join('; '));
}

export function effacerCookie(reponse, securise) {
  const parties = [`${NOM_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (securise) parties.push('Secure');
  reponse.setHeader('Set-Cookie', parties.join('; '));
}

/** Identifiant normalisé : minuscules, sans espaces ni caractères exotiques. */
export function normaliserIdentifiant(brut) {
  if (typeof brut !== 'string') return null;
  const cle = brut.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(cle)) return null;
  return cle;
}
