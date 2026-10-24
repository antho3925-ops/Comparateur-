# Mettre en place Supabase (≈ 15 minutes, offre gratuite)

Supabase stocke les articles, les photos et le compte administrateur.
Tant que ce n'est pas fait, le site fonctionne en démo à partir du JSON.

## 1. Créer le projet

1. Aller sur https://supabase.com → **Start your project** → se connecter
   (avec GitHub ou un e-mail). Idéalement, utiliser un compte qui pourra être
   transmis au client plus tard.
2. **New project** :
   - *Name* : `paytoocash`
   - *Database Password* : cliquer **Generate a password** et le garder
     de côté (il ne servira pas au site, mais garde-le).
   - *Region* : **West EU (Paris)** ou **Central EU (Frankfurt)**.
   - Plan **Free** → **Create new project**. Attendre 1 à 2 minutes.

## 2. Créer les tables (copier-coller)

1. Menu de gauche → **SQL Editor** → **New query**.
2. Ouvrir `supabase/schema.sql`, tout copier, coller dans l'éditeur.
   Si le compte admin n'utilise pas `paytoocash@gmail.com`, changer cette
   adresse à la ligne `insert into public.admins …` (en minuscules).
3. Cliquer **Run**. Le message « Success. No rows returned » est normal.

Ce script crée les tables `categories`, `articles`, `boutique`, `reservations`,
`estimations`, les dossiers de photos `photos` (public) et `estimations` (privé),
et les règles de sécurité : tout le monde peut **lire** le catalogue, les
visiteurs peuvent **réserver** et **demander une estimation**, seul le compte
administrateur peut **modifier** et voir les demandes.

> **Base déjà créée avant la mise à jour « réservations / estimations » ?**
> Copiez seulement le bloc qui commence par `-- Ajouts : réservations 24 h`
> (en bas de `schema.sql`) et exécutez-le : il ajoute les tables
> `reservations` et `estimations`, le dossier privé de photos `estimations`
> et les colonnes des avis et de la galerie, sans toucher aux articles.

## 3. Créer le compte administrateur

1. Menu **Authentication** → **Users** → **Add user** → **Create new user**.
2. *Email* : `paytoocash@gmail.com` (la même adresse qu'à l'étape 2),
   *Password* : le mot de passe que le commerçant utilisera sur `/admin`
   (12 caractères minimum conseillés). Cocher **Auto Confirm User**.
   → **Create user**.
3. Toujours dans **Authentication** → **Sign In / Providers** (selon la version :
   *Providers → Email* ou *Settings*) : **désactiver « Allow new users to sign up »**
   puis **Save**. Ainsi personne d'autre ne peut créer de compte.

## 4. Récupérer les clés et les coller dans le site

1. Menu **Project Settings** (roue crantée) → **API** (ou **Data API** /
   **API Keys** selon la version).
2. Copier :
   - **Project URL** — ressemble à `https://abcdefgh.supabase.co`
   - la clé **anon public** (longue chaîne commençant par `eyJ…`), ou, si
     l'écran propose les nouvelles clés, la **Publishable key** (`sb_publishable_…`).
   - ⚠️ **Jamais** la clé `service_role` / `secret`.
3. Ouvrir `paytoocash/js/config.js` et remplir :

```js
export const CONFIG = {
  SUPABASE_URL: 'https://abcdefgh.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOi…',
  ADMIN_EMAIL: 'paytoocash@gmail.com',
  BUCKET: 'photos',
};
```

4. Enregistrer, puis commit et push : Netlify/Vercel redéploient tout seuls.

Ces deux valeurs peuvent être publiques : la protection vient des règles de
sécurité créées à l'étape 2.

## 5. Premier lancement : import automatique

1. Vérifier que les photos sont bien dans `paytoocash-photos/` et déployées.
2. Ouvrir `https://<adresse-du-site>/admin`, saisir le mot de passe.
3. La base étant vide, l'admin importe automatiquement les catégories, les
   45 articles, les infos du magasin et envoie les photos dans Supabase
   (barre de progression, environ une minute). Ne pas fermer la page.
4. C'est fini : le site public lit désormais Supabase.

## En cas de souci

| Message | Solution |
|---|---|
| « Base non initialisée » | L'étape 2 n'a pas été exécutée (ou a échoué) : relancer `schema.sql`. |
| « Ce compte n'est pas administrateur » | L'e-mail du compte (étape 3) n'est pas celui de la table `admins` (étape 2). Dans **SQL Editor** : `insert into admins(email) values ('adresse@exemple.fr');` |
| « Mot de passe incorrect » | Réinitialiser le mot de passe dans **Authentication → Users → … → Send password recovery** ou recréer l'utilisateur. |
| Articles importés « sans photo » | Les photos n'étaient pas présentes dans `paytoocash-photos/` au moment de l'import. Les ajouter ensuite article par article depuis l'admin. |

Offre gratuite : 500 Mo de base et 1 Go de photos, largement suffisant (les
photos sont réduites à ~300 Ko avant l'envoi). Un projet gratuit sans aucune
visite pendant 7 jours est mis en pause ; il se réactive d'un clic depuis le
tableau de bord Supabase.
