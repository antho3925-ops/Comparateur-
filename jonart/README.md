# Site vitrine JON'ART SRL

Site bilingue (FR par défaut, ES) de JON'ART SRL, artisan à Linkebeek (Bruxelles) et en Espagne.
Construit avec [Astro](https://astro.build) : un site statique et rapide, sans base de données.

| Mode | Commande | Résultat |
|---|---|---|
| Aperçu client (phase 1) | `npm run build:preview` | `dist-preview/` à zipper + `apercu-pdf/` (PDF desktop et mobile) |
| Production (phase 2) | `npm run build` | `dist/`, publié par Netlify |
| Développement | `npm run dev` | http://localhost:4321 avec rechargement automatique |

---

## 1. Lancer en local

Prérequis : [Node.js](https://nodejs.org) 18.20 ou plus récent (version LTS conseillée).

```bash
cd jonart
npm install
npm run dev          # ouvre http://localhost:4321
```

Pour tester l'aperçu en local : `PREVIEW=true npm run dev` (macOS/Linux) ou
`set PREVIEW=true&& npm run dev` (Windows, invite de commandes).

## 2. Phase 1 : aperçu hors ligne pour le client

```bash
npm run build:preview
```

Cette commande unique :
1. construit le site avec `PREVIEW=true` : bandeau et filigrane « APERÇU – NON PUBLIÉ », formulaire
   désactivé, balise `noindex`, `robots.txt` bloquant, aucun suivi ni cookie ;
2. rend tous les chemins relatifs : le site s'ouvre par **double-clic sur `index.html`**, sans serveur
   ni connexion Internet (polices et images incluses) ;
3. génère `apercu-pdf/JONART-apercu-desktop.pdf` et `apercu-pdf/JONART-apercu-mobile.pdf`
   (accueil, présentation, réalisations, devis, Instagram, accueil ES, devis ES).

**À envoyer au client** : le dossier `dist-preview/` zippé (avec son `LISEZ-MOI.txt`) et les deux PDF.

> Le PDF utilise Chromium via `playwright-core`. Si aucun Chromium n'est trouvé, lancez une fois
> `npx playwright install chromium`, ou indiquez son chemin : `CHROMIUM_PATH=/chemin/chrome npm run build:preview`.
> Pour ne générer que le site : `npm run build:preview:nopdf`.

Dans l'aperçu, les avis clients et le bloc avant/après apparaissent comme emplacements
**[À COMPLÉTER]**. En production, ils restent masqués tant qu'ils ne sont pas remplis.

## 3. Passer de l'aperçu à la production

Il n'y a rien à modifier dans le code : la variable `PREVIEW` vaut `false` par défaut et `netlify.toml`
la fixe explicitement. En production :
- plus de filigrane ni de bandeau ;
- le formulaire de devis est actif et envoie les demandes à **jonartsrl@hotmail.com** ;
- les balises canonical, hreflang FR/ES, Open Graph, le schema.org `LocalBusiness`
  (type `GeneralContractor`), `sitemap.xml` et `robots.txt` sont générés.

Avant la mise en ligne, complétez toutes les mentions `[À COMPLÉTER]` / `[À VÉRIFIER]`
(recherche dans le projet : `grep -rn "À COMPLÉTER" src public`).

## 4. Déployer sur Netlify

1. Poussez le dépôt sur GitHub, puis sur [netlify.com](https://app.netlify.com) : *Add new site →
   Import an existing project* et choisissez le dépôt.
2. **Base directory** : `jonart`. Les autres réglages sont lus dans `netlify.toml`
   (`npm run build`, dossier `dist`, fonctions dans `netlify/functions`).
3. *Site configuration → Environment variables* :

   | Variable | Valeur |
   |---|---|
   | `SITE_URL` | `https://votre-domaine.be` (domaine définitif) |
   | `RESEND_API_KEY` | clé API [Resend](https://resend.com) |
   | `MAIL_FROM` | `Site JON'ART <site@votre-domaine.be>` (adresse d'un domaine vérifié chez Resend) |
   | `MAIL_TO` | facultatif, `jonartsrl@hotmail.com` par défaut |

4. **E-mails du formulaire** : créez un compte Resend (offre gratuite suffisante pour un site
   vitrine) et vérifiez le nom de domaine (enregistrements DNS fournis par Resend). Une adresse
   Hotmail ne peut pas servir d'expéditeur, d'où l'utilisation d'un domaine. Les demandes arrivent
   dans Hotmail, avec « Répondre » directement vers le client.
5. *Domain management* : ajoutez le domaine ; le HTTPS est automatique.

### Le formulaire de devis (`netlify/functions/devis.mjs`)
- Validation côté serveur de tous les champs (formats, longueurs, consentement RGPD).
- Anti-spam sans service tiers ni cookie : champ piège invisible, délai minimum de 3 secondes,
  limite de liens. Les robots reçoivent une fausse confirmation.
- Fonctionne aussi sans JavaScript (redirection vers `/devis/merci/`).

## 5. Espace administrateur

Adresse : `https://votre-domaine.be/admin/`. Le client y modifie textes, services, coordonnées,
galerie, paires avant/après et avis. Chaque enregistrement republie le site en 1 à 2 minutes.

**Photos** : téléversées dans l'admin, elles sont automatiquement redimensionnées et converties en
WebP au build (plusieurs tailles de 360 à 1200 px, chargement différé). On peut envoyer directement
les photos du téléphone. Remplissez toujours la « description de la photo » en FR et ES
(accessibilité et référencement).

### Activer l'accès (une seule fois)
1. Netlify → *Project configuration → Identity* → **Enable Identity**.
2. *Registration* → **Invite only** (personne ne peut créer de compte seul).
3. *Services → Git Gateway* → **Enable**.
4. *Identity → Invite users* → e-mail du client. Il reçoit un lien pour choisir son mot de passe.
5. Vérifiez dans `public/admin/config.yml` que `branch:` correspond à la branche publiée (`main` par défaut).

> Netlify avait annoncé en 2025 l'abandon d'Identity, puis est revenu sur cette décision début 2026.
> Vérifiez la situation au moment du déploiement. Si Identity n'est plus disponible, l'alternative
> sans changer le site est [DecapBridge](https://decapbridge.com) (identifiant + mot de passe pour
> Decap CMS) : seule la section `backend:` de `config.yml` change.

### Changer le mot de passe administrateur
- **Le client** : sur `/admin/`, *Forgot password?* → lien reçu par e-mail → nouveau mot de passe.
- **Vous (développeur)** : Netlify → *Identity* → choisir l'utilisateur → *Send reset password email*.
  Pour retirer un accès : *Delete user*.

### Pourquoi Decap CMS ? (options étudiées)

| | **Astro + Decap CMS** (retenu) | Next.js + Payload CMS |
|---|---|---|
| Hébergement | Site statique : offre gratuite Netlify | Serveur Node + base de données (≈ 5 à 25 €/mois) |
| Sécurité, maintenance | Rien à mettre à jour côté serveur, rien à pirater | Serveur, base, mises à jour de sécurité à suivre |
| Sauvegarde | Chaque modification est un commit Git (historique complet) | Sauvegardes de la base à organiser |
| Ergonomie admin | Simple, suffisante pour textes et galerie | Plus riche (rôles, brouillons, médiathèque avancée) |
| Délai de publication | 1 à 2 min (rebuild) | Immédiat |
| Limites | Pas de vraie médiathèque, pas d'aperçu en direct | Plus coûteux et plus complexe pour un site vitrine |

Pour un artisan qui modifie quelques textes et ajoute des photos de chantier, Decap offre le meilleur
rapport simplicité, coût et sécurité.

## 6. Sauvegarder

- **Contenu et code** : tout est versionné dans Git (GitHub). Chaque modification faite dans l'admin
  crée un commit ; on peut revenir à n'importe quelle version. Sauvegarde hors ligne :
  `git clone` du dépôt, ou *Code → Download ZIP* sur GitHub, par exemple une fois par trimestre.
- **Site publié** : Netlify conserve chaque déploiement (*Deploys* → choisir une version →
  *Publish deploy* pour revenir en arrière en un clic).
- **Demandes de devis** : elles ne sont stockées nulle part sur le site, seulement dans la boîte
  Hotmail. Pensez à sauvegarder cette boîte.

## 7. Où modifier quoi

```
jonart/
├── src/content/        Textes éditables (aussi via l'admin) : accueil, présentation, services,
│                       galerie (+ avant/après), avis, coordonnées
├── src/i18n/ui.js      Libellés fixes FR/ES (menus, boutons, formulaire)
├── src/views/          Mise en page de chaque page (partagée FR/ES)
├── src/pages/          Adresses des pages (FR à la racine, ES dans /es/)
├── src/components/     En-tête, pied de page, galerie, avant/après, avis, formulaire…
├── src/styles/         Feuille de style (couleurs et polices dans :root)
├── src/assets/         Logo, photos d'origine (photos/) et photos ajoutées via l'admin (galerie/)
├── public/admin/       Espace administrateur Decap CMS
├── netlify/functions/  Envoi du formulaire de devis
├── scripts/            Build aperçu, chemins relatifs, PDF, build production
└── photos-originales/  Montages fournis par le client (sources des photos découpées)
```

### Règles de contenu
- **Avis clients** : uniquement de vrais avis, publiés avec l'accord du client. Les faux avis sont
  interdits (pratique commerciale déloyale, Code de droit économique). Aucune note étoilée n'est
  affichée ni déclarée aux moteurs de recherche.
- **Aucune coordonnée bancaire** sur le site.
- Pas de chiffres, certifications ou labels non vérifiés.

### Cookies
Le site n'utilise ni mesure d'audience, ni publicité, ni contenu Instagram intégré, et les polices
sont hébergées localement : **aucun bandeau cookies n'est nécessaire**. Si vous ajoutez un jour
Google Analytics, une carte Google Maps intégrée ou un widget Instagram, il faudra ajouter un
bandeau de consentement et mettre à jour la politique de confidentialité.
