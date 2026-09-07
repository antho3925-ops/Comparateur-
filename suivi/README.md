# Suivi de performance commerciale

Plateforme web de suivi de l'activité quotidienne d'une équipe de conseillers
en assurance. Chaque conseiller saisit ses six indicateurs du jour ; le
responsable d'équipe fixe les objectifs, consulte les chiffres individuels, la
vue globale de l'équipe et le classement.

**Projet distinct du comparateur d'assurance maladie** qui occupe le reste du
dépôt. Le comparateur est une page statique sans serveur ni données ; le suivi
a besoin d'un état partagé entre plusieurs personnes, donc d'un serveur. Les
deux ne partagent aucun fichier.

## Démarrer

```
node suivi/serveur.mjs
```

La plateforme écoute sur `http://localhost:8080` et s'ouvre dans n'importe quel
navigateur. Aucune dépendance à installer : Node seul suffit (version 18 ou
plus récente, pour `fetch` et `Intl`).

Au tout premier démarrage, un code administrateur est tiré au hasard et affiché
**une seule fois** sur la console. Notez-le. Pour en fixer un vous-même :

```
SUIVI_CODE_ADMIN='votre-code' node suivi/serveur.mjs
```

La variable d'environnement fait autorité : la redéfinir change le code sans
toucher aux données.

| Variable | Effet |
|---|---|
| `PORT` | Port d'écoute (8080 par défaut) |
| `HOTE` | Interface d'écoute (`0.0.0.0` par défaut) |
| `SUIVI_CODE_ADMIN` | Code de l'espace administrateur |
| `SUIVI_HTTPS=1` | À poser derrière un reverse proxy TLS : le cookie de session prend l'attribut `Secure` |

## Voir la plateforme remplie

```
node suivi/demo.mjs
```

Monte une équipe fictive de cinq conseillers et six semaines d'activité sur
`http://localhost:8090` : code administrateur `demo`, identifiants `a.roux`,
`b.dias`, `c.meyer`, `d.perret`, `e.fontana`. Les chiffres sont tirés d'un
générateur à graine — les mêmes d'un lancement à l'autre — et vivent dans
`suivi/demo-donnees/`, remis à neuf à chaque démarrage. La démonstration ne
touche jamais à `suivi/data/`.

## Les six indicateurs

| Indicateur | Objectif hebdomadaire | Objectif mensuel |
|---|---|---|
| Contrats d'assurance maladie signés | oui | oui |
| Comptes LPP ouverts | oui | oui |
| Contrats Everlife signés | oui | oui |
| Rendez-vous pris dans la journée | oui | oui |
| Rendez-vous valides non signés | oui | oui |
| Montant transféré des avoirs LPP (CHF) | **non** | oui |

Aucun indicateur n'a d'objectif journalier. Les objectifs sont fixés par
l'administrateur, conseiller par conseiller, et modifiables à tout moment : une
modification prend effet immédiatement, y compris sur la période en cours.

## Les règles

**Saisie.** Un conseiller saisit ses chiffres du jour et peut les corriger
autant qu'il veut, mais **le jour même seulement**. Passé minuit, heure suisse,
la journée est figée pour tout le monde — l'administrateur compris, qui ne
dispose d'aucune route d'écriture sur les saisies. Le gel n'est pas une règle
affichée mais une propriété du serveur : la date n'est jamais transmise par le
navigateur, le serveur écrit toujours sur la journée courante.

**Écarts.** Pour chaque indicateur, l'écart entre le réalisé et l'objectif est
affiché en valeur chiffrée — un nombre de contrats, de rendez-vous, ou un
montant en francs. Jamais en pourcentage, nulle part.

**Classement.** Visible uniquement depuis l'espace administrateur. Chaque
conseiller est classé indicateur par indicateur sur son réalisé, ex æquo au
même rang ; les points sont la somme de ces rangs et le plus petit total passe
premier. Un décompte de rangs, et non un pourcentage, ce qui évite de comparer
des contrats à des francs. Les rendez-vous valides non signés sont affichés et
classés mais n'entrent pas dans les points : en faire un critère de performance
récompenserait l'affaire manquée.

**Semaines et mois.** Semaines ISO 8601, du lundi au dimanche. Toutes les dates
sont raisonnées dans le fuseau `Europe/Zurich`, quel que soit le fuseau du
serveur — sans quoi un serveur en UTC rouvrirait la saisie de la veille pendant
les deux heures qui suivent minuit en été.

**Temps réel.** Les pages se mettent à jour d'elles-mêmes : le serveur pousse un
événement à chaque changement (flux `text/event-stream`), et les navigateurs
ouverts rechargent leurs chiffres. Une saisie de conseiller apparaît sur le
tableau de bord du responsable sans rechargement. Une pastille indique l'état de
la liaison.

