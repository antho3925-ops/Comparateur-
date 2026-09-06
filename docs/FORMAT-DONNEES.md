# Format des données — comment me livrer tes captures d'écran

Ce document décrit **le seul format** dont j'ai besoin pour intégrer une nouvelle
caisse maladie. Tu peux soit m'envoyer les captures et je remplis le fichier,
soit le remplir toi-même en suivant `data/assureurs/_TEMPLATE.json`.

---

## 1. Le principe : un catalogue commun

Le fichier `data/catalogue-prestations.json` contient **la liste de référence des
prestations** (52 aujourd'hui), chacune avec un identifiant stable :

```
osteopathie, dentaire_soins, hospitalisation_demi_privee, lunettes_lentilles_adulte, ...
```

Chaque assureur ne décrit **jamais** ses prestations avec ses propres mots : il
dit seulement, pour un identifiant de ce catalogue, *combien* il rembourse.
C'est ce qui permet de comparer Helsana et Assura ligne à ligne alors que leurs
brochures n'emploient pas le même vocabulaire.

Chaque prestation porte une **catégorie** :

| Catégorie | Sens |
|---|---|
| `LAMal`  | Couverte par l'assurance de base, identique chez toutes les caisses |
| `LCA`    | Uniquement complémentaire, propre à chaque assureur |
| `MIXTE`  | La base couvre une part (ex. tarif division commune), la complémentaire le surcoût. La répartition est toujours saisie à la main sur la facture, jamais estimée. |

Si une prestation manque au catalogue, dis-le-moi : je l'ajoute. **Ne jamais
renommer un identifiant existant** — ajouter un nouvel identifiant et passer
l'ancien à `"actif": false`.

---

## 2. Un fichier JSON par caisse

Emplacement : `data/assureurs/<id>.json`. Copie de `_TEMPLATE.json`.

### 2.1 En-tête et traçabilité

```json
{
  "id": "helsana",
  "nom": "Helsana",
  "actif": true,
  "source": {
    "origine": "capture d'ecran",
    "reference": "helsana_completa_p2.png",
    "date_extraction": "2026-09-06",
    "annee_tarifaire": 2026,
    "fiabilite": "a_verifier",
    "remarque": "Le plafond orthodontie etait coupe sur la capture."
  }
}
```

`fiabilite` vaut `a_verifier`, `verifie` ou `fictif`. Le build te signale toute
caisse qui n'est pas encore `verifie` — utile pour savoir ce qui reste à
contrôler avant d'utiliser l'outil en clientèle.

### 2.2 Bloc LAMal — presque toujours vide

La LAMal étant identique partout, ce bloc reste à `null` : l'outil applique
alors les valeurs légales de `data/meta.json` (franchises 300 à 2 500, quote-part
10 %, plafond 700 CHF adulte / 350 CHF enfant, 15 CHF par jour d'hospitalisation).
Ne remplis que les rares champs où une capture montre autre chose, et la liste
des modèles réellement proposés par la caisse.

### 2.3 Bloc LCA — le cœur du travail

Un objet par **produit** complémentaire, contenant des **couvertures** :

```json
{
  "id": "helsana_completa",
  "nom": "COMPLETA",
  "type": "ambulatoire",
  "niveau": "plus",
  "franchise_produit": 0,
  "delai_attente_mois": 0,
  "enveloppes": [
    { "id": "env_med_alt", "libelle": "Medecines alternatives", "plafond_annuel": 1000 }
  ],
  "couvertures": [
    {
      "prestation_id": "osteopathie",
      "taux_remboursement": 0.75,
      "plafond_par_seance": 60,
      "plafond_annuel": null,
      "nb_seances_max_annuel": null,
      "enveloppe_id": "env_med_alt",
      "conditions": "Therapeute reconnu ASCA / RME",
      "source_page": "capture 2, ligne Osteopathie"
    }
  ]
}
```

Champs d'une couverture :

| Champ | Sens | `null` signifie |
|---|---|---|
| `prestation_id` | identifiant du catalogue | — (obligatoire) |
| `taux_remboursement` | fraction entre 0 et 1 (`0.75` = 75 %) | — (obligatoire) |
| `plafond_par_seance` | max remboursé par séance | pas de limite par séance |
| `plafond_par_jour` | max par jour (hospitalier, indemnités) | pas de limite par jour |
| `plafond_annuel` | max par an pour cette prestation | pas de plafond propre |
| `nb_seances_max_annuel` | nombre de séances remboursées par an | illimité |
| `enveloppe_id` | plafond partagé avec d'autres prestations | plafond non partagé |
| `statut` | `a_completer` si le taux est inconnu (voir plus bas) | couverture chiffrée |
| `conditions` | texte libre affiché en clientèle | — |
| `source_page` | où c'était écrit dans le document source | — |

**Règle importante : une prestation absente de `couvertures` est considérée
comme non remboursée par ce produit.** Pas besoin de lister les exclusions.

### Couvertures « à compléter » — le cas le plus fréquent

Une brochure d'aperçu dit presque toujours **quelles** prestations sont couvertes,
et presque jamais **à quel taux**. Plutôt que d'inventer un chiffre ou de laisser
croire à une non-couverture, on écrit :

```json
{ "prestation_id": "dentaire_soins", "taux_remboursement": null,
  "statut": "a_completer",
  "conditions": "Couverte d'après la brochure, taux et plafond non indiqués.",
  "source_page": "Aperçu LCA 2.26, page 3" }
```

Le build impose `taux_remboursement: null` dès que `statut` vaut `a_completer`,
et l'interface affichera **« couvert, conditions à préciser »** — jamais 0 CHF,
jamais un montant estimé. `node tools/trous.mjs [assureur]` liste tout ce qui
reste à compléter, produit par produit : c'est la liste des conditions
particulières à aller chercher.

### Produits hors périmètre facture

Protection juridique, capitaux invalidité ou décès, rentes, indemnités
journalières : ces produits ne remboursent pas une facture médicale. Ils portent
`"hors_perimetre_facture": true`, restent dans la base pour le conseil, mais sont
exclus du comparatif de reste à charge. Au catalogue, les prestations
correspondantes portent `"nature": "prestation_versee"`.

**Les enveloppes** servent au cas très fréquent où plusieurs prestations se
partagent un seul plafond annuel — typiquement « médecines alternatives :
1 000 CHF par an, toutes thérapies confondues ». Déclare l'enveloppe une fois,
puis fais-y référence depuis chaque couverture concernée.

### 2.4 Produits à paliers

Une caisse qui propose *Basic / Plus / Top* donne **trois objets produits
distincts** (`niveau`: `"basic"`, `"plus"`, `"top"`), pas un produit à variantes.
C'est plus verbeux mais ça évite toute ambiguïté au moment de comparer.

---

### Autres champs d'un produit

`code_produit` (le code interne de la caisse, ex. `GO`, `DP`), `age_adhesion_min`
et `age_adhesion_max`, `franchises_produit` (liste, ex. `[0, 150]`),
`delai_attente_mois` et `delais_attente_specifiques` (carences par motif),
`duree_min_contrat_ans`, `exclusions`, `prime_mensuelle_indicative`.

## 3. Ce que je peux lire sur une capture

Envoie les captures telles quelles, plusieurs par assureur si besoin. Ce que je
cherche :

- le **nom exact** du produit complémentaire et son niveau ;
- pour chaque ligne de la grille : le **taux** (%), le **plafond annuel**, le
  **plafond par séance**, le **nombre de séances**, et les **conditions**
  (thérapeute reconnu, délai d'attente, sur prescription…) ;
- les mentions de **plafonds partagés** (« au total », « toutes thérapies
  confondues ») — c'est ce qui devient une enveloppe ;
- pour la base : uniquement les **modèles proposés** et d'éventuelles franchises
  particulières.

Quand une valeur est illisible ou ambiguë, je la mets à `null` et je le note dans
`source.remarque` plutôt que de deviner. Je te signalerai la liste des trous à
combler.

---

## 4. Ce que l'aperçu produits ne suffit pas à faire

Une brochure d'aperçu permet de savoir **quels produits d'une caisse couvrent
quoi** — assez pour orienter un conseil, pas assez pour chiffrer un
remboursement. Pour qu'une prestation entre réellement dans le comparatif, il
faut les **conditions particulières du produit**, qui donnent le taux, le
plafond annuel, le plafond par séance et le nombre de séances.

## 5. Mise à jour

1. Tu m'envoies les nouvelles captures (ou tu édites le JSON).
2. `node build.mjs` régénère `data/db.js` et **valide** les données : identifiants
   inconnus, enveloppes orphelines, taux hors bornes, assureurs en double.
3. Un commit, un push — le lien partagé est à jour pour toute l'équipe.

Aucune installation n'est nécessaire côté collègues : ils ouvrent le lien (ou le
fichier `index.html`), tout tourne dans le navigateur, hors ligne.
