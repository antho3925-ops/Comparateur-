-- Paytoocash : schéma Supabase.
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis « Run ».
-- Lecture publique ; écriture réservée aux adresses e-mail listées dans « admins ».

-- ---------- Administrateurs ----------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- Aucune policy : la table n'est lisible que par la fonction ci-dessous.

-- Adresse du compte administrateur (à adapter si besoin, en minuscules).
insert into public.admins (email) values ('paytoocash@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'));
$$;

-- ---------- Catégories ----------
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  nom text not null unique,
  slug text not null unique,
  icone text not null default 'carton',
  image_url text,
  ordre int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Articles ----------
create table if not exists public.articles (
  id bigint generated always as identity primary key,
  titre text not null,
  marque text,
  categorie_id bigint references public.categories (id) on delete set null,
  type text,
  prix numeric(10, 2),
  prix_note text,
  etat text,
  garantie boolean,
  garantie_jusqu_au text,
  facture boolean,
  inclus text,
  specs text,
  stockage text,
  couleur text,
  matiere text,
  poids text,
  ram text,
  photos text[] not null default '{}',
  disponible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_categorie_idx on public.articles (categorie_id);
create index if not exists articles_created_idx on public.articles (created_at desc);

-- ---------- Infos du magasin (une seule ligne, id = 1) ----------
create table if not exists public.boutique (
  id int primary key default 1 check (id = 1),
  nom text not null default 'Paytoocash',
  adresse text,
  tel text,
  email text,
  facebook text,
  slogan text,
  atout text,
  horaires jsonb,
  horaires_note text,
  vitrine jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- Sécurité (RLS) ----------
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.boutique enable row level security;

do $$
declare t text;
begin
  foreach t in array array['categories', 'articles', 'boutique'] loop
    execute format('drop policy if exists "lecture publique" on public.%I', t);
    execute format('drop policy if exists "ecriture admin" on public.%I', t);
    execute format('create policy "lecture publique" on public.%I for select using (true)', t);
    execute format('create policy "ecriture admin" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---------- Stockage des photos ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = true;

drop policy if exists "photos lecture" on storage.objects;
drop policy if exists "photos ajout admin" on storage.objects;
drop policy if exists "photos modif admin" on storage.objects;
drop policy if exists "photos suppression admin" on storage.objects;
create policy "photos lecture" on storage.objects for select using (bucket_id = 'photos');
create policy "photos ajout admin" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_admin());
create policy "photos modif admin" on storage.objects for update to authenticated using (bucket_id = 'photos' and public.is_admin());
create policy "photos suppression admin" on storage.objects for delete to authenticated using (bucket_id = 'photos' and public.is_admin());

-- =====================================================================
-- Ajouts : réservations 24 h, demandes d'estimation, avis, galerie.
-- Ce bloc peut être exécuté seul sur une base déjà créée.
-- =====================================================================

alter table public.articles add column if not exists reserve_jusqu_au timestamptz;
alter table public.boutique add column if not exists avis jsonb;
alter table public.boutique add column if not exists galerie jsonb;

-- ---------- Réservations (24 h) ----------
create table if not exists public.reservations (
  id bigint generated always as identity primary key,
  article_id bigint references public.articles (id) on delete cascade,
  article_titre text,
  nom text not null check (char_length(nom) between 1 and 80),
  tel text not null check (char_length(tel) between 6 and 30),
  created_at timestamptz not null default now(),
  expire_at timestamptz not null,
  annulee boolean not null default false
);
alter table public.reservations enable row level security;
drop policy if exists "reservations admin" on public.reservations;
create policy "reservations admin" on public.reservations for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Le public réserve uniquement par cette fonction : elle vérifie que
-- l'article est en vente et libre, puis le bloque 24 h.
create or replace function public.reserver_article(p_article bigint, p_nom text, p_tel text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.articles;
  fin timestamptz := now() + interval '24 hours';
  tel_net text := regexp_replace(coalesce(p_tel, ''), '[^0-9+]', '', 'g');
begin
  if char_length(trim(coalesce(p_nom, ''))) < 2 or char_length(tel_net) < 10 then
    raise exception 'Nom ou téléphone invalide';
  end if;
  if (select count(*) from public.reservations
      where regexp_replace(tel, '[^0-9+]', '', 'g') = tel_net and not annulee and expire_at > now()) >= 2 then
    raise exception 'Trop de réservations en cours pour ce numéro';
  end if;
  select * into a from public.articles where id = p_article for update;
  if not found or not a.disponible then
    raise exception 'Article indisponible';
  end if;
  if a.reserve_jusqu_au is not null and a.reserve_jusqu_au > now() then
    raise exception 'Article déjà réservé';
  end if;
  update public.articles set reserve_jusqu_au = fin where id = p_article;
  insert into public.reservations (article_id, article_titre, nom, tel, expire_at)
  values (p_article, a.titre, left(trim(p_nom), 80), left(trim(p_tel), 30), fin);
  return fin;
end;
$$;
grant execute on function public.reserver_article(bigint, text, text) to anon, authenticated;

-- ---------- Demandes d'estimation (rachat) ----------
create table if not exists public.estimations (
  id bigint generated always as identity primary key,
  nom text not null check (char_length(nom) between 1 and 80),
  tel text not null check (char_length(tel) between 6 and 30),
  objet text not null check (char_length(objet) between 1 and 200),
  etat text check (char_length(etat) <= 100),
  details text check (char_length(details) <= 1500),
  prix_souhaite text check (char_length(prix_souhaite) <= 30),
  photos text[] not null default '{}' check (cardinality(photos) <= 4),
  traitee boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.estimations enable row level security;
drop policy if exists "estimations depot public" on public.estimations;
drop policy if exists "estimations admin" on public.estimations;
create policy "estimations depot public" on public.estimations for insert to anon, authenticated with check (not traitee);
create policy "estimations admin" on public.estimations for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Photos des demandes : dossier privé (lisible seulement par l'admin),
-- images de 6 Mo maximum.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('estimations', 'estimations', false, 6291456, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update set public = false, file_size_limit = 6291456,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

drop policy if exists "estimations photos depot" on storage.objects;
drop policy if exists "estimations photos admin" on storage.objects;
create policy "estimations photos depot" on storage.objects for insert to anon, authenticated with check (bucket_id = 'estimations');
create policy "estimations photos admin" on storage.objects for all to authenticated using (bucket_id = 'estimations' and public.is_admin());