## Accès

Un conseiller se connecte avec **son seul identifiant, sans mot de passe** :
c'est le choix de conception demandé. Un identifiant connu suffit donc à ouvrir
la page d'un collègue — d'où le second rempart : l'espace administrateur, lui,
est protégé par un code, et c'est lui seul qui expose le classement et les
chiffres de toute l'équipe. Un conseiller ne voit que sa propre page.

Choisissez les identifiants en conséquence, et désactivez l'accès au départ d'un
collaborateur (onglet **Accès**) : ses chiffres passés restent au dossier, mais
il ne peut plus se connecter ni saisir.

Le code administrateur n'est jamais stocké en clair : seule son empreinte
`scrypt` salée figure dans `suivi/data/config.json`. Les tentatives sont
limitées à cinq par tranche de cinq minutes et par adresse. Les sessions sont
des cookies signés (HMAC-SHA256), `HttpOnly` et `SameSite=Strict`, valables une
journée de travail pour un conseiller et quatre heures pour l'administrateur.

## Structure

```
suivi/
├── serveur.mjs              Serveur HTTP, routage, fichiers statiques, flux temps réel
├── demo.mjs                 Équipe fictive et six semaines d'activité, pour démonstration
├── tests.mjs                Suite de tests (151 cas)
├── lib/
│   ├── dates.mjs            Fuseau suisse, semaines ISO, libellés en français
│   ├── domaine.mjs          Indicateurs, cumuls, écarts, classement — fonctions pures
│   ├── stockage.mjs         Persistance JSON atomique et diffusion des changements
│   ├── sessions.mjs         Cookies signés, code administrateur, identifiants
│   └── api.mjs              Gestionnaires de routes
├── public/
│   ├── index.html           Connexion conseiller
│   ├── conseiller.html      Page personnelle : saisie, écarts, historique
│   ├── admin.html           Tableau de bord de l'équipe
│   ├── styles.css
│   └── js/                  commun.js, connexion.js, conseiller.js, admin.js
└── data/                    Généré au premier démarrage — non versionné
    ├── suivi.json           Conseillers, saisies, objectifs, journal
    └── config.json          Secret de session et empreinte du code administrateur
```

## Données

Contrairement au comparateur, cette plateforme **conserve des données** : noms
et identifiants des conseillers, chiffres d'activité quotidiens, objectifs, et
un journal des modifications (les 5000 dernières). Ce sont des données de
performance professionnelle, pas des données de santé ni des données client :
aucun nom de client, aucune information médicale n'est saisie nulle part.

Tout tient dans `suivi/data/`. **Ce dossier n'est pas versionné** et constitue
la totalité de ce qu'il faut sauvegarder. L'écriture est atomique — fichier
temporaire puis renommage — de sorte qu'une coupure ne laisse jamais un fichier
tronqué.

## Vérification

```
node suivi/tests.mjs
```

151 tests. Les tests de dates et de règles métier sont unitaires ; les tests
d'accès démarrent un vrai serveur sur un port libre, avec un dossier de données
jetable, et parlent HTTP comme le ferait un navigateur.

Ce que la suite couvre : semaines ISO aux changements d'année, mois bissextiles,
changements d'heure suisses ; validation des saisies et des objectifs ; absence
d'objectif hebdomadaire sur le montant LPP et absence d'objectif journalier
partout ; écarts chiffrés dans les deux sens et sans objectif fixé ; cumuls par
semaine et par mois ; totaux d'équipe et objectifs cumulés ; classement, ex
æquo compris ; puis, côté serveur, le refus d'un code administrateur erroné,
l'impossibilité pour un conseiller de voir la page d'un collègue, d'atteindre le
tableau de bord ou de fixer ses propres objectifs, le gel des journées passées
y compris pour l'administrateur, la prise d'effet immédiate d'un changement
d'objectif, la désactivation et la réactivation d'un accès, et le cloisonnement
des fichiers servis.

## Mise en service

Le serveur écoute en clair. Sur un poste ou un réseau interne, cela suffit. Dès
qu'il est joignable au-delà, placez-le derrière un reverse proxy TLS et posez
`SUIVI_HTTPS=1` : sans chiffrement, l'identifiant d'un conseiller et le code
administrateur circulent en clair.

Pour qu'il redémarre tout seul, un service systemd suffit :

```ini
[Service]
ExecStart=/usr/bin/node /chemin/vers/suivi/serveur.mjs
Environment=SUIVI_CODE_ADMIN=…
Environment=SUIVI_HTTPS=1
Restart=always
```
