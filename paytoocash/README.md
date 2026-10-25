# Site Paytoocash

Site vitrine du magasin **Paytoocash** (achat-vente d'occasion et rachat cash,
16 rue Denis Papin, 25300 Pontarlier). Site statique (HTML, CSS, JavaScript),
sans étape de compilation, pensé d'abord pour le mobile.

| Page | Fichier |
|---|---|
| Accueil | `index.html` |
| Catalogue (recherche, filtres, tri) | `catalogue.html` |
| Fiche article | `article.html?id=…` |
| On rachète vos objets | `rachat.html` |
| Administration | `/admin` (`admin.html`) |
| Mentions légales | `mentions-legales.html` (champs `[à compléter]`) |

## À faire avant la mise en ligne

1. **Photos** : copier les photos dans `paytoocash-photos/`.
2. **Logo** : `paytoocash-logo/` contient le logo du magasin (bonhomme aux
   pouces levés), redessiné en vectoriel d'après la carte de visite.
3. **Supabase** (pour l'administration) : suivre [SUPABASE.md](SUPABASE.md).
4. **Mentions légales** : compléter SIRET, forme juridique, hébergeur.

## Lancer en local

Les modules JavaScript ne fonctionnent pas en ouvrant le fichier directement :
il faut un petit serveur.

```bash
cd paytoocash
python3 -m http.server 8000      # ou : npx serve .
```

Puis ouvrir http://localhost:8000. En local, l'admin est à
http://localhost:8000/admin.html (l'adresse courte `/admin` marche une fois en ligne).

## Mode démo / mode Supabase

- **Sans Supabase** (`js/config.js` vide) : le site public lit
  `catalogue-paytoocash.json` en lecture seule. L'admin s'ouvre en mode démo
  et montre les articles « à vérifier ». Parfait pour faire valider le client.
- **Avec Supabase** : au premier passage dans l'admin, le JSON et les photos
  sont importés automatiquement ; ensuite tout se gère depuis `/admin`.

Règles d'affichage : un article `disponible: false` apparaît grisé avec un badge
« Vendu », en bas de liste, sans boutons de contact. Tout champ contenant
« à confirmer », et la note interne de prix, n'est jamais affiché au public ;
ces articles sont regroupés en haut de l'admin avec une pastille « à vérifier ».

## Déployer (gratuit, sans nom de domaine)

Le site est dans le sous-dossier `paytoocash/` du dépôt.

**Netlify** : *Add new site → Import an existing project* → choisir le dépôt et
la branche → *Base directory* : `paytoocash` → *Build command* : vide →
*Publish directory* : `paytoocash`. Le site est en ligne sur
`https://<nom>.netlify.app` (nom modifiable dans *Site configuration*).

**Vercel** : *Add New → Project* → importer le dépôt → *Root Directory* :
`paytoocash` → *Framework Preset* : `Other` → *Deploy*.

Plus tard, le nom de domaine s'ajoute dans *Domain management* (Netlify) ou
*Settings → Domains* (Vercel), sans rien changer au code.

## Ajouter un article (commerçant)

1. Sur le téléphone, ouvrir `https://<adresse-du-site>/admin` et saisir le mot de passe.
   Astuce : « Ajouter à l'écran d'accueil » pour l'avoir comme une appli.
2. **Ajouter un article** → **Ajouter des photos** (appareil photo ou galerie,
   plusieurs possibles ; l'étoile met une photo en premier).
3. Remplir titre, prix, catégorie, état, garantie, ce qui est inclus
   (les champs stockage, couleur, matière… sont dans « Champs optionnels »).
4. **Enregistrer** : l'article est en ligne immédiatement.

Article vendu : bouton **Vendu** dans la liste (un clic). « Remettre en vente »
l'annule.

## Réservations et estimations

- **Réserver 24 h** (fiche article) : le client laisse son nom et son
  téléphone ; l'article affiche « Réservé » pendant 24 h, puis revient seul
  en vente. Sans Supabase (démo), le bouton envoie un SMS au magasin.
- **Demande d'estimation** (page « On rachète ») : description, état, prix
  souhaité et jusqu'à 4 photos. Sans Supabase, la demande part par WhatsApp.
- Le commerçant retrouve tout dans l'onglet **Demandes** de l'admin
  (pastille quand il y a du nouveau) : appeler ou écrire sur WhatsApp en un
  clic, annuler une réservation, marquer une estimation « Traitée ».

## Avis Google et photos du magasin

Dans **Infos du magasin** : recopier de vrais avis de la fiche Google (auteur,
note, texte), la note moyenne et le lien ; ajouter des photos des salles de
vente. Les deux sections de l'accueil restent masquées tant qu'elles sont vides.

## Structure

```
paytoocash/
├── *.html                    Pages
├── catalogue-paytoocash.json Données de départ (démo + import initial)
├── paytoocash-photos/        Photos du catalogue de départ
├── paytoocash-logo/          Logo et icônes
├── css/style.css, admin.css
├── js/config.js              Clés Supabase (à remplir)
├── js/store.js               Lecture des données (Supabase ou JSON)
├── js/layout.js, infos.js    En-tête, pied, cartes, animations
├── js/home.js, catalogue.js, article.js, rachat.js, admin.js
├── js/icons.js               Icônes SVG originales des catégories
├── supabase/schema.sql       Tables, sécurité, stockage
├── netlify.toml, vercel.json Déploiement (/admin, en-têtes)
└── SUPABASE.md               Mise en place de Supabase pas à pas
```
