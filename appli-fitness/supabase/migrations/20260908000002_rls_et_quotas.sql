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
