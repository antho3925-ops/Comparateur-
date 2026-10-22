# Vitrines Pro : portfolio de démos pour le commercial

Une appli unique (`index.html`) qui sert de **plaquette** et de **démo** en magasin :
- 21 sites de démonstration (friperie, tabac, épicerie de nuit, barbier, coiffeur, onglerie, boulangerie-pâtisserie, traiteur, restaurant, fleuriste, garage, institut, tatoueur, auto-école, kiné, réparation de téléphones, multiservices, caviste, artisan du bâtiment, snack, salon de thé) ;
- la page **Offre** (plaquette), le **devis sur mesure**, la prise de **2e rendez-vous** ;
- un **espace administrateur** (code par défaut : `1234`, à changer dans Réglages) ;
- tout est enregistré **sur le téléphone**, sans internet.

## Installer sur le téléphone du commercial (hors ligne)
1. Mettre ce dossier en ligne une seule fois sur un hébergement statique gratuit (GitHub Pages, Netlify, Cloudflare Pages).
2. Ouvrir l'adresse sur le téléphone **avec internet**, puis « Ajouter à l'écran d'accueil ».
3. L'appli fonctionne ensuite sans réseau. Les données restent sur le téléphone.

Fichiers à mettre en ligne : `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`.

## Récupérer les notes du commercial
Espace admin → Données → « Envoyer la sauvegarde » (WhatsApp, SMS, mail), puis sur le téléphone du patron : Données → « Importer » et coller le texte. « Envoyer le résumé du jour » donne un texte lisible.

## Avant la première visite
Espace admin → Réglages : nom de l'agence, nom du commercial, téléphone, prix et mensualité, jours de rendez-vous, code admin.

## Modifier l'appli
Le dossier `source/` contient le code, les photos traitées et le script `build.py` qui régénère `index.html`.
Les noms, photos, prix et avis des démos sont fictifs.
