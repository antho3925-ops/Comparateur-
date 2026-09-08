# Appli fitness — suivi des calories par photo

MVP mobile iOS + Android : l'utilisateur photographie son assiette, un modele de
vision estime les aliments et les macros, il corrige si besoin, et l'appli suit
ses calories, ses seances et sa position dans les classements.

Ce dossier est autonome : il ne partage rien avec le comparateur d'assurance qui
occupe le reste du depot, et peut etre deplace tel quel dans son propre depot.

## Stack

| Besoin | Choix |
| --- | --- |
| Application | React Native via Expo (SDK 57), navigation par `expo-router` |
| Auth, base, stockage | Supabase |
| Vision photo → calories | API Claude, appelee par une Edge Function |
| Abonnements | RevenueCat (iOS + Android + les trois paliers) |
| Connexion | Sign in with Apple, Google via OAuth navigateur |

## Les trois paliers

| Palier | Prix | Photos/jour | Exercices | Classements |
| --- | --- | --- | --- | --- |
| Gratuit | 0 € | 1 | non | lecture seule |
| Standard | 5 €/mois | 6 (2 par repas) | non | participe |
| Premium | 15 €/mois | illimite | programme perso | participe |

Ces regles sont definies une seule fois, dans `src/metier/paliers.ts`, et
appliquees **aussi cote serveur** : un declencheur PostgreSQL refuse le repas
au-dela du quota, et `users.palier` n'est modifiable que par le webhook
RevenueCat. Sans cela, n'importe quel client pourrait s'attribuer Premium.

## Vous debutez ?

Lisez **[GUIDE-PUBLICATION.md](GUIDE-PUBLICATION.md)** : les memes etapes, mais
expliquees pour quelqu'un qui n'a jamais publie d'application, avec les couts et
les delais.

## Mise en route

### 1. Dependances

```bash
cd appli-fitness
npm install
```

### 2. Supabase

Creer un projet, puis appliquer les migrations :

```bash
supabase link --project-ref <votre-ref>
supabase db push
```

Activer les fournisseurs Apple et Google dans *Authentication → Providers*, et
ajouter `applifitness://retour-connexion` aux URL de redirection autorisees.

### 3. Edge Functions

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy analyser-repas

supabase secrets set REVENUECAT_AUTH_HEADER=<valeur secrete au choix>
supabase functions deploy webhook-revenuecat --no-verify-jwt

supabase functions deploy supprimer-compte
```

Puis, dans RevenueCat → *Integrations → Webhooks*, renseigner l'URL de
`webhook-revenuecat` et la meme valeur d'en-tete `Authorization`.

La cle du modele de vision ne quitte jamais le serveur : l'app envoie l'image,
la fonction repond avec l'estimation.

### 4. Variables d'environnement

```bash
cp .env.example .env
```

Ces variables sont publiques (elles finissent dans le bundle). Aucune cle
secrete ne doit y figurer.

### 5. Lancer

```bash
npx expo start
```

`EXPO_PUBLIC_TOUT_DEBLOQUE=1` (valeur par defaut de `.env.example`) leve toutes
les limites dans l'interface, comme le demandait la spec : on verifie que
l'appli marche, puis on repasse a `0` pour tester les paliers. Les quotas
restent appliques en base dans les deux cas.

## Verifications

```bash
npm run verif-types          # TypeScript, mode strict
npm test                     # logique metier (32 tests)
./supabase/tests/lancer.sh   # rejoue les migrations sur un PostgreSQL jetable
```

Le dernier script demarre un PostgreSQL local, applique les quatre migrations et
verifie le comportement reel du schema : quotas 1 / 6 / illimite remis a zero
chaque jour, impossibilite pour un client de changer son palier, exclusion des
comptes gratuits des classements, classement au 1RM estime.

## Structure

```
app/                     Ecrans (expo-router)
  (auth)/                Connexion, onboarding
  (app)/                 Onglets : accueil, exercices, classements, profil
  photo.tsx              Camera + analyse
  correction.tsx         Ajustement des aliments avant enregistrement
  paywall.tsx            Les trois formules
src/
  metier/                Regles pures et testables (paliers, calories, programme)
  donnees/               Acces Supabase, une fonction par usage
  auth/, abonnement/     Contextes React
  ui/                    Theme et composants
supabase/
  migrations/            Schema, RLS, quotas, classements, stockage
  functions/             analyser-repas, webhook-revenuecat, supprimer-compte
  tests/                 Verification du schema sur PostgreSQL
tests/                   Tests de la logique metier
```

La logique metier est volontairement separee de React : elle se teste sans
simulateur, ce que font les 32 tests de `tests/`.

## Ordre de developpement suivi

Celui de la spec : auth et onboarding, puis les tables, puis la photo et la
vision, puis les limites par palier, puis RevenueCat, puis exercices,
classements et profil.

## Ce qui demande un appareil reel

Le code est complet et verifie autant qu'il peut l'etre hors appareil
(TypeScript strict, tests metier, schema execute sur un vrai PostgreSQL). Trois
choses ne peuvent pas etre validees ici et demandent un passage sur telephone :

- **Les achats RevenueCat** : module natif, absent d'Expo Go. Il faut une
  *development build* et des produits configures dans App Store Connect et Google
  Play. Sans cela, `achatsDisponibles` vaut `false` et le paywall l'annonce au
  lieu de planter.
- **Sign in with Apple** : demande un identifiant d'app et la capacite associee.
- **Le rendu camera et la qualite des estimations**, qui se jugent sur de vraies
  photos de repas.
