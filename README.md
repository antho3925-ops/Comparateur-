# Comparateur de remboursement — assurance maladie suisse

Outil interne de simulation à usage professionnel. En rendez-vous client, on
saisit la couverture actuelle (base + complémentaires) et les montants d'une
facture médicale ; l'outil calcule le reste à charge chez l'assureur actuel puis
le compare à toutes les caisses de la base de données, prestation par prestation,
en distinguant toujours la part LAMal de la part LCA.

La couverture actuelle est **sélectionnée dans la base** — caisse, puis produits
possédés — et non saisie librement. L'outil ne retient aucun assureur de
référence ni aucune couverture par défaut : la situation du client est
renseignée à chaque rendez-vous.

**Ce n'est pas un décompte officiel de caisse.** Les résultats sont des
estimations fondées sur les grilles saisies, destinées au conseil.

## Suivi des contrats (`suivi.html`)

Seconde page, indépendante du comparateur : le carnet de production du
conseiller. Pour chaque contrat — **assurance maladie** (complémentaire),
**Everlife** ou **transfert LPP** — on note le nom et le prénom du client, le
montant (prime complémentaire ou montant LPP transféré — Everlife se compte en
contrats signés, sans montant), le
nombre de points, le statut (proposition, signé, transmis, accepté, refusé,
annulé — pour le LPP : transfert en attente et argent reçu à la place de
transmis et accepté), puis deux interrupteurs cliquables directement dans la liste :
**policé** et **déjà commissionné**, chacun avec sa date. Chaque contrat porte
aussi le **montant de sa commission**, noté à tout moment, qu'elle soit déjà
perçue ou encore attendue. Les contrats Everlife portent en plus une case
**paiement direct**. Les points se saisissent à la main ; l'application en fait
la somme.

- Fonctionne **hors connexion** : `dist/suivi.html` est un fichier unique à
  ouvrir par double-clic, sur ordinateur comme sur téléphone.
- Les saisies sont **conservées dans le navigateur de l'appareil**
  (`localStorage`) et survivent à la fermeture de la page.
- Synthèse en trois blocs séparés : **maladie** (contrats, total des
  complémentaires, **moyenne par contrat**, points), **Everlife** (contrats
  signés, paiement direct, points) et **LPP** (montant transféré, transferts,
  points) ; puis total des points, contrats restant à policer et à commissionner, total des commissions
  (perçues / à recevoir).
- **Suivi mensuel** : points et nombres de contrats repartent de zéro chaque
  mois (mois de la date de signature). Un sélecteur passe d'un mois à l'autre,
  ou affiche tous les mois.
- **Commission du mois** (générée par les contrats signés ce mois-là) et
  **commission générale** (tous mois confondus, avec ce qui n'est pas encore
  arrivé).
- **LPP** : moyenne par transfert. Les statuts propres au LPP remplacent
  « transmis à la compagnie » : **transfert en attente** puis **argent reçu**
  (avec la date d'arrivée sur le compte de libre passage). Le bloc LPP totalise
  l'argent en attente et l'argent reçu.
- **Barème des points**, calculés automatiquement :
  - maladie, selon la prime complémentaire mensuelle — moins de CHF 25.– : 0 ;
    de 25 à 50 : 50 ; plus de 50 : 100 — et seulement si la **base LAMal** a été
    signée avec (case « Base LAMal signée aussi ») ; complémentaire seule :
    commission sans points ;
  - LPP : 150 points par CHF 100'000 transférés, au prorata (50'000 → 75) ;
  - Everlife : points notés à la main.
- **Commission LPP automatique** : 1.5 % du montant transféré (arrondie au
  centime), comptée une fois l'argent reçu.
- **Commission Everlife automatique** : CHF 150.– à la signature (une fois le
  contrôle qualité validé, à partir de 3 contrats Everlife signés dans le mois), CHF 400.–
  une fois le client payé ou en paiement direct ; un autre montant saisi à la
  main n'est jamais écrasé.
