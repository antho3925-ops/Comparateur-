\set ON_ERROR_STOP on

-- Trois utilisateurs, un par palier.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@test'),
  ('33333333-3333-3333-3333-333333333333', 'carol@test');

insert into public.users (id, username, email, objectif, taille_cm, palier) values
  ('11111111-1111-1111-1111-111111111111', 'alice', 'alice@test', 'perte_poids', 170, 'premium'),
  ('22222222-2222-2222-2222-222222222222', 'bob',   'bob@test',   'perte_poids', 180, 'standard'),
  ('33333333-3333-3333-3333-333333333333', 'carol', 'carol@test', 'perte_poids', 165, 'gratuit');

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;

-- ============================ 1. quota de photos par jour
do $$
declare v_erreur text;
begin
  -- Gratuit : 1 photo par jour.
  insert into public.meals (user_id, calories) values ('33333333-3333-3333-3333-333333333333', 500);
  begin
    insert into public.meals (user_id, calories) values ('33333333-3333-3333-3333-333333333333', 500);
    raise exception 'ECHEC : la 2e photo d un compte gratuit aurait du etre refusee';
  exception when check_violation then
    null;  -- attendu
  end;

  -- Standard : 6 photos, la 7e est refusee.
  for i in 1..6 loop
    insert into public.meals (user_id, calories) values ('22222222-2222-2222-2222-222222222222', 400);
  end loop;
  begin
    insert into public.meals (user_id, calories) values ('22222222-2222-2222-2222-222222222222', 400);
    raise exception 'ECHEC : la 7e photo d un compte standard aurait du etre refusee';
  exception when check_violation then
    null;
  end;

  -- Premium : illimite.
  for i in 1..25 loop
    insert into public.meals (user_id, calories) values ('11111111-1111-1111-1111-111111111111', 300);
  end loop;

  -- Le quota est journalier : la veille reste ouverte pour le compte gratuit.
  insert into public.meals (user_id, calories, date)
  values ('33333333-3333-3333-3333-333333333333', 500, current_date - 1);

  raise notice 'OK 1 - quotas 1 / 6 / illimite, remis a zero chaque jour';
end $$;

-- ============================ 2. le palier n'est pas modifiable par le client
select set_config('request.jwt.claims',
                  jsonb_build_object('sub', '33333333-3333-3333-3333-333333333333',
                                     'role', 'authenticated')::text, false);
set role authenticated;
update public.users set palier = 'premium' where id = '33333333-3333-3333-3333-333333333333';
reset role;
select set_config('request.jwt.claims', '', false);

do $$
declare v_palier public.palier_type;
begin
  select palier into v_palier from public.users where username = 'carol';
  if v_palier <> 'gratuit' then
    raise exception 'ECHEC : un client a pu se donner le palier %', v_palier;
  end if;
  raise notice 'OK 2 - un client ne peut pas s auto-attribuer un palier';
end $$;

-- Le webhook, lui, doit pouvoir ecrire.
select set_config('request.jwt.claims',
                  jsonb_build_object('role', 'service_role')::text, false);
update public.users set palier = 'standard' where id = '33333333-3333-3333-3333-333333333333';
select set_config('request.jwt.claims', '', false);

do $$
declare v_palier public.palier_type;
begin
  select palier into v_palier from public.users where username = 'carol';
  if v_palier <> 'standard' then
    raise exception 'ECHEC : le webhook n a pas pu ecrire le palier (valeur %)', v_palier;
  end if;
  raise notice 'OK 3 - le webhook (service_role) ecrit bien le palier';
end $$;

-- On remet carol en gratuit pour la suite.
select set_config('request.jwt.claims',
                  jsonb_build_object('role', 'service_role')::text, false);
update public.users set palier = 'gratuit' where id = '33333333-3333-3333-3333-333333333333';
select set_config('request.jwt.claims', '', false);

