-- Schema initial de l'appli fitness (spec MVP).
-- Tables : users, weight_logs, meals, exercises_log.
-- Les abonnements ne sont pas stockes ici : RevenueCat fait foi, on ne garde
-- que le palier en cache dans users.palier (ecrit uniquement par le webhook).

create extension if not exists "pgcrypto";

create type objectif_type as enum ('perte_poids', 'prise_muscle', 'maintien');
create type palier_type   as enum ('gratuit', 'standard', 'premium');

-- ---------------------------------------------------------------- users
create table public.users (
  id                uuid primary key references auth.users (id) on delete cascade,
  username          text not null unique
                    check (username ~ '^[a-z0-9_]{3,20}$'),
  email             text,
  auth_provider     text,
  objectif          objectif_type not null default 'maintien',
  taille_cm         integer check (taille_cm between 100 and 250),
  calories_objectif integer check (calories_objectif between 800 and 8000),
  palier            palier_type not null default 'gratuit',
  created_at        timestamptz not null default now()
);

comment on column public.users.calories_objectif is
  'Objectif calorique force par l''utilisateur. NULL = calcule par l''app.';
comment on column public.users.palier is
  'Cache du palier RevenueCat. Ecrit uniquement par le webhook (service_role).';

-- ---------------------------------------------------------- weight_logs
create table public.weight_logs (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  poids   numeric(5, 2) not null check (poids between 25 and 400),
  date    date not null default current_date,
  unique (user_id, date)
);

create index weight_logs_user_date_idx on public.weight_logs (user_id, date desc);

-- ---------------------------------------------------------------- meals
create table public.meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  photo_url  text,
  aliments   jsonb not null default '[]'::jsonb,
  calories   integer not null default 0 check (calories between 0 and 20000),
  proteines  numeric(6, 1) not null default 0 check (proteines >= 0),
  glucides   numeric(6, 1) not null default 0 check (glucides >= 0),
  lipides    numeric(6, 1) not null default 0 check (lipides >= 0),
  date       date not null default current_date,
  created_at timestamptz not null default now()
);

create index meals_user_date_idx on public.meals (user_id, date desc);

comment on column public.meals.aliments is
  'Detail renvoye par la vision puis corrige : [{nom, quantite, calories, ...}].';

-- --------------------------------------------------------- exercises_log
create table public.exercises_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  exercice      text not null check (char_length(exercice) between 2 and 60),
  poids_souleve numeric(6, 2) not null check (poids_souleve >= 0),
  reps          integer not null check (reps between 1 and 100),
  date          date not null default current_date,
  created_at    timestamptz not null default now()
);

create index exercises_log_user_date_idx on public.exercises_log (user_id, date desc);
create index exercises_log_exercice_idx  on public.exercises_log (exercice, poids_souleve desc);
