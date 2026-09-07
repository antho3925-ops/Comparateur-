# Héberger la plateforme

Ce que l'outil demande à son hébergeur est court, mais le deuxième point élimine
la plupart des offres gratuites.

1. **Faire tourner Node** en continu. Pas de compilation, aucune dépendance :
   `npm start` suffit, et le serveur écoute sur le port donné par `PORT`.
2. **Garder un disque entre deux redémarrages.** Tout l'état vit dans un dossier
   — `suivi/data/` par défaut, ailleurs si `SUIVI_DONNEES` le dit. Sur un
   hébergeur au disque éphémère, ce dossier repart vide à chaque redéploiement
   et à chaque réveil : les chiffres de l'équipe disparaissent sans prévenir.
3. **Rester éveillé aux heures de travail.** Une offre qui endort le service
   après quinze minutes d'inactivité le réveille en trente secondes à la
   première visite — supportable, mais elle s'accompagne presque toujours du
   disque éphémère du point 2.

> Les conditions des offres gratuites changent souvent. Ce qui suit décrit la
> forme de chaque solution ; vérifiez les limites du jour avant de vous engager.

## Les voies possibles

| Voie | Vraiment gratuit | Disque persistant | Accessible hors du bureau | Mise en place |
|---|---|---|---|---|
| Poste du bureau, réseau local | oui | oui | non | quelques minutes |
| Poste du bureau + tunnel Cloudflare | oui | oui | oui | une heure |
| Machine virtuelle « toujours gratuite » (Oracle) | oui | oui | oui | une demi-journée |
| Hébergeur de conteneurs, offre gratuite | oui | **non** | oui | une heure |
| Hébergeur gratuit + base de données gérée | oui | oui | oui | demande de réécrire le stockage |

### 1. Un poste du bureau, sur le réseau local

La solution la plus simple, et celle qui garde les données chez vous. Sur un
ordinateur de l'agence :

```
node suivi/serveur.mjs
```

Relevez son adresse locale (`ipconfig` sous Windows, `ipconfig getifaddr en0`
sur un Mac) et donnez à vos conseillers `http://<adresse>:8080`, par exemple
`http://192.168.1.20:8080`. Il faut que le pare-feu laisse passer le port 8080.

Accessible seulement au bureau, et seulement quand ce poste est allumé.

### 2. Le même poste, rendu accessible de l'extérieur par un tunnel

Un tunnel Cloudflare donne une adresse en `https://` publique à un service qui
tourne chez vous, sans ouvrir de port sur votre box et sans adresse IP fixe.
L'offre gratuite couvre largement quatre utilisateurs.

```
cloudflared tunnel --url http://localhost:8080
```

Cette commande affiche une adresse temporaire, de quoi essayer tout de suite. Un
tunnel nommé, rattaché à un domaine, donne une adresse stable ; il faut un nom de
domaine, que vous avez peut-être déjà.

Les données restent sur votre machine — c'est le point fort de cette voie pour
des données de personnel. En contrepartie, le poste doit rester allumé, et
`SUIVI_HTTPS=1` est à poser puisque le tunnel apporte le chiffrement.

### 3. Une machine virtuelle « toujours gratuite »

Oracle Cloud offre des machines ARM sans limite de durée, avec un vrai disque.
C'est la seule offre de cloud public réellement gratuite et persistante que je
connaisse ; en contrepartie l'inscription demande une carte bancaire pour
vérification et l'obtention d'une machine peut demander plusieurs tentatives
selon la région.

Une fois la machine obtenue, `git clone`, `npm start` sous systemd, et Caddy
devant pour le certificat TLS :

```ini
[Unit]
Description=Suivi de performance
After=network.target

[Service]
WorkingDirectory=/opt/suivi/suivi
ExecStart=/usr/bin/node serveur.mjs
Environment=SUIVI_DONNEES=/var/lib/suivi
Environment=SUIVI_HTTPS=1
Restart=always
User=suivi

[Install]
WantedBy=multi-user.target
```

### 4. Un hébergeur de conteneurs, offre gratuite

Render, Koyeb et leurs semblables déploient le `Dockerfile` de ce dossier sans
rien configurer d'autre. C'est la voie la plus rapide — et celle qui perd vos
données, parce que leurs offres gratuites n'attachent pas de disque persistant.
À réserver à un essai. Si vous y allez quand même, sachez que chaque
redéploiement remet l'équipe à zéro.

Sur ces hébergeurs, réglez le dossier racine sur `suivi` et laissez-les utiliser
`npm start` ou le `Dockerfile`.

### 5. Un hébergeur gratuit avec une base de données gérée

La combinaison qui tient debout sans rien payer : un service gratuit pour le
code, et une base Postgres gratuite à côté (Neon, Supabase) pour les données.
Cela demande de remplacer le stockage en fichier JSON par des tables — un
travail réel mais circonscrit : tout passe par `lib/stockage.mjs`, et rien
d'autre dans le projet ne sait comment les données sont rangées.

## Réglages communs

| Variable | Rôle |
|---|---|
| `PORT` | Port d'écoute. La plupart des hébergeurs l'imposent ; le serveur le respecte. |
| `SUIVI_DONNEES` | Dossier de l'état. À faire pointer sur le disque persistant. |
| `SUIVI_HTTPS=1` | Derrière un reverse proxy TLS, pour que le cookie de session prenne `Secure`. |
| `SUIVI_CODE_ADMIN` | Change le code administrateur au démarrage. |

## Sauvegarde

Quelle que soit la voie, tout tient dans un fichier. Le copier ailleurs une fois
par semaine suffit :

```
cp "$SUIVI_DONNEES/suivi.json" "sauvegardes/suivi-$(date +%F).json"
```

Restaurer, c'est remettre ce fichier en place, serveur arrêté.
