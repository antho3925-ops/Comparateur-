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

Au tout premier démarrage, tout se met en place seul : l'équipe de départ
décrite dans `suivi/equipe-initiale.json` est installée, et l'accès
administrateur prend l'empreinte livrée dans `suivi/acces-initial.json`. Les
conseillers et le responsable peuvent se connecter aussitôt, sans rien
configurer.

Sans empreinte livrée, un code est tiré au hasard et affiché **une seule fois**
sur la console. Pour en fixer un vous-même, à tout moment :

```
SUIVI_CODE_ADMIN='votre-code' node suivi/serveur.mjs
```

La variable d'environnement fait autorité : la redéfinir change le code sans
toucher aux données. Le code peut aussi se poser une fois pour toutes, sans
rester dans l'historique du shell à chaque démarrage :

```
node suivi/gestion.mjs code-admin
```

**Le code n'est écrit en clair nulle part** — ni dans le dépôt, ni dans
`suivi/data/config.json`. Ce qui circule est son empreinte `scrypt` salée :
elle vérifie un code proposé, elle ne permet pas de le retrouver.

Le code administrateur ne tient compte ni de la casse ni des espaces de bord,
comme les identifiants des conseillers : `Admin39`, `admin39` et `ADMIN39`
ouvrent la même porte.