-- ============================ 3. classement perte de poids
insert into public.weight_logs (user_id, poids, date) values
  ('11111111-1111-1111-1111-111111111111', 80, date_trunc('month', current_date)::date),
  ('11111111-1111-1111-1111-111111111111', 76, current_date),          -- -5 %
  ('22222222-2222-2222-2222-222222222222', 100, date_trunc('month', current_date)::date),
  ('22222222-2222-2222-2222-222222222222', 98, current_date),          -- -2 %
  ('33333333-3333-3333-3333-333333333333', 90, date_trunc('month', current_date)::date),
  ('33333333-3333-3333-3333-333333333333', 81, current_date);          -- -10 % mais gratuit

do $$
declare
  v_premier text;
  v_pct numeric;
  v_nb integer;
begin
  select username, pct_perdu into v_premier, v_pct
    from public.classement_perte_poids() order by rang limit 1;

  if v_premier <> 'alice' or v_pct <> 5.00 then
    raise exception 'ECHEC : tete du classement = % a % %%', v_premier, v_pct;
  end if;

  select count(*) into v_nb
    from public.classement_perte_poids() where username = 'carol';
  if v_nb <> 0 then
    raise exception 'ECHEC : un compte gratuit figure dans le classement';
  end if;

  select count(*) into v_nb from public.classement_perte_poids();
  if v_nb <> 2 then
    raise exception 'ECHEC : % participants au lieu de 2', v_nb;
  end if;

  raise notice 'OK 4 - classement perte de poids : alice -5 %%, bob -2 %%, carol exclue';
end $$;

-- ============================ 4. classement par exercice
insert into public.exercises_log (user_id, exercice, poids_souleve, reps) values
  ('11111111-1111-1111-1111-111111111111', 'Squat', 100, 5),   -- 1RM ~116.7
  ('11111111-1111-1111-1111-111111111111', 'Squat', 90, 8),    -- 1RM ~114 (moins bon)
  ('22222222-2222-2222-2222-222222222222', 'Squat', 120, 3),   -- 1RM ~132
  ('33333333-3333-3333-3333-333333333333', 'Squat', 200, 5);   -- gratuit : exclu

do $$
declare
  v_nom text;
  v_rm numeric;
  v_nb integer;
begin
  select username, un_rm_estime into v_nom, v_rm
    from public.classement_exercice('Squat') order by rang limit 1;

  if v_nom <> 'bob' then
    raise exception 'ECHEC : tete du classement squat = %', v_nom;
  end if;
  if v_rm <> 132.0 then
    raise exception 'ECHEC : 1RM de bob = % au lieu de 132', v_rm;
  end if;

  -- Une seule ligne par athlete : sa meilleure serie.
  select count(*) into v_nb from public.classement_exercice('Squat') where username = 'alice';
  if v_nb <> 1 then
    raise exception 'ECHEC : alice apparait % fois', v_nb;
  end if;

  select un_rm_estime into v_rm
    from public.classement_exercice('Squat') where username = 'alice';
  if v_rm <> 116.7 then
    raise exception 'ECHEC : alice devrait etre classee sur sa meilleure serie (116.7), pas %', v_rm;
  end if;

  select count(*) into v_nb from public.classement_exercice('Squat') where username = 'carol';
  if v_nb <> 0 then
    raise exception 'ECHEC : un compte gratuit figure au classement squat';
  end if;

  raise notice 'OK 5 - classement squat : bob 132 kg, alice sur sa meilleure serie, carol exclue';
end $$;

-- La recherche d'exercice ignore la casse.
do $$
declare v_nb integer;
begin
  select count(*) into v_nb from public.classement_exercice('squat');
  if v_nb <> 2 then
    raise exception 'ECHEC : la recherche par exercice est sensible a la casse';
  end if;
  raise notice 'OK 6 - la recherche d exercice ignore la casse';
end $$;

select 'TOUTES LES VERIFICATIONS SQL SONT PASSEES' as resultat;
