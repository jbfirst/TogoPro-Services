-- =========================================================
-- Migration : quartiers gérables + gestion Premium avancée
-- À exécuter UNE FOIS dans Supabase > SQL Editor
-- (sans danger si tu relances par erreur, tout est "if not exists")
-- =========================================================

-- 1. Table des quartiers (gérable depuis l'admin)
create table if not exists neighborhoods (
  id text primary key,
  label text not null
);

insert into neighborhoods (id, label) values
  ('be', 'Bè'),
  ('adidogome', 'Adidogomé'),
  ('agoe', 'Agoè'),
  ('tokoin', 'Tokoin'),
  ('kodjoviakope', 'Kodjoviakopé'),
  ('nyekonakpoe', 'Nyékonakpoè'),
  ('hedzranawoe', 'Hédzranawoé'),
  ('djidjole', 'Djidjolé')
on conflict (id) do nothing;

-- 2. Nouvelles colonnes sur providers
alter table providers add column if not exists premium_until date;

-- 3. Étendre le statut pour inclure "blocked"
alter table providers drop constraint if exists providers_status_check;
alter table providers add constraint providers_status_check
  check (status in ('pending', 'approved', 'rejected', 'blocked'));

-- 4. Policy de suppression pour les admins (elle n'existait pas encore)
drop policy if exists "Admins suppriment tout" on providers;
create policy "Admins suppriment tout"
  on providers for delete
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 5. Sécuriser et ouvrir categories/neighborhoods à la gestion admin
alter table categories enable row level security;
alter table neighborhoods enable row level security;

drop policy if exists "Catégories visibles publiquement" on categories;
create policy "Catégories visibles publiquement"
  on categories for select
  using (true);

drop policy if exists "Admins gèrent les catégories" on categories;
create policy "Admins gèrent les catégories"
  on categories for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Quartiers visibles publiquement" on neighborhoods;
create policy "Quartiers visibles publiquement"
  on neighborhoods for select
  using (true);

drop policy if exists "Admins gèrent les quartiers" on neighborhoods;
create policy "Admins gèrent les quartiers"
  on neighborhoods for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 6. Colonnes localisation (si tu n'as pas encore fait la migration précédente)
alter table providers add column if not exists latitude double precision;
alter table providers add column if not exists longitude double precision;
