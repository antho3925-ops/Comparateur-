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
│   └── styles.css
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
│   │   └── groupe-mutuel.json     Groupe Mutuel — 28 produits LCA
│   └── db.js                      Généré — ne pas éditer
└── docs/
    ├── FORMAT-DONNEES.md          Comment livrer les captures d'écran
    └── MOTEUR-CALCUL.md           Ordre d'application des règles de calcul
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

## État d'avancement

- [x] Nomenclature commune des prestations (52 prestations, 11 groupes)
- [x] Format de données assureur + template + validation au build
- [x] Spécification du moteur de calcul
- [ ] Moteurs LAMal / LCA
- [ ] Interface de saisie et écran de comparaison
- [x] Chaîne d'ingestion des PDF assureurs (téléchargement + extraction)
- [x] Groupe Mutuel : 28 produits saisis depuis l'aperçu LCA 2.26
- [ ] Groupe Mutuel : 112 couvertures à chiffrer (`node tools/trous.mjs groupe_mutuel`)
- [ ] Autres caisses
