# Boutique de cartes à collectionner

Site de vente avec panier, produits en stock, **précommandes** et paiement par
**carte bancaire, Apple Pay et Google Pay** via Stripe. L'argent est versé
automatiquement par Stripe sur ton compte bancaire (IBAN).

Fonctionne sur un hébergement web Infomaniak classique (PHP 8), sans base de
données ni installation : il suffit d'envoyer les fichiers.

## Ce que contient le site

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | Le catalogue et le panier |
| `succes.html` | Page affichée après un paiement réussi |
| `cgv.html`, `mentions-legales.html`, `confidentialite.html` | Pages légales obligatoires, **à compléter** |
| `assets/` | Style, script du panier, images |
| `api/` | Petits scripts serveur : catalogue, création du paiement, réception des paiements |
| `private/products.json` | **Tes produits** (nom, prix, stock, précommande…) |
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
   le nom de la boutique, l'adresse du site et ton e-mail.
5. Ouvre ton site : le catalogue s'affiche avec un bandeau « paiement bientôt
   disponible ».

## 2. Gérer tes produits

Modifie `private/products.json` (gestionnaire de fichiers Infomaniak > éditer).
Chaque produit ressemble à ceci :

```json
{
  "id": "display-exemple",
  "name": "Display 36 boosters – Extension exemple",
  "category": "Displays",
  "price": 21990,
  "stock": 4,
  "max_per_order": 2,
  "preorder": false,
  "release_date": "2026-12-12",
  "image": "assets/img/produit.svg",
  "description": "Display scellé de 36 boosters, version française."
}
```

| Champ | Signification |
|---|---|
| `id` | Identifiant unique, sans espace ni accent |
| `category` | Crée automatiquement un filtre sur le site |
| `price` | En **centimes** : `21990` = 219,90 € |
| `stock` | Quantité vendable (pour une précommande : nombre de places) |
| `max_per_order` | Limite par client et par commande, utile contre les revendeurs |
| `preorder` / `release_date` | `true` pour une précommande, avec sa date de sortie (AAAA-MM-JJ) |

- Mets tes photos dans `assets/img/` et indique leur chemin dans `image`.
- Le stock **baisse tout seul** à chaque vente. Pour réapprovisionner, modifie
  `stock` **directement sur le serveur** : si tu renvoies une ancienne copie du
  fichier depuis ton ordinateur, tu effaceras les ventes déjà décomptées.
- Quand une précommande est sortie, passe `"preorder": false` pour la vendre en stock.

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
   stock après tes tests.

## 4. Au quotidien

- **Nouvelle commande** : tu reçois un e-mail avec les produits, l'adresse et le
  téléphone du client. Tout est aussi visible dans Stripe > Paiements.
- **Annuler ou rembourser** (précommande annulée, rupture…) : Stripe > Paiements >
  la commande > Rembourser. Pense à remettre le stock à jour si besoin.
- **Virements** : Stripe vire automatiquement ton solde sur ton IBAN (calendrier
  réglable dans Stripe > Soldes).

## Avant d'ouvrir au public

- [ ] Compléter les 3 pages légales (SIRET, adresse, médiateur de la consommation…)
- [ ] Remplacer les produits d'exemple par les tiens, avec tes photos
- [ ] Faire au moins une commande test complète
- [ ] Ne pas utiliser le logo Pokémon ni les illustrations officielles comme
      identité visuelle. Les photos de tes propres produits suffisent.
