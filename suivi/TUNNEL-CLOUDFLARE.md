# Rendre la plateforme accessible par un tunnel Cloudflare

Le principe : la plateforme tourne sur un ordinateur de l'agence, et un petit
programme — `cloudflared` — ouvre depuis cette machine une liaison sortante vers
Cloudflare, qui publie une adresse `https://`. Aucun port à ouvrir sur la box,
aucune adresse IP fixe à louer, et **les données ne quittent pas votre machine**.

Il faut en contrepartie que ce poste reste allumé : quand il s'éteint, l'adresse
ne répond plus. Choisissez un ordinateur qui ne bouge pas — pas un portable qu'on
emporte en rendez-vous.

## 1. Installer cloudflared

**Windows** — dans PowerShell :

```powershell
winget install --id Cloudflare.cloudflared
```

**macOS** — dans le Terminal :

```bash
brew install cloudflared
```

À défaut, les exécutables sont publiés sur la page des versions de
`cloudflare/cloudflared` sur GitHub.

Vérifiez : `cloudflared --version` doit répondre.

## 2. Essayer tout de suite, sans rien configurer

Deux fenêtres, ou le script `demarrer` fourni plus bas.

```
node suivi/serveur.mjs
cloudflared tunnel --url http://localhost:8080
```

La seconde commande affiche, au milieu de son bavardage, une ligne du genre :

```
https://quelque-chose-au-hasard.trycloudflare.com
```

C'est votre adresse. Ouvrez-la depuis votre téléphone, en 4G, pour vérifier
qu'elle sort bien de l'agence.

**Cette adresse change à chaque lancement de cloudflared.** Elle sert à essayer,
pas à donner un lien durable à vos conseillers. Pour cela, passez à l'étape
suivante.

## 3. Une adresse stable

Il faut un nom de domaine géré par Cloudflare. Si vous en avez déjà un, son
transfert de gestion vers Cloudflare est gratuit ; sinon comptez une quinzaine
de francs par an chez n'importe quel bureau d'enregistrement.

```
cloudflared tunnel login
cloudflared tunnel create suivi
cloudflared tunnel route dns suivi suivi.votre-domaine.ch
```

Puis un fichier de configuration — `%USERPROFILE%\.cloudflared\config.yml` sous
Windows, `~/.cloudflared/config.yml` sur macOS :

```yaml
tunnel: suivi
credentials-file: /chemin/vers/.cloudflared/<identifiant-du-tunnel>.json

ingress:
  - hostname: suivi.votre-domaine.ch
    service: http://localhost:8080
  - service: http_status:404
```

`cloudflared tunnel run suivi` publie alors la plateforme sur
`https://suivi.votre-domaine.ch`, adresse qui ne change plus.

## 4. Poser SUIVI_HTTPS=1

Le tunnel apporte le chiffrement : le cookie de session doit en profiter.

```
SUIVI_HTTPS=1 node suivi/serveur.mjs
```

**Une conséquence à connaître** : le cookie prend alors l'attribut `Secure`, que
les navigateurs refusent sur une adresse en clair. `http://localhost:8080`
continue de fonctionner — les navigateurs font une exception pour la machine
elle-même — mais `http://192.168.1.20:8080` depuis un autre poste ne permettra
plus de se connecter. Si vous tenez à garder l'accès par le réseau local en
parallèle du tunnel, laissez `SUIVI_HTTPS` de côté.

## 5. Mettre une porte devant, avec Cloudflare Access

**C'est le point que je vous recommande de ne pas sauter.** Un tunnel publie
votre plateforme sur l'internet ouvert. Une adresse au hasard en
`trycloudflare.com` est indevinable, mais `suivi.votre-domaine.ch` ne l'est pas —
et comme la plateforme n'a pas de mot de passe, quiconque tombe sur l'adresse
ouvre la page d'un conseiller en tapant son identifiant.

Cloudflare Access règle cela sans toucher à l'application, et gratuitement
jusqu'à cinquante personnes : le visiteur reçoit un code à usage unique sur son
adresse professionnelle avant d'atteindre la plateforme.

Dans le tableau de bord Cloudflare, **Zero Trust → Access → Applications →
Add an application → Self-hosted** :

- domaine : `suivi.votre-domaine.ch`
- règle : *Allow*, sélecteur **Emails**, et les quatre adresses — la vôtre et
  celles de Sofiane, Thomas et Melchior
- méthode de connexion : **One-time PIN**, qui n'exige aucun compte à créer

Vos conseillers verront donc deux étapes : le code reçu par courriel, puis leur
identifiant. C'est le prix d'une plateforme sans mot de passe exposée à
l'extérieur, et il est modique.

## 6. Démarrer automatiquement

Sans cela, une coupure de courant laisse l'équipe sans outil jusqu'à ce que
quelqu'un pense à relancer les deux commandes.

**Le tunnel** s'installe en service, une fois pour toutes :

```
cloudflared service install
```

**La plateforme**, sous Windows, par le Planificateur de tâches : nouvelle tâche,
déclencheur « Au démarrage de l'ordinateur », action « Démarrer un programme »,
programme `node`, arguments `serveur.mjs`, dossier de départ le dossier `suivi`.
Cochez « Exécuter même si l'utilisateur n'est pas connecté ».

Sur macOS, un fichier `~/Library/LaunchAgents/ch.stf.suivi.plist` :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
  <key>Label</key><string>ch.stf.suivi</string>
  <key>ProgramArguments</key>
  <array><string>/usr/local/bin/node</string><string>serveur.mjs</string></array>
  <key>WorkingDirectory</key><string>/Users/vous/Comparateur-/suivi</string>
  <key>EnvironmentVariables</key>
  <dict><key>SUIVI_HTTPS</key><string>1</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
```

chargé par `launchctl load ~/Library/LaunchAgents/ch.stf.suivi.plist`.

## 7. Sauvegarder

Tout l'historique de l'équipe tient dans un fichier. Une copie par semaine
suffit, sur une clé ou un disque réseau :

```
cp suivi/data/suivi.json sauvegardes/suivi-$(date +%F).json
```

Restaurer, c'est remettre ce fichier en place, serveur arrêté.

## Si quelque chose ne marche pas

**L'adresse ne répond pas.** Vérifiez d'abord que la plateforme tourne :
`http://localhost:8080` sur la machine elle-même. Si elle répond et que le
tunnel non, c'est cloudflared qu'il faut relancer.

**La page s'affiche mais la connexion échoue.** Probablement `SUIVI_HTTPS=1`
posé alors que vous arrivez par une adresse en clair — voir l'étape 4.

**Les chiffres ont disparu.** Vérifiez `SUIVI_DONNEES` : s'il a changé entre
deux lancements, le serveur a créé une base neuve ailleurs, sans effacer
l'ancienne. Le fichier précédent est toujours là.

**Le poste a redémarré et rien n'est reparti.** L'étape 6 n'a pas été faite, ou
la tâche planifiée ne s'exécute pas hors session — c'est la case « même si
l'utilisateur n'est pas connecté ».
