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
├── js/site.js              Affiche le contenu, menu, galerie, contrôle 18+
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
    photo: 'photos/masseuses/luna.jpg',
    age: 27,
    origine: 'Italie',
    langues: 'Français, italien',
    specialites: ['Tantra', 'Body-body'],
    presentation: "Deux phrases pour la présenter.",
    disponible: true,          // false = « Bientôt de retour »
  },
```

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

**À faire avant la mise en ligne :** remplacer le numéro de téléphone
`+41 00 000 00 00` et l'adresse dans `SALON` par les vraies coordonnées.

## Mise en ligne

Le site est entièrement statique : n'importe quel hébergement suffit
(Infomaniak, Hostpoint, Netlify, GitHub Pages…). Il faut y copier le
contenu du dossier `mina-tantra/` tel quel, en gardant l'arborescence.

## Contrôle d'âge

Une porte « 18 ans ou plus » s'affiche à la première visite. Le choix est
mémorisé dans le navigateur du visiteur (`localStorage`) ; aucune donnée
n'est envoyée nulle part, le site ne collecte rien.
