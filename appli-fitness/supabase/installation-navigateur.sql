-- =====================================================================
--  INSTALLATION COMPLETE DE LA BASE — a coller dans l'editeur SQL
-- =====================================================================
--
--  Ce fichier reunit les quatre migrations en un seul bloc, pour pouvoir
--  installer la base depuis un navigateur, telephone compris, sans outil
--  a installer.
--
--  MODE D'EMPLOI
--    1. Copier tout ce fichier.
--    2. Dans Supabase, ouvrir « SQL Editor » puis « New query ».
--    3. Coller, puis cliquer sur « Run ».
--    4. Le message attendu est « Success. No rows returned ».
--
--  A n'executer qu'une seule fois, sur une base vide.
--  Le contenu est identique a supabase/migrations/ : si vous modifiez
--  l'un, regenerez l'autre.
-- =====================================================================



-- =============================================================
-- 20260908000001_schema_initial.sql
-- =============================================================

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


-- =============================================================
-- 20260908000002_rls_et_quotas.sql
-- =============================================================

-- RLS : chacun ne voit et n'ecrit que ses propres lignes.
-- Les classements passent par des fonctions security definer (fichier suivant),
-- ce qui evite d'ouvrir les tables en lecture a tout le monde.

alter table public.users         enable row level security;
alter table public.weight_logs   enable row level security;
alter table public.meals         enable row level security;
alter table public.exercises_log enable row level security;

create policy "lit son profil"     on public.users for select using (auth.uid() = id);
create policy "cree son profil"    on public.users for insert with check (auth.uid() = id);
create policy "modifie son profil" on public.users for update using (auth.uid() = id)
                                                          with check (auth.uid() = id);

create policy "lit ses poids"     on public.weight_logs for select using (auth.uid() = user_id);
create policy "ajoute ses poids"  on public.weight_logs for insert with check (auth.uid() = user_id);
create policy "modifie ses poids" on public.weight_logs for update using (auth.uid() = user_id)
                                                              with check (auth.uid() = user_id);
create policy "efface ses poids"  on public.weight_logs for delete using (auth.uid() = user_id);

create policy "lit ses repas"     on public.meals for select using (auth.uid() = user_id);
create policy "ajoute ses repas"  on public.meals for insert with check (auth.uid() = user_id);
create policy "modifie ses repas" on public.meals for update using (auth.uid() = user_id)
                                                        with check (auth.uid() = user_id);
create policy "efface ses repas"  on public.meals for delete using (auth.uid() = user_id);

create policy "lit ses seances"     on public.exercises_log for select using (auth.uid() = user_id);
create policy "ajoute ses seances"  on public.exercises_log for insert with check (auth.uid() = user_id);
create policy "modifie ses seances" on public.exercises_log for update using (auth.uid() = user_id)
                                                                  with check (auth.uid() = user_id);
create policy "efface ses seances"  on public.exercises_log for delete using (auth.uid() = user_id);

-- ------------------------------------------------- le palier n'est pas modifiable par le client
-- users.palier est un cache de RevenueCat. Sans ce garde-fou, n'importe qui
-- pourrait s'attribuer "premium" avec un simple update depuis l'app.
create or replace function public.verrouille_palier()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.palier is distinct from old.palier
     and coalesce(
           nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
           ''
         ) <> 'service_role'
  then
    new.palier := old.palier;
  end if;
  return new;
end;
$$;

create trigger users_verrouille_palier
  before update on public.users
  for each row execute function public.verrouille_palier();

-- ------------------------------------------------------------ quota de photos par jour
create or replace function public.quota_photos(p_palier palier_type)
returns integer
language sql
immutable
as $$
  select case p_palier
           when 'gratuit'  then 1
           when 'standard' then 6
           when 'premium'  then null   -- illimite
         end;
$$;

create or replace function public.verifie_quota_repas()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_palier public.palier_type;
  v_quota  integer;
  v_deja   integer;
begin
  select palier into v_palier from public.users where id = new.user_id;
  v_quota := public.quota_photos(v_palier);

  if v_quota is null then          -- premium : rien a verifier
    return new;
  end if;

  select count(*) into v_deja
    from public.meals
   where user_id = new.user_id and date = new.date;

  if v_deja >= v_quota then
    raise exception 'quota_photos_atteint'
      using detail = format('palier %s : %s photo(s) par jour', v_palier, v_quota),
            errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger meals_verifie_quota
  before insert on public.meals
  for each row execute function public.verifie_quota_repas();


-- =============================================================
-- 20260908000003_classements.sql
-- =============================================================

