# Pokestocks – boutique de cartes à collectionner

Site de vente avec panier, produits en stock, **précommandes** et paiement par
**carte bancaire, Apple Pay et Google Pay** via Stripe. L'argent est versé
automatiquement par Stripe sur ton compte bancaire (IBAN).

Fonctionne sur un hébergement web Infomaniak classique (PHP 8), sans base de
données ni installation : il suffit d'envoyer les fichiers.

## Ce que contient le site

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | La boutique : meilleures ventes, précommandes, tous les produits, recherche, panier |
| `admin/` | **Ta page d'administration** pour gérer les produits |
| `succes.html` | Page affichée après un paiement réussi |
| `cgv.html`, `mentions-legales.html`, `confidentialite.html` | Pages légales obligatoires, **à compléter** |
| `assets/` | Style, script du panier, images |
| `api/` | Petits scripts serveur : catalogue, création du paiement, réception des paiements |
| `private/products.json` | La liste des produits (gérée depuis l'administration) |
| `uploads/` | Les photos envoyées depuis l'administration |
| `private/config.php` | **Tes réglages et clés Stripe** (à créer, voir plus bas) |
| `private/orders/` | Une fiche par commande payée |

Le dossier `private/` est bloqué depuis internet par son fichier `.htaccess`.

## 1. Mettre le site en ligne sur Infomaniak

1. Dans le Manager Infomaniak, ouvre ton **hébergement web** et vérifie que ton
   domaine `.com` y est lié, avec le **certificat SSL (HTTPS) activé**. Apple Pay
   ne fonctionne qu'en HTTPS.
2. Vérifie que la version de PHP est **8.1 ou plus** (réglages du site).
3. Envoie **tout le contenu de ce dossier** dans le dossier racine du site
   (souvent `web/`) via le gestionnaire de fichiers ou un logiciel FTP comme
   FileZilla. Pense aux fichiers cachés `.htaccess` (à la racine et dans
   `private/`).
4. Dans `private/`, duplique `config.example.php` en **`config.php`** et remplis
   l'adresse du site, ton e-mail et le **mot de passe administrateur**
   (`admin_password`, 12 caractères minimum).
5. Ouvre ton site : le catalogue s'affiche avec un bandeau « paiement bientôt
   disponible ».

## 2. Gérer tes produits

Va sur **`https://www.tonsite.com/admin/`** et connecte-toi avec ton mot de passe.

- **Ajouter un produit** : nom, photo (JPG, PNG ou WebP, 8 Mo maximum), prix
  (par exemple `59,90`), stock, et la case **« C'est une précommande »** avec
  la date de sortie.
- Dans **Options** :
  - catégorie (crée un filtre sur le site) ;
  - limite par commande, utile contre les revendeurs ;
  - description ;
  - case « Afficher dans Meilleures ventes ».
- **Modifier** : change ce que tu veux. Pour le stock, si des ventes ont lieu
  pendant que le formulaire est ouvert, elles sont conservées : passer de 5 à 8
  ajoute bien 3 exemplaires au stock réel.
- **Supprimer** : retire le produit et sa photo.
- Le stock **baisse tout seul** à chaque vente.
- Quand une précommande sort, décoche la case pour la vendre en stock.
- Pour une précommande, le stock est le nombre de places.

Après 5 mauvais mots de passe, la connexion est bloquée 15 minutes.

## 3. Activer le paiement avec Stripe

1. Crée ton compte sur [stripe.com](https://stripe.com) : identité, statut
   (auto-entrepreneur…) et **IBAN**, sur lequel Stripe te versera l'argent.
2. Dans Stripe, reste d'abord en **mode test**. Va dans *Développeurs > Clés API*,
   copie la **clé secrète** (`sk_test_…`) dans `stripe_secret_key` de `config.php`.
3. Dans *Développeurs > Webhooks*, ajoute une destination :
   - URL : `https://www.tonsite.com/api/webhook.php`
   - Événement : `checkout.session.completed`

   Puis copie le **secret de signature** (`whsec_…`) dans `stripe_webhook_secret`.
4. Fais une commande test avec la carte `4242 4242 4242 4242`, n'importe quelle
   date future et n'importe quel code. Vérifie que :
   - tu arrives sur la page « Merci pour votre commande » ;
   - le stock a baissé ;
   - tu as reçu l'e-mail de commande ;
   - une fiche est apparue dans `private/orders/`.
5. Dans *Paramètres > Moyens de paiement*, vérifie que **Cartes, Apple Pay et
   Google Pay** sont activés. Ils le sont normalement par défaut.
6. Dans *Paramètres > E-mails clients*, active les **reçus de paiement**.
7. Une fois ton compte validé, passe en **mode production** et refais les étapes 2
   et 3 avec la clé `sk_live_…` et un nouveau webhook. Remets bien le vrai
   stock après tes tests (depuis l'administration).

## 4. Au quotidien

- **Nouvelle commande** : tu reçois un e-mail avec les produits, l'adresse et le
  téléphone du client. Tout est aussi visible dans Stripe > Paiements.
- **Annuler ou rembourser** (précommande annulée, rupture…) : Stripe > Paiements >
  la commande > Rembourser. Pense à remettre le stock à jour si besoin.
- **Virements** : Stripe vire automatiquement ton solde sur ton IBAN (calendrier
  réglable dans Stripe > Soldes).

## Avant d'ouvrir au public

- [ ] Compléter les 3 pages légales (SIRET, adresse, médiateur de la consommation…)
- [ ] Choisir un mot de passe administrateur solide
- [ ] Remplacer les produits d'exemple par les tiens, avec tes photos
- [ ] Faire au moins une commande test complète
- [ ] Ne pas utiliser le logo Pokémon ni les illustrations officielles comme
      identité visuelle. Les photos de tes propres produits suffisent.

## Images de décor

Les illustrations Pokémon du décor sont dans `assets/img/deco/` : le fond de
l'accueil, le bandeau Pikachu, les starters du pied de page, les mascottes des
titres et les Pokémon flottants. Pour en changer une, remplace le fichier en
gardant **le même nom**. Le format WebP est conseillé, et une image plus grande
rendra le fond de l'accueil plus net.

Ces illustrations appartiennent à The Pokémon Company. Leur usage comme décor
d'un site commercial n'est pas autorisé par défaut. Si tu reçois une demande
de retrait, supprime simplement le dossier `assets/img/deco/` et les balises
`<img>` qui y font référence dans `index.html` et `succes.html`.

## Crédits

Police du logo : *Luckiest Guy* d'Astigmatic, licence Apache 2.0, hébergée
dans `assets/fonts/`.
