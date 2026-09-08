# Mettre l'appli sur les stores — guide pas a pas

Ecrit pour quelqu'un qui n'a jamais publie d'application. Suivez les etapes
dans l'ordre. Ne sautez pas l'etape 1 : tout le reste en depend.

**Ou vous en etes :** le code est ecrit et verifie, mais l'appli n'a jamais
tourne. Il reste a la brancher a des services, la voir fonctionner, puis la
soumettre. Comptez plusieurs semaines, l'essentiel etant de l'attente.

---

## Etape 1 — Voir l'appli sur votre telephone

C'est la seule etape vraiment importante pour l'instant. Tant que l'appli n'a
pas tourne, parler des stores n'a pas de sens.

### 1.1 Creer la base de donnees (gratuit)

1. Aller sur **supabase.com**, creer un compte, puis un projet.
2. Noter deux valeurs, dans *Project Settings → API* :
   - l'**URL du projet** (ressemble a `https://abcdefgh.supabase.co`)
   - la cle **anon public**
3. Installer l'outil Supabase et envoyer la structure des tables :

   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref VOTRE-REF
   supabase db push
   ```

### 1.2 Obtenir une cle pour l'analyse des photos (payant a l'usage)

Sur **console.anthropic.com**, creer un compte et generer une cle API. C'est
elle qui permet de lire les photos de repas. Vous payez a la photo analysee,
quelques centimes.

Puis :

```bash
supabase secrets set ANTHROPIC_API_KEY=votre-cle
supabase functions deploy analyser-repas
supabase functions deploy supprimer-compte
```

Cette cle reste sur le serveur. Elle n'entre jamais dans l'appli : une cle
placee dans une appli est une cle publique, n'importe qui peut la recuperer.

### 1.3 Lancer

Creer un fichier `.env` a partir du modele fourni :

```bash
cp .env.example .env
```

Y coller l'URL et la cle anon de l'etape 1.1. Puis :

```bash
npm install
npx expo start
```

Installer **Expo Go** sur votre telephone (App Store ou Play Store), scanner le
QR code affiche. L'appli se lance.

A ce stade, `EXPO_PUBLIC_TOUT_DEBLOQUE=1` deverrouille tout : vous voyez
l'ensemble des ecrans sans payer d'abonnement. C'est voulu.

**Ne passez a l'etape 2 que lorsque vous avez photographie un vrai repas et vu
les calories s'afficher.**

---

## Etape 2 — Les comptes payants

Ces comptes demandent une piece d'identite et une carte bancaire. Vous seul
pouvez les creer.

| Compte | Cout | Delai |
| --- | --- | --- |
| Apple Developer Program | environ 99 € par an | quelques jours de verification |
| Google Play Console | 25 $ une seule fois | quelques jours de verification |
| RevenueCat (abonnements) | gratuit au debut | immediat |

**Point de vigilance cote Google.** Depuis quelques annees, un compte
developpeur **personnel** nouvellement cree doit faire tester l'appli par une
douzaine de personnes pendant deux semaines avant d'avoir le droit de publier.
Un compte **d'entreprise** en est dispense. La regle evolue : verifiez la
condition en vigueur au moment ou vous creez le compte, car elle peut decaler
votre publication de plusieurs semaines.

**Point de vigilance cote Apple.** Le delai de validation est de quelques jours,
et un refus est frequent au premier essai. Ce n'est pas grave : on corrige et
on resoumet.

---

## Etape 3 — Preparer ce qui manque encore

Ces elements ne sont pas du code, mais aucun store ne les accepte manquants.

- [ ] **Une icone d'application.** Celle en place est l'icone generique d'Expo.
      Il en faut une a vous, carree, 1024 × 1024 pixels, a deposer dans
      `assets/icon.png`.
- [ ] **Un nom definitif.** Actuellement « Fitness », dans `app.json`.
- [ ] **Une politique de confidentialite**, publiee sur une page web
      accessible. Obligatoire des lors qu'une appli collecte un compte, un
      poids ou une photo — c'est le cas ici. Son adresse vous sera demandee par
      les deux stores.
- [ ] **Des captures d'ecran** de l'appli, prises sur telephone.
- [ ] **Un texte de presentation** pour la fiche de l'appli.

---

## Etape 4 — Les abonnements

A faire seulement quand l'appli tourne et que les comptes stores sont valides.

1. Declarer trois produits d'abonnement dans App Store Connect **et** dans
   Google Play Console : gratuit, standard (5 €/mois), premium (15 €/mois).
2. Sur **revenuecat.com**, creer un projet, y relier les deux stores, et creer
   deux droits d'acces nommes exactement `standard` et `premium`.
3. Recuperer les deux cles publiques RevenueCat, les coller dans `.env`.
4. Brancher le webhook, pour que le serveur sache qui a paye :

   ```bash
   supabase secrets set REVENUECAT_AUTH_HEADER=un-mot-de-passe-au-choix
   supabase functions deploy webhook-revenuecat --no-verify-jwt
   ```

   Puis, dans RevenueCat → *Integrations → Webhooks*, indiquer l'adresse de
   cette fonction et le meme mot de passe.
5. Passer `EXPO_PUBLIC_TOUT_DEBLOQUE=0` dans `.env` pour activer les limites,
   et verifier que le compte gratuit est bien bloque apres une photo.

---

## Etape 5 — Compiler et soumettre

Les applications ne se publient pas depuis le code source : il faut les
compiler. Expo le fait a distance, sans avoir besoin d'un Mac.

```bash
npm install -g eas-cli
eas login
eas build:configure

# une version d'essai, installable sur votre telephone
npm run build:test

# les versions definitives pour les deux stores
npm run build:store

# envoi vers les stores
eas submit --platform ios
eas submit --platform android
```

Puis, dans App Store Connect et Google Play Console : remplir la fiche
(captures, description, politique de confidentialite) et cliquer sur soumettre.

---

## Ce que ca coute au total

| Poste | Montant |
| --- | --- |
| Apple, la premiere annee | environ 99 € |
| Google, une seule fois | environ 23 € |
| Supabase | gratuit jusqu'a un certain volume |
| Analyse des photos | a l'usage, quelques centimes par photo |
| RevenueCat | gratuit sous un certain chiffre d'affaires |
| Compilation Expo | gratuite avec attente, payante pour aller plus vite |

Soit environ **120 € pour demarrer**, hors analyse des photos.

---

## Si vous bloquez

Notez le message d'erreur exact et l'etape ou vous en etes. La plupart des
blocages a ce stade viennent d'une cle mal recopiee ou d'un `.env` non
enregistre.
