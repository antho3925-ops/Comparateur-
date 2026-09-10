# Mina Tantra — site de présentation

Site vitrine du salon **Mina Tantra**, La Chaux-de-Fonds.
Page unique, en HTML/CSS/JavaScript, sans serveur ni base de données :
il suffit d'ouvrir `index.html` dans un navigateur, ou de déposer le dossier
chez n'importe quel hébergeur.

## Structure

```
mina-tantra/
├── index.html              La page (structure et textes fixes)
├── data/contenu.js         >>> LE FICHIER À MODIFIER <<<
│                           masseuses, horaires, tarifs, galerie, coordonnées
├── assets/styles.css       Le graphisme (couleurs, polices, mise en page)
├── assets/favicon*         L'icône affichée dans l'onglet du navigateur
├── assets/partage.jpg      L'aperçu affiché quand le lien est partagé (WhatsApp…)
├── robots.txt              Autorise ou interdit les moteurs de recherche
├── sitemap.xml             La liste des pages, pour Google
├── js/site.js              Affiche le contenu, menu, galerie, contrôle 18+
├── tools/exporter.py       Replie tout le site dans un seul fichier HTML
└── photos/
    ├── masseuses/          Les photos des masseuses
    └── salon/              Les photos du salon + hero.jpg (image de fond)
```

## Ajouter une masseuse

1. Déposer sa photo dans `photos/masseuses/` — par exemple `luna.jpg`.
   Format conseillé : portrait (3/4), 900 × 1200 px, moins de 500 Ko.
2. Ouvrir `data/contenu.js`, copier un bloc existant dans la liste `MASSEUSES`
   et le coller à la suite :

```js
  {
    prenom: 'Luna',
    photo: 'photos/masseuses/luna-1.jpg',      // la grande photo de la fiche
    photos: [                                  // les vignettes sous la fiche
      'photos/masseuses/luna-1.jpg',
      'photos/masseuses/luna-2.jpg',
    ],
    age: 27,                                   // facultatif
    origine: 'Italie',
    langues: 'Français, italien',
    specialites: ['Tantra', 'Body body'],
    presentation: "Deux phrases pour la présenter.",
    disponible: true,          // false = « Bientôt de retour »
  },
```

Les vignettes s'ouvrent en plein écran quand on clique dessus. Le champ
`photos` est facultatif : sans lui, seule la grande photo s'affiche.

Tant qu'il n'y a **qu'une seule masseuse**, la section s'intitule « La
masseuse » et sa fiche s'affiche en grand, photo à gauche. Dès qu'une
deuxième est ajoutée, le titre passe à « Les masseuses » et les fiches se
rangent en colonnes — il n'y a rien à changer pour cela. La phrase
d'introduction de la section se modifie dans `MASSEUSES_INTRO`.

3. Enregistrer, puis rafraîchir la page (F5).

Une masseuse sans photo s'affiche quand même : son initiale apparaît à la place.

## Ajouter des photos du salon

Déposer les images dans `photos/salon/`, puis ajouter une ligne dans `GALERIE` :

```js
  { src: 'photos/salon/salon-5.jpg', legende: 'Le coin détente' },
```

L'image de fond de la page d'accueil est `photos/salon/hero.jpg`
(format paysage, 1920 × 1080 px environ). Tant qu'elle n'existe pas,
un dégradé s'affiche à la place — rien ne casse.

## Modifier les horaires, les tarifs, le téléphone

Tout est dans `data/contenu.js`, dans les listes `HORAIRES`, `TARIFS`,
`REGLES` et l'objet `SALON` (téléphone, WhatsApp, e-mail, adresse).
Le jour en cours est mis en évidence automatiquement dans le tableau
des horaires.

Le numéro du salon (`+41 77 276 13 70`) est déjà renseigné, et sert aussi
au bouton WhatsApp. L'adresse (`Rue des Ponts 34, 2300 La Chaux-de-Fonds`)
alimente le bloc contact, le lien « Voir sur la carte » et le pied de page.
Le bouton e-mail n'apparaît que si `email` contient une adresse.

## Mise en ligne (Infomaniak)

Le site est entièrement statique : ni PHP, ni base de données, ni
installation. Il suffit de copier le **contenu** du dossier `mina-tantra/`
à la racine web de l'hébergement, en gardant l'arborescence.

1. Chez Infomaniak, prendre un **hébergement Web** et un **nom de domaine**
   (par exemple `minatantra.ch`). Compter quelques francs par mois pour
   l'hébergement et une dizaine de francs par an pour le domaine `.ch` —
   les tarifs exacts sont à vérifier sur leur site, ils changent.
2. Dans le Manager Infomaniak, créer le site et récupérer les accès **FTP**
   (serveur, utilisateur, mot de passe).
3. Avec FileZilla (gratuit), se connecter et déposer dans le dossier web
   (`/web` ou `/sites/minatantra.ch/` selon la configuration) :

   ```
   index.html
   robots.txt
   sitemap.xml
   assets/
   data/
   js/
   photos/
   ```

   `index.html` doit se trouver **à la racine**, pas dans un sous-dossier.
4. Activer le **certificat SSL Let's Encrypt** (gratuit, en un clic dans le
   Manager) pour que le site soit en `https://`.

Pour modifier le site ensuite, on change le fichier concerné et on le
redépose au même endroit par FTP — inutile de tout renvoyer.

### Variante : le site en un seul fichier

Le gestionnaire de fichiers d'Infomaniak (WebFTP) ne sait pas décompresser
une archive, et créer les dossiers à la main depuis un téléphone est
fastidieux. D'où cette commande :

```
python3 tools/exporter.py
```

Elle fabrique `dist/index.html` : la page entière, avec le style, le script
et **toutes les photos** incorporés dedans (environ 2 Mo). Il n'y a plus
qu'un fichier à déposer à la racine du site, sans aucun dossier à créer.

À déposer à côté, à la racine également : `partage.jpg` (l'aperçu des liens
partagés), `robots.txt` et `sitemap.xml`.

Après chaque modification de `data/contenu.js`, relancer la commande et
redéposer `dist/index.html`. L'inconvénient de cette variante : le visiteur
télécharge les 2 Mo à chaque première visite, et la moindre correction
demande de renvoyer tout le fichier. Dès que possible, mieux vaut revenir
au dépôt normal, en dossiers, depuis un ordinateur.

Le site fonctionne aussi sans hébergement : il suffit d'ouvrir `index.html`
depuis le disque pour le montrer sur un ordinateur ou une tablette.

## Référencement

Le site est configuré pour l'adresse **https://mina-tantra.ch** : adresse
canonique, aperçu de partage (`assets/partage.jpg`, ce qui s'affiche quand on
envoie le lien par WhatsApp) et fiche d'établissement pour Google — nom,
adresse, téléphone et horaires, générés automatiquement depuis
`data/contenu.js`, donc toujours à jour.

Pour **rester invisible dans Google**, ouvrir `robots.txt` et remplacer
`Allow: /` par `Disallow: /`. Les moteurs cessent alors de référencer le site ;
le lien continue de fonctionner pour qui le connaît.

Si au contraire vous voulez apparaître dans les recherches locales, créez
une fiche Google Business Profile avec exactement les mêmes nom, adresse et
téléphone que sur le site.

## Contrôle d'âge

Une porte « 18 ans ou plus » s'affiche à la première visite. Le choix est
mémorisé dans le navigateur du visiteur (`localStorage`) ; aucune donnée
n'est envoyée nulle part, le site ne collecte rien.
