# Logos des caisses

Déposez ici le logo officiel de chaque caisse, nommé d'après son identifiant :

```
assura.svg   axa.svg   concordia.svg   css.svg   groupe_mutuel.svg
helsana.svg  sanitas.svg   swica.svg    visana.svg
```

Formats acceptés, par ordre de préférence : `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`.

**Après avoir déposé les fichiers, lancer `node build.mjs`** : le build recense
les logos présents et les inscrit dans `data/db.js`. Sans cette étape, la page
continue d'afficher les noms en toutes lettres.

Une caisse sans logo affiche son nom — c'est un repli prévu, pas une erreur. Le
build indique combien de logos il a trouvés et signale tout fichier dont le nom
ne correspond à aucun identifiant d'assureur.

Hauteur d'affichage : 30 px. Un SVG ou un PNG d'au moins 120 px de haut sur fond
transparent donne le meilleur rendu.

Ces fichiers ne sont pas fournis avec le projet : les logos sont des marques
protégées appartenant à chaque assureur. Utilisez les versions mises à
disposition dans leurs chartes graphiques ou espaces partenaires, et respectez
les conditions d'usage qui les accompagnent.
