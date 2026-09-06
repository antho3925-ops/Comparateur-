# Comparateur de remboursement — assurance maladie suisse

Outil interne de simulation à usage professionnel. En rendez-vous client, on
saisit la couverture actuelle (base + complémentaires) et les montants d'une
facture médicale ; l'outil calcule le reste à charge chez l'assureur actuel puis
le compare à toutes les caisses de la base de données, prestation par prestation,
en distinguant toujours la part LAMal de la part LCA.

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
│   ├── assureurs/
│   │   ├── _TEMPLATE.json         Modèle à copier pour chaque nouvelle caisse
│   │   └── _exemple-demo.json     Caisse FICTIVE de démonstration (à supprimer)
│   └── db.js                      Généré — ne pas éditer
└── docs/
    ├── FORMAT-DONNEES.md          Comment livrer les captures d'écran
    └── MOTEUR-CALCUL.md           Ordre d'application des règles de calcul
```

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
- [ ] Saisie des vraies caisses à partir des captures d'écran
