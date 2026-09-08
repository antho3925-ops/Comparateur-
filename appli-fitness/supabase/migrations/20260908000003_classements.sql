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
