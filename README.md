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

## Fonctionnement

Application web statique : HTML + JavaScript + fichiers de données locaux.
Aucun serveur, aucune base de données, aucun compte utilisateur, aucune donnée
client enregistrée. Un lien unique partagé entre collègues, qui fonctionne aussi
hors ligne en ouvrant `index.html` directement.

## Structure du projet

```
.
├── index.html                     Page unique de l'application
├── build.mjs                      Compile data/*.json -> data/db.js (+ validation)
├── tools/
│   ├── sources.py                 Téléchargement des PDF assureurs + extraction du texte
│   └── trous.mjs                  Liste les couvertures connues mais non chiffrées
├── assets/
│   ├── styles.css
│   ├── banniere-stf-psg.jpg       Bandeau Swiss Times Fiduciary affiché en pied de page
│   └── logos/                     Logos des caisses — déposer les fichiers puis relancer le build
├── js/
│   ├── app.js                     Interface, saisie, bouton Réinitialiser
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

## Protection des données

L'outil ne conserve et ne transmet rien : aucun stockage navigateur, aucun appel
réseau, aucune ressource externe. Les données saisies vivent en mémoire vive et
disparaissent à la fermeture de l'onglet ou via le bouton Réinitialiser. Les
données de santé étant sensibles au sens de l'art. 5 let. c LPD, aucun champ
d'identification du client n'est prévu — c'est un choix de conception.
Voir `docs/PROTECTION-DONNEES.md`.

## Vérification

Les moteurs se testent hors navigateur en chargeant `data/db.js` et les fichiers `js/` dans
Node. Deux résultats servent de référence :

- **Part LAMal** — consultation 640 CHF + part hospitalière 5 200 CHF, franchise 300 :
  300 (franchise) + 554 (quote-part 10 %) + 90 (6 jours × 15) = **944 CHF**.
- **Quota de séances** — 20 séances d'ostéopathie à 6 000 CHF chez Assura Natura, quota
  12 séances, 130 CHF par séance, franchise produit 200 : **1 560 CHF** remboursés.

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
