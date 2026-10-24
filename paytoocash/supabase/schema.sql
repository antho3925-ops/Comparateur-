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
