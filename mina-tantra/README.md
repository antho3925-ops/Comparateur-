# Chez Eva — site du salon

Site vitrine du salon **Chez Eva**, Rue des Ponts 34, La Chaux-de-Fonds.

Une page unique en HTML, CSS et JavaScript, plus une **administration en PHP**
qui permet d'ajouter des masseuses et leurs photos depuis un téléphone, sans
toucher au code. Aucune base de données : les fiches sont rangées dans un
fichier JSON.

## Structure

```
.
├── index.php               La page publique : prend modele.html et y injecte
│                           les fiches enregistrées depuis l'administration
├── modele.html             La page elle-même (structure et textes fixes)
├── admin/
│   ├── index.php           L'administration : fiches, photos, mot de passe
│   └── noyau.php           Session, sécurité, lecture/écriture, images
├── data/
│   ├── contenu.js          Textes, horaires, tarifs, galerie, coordonnées
│   ├── masseuses.json      Les fiches — écrit par l'administration
│   ├── config.json         Le mot de passe (créé au serveur, jamais versionné)
│   └── .htaccess           Interdit la lecture directe de ce dossier
├── assets/
│   ├── styles.css          Le graphisme du site
│   ├── favicon*            L'icône de l'onglet
│   └── partage.jpg         L'aperçu affiché quand le lien est partagé
├── js/site.js              Affiche le contenu, menu, galerie, contrôle 18+
├── photos/
│   ├── masseuses/          Photos des masseuses (l'administration écrit ici)
│   └── salon/              Photos du salon + hero.jpg (image de fond)
├── robots.txt, sitemap.xml Pour les moteurs de recherche
└── tools/
    ├── paquet.py           Fabrique l'installateur (voir plus bas)
    └── exporter.py         Replie le site en un fichier unique (solution de repli)
```

## L'administration

Adresse : `https://chez-eva.ch/admin/`

À la **première visite**, elle demande de choisir un mot de passe (huit
caractères minimum) ; il est conservé sous forme chiffrée dans
`data/config.json`. Il n'y a pas de « mot de passe oublié » : pour le
réinitialiser, il faut supprimer ce fichier par FTP.

Une fois connecté :

- **Ajouter une masseuse** : prénom, âge (facultatif), origine, langues,
  spécialités, présentation, et autant de photos que voulu.
- **Modifier** une fiche, la marquer absente sans la supprimer (décocher
  « Disponible en ce moment »), ou la **supprimer** avec ses photos.
- **Son propre numéro** : si une masseuse préfère être appelée directement,
  renseigner son numéro ; un bouton « Appeler Prénom » apparaît sur sa fiche.
  Laissé vide, les clients appellent le numéro du salon.
- **Dates de présence** : pour une masseuse de passage, renseigner « présente
  à partir du » et « jusqu'au ». Le site affiche alors « À partir du
  3 novembre » puis « Présente du 3 au 12 novembre », « Jusqu'au 25 octobre »
  pendant son séjour, et « Bientôt de retour » une fois la date passée.
  Les deux champs se laissent vides pour une masseuse permanente.
- **Les photos** : envoyées depuis le téléphone, elles sont automatiquement
  réduites à 1200 px et compressées. La première de la liste est la grande
  photo de la fiche ; « En principale » permet d'en promouvoir une autre.
- **Réordonner** les masseuses avec les flèches ↑ ↓.
- **Changer le mot de passe** en bas de la liste.

La place occupée est affichée en bas de page : l'hébergement Starter
d'Infomaniak est limité à 10 Mo.

Tant qu'il n'y a **qu'une seule masseuse**, le site intitule la section « La
masseuse » et affiche sa fiche en grand, photo à gauche. Dès la deuxième, le
titre passe à « Les masseuses » et les fiches se rangent en colonnes.

### Sécurité

Mot de passe chiffré (`password_hash`), session avec cookie `HttpOnly`,
jeton anti-falsification sur chaque formulaire, blocage d'une minute après
cinq essais ratés. Les photos envoyées sont vérifiées puis réencodées en
JPEG, le nom du fichier est généré par le serveur, et le dossier `data/`
est interdit d'accès direct par `.htaccess`.

## Ce qui se modifie encore dans le code

Tout ce qui ne change pas tous les jours vit dans `data/contenu.js` :

- `SALON` — nom, adresse, téléphone, WhatsApp, site, photo de l'entrée ;
- `PRESENTATION` et `ATOUTS` — le mot du salon ;
- `HORAIRES` et `HORAIRES_NOTE` ;
- `TARIFS`, `SUPPLEMENTS` et `TARIFS_NOTE` ;
- `GALERIE` — les photos du salon ;
- `REGLES` — le cadre affiché dans la section contact.

Le nom du salon n'est écrit qu'à un seul endroit (`SALON.nom`) : il
s'affiche dans l'en-tête, le bandeau d'accueil, la porte 18+ et le pied de
page.

## Installation et mises à jour

Le gestionnaire de fichiers d'Infomaniak ne décompresse pas les archives et
créer une arborescence depuis un téléphone est pénible. D'où l'installateur :

```
python3 tools/paquet.py
```

Il fabrique `dist/installateur.php` — un fichier unique contenant tout le
site — et affiche l'adresse à ouvrir, avec sa clé. Marche à suivre :

1. déposer `installateur.php` à la racine du site par le WebFTP ;
2. ouvrir dans le navigateur l'adresse affichée par le script
   (`https://chez-eva.ch/installateur.php?cle=…`) ;
3. il recrée les dossiers, écrit les fichiers, supprime l'ancienne page
   `index.html`, puis **s'efface lui-même**.

Sans la clé, il répond « accès refusé ».

Pour une **mise à jour**, c'est la même manœuvre : il conserve les fiches
(`data/masseuses.json`), le mot de passe et les photos ajoutées depuis
l'administration.

L'hébergement doit fournir **PHP 8**. Si la page affiche du code au lieu du
site, c'est que PHP n'est pas actif : il reste alors la solution de repli
ci-dessous.

### Solution de repli : le site en un seul fichier

```
python3 tools/exporter.py
```

Fabrique `dist/index.html` : la page entière, photos incorporées (environ
2 Mo), à déposer seule à la racine. Fonctionne sur n'importe quel
hébergement, même sans PHP — mais sans administration : les fiches sont
alors figées dans le fichier, et chaque modification demande de régénérer et
redéposer le tout.

## Référencement

Le site est configuré pour l'adresse **https://chez-eva.ch** : adresse
canonique, aperçu de partage (`assets/partage.jpg`) et fiche d'établissement
pour Google — nom, adresse, téléphone et horaires, générés automatiquement
depuis `data/contenu.js`, donc toujours à jour.

Pour **rester invisible dans Google**, ouvrir `robots.txt` et remplacer
`Allow: /` par `Disallow: /`. Le lien continue de fonctionner pour qui le
connaît. L'administration, elle, n'est jamais indexée.

Si au contraire vous voulez apparaître dans les recherches locales, créez
une fiche Google Business Profile avec exactement les mêmes nom, adresse et
téléphone que sur le site.

## Contrôle d'âge

Une porte « 18 ans ou plus » s'affiche à la première visite. Le choix est
mémorisé dans le navigateur du visiteur (`localStorage`) ; aucune donnée
n'est envoyée nulle part, le site ne collecte rien.
