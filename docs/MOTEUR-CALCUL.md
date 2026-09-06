# Moteur de calcul — ordre d'application

Ce document fige la logique métier pour qu'elle soit vérifiable et discutable
avant d'être codée.

## Point de départ : la situation réelle du client, jamais un défaut

**Décision figée : l'outil ne retient aucun assureur de référence et aucune
couverture par défaut.** À chaque nouveau client, le conseiller renseigne où se
trouve le client, en le sélectionnant dans la base :

1. la **caisse actuelle**, choisie dans la liste des assureurs encodés ;
2. les **produits complémentaires** qu'il possède, cochés parmi ceux de cette
   caisse (plusieurs possibles : un ambulatoire, un dentaire, un hospitalier…) ;
3. sa **franchise LAMal** et son **modèle d'assurance**.

Cette sélection constitue la couverture de référence du calcul. Tant qu'elle
n'est pas renseignée, aucun comparatif n'est produit : il n'y a rien à comparer.
Une caisse dont les produits ne sont pas encore encodés n'apparaît simplement pas
dans la liste — mieux vaut une caisse absente qu'une caisse aux chiffres inventés.

Le bouton **Réinitialiser** remet cette sélection à zéro, comme le reste.

### Caisse pas encore encodée : saisie libre de secours

Les caisses présentes en base sont proposées en premier. Si le client se trouve
chez une caisse pas encore encodée, le conseiller peut **décrire sa couverture à
la main** — taux et plafonds lus sur la police — pour la seule couverture
actuelle. Dans ce cas l'écran porte en permanence une mention indiquant que la
couverture de référence a été décrite manuellement et ne provient pas de la base
vérifiée. Cette saisie n'est pas enregistrée : elle disparaît à la
réinitialisation, comme le reste du dossier client.

### Côté caisses comparées : le meilleur produit, toujours nommé

Le client ne possède aucun produit chez les concurrents. Pour chaque prestation
de la facture, l'outil retient donc **le produit le plus favorable de la caisse**
— jamais un cumul de plusieurs produits.

Deux garde-fous, parce que cette règle compare volontiers un produit d'entrée de
gamme à un haut de gamme :

- le **nom du produit retenu est affiché** à côté de chaque montant, ligne par
  ligne : le conseiller voit immédiatement qu'un résultat vient de « Global smart
  niveau 3 » et non d'un produit comparable à celui du client ;
- ce produit est **remplaçable d'un clic** par un autre produit de la même caisse,
  pour refaire la comparaison à gamme équivalente.

Le classement affiche donc un potentiel maximal de remboursement, assumé comme
tel et vérifiable à l'écran, plutôt qu'un chiffre dont on ne saurait pas d'où il
sort.

## Entrée : une ligne de facture

```json
{
  "prestation_id": "osteopathie",
  "libelle_facture": "3 seances - Cabinet Dupont",
  "montant": 270.00,
  "nb_seances": 3,
  "nb_jours": null,
  "montant_part_lamal": null,
  "quote_part_taux_override": null,
  "date": "2026-03-04"
}
```

`montant_part_lamal` ne concerne que les prestations `MIXTE` : quand la facture
distingue le tarif de base du surcoût (typiquement une hospitalisation
mi-privée), on saisit les deux.

**Décision figée : sur une ligne `MIXTE`, l'outil affiche systématiquement deux
champs** — montant total et part au tarif LAMal — et refuse de deviner la
répartition. Aucune clé de répartition par défaut n'est stockée au catalogue :
une approximation invisible sur l'hospitalier fausserait tout le comparatif et
serait indéfendable devant le client. Tant que la part LAMal n'est pas
renseignée, la ligne est signalée comme incomplète à l'écran.

## Étape 1 — Ventilation base / complémentaire

Pour chaque ligne, selon la catégorie de la prestation au catalogue :

- `LAMal` → tout le montant part au calcul LAMal ;
- `LCA` → tout le montant part au calcul complémentaire ;
- `MIXTE` → `montant_part_lamal` va au calcul LAMal, le solde au calcul LCA.

## Étape 2 — Part LAMal (identique chez tous les assureurs)

Sur le cumul annuel des montants LAMal, dans cet ordre :

1. **Exonérations** — les prestations portant `exoneration_id: "maternite"` sont
   sorties du calcul de franchise et de quote-part.
