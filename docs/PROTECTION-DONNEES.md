# Protection des données — LPD

Note interne accompagnant le comparateur. Elle décrit ce que l'outil garantit
techniquement, et ce qui reste à la charge du conseiller.

## 1. Ce que l'outil garantit techniquement

Ces trois points sont vérifiables dans le code du projet :

| Garantie | Vérification |
|---|---|
| Aucune donnée n'est enregistrée | Aucun appel à `localStorage`, `sessionStorage`, `indexedDB` ni `document.cookie` |
| Aucune donnée n'est transmise | Aucun `fetch`, `XMLHttpRequest`, `WebSocket` ni `sendBeacon` |
| Aucune ressource externe n'est chargée | Aucune URL distante dans `index.html` ; polices, styles et données sont locaux |

```bash
grep -rn "localStorage\|sessionStorage\|indexedDB\|document.cookie" js/ index.html
grep -rn "fetch(\|XMLHttpRequest\|WebSocket\|sendBeacon" js/ index.html
grep -nE "https?://" index.html
```

Les données saisies vivent uniquement dans la mémoire vive du navigateur. Elles
disparaissent à la fermeture de l'onglet, au rechargement de la page et lorsque
le bouton **Réinitialiser** est utilisé. Il n'existe ni base de données côté
serveur, ni compte utilisateur, ni journal d'activité.

## 2. Pourquoi cela ne suffit pas

Les données de santé sont des **données sensibles** au sens de l'art. 5 let. c
de la loi fédérale sur la protection des données. Le fait qu'un outil ne
conserve rien ne dispense pas celui qui l'utilise de ses obligations : le
traitement a bien lieu, sur l'écran du conseiller, en présence du client.

Le conseiller demeure **responsable du traitement** au sens de la LPD, et reste
tenu au secret professionnel attaché à son activité d'intermédiaire en
assurance.

## 3. Règles d'usage

**Minimisation.** Ne saisir aucune donnée d'identification : ni nom, ni prénom,
ni date de naissance complète, ni numéro AVS, ni numéro de police, ni adresse.
Le calcul n'en a pas besoin — il ne demande qu'une catégorie d'âge, une
franchise, un modèle et des montants. Cette absence de champ d'identité est un
choix de conception, pas un oubli.

**Un client, une session.** Réinitialiser entre deux rendez-vous. Le bouton est
placé en évidence dans l'en-tête pour cette raison.

**Confidentialité de l'écran.** Verrouiller la session en quittant le poste.
Veiller à ce que l'écran ne soit pas visible d'un tiers en salle d'attente ou en
espace ouvert.

**Impressions.** Une impression sort du périmètre technique de l'outil : elle
devient un document papier contenant des données de santé. La remettre au client
ou la détruire ; ne pas la laisser traîner ni la conserver hors du dossier
client sécurisé.

**Partage du lien.** Le lien est destiné à l'usage interne de l'équipe. Il donne
accès à l'outil et à la base de grilles tarifaires, non à des données clients —
il n'en existe aucune.

## 4. Ce que l'outil ne fait pas

Il ne constitue pas un décompte officiel de caisse, ne remplace pas les
conditions générales et particulières des assureurs, et ne conserve aucune trace
des simulations effectuées. Aucun historique n'est donc consultable après coup,
volontairement.

## 5. Marques et logos

Les grilles de prestations sont saisies depuis les brochures publiques des
assureurs, à titre de documentation professionnelle. Les logos éventuellement
déposés dans `assets/logos/` sont des marques protégées appartenant à chaque
assureur : leur affichage sert à identifier la caisse et n'implique ni lien, ni
partenariat, ni approbation. Se conformer aux conditions d'usage de chaque
charte graphique.