- **Points acquis** : les points notés ne comptent qu'une fois acquis — un
  transfert LPP quand l'argent est reçu, un Everlife quand le client a payé
  (case « Le client a payé », cliquable aussi dans la liste) ou en paiement
  direct. En attendant, ils s'affichent en ambre et à part (« pts en attente »).
- **Commission LPP** : acquise seulement à réception de l'argent ; avant, elle
  s'affiche à part (« LPP en attente de l'argent ») hors des totaux. Everlife et
  maladie : comptée dès la saisie (rappel Everlife : CHF 150.– à la signature,
  CHF 400.– une fois l'apport payé).
- Un contrat **refusé ou annulé** est perdu : il ne vaut plus ni points, ni
  commission, ni montant, dans tous les totaux et le récapitulatif.
- **Récapitulatif mensuel** : par mois, contrats maladie et moyenne des
  complémentaires, Everlife signés, LPP transféré, points, commission générée,
  perçue et à recevoir.
- En vue « Tous », la liste est découpée en trois sections avec leurs totaux.
- Filtres par type, statut, policé, commissionné, recherche par nom ou compagnie.
- **Sauvegarde** : export / import JSON (fusion ou remplacement) et export CSV
  pour Excel. Les données n'existent que sur l'appareil : exporter
  régulièrement.

### Lien pour les téléphones (GitHub Pages)

Sur téléphone, un fichier HTML ouvert depuis l'app Fichiers ne s'exécute pas :
le suivi se diffuse donc par un lien, hébergé gratuitement par GitHub Pages.

    https://antho3925-ops.github.io/Comparateur-/suivi.html

- **Seule l'application vide est en ligne** ; les contrats restent enregistrés
  sur chaque téléphone et ne passent jamais par GitHub.
- **Application installable** (`suivi.webmanifest`, icônes `assets/icones/`) :
  sur iPhone, Safari → Partager → « Sur l'écran d'accueil » ; sur Android,
  Chrome → « Installer l'application ». Toujours l'ouvrir ensuite depuis l'icône.
- **Hors connexion** après la première ouverture (`sw-suivi.js`, réseau
  d'abord puis cache) ; chaque version poussée arrive seule à la prochaine
  ouverture en ligne.
- Activation, une seule fois : dépôt → Settings → Pages → *Deploy from a
  branch* → branche `claude/offline-health-insurance-app-h8xpdb`, dossier
  `/ (root)` → Save. `.nojekyll` sert les fichiers tels quels.
- Icônes régénérées par `node tools/icones.mjs`.
- **Clavier de secours** (`js/clavier.js`) : sur iPhone, iOS n'ouvre parfois
  pas son clavier dans une application ajoutée à l'écran d'accueil (bug WebKit
  279904). Si le clavier d'iOS n'apparaît pas 0,7 s après le toucher d'un champ,
  l'application affiche le sien (AZERTY avec accents, pavé numérique pour les
  montants, Suivant, OK). Sans effet dans Safari et sur ordinateur.

### Où vivent les données du suivi

- **Chaque appareil a ses propres chiffres.** Les contrats sont enregistrés dans
  le navigateur de l'appareil qui les saisit, jamais envoyés ailleurs. Deux
  collègues qui ouvrent le même lien ou le même fichier ont chacun leur liste,
  invisible pour l'autre.
- **Les chiffres restent notés** après fermeture de l'onglet, du navigateur ou
  de l'appareil, et chaque modification est enregistrée aussitôt (relue pour
  vérification). Deux onglets ouverts se tiennent à jour l'un l'autre.
- **Même appareil, même navigateur = mêmes données** : un collègue qui utilise
  votre session voit vos contrats. Un autre navigateur (Chrome / Safari) sur le
  même appareil a, lui, une liste séparée.
- **Ce qui efface les données** : vider les données de navigation, la
  navigation privée (tout disparaît à la fermeture), désinstaller le
  navigateur, changer d'appareil. Sur iPhone, ouvrir le fichier dans Safari
  (pas en aperçu depuis Mail ou Fichiers) ; Safari peut effacer les données
  d'un site non utilisé pendant sept jours, sauf s'il est ajouté à l'écran
  d'accueil. D'où l'export régulier de la sauvegarde.