Cela dit, une empreinte livrée dans le dépôt reste attaquable hors ligne par
qui y a accès, d'autant plus vite que le code est court. C'est un compromis
assumé au profit d'une installation sans configuration : `gestion.mjs
code-admin` permet d'en sortir quand on le souhaite, et rend le fichier livré
sans effet.

| Variable | Effet |
|---|---|
| `PORT` | Port d'écoute (8080 par défaut) |
| `HOTE` | Interface d'écoute (`0.0.0.0` par défaut) |
| `SUIVI_CODE_ADMIN` | Code de l'espace administrateur |
| `SUIVI_DONNEES` | Dossier de l'état et de la configuration (`suivi/data` par défaut) |
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

| Indicateur | Sens | Hebdomadaire | Mensuel |
|---|---|---|---|
| Contrats d'assurance maladie signés | cible | oui | oui |
| Comptes LPP ouverts | cible | oui | oui |
| Contrats Everlife signés | cible | oui | oui |
| Rendez-vous pris dans la journée | cible | oui | oui |
| Rendez-vous valides non signés | **plafond** | oui | oui |
| Montant transféré des avoirs LPP (CHF) | cible | **non** | oui |

Aucun indicateur n'a d'objectif journalier. Les objectifs sont fixés par
l'administrateur, conseiller par conseiller, et modifiables à tout moment : une
modification prend effet immédiatement, y compris sur la période en cours.

**Chacun les siens.** Les objectifs se règlent conseiller par conseiller et
indicateur par indicateur : rien n'est partagé, aucune valeur n'en entraîne une
autre. Chaque carte de l'onglet **Objectifs** s'enregistre séparément, et une
case laissée vide dispense purement et simplement ce conseiller de cet
indicateur — il n'aura ni objectif ni écart affiché sur cette ligne, tandis que
ses collègues gardent le leur. Un objectif saisi mais pas encore enregistré est
signalé sur sa carte et conservé si l'on change d'onglet entre-temps.

**Cible ou plafond.** Cinq indicateurs sont des cibles : l'objectif est un
minimum, plus on en fait mieux c'est, et la tuile passe au vert quand il est
atteint. Les rendez-vous valides non signés sont un **plafond** : ce sont des
affaires manquées, l'objectif est un maximum à ne pas franchir. Rester en
dessous est le bon résultat — vert, avec la marge restante ; le franchir passe
la tuile au rouge et affiche de combien. Au classement, ce même indicateur se
lit à l'envers : le moins nombreux passe premier.

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

**Objectif atteint.** Une tuile dont l'objectif est atteint passe au vert et
porte un sceau. Au moment où elle bascule — et à ce moment seulement — elle
s'anime : sursaut, halo, éclat doré, étincelles, et un bandeau quand toute la
période est bouclée. Un plafond franchi se signale de la même façon mais en
rouge, et sans fête : une secousse brève et un sceau d'alerte, parce que ce
n'est pas un exploit. La comparaison se fait sur l'état précédent de la même
période, si bien qu'un simple chargement de page ne déclenche rien, et changer
de semaine non plus. L'animation est désactivée pour qui a demandé à son système
de réduire les animations ; le sceau et le bandeau, eux, restent : ils portent
l'information, contrairement au mouvement.

**Classement.** Visible uniquement depuis l'espace administrateur. Chaque
conseiller est classé indicateur par indicateur sur son réalisé, ex æquo au
même rang ; les points sont la somme de ces rangs et le plus petit total passe
premier. Un décompte de rangs, et non un pourcentage, ce qui évite de comparer
des contrats à des francs. Les rendez-vous valides non signés sont classés à
l'envers — c'est un plafond, le moins nombreux passe premier — et restent hors
des points : tenir un plafond n'est pas une performance, c'est la normale.

**Semaines et mois.** Semaines ISO 8601, du lundi au dimanche. Toutes les dates
sont raisonnées dans le fuseau `Europe/Zurich`, quel que soit le fuseau du
serveur — sans quoi un serveur en UTC rouvrirait la saisie de la veille pendant
les deux heures qui suivent minuit en été.

**Temps réel.** Les pages se mettent à jour d'elles-mêmes : le serveur pousse un
événement à chaque changement (flux `text/event-stream`), et les navigateurs
ouverts rechargent leurs chiffres. Une saisie de conseiller apparaît sur le
tableau de bord du responsable sans rechargement. Une pastille indique l'état de
la liaison.

## Gérer les accès

Tout se fait depuis l'onglet **Accès** de l'espace administrateur : créer,
renommer, désactiver, réactiver. La même chose en ligne de commande, utile
quand il n'existe encore aucun accès administrateur — donc personne pour ouvrir
cet onglet :

```
node suivi/gestion.mjs lister
node suivi/gestion.mjs ajouter p.dupont Pauline Dupont
node suivi/gestion.mjs renommer p.dupont Pauline Dupont-Meier
node suivi/gestion.mjs desactiver p.dupont
node suivi/gestion.mjs reactiver p.dupont
node suivi/gestion.mjs code-admin <code>
```

**À lancer serveur arrêté** : le serveur garde l'état en mémoire et réécrirait
le fichier par-dessus à sa prochaine modification.

L'identifiant est enregistré en minuscules ; la connexion, elle, ne tient pas
compte de la casse — `S.ragaa`, `s.ragaa` et `S.RAGAA` ouvrent la même page. Le
code administrateur suit la même règle.

Désactiver plutôt que supprimer : les chiffres déjà saisis restent au dossier et
continuent de compter dans les totaux passés, mais la personne ne peut plus se
connecter ni saisir.

### Ce que l'installation apporte

`suivi/equipe-initiale.json` liste les conseillers créés **au tout premier
démarrage**, quand la base est encore vierge. Passé ce moment le fichier n'est
plus jamais relu : le modifier ne change rien à une installation en service, et
une équipe vidée de tous ses conseillers ne verra pas ressusciter les anciens.
La base reste la seule source de vérité ; ce fichier n'est qu'un point de
départ, et ne contient que des identifiants et des noms.

`suivi/acces-initial.json` joue le même rôle pour l'accès administrateur, avec
la même règle : il ne sert qu'à la toute première configuration, et une fois
`suivi/data/config.json` écrit il n'est plus jamais consulté. Changer le code
avec `gestion.mjs code-admin` le rend définitivement sans effet.

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
├── gestion.mjs              Gestion des accès en ligne de commande
├── equipe-initiale.json     Conseillers créés au tout premier démarrage
├── acces-initial.json       Empreinte de l'accès administrateur de départ
├── tests.mjs                Suite de tests (210 cas)
├── lib/
│   ├── dates.mjs            Fuseau suisse, semaines ISO, libellés en français
│   ├── domaine.mjs          Indicateurs, cumuls, écarts, classement — fonctions pures
│   ├── stockage.mjs         Persistance JSON atomique et diffusion des changements
│   ├── sessions.mjs         Cookies signés, code administrateur, identifiants
│   ├── installation.mjs     Amorçage de l'équipe de départ, une seule fois
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

210 tests. Les tests de dates et de règles métier sont unitaires ; les tests
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
d'objectif, la désactivation et la réactivation d'un accès, le cloisonnement
des fichiers servis, l'amorçage de l'équipe de départ — qui ne joue qu'une
fois, jamais sur une base déjà peuplée, et refuse un identifiant invalide — et
l'accès administrateur livré, dont l'empreinte ne s'applique qu'à une
installation neuve et ne revient jamais écraser un code changé depuis ; enfin
l'indépendance des objectifs — deux conseillers aux grilles entièrement
distinctes, un indicateur modifié chez l'un qui ne déplace rien chez l'autre ni
sur ses propres autres lignes, et une case vide qui dispense sans toucher aux
collègues.

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