-- Classements. Les tables restent fermees par RLS : on expose seulement des
-- agregats, via des fonctions security definer, et uniquement pour les
-- utilisateurs qui participent (palier standard ou premium).
-- Un compte gratuit peut appeler ces fonctions (lecture seule) mais n'y figure pas.

create or replace function public.participe_aux_classements(p_palier palier_type)
returns boolean
language sql
immutable
as $$
  select p_palier in ('standard', 'premium');
$$;

-- ------------------------------------------------- onglet 1 : perte de poids
-- Pourcentage perdu depuis le debut du mois demande (remise a zero mensuelle).
create or replace function public.classement_perte_poids(
  p_mois date default date_trunc('month', current_date)::date,
  p_limite integer default 50
)
returns table (
  rang         bigint,
  username     text,
  est_moi      boolean,
  pct_perdu    numeric,
  poids_depart numeric,
  poids_actuel numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with bornes as (
    select date_trunc('month', p_mois)::date                     as debut,
           (date_trunc('month', p_mois) + interval '1 month')::date as fin
  ),
  mesures as (
    select w.user_id,
           first_value(w.poids) over (partition by w.user_id order by w.date asc)  as depart,
           first_value(w.poids) over (partition by w.user_id order by w.date desc) as actuel
      from public.weight_logs w, bornes b
     where w.date >= b.debut and w.date < b.fin
  ),
  par_user as (
    select distinct m.user_id, m.depart, m.actuel from mesures m
  )
  select row_number() over (order by round((p.depart - p.actuel) / p.depart * 100, 2) desc,
                                     u.username asc) as rang,
         u.username,
         u.id = auth.uid()                                    as est_moi,
         round((p.depart - p.actuel) / p.depart * 100, 2)     as pct_perdu,
         p.depart                                             as poids_depart,
         p.actuel                                             as poids_actuel
    from par_user p
    join public.users u on u.id = p.user_id
   where public.participe_aux_classements(u.palier)
     and p.depart > 0
   order by pct_perdu desc, u.username asc
   limit greatest(p_limite, 1);
$$;

-- ------------------------------------- onglet 2 : performance par exercice
-- Classe sur le 1RM estime (formule d'Epley : charge x (1 + reps / 30)),
-- ce qui compare equitablement une serie lourde et une serie longue.
create or replace function public.classement_exercice(
  p_exercice text,
  p_limite integer default 50
)
returns table (
  rang          bigint,
  username      text,
  est_moi       boolean,
  un_rm_estime  numeric,
  poids_souleve numeric,
  reps          integer,
  date          date
)
language sql
stable
security definer
set search_path = ''
as $$
  with meilleures as (
    select distinct on (e.user_id)
           e.user_id, e.poids_souleve, e.reps, e.date,
           round(e.poids_souleve * (1 + e.reps::numeric / 30), 1) as un_rm
      from public.exercises_log e
     where lower(e.exercice) = lower(p_exercice)
     order by e.user_id, un_rm desc, e.date desc
  )
  select row_number() over (order by m.un_rm desc, u.username asc) as rang,
         u.username,
         u.id = auth.uid() as est_moi,
         m.un_rm,
         m.poids_souleve,
         m.reps,
         m.date
    from meilleures m
    join public.users u on u.id = m.user_id
   where public.participe_aux_classements(u.palier)
   order by m.un_rm desc, u.username asc
   limit greatest(p_limite, 1);
$$;

-- Exercices qui ont au moins une perf enregistree, pour alimenter l'onglet 2.
create or replace function public.exercices_classes()
returns table (exercice text, nb_athletes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select initcap(lower(e.exercice)) as exercice,
         count(distinct e.user_id)  as nb_athletes
    from public.exercises_log e
    join public.users u on u.id = e.user_id
   where public.participe_aux_classements(u.palier)
   group by initcap(lower(e.exercice))
   order by nb_athletes desc, exercice asc;
$$;

revoke execute on function public.classement_perte_poids(date, integer) from public;
revoke execute on function public.classement_exercice(text, integer)   from public;
revoke execute on function public.exercices_classes()                  from public;

grant execute on function public.classement_perte_poids(date, integer) to authenticated;
grant execute on function public.classement_exercice(text, integer)    to authenticated;
grant execute on function public.exercices_classes()                   to authenticated;


-- =============================================================
-- 20260908000004_storage_photos.sql
-- =============================================================

-- Bucket prive des photos de repas. Chaque utilisateur ecrit et lit
-- uniquement dans son dossier <user_id>/...
insert into storage.buckets (id, name, public)
values ('photos-repas', 'photos-repas', false)
on conflict (id) do nothing;

create policy "lit ses photos de repas"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos-repas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "depose ses photos de repas"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos-repas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "efface ses photos de repas"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos-repas' and (storage.foldername(name))[1] = auth.uid()::text);