- **Rappel d'export** : un bandeau s'affiche dès que la dernière sauvegarde
  exportée date de 7 jours ou plus (ou n'a jamais été faite), avec « Exporter
  maintenant » ou « Plus tard » (masqué jusqu'au lendemain).

```
node tools/verif-stockage.mjs  # 16 verifications en navigateur : appareils, fermeture, onglets, reseau
node tools/tests-suivi.mjs     # 144 tests du modele (filtres, totaux, CSV, import)
```

## Fonctionnement

Application web statique : HTML + JavaScript + fichiers de données locaux.
Aucun serveur, aucune base de données, aucun compte utilisateur, aucune donnée
client enregistrée. Un lien unique partagé entre collègues, qui fonctionne aussi
hors ligne en ouvrant `index.html` directement.

## Structure du projet

```
.
├── index.html                     Comparateur
├── suivi.html                     Suivi des contrats (maladie, Everlife, LPP)
├── suivi.webmanifest              Suivi installable sur l'écran d'accueil
├── sw-suivi.js                    Suivi hors connexion une fois ouvert en ligne
├── build.mjs                      Compile data/*.json -> data/db.js (+ validation)
├── dist/                          Export en fichier unique (généré, non versionné)
├── tools/
│   ├── exporter.mjs               Replie tout le projet dans un fichier HTML unique
│   ├── tests.mjs                  Suite de tests du moteur de calcul
│   ├── tests-suivi.mjs            Tests du modele de suivi des contrats
│   ├── sources.py                 Téléchargement des PDF assureurs + extraction du texte
│   └── trous.mjs                  Liste les couvertures connues mais non chiffrées
├── assets/
│   ├── styles.css
│   ├── banniere-stf-psg.jpg       Bandeau Swiss Times Fiduciary affiché en pied de page
│   └── logos/                     Logos des caisses — déposer les fichiers puis relancer le build
├── js/
│   ├── app.js                     Interface, saisie, bouton Réinitialiser
│   ├── suivi-modele.js            Suivi : types, statuts, filtres, totaux, CSV, import
│   ├── suivi.js                   Suivi : interface et stockage local
│   ├── clavier.js                 Suivi : clavier de secours (iPhone, application installée)
│   ├── moteur-lamal.js            Franchise, quote-part, plafonds, forfait hospitalier
│   ├── moteur-lca.js              Taux, plafonds, enveloppes partagées
│   ├── comparateur.js             Boucle sur les assureurs et classement
│   └── format.js                  Formatage CHF, arrondis
├── data/
│   ├── meta.json                  Paramètres LAMal communs (année tarifaire)
│   ├── catalogue-prestations.json Nomenclature de référence des prestations
│   ├── sources/                   Manifestes des documents source par assureur
│   ├── assureurs/
│   │   ├── _TEMPLATE.json         Modèle à copier pour chaque nouvelle caisse
│   │   └── *.json                 9 caisses : Assura, AXA, CONCORDIA, CSS, Groupe Mutuel,
│   │                              Helsana, Sanitas, SWICA, Visana
│   └── db.js                      Généré — ne pas éditer
└── docs/
    ├── FORMAT-DONNEES.md          Comment livrer les captures d'écran
    ├── MOTEUR-CALCUL.md           Ordre d'application des règles de calcul
    └── PROTECTION-DONNEES.md      Garanties techniques et règles d'usage (LPD)
```

## Alimenter la base depuis les documents d'un assureur

Les grilles de prestations viennent des brochures et conditions générales
publiées par les caisses. La chaîne :

```
python3 tools/sources.py telecharger data/sources/<assureur>.sources.json
python3 tools/sources.py extraire
```

Les PDF vont dans `sources-pdf/<assureur>/`, le texte extrait dans
`sources-texte/<assureur>/`. **Ces deux dossiers ne sont pas versionnés** : ce
sont les documents des assureurs, seules les données structurées qu'on en tire
sont commitées.

Si le téléchargement échoue avec un `403` de la passerelle, l'environnement
bloque l'accès sortant : soit autoriser le domaine dans la politique réseau de
l'environnement, soit déposer les PDF à la main dans `sources-pdf/<assureur>/`
et lancer directement `extraire`. Un PDF scanné ne rend aucun texte — dans ce
cas seule une capture d'écran permet de lire la grille.

## Ajouter ou mettre à jour une caisse

1. Copier `data/assureurs/_TEMPLATE.json` en `data/assureurs/<id>.json` et le
   remplir — voir `docs/FORMAT-DONNEES.md`.
2. `node build.mjs` — régénère `data/db.js` et valide les données (identifiants
   inconnus, enveloppes orphelines, taux hors bornes, doublons).
3. Commit et push : le lien partagé est à jour pour toute l'équipe.

## Distribuer l'outil

```
node build.mjs
node tools/exporter.mjs
```

`dist/comparateur.html` est un **fichier unique et autonome** : styles, scripts,
base de données, bandeau et logos y sont intégrés. Il s'ouvre par un double-clic,
se copie sur une clé USB, s'envoie par courriel, et fonctionne sans connexion.
C'est la forme à donner aux collègues.

`dist/artifact.html` est la même page sans son enveloppe `html`/`head`/`body`,
pour publication en lien partagé.

`dist/suivi.html` est le suivi des contrats, lui aussi en fichier unique.

Ces deux fichiers sont régénérés à chaque export et ne sont pas versionnés.

## Protection des données

L'outil ne conserve et ne transmet rien : aucun stockage navigateur, aucun appel
réseau, aucune ressource externe. Les données saisies vivent en mémoire vive et
disparaissent à la fermeture de l'onglet ou via le bouton Réinitialiser. Les
données de santé étant sensibles au sens de l'art. 5 let. c LPD, aucun champ
d'identification du client n'est prévu — c'est un choix de conception.
Voir `docs/PROTECTION-DONNEES.md`.

## Vérification

```
node tools/tests.mjs
```

54 tests couvrant l'ensemble des règles de calcul, chacun avec sa valeur attendue
calculée à la main et écrite dans son intitulé. À relancer après toute modification
des moteurs ou des données.

Ce que la suite couvre : franchise, quote-part et son plafond, contribution
hospitalière, exonération maternité, cumuls annuels déjà consommés, quote-part
majorée sur un médicament substituable ; côté complémentaire, taux, plafonds
annuels, par séance et par jour, enveloppes partagées, quotas de séances,
franchises de produit et de prestation, exemptions, participations journalières,
plafonds cumulables sur plusieurs années ; puis les prestations mixtes et les
lignes incomplètes, le choix du produit le plus favorable, les trois états
affichés, le périmètre des produits retenus, les portefeuilles fermés, le
masquage de caisses, les programmes partenaires, et quatre invariants de
cohérence — aucun remboursement supérieur à sa ligne, aucun reste à charge
négatif, part base identique chez toutes les caisses, et somme des parts égale
au total.

## État d'avancement

- [x] Nomenclature commune des prestations (52 prestations, 11 groupes)
- [x] Format de données assureur + template + validation au build
- [x] Spécification du moteur de calcul
- [x] Moteurs LAMal / LCA, vérifiés sur cas calculés à la main
- [x] Interface de saisie et écran de comparaison, testée dans Chromium
- [x] Mode argumentaire : points forts et points faibles de chaque caisse
      face à la couverture actuelle, prestation par prestation
- [x] Programmes partenaires : rabais chez les prestataires d'une caisse,
      en couche activable et séparée du chiffrage contractuel
- [x] Chaîne d'ingestion des PDF assureurs (téléchargement + extraction)
- [x] 9 caisses saisies : 172 produits, 967 couvertures dont 654 chiffrées
- [ ] 313 couvertures à chiffrer depuis les conditions particulières (`node tools/trous.mjs`)
- [ ] Vérification des sources (toutes marquées `a_verifier`)