2. **Franchise** — le client paie 100 % jusqu'à épuisement de la franchise
   choisie, en tenant compte de la franchise **déjà consommée** dans l'année.
3. **Quote-part** — 10 % de ce qui dépasse la franchise (20 % sur un médicament
   original substituable, via `quote_part_taux_override`), plafonnée à 700 CHF
   par an pour un adulte, 350 CHF pour un enfant, en tenant compte de la
   quote-part déjà consommée.
4. **Contribution hospitalière** — 15 CHF par jour d'hospitalisation adulte,
   qui s'ajoute et n'est soumise à aucun plafond.

Reste à charge LAMal = franchise consommée + quote-part + contribution
hospitalière.

Conséquence à expliquer en clientèle : **la part base est la même partout à
franchise et modèle égaux.** Le comparatif ne fait donc varier la part base que
si on simule une autre franchise ; les écarts entre caisses viennent de la LCA.

## Étape 3 — Part LCA (propre à chaque assureur)

Pour chaque produit complémentaire de l'assureur, on cherche une couverture
correspondant à la prestation. Si plusieurs produits couvrent la même
prestation, on retient **la plus favorable** (jamais un cumul).

Ordre d'application sur le montant complémentaire de la ligne :

1. `nb_seances_max_annuel` — les séances au-delà du quota ne sont pas remboursées ;
2. `taux_remboursement` ;
3. `plafond_par_seance` × nombre de séances (ou `plafond_par_jour` × nombre de jours) ;
4. `plafond_annuel` de la prestation, décompté du cumul déjà consommé dans l'année ;
5. `plafond_annuel` de l'**enveloppe** partagée, décompté du cumul de l'enveloppe ;
6. `franchise_produit` éventuelle du produit.

Le `delai_attente_mois` est affiché comme avertissement (il conditionne l'accès
au produit à la souscription, il ne modifie pas le calcul sur une facture
existante).

Trois états distincts, à ne jamais confondre à l'écran :

| État | Origine | Affichage |
|---|---|---|
| **Remboursé** | couverture chiffrée | le montant calculé, avec le nom du produit |
| **Non couvert** | aucune couverture pour cette prestation | « non couvert », et non « 0 CHF » |
| **À préciser** | couverture au statut `a_completer` | « couvert, conditions à préciser » |

Une prestation « à préciser » n'entre ni dans le total remboursé ni dans le reste
à charge : elle est sortie du chiffre et signalée séparément, avec le nom du
produit concerné. Le classement des caisses indique combien de lignes sont dans
ce cas, pour que le conseiller sache si un écart affiché est solide ou
provisoire.

## Cumuls déjà consommés dans l'année

**Décision figée : la simulation accepte les cumuls en cours d'année**, via un
bloc repliable et **vide par défaut** en tête de saisie — il ne ralentit donc
pas le cas courant :

- franchise LAMal déjà payée cette année ;
- quote-part LAMal déjà atteinte cette année ;
- montants déjà consommés sur les plafonds LCA (par prestation ou par
  enveloppe), saisis seulement si le client le sait.

Ces cumuls s'appliquent **à l'identique à toutes les caisses comparées** pour la
part LAMal. Côté LCA, un cumul renseigné pour la caisse actuelle ne peut pas être
reporté sur les autres caisses (le client n'y a rien consommé) : les concurrents
sont donc calculés sur plafonds intacts, et l'écran l'indique explicitement pour
éviter une comparaison trompeuse.

## Étape 4 — Comparatif

Pour la couverture actuelle sélectionnée, puis pour chaque autre caisse, on
produit :

```
reste_a_charge_total = reste_a_charge_LAMal + (montant_LCA - rembourse_LCA)
```

Le classement se fait sur `reste_a_charge_total` croissant, avec le détail
prestation par prestation, toujours en distinguant part base et part
complémentaire.

## Limites assumées

- Le calcul porte sur **la facture saisie**, avec les cumuls annuels renseignés
  manuellement. Ce n'est pas un décompte officiel de caisse.
- Les indemnités journalières (`indemnite_journaliere`) sont une prestation
  versée, pas un remboursement : elles sont présentées à part et n'entrent pas
  dans le reste à charge.
- Les primes ne sont pas comparées par défaut : `prime_mensuelle_indicative`
  n'est qu'un repère facultatif. Une comparaison de primes sérieuse suppose
  l'âge, la commune et l'année tarifaire — à discuter si tu le veux.
