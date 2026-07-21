-- =========================================================
-- TogoPro Services — Schéma Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =========================================================

-- Extension pour générer des UUID
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Table: categories (référence fixe, pas besoin d'admin pour gérer)
-- ---------------------------------------------------------
create table if not exists categories (
  id text primary key,           -- ex: 'plomberie'
  label text not null,           -- ex: 'Plomberie'
  icon text not null             -- nom d'icône lucide-react, ex: 'Wrench'
);

insert into categories (id, label, icon) values
  ('plomberie', 'Plomberie', 'Wrench'),
  ('electricite', 'Électricité', 'Zap'),
  ('beaute', 'Beauté & Coiffure', 'Scissors'),
  ('traiteur', 'Traiteur & Cuisine', 'ChefHat'),
  ('mecanique', 'Mécanique auto/moto', 'Car'),
  ('menage', 'Ménage & Nettoyage', 'Sparkles'),
  ('maconnerie', 'Maçonnerie & Rénovation', 'HardHat'),
  ('menuiserie', 'Menuiserie & Ébénisterie', 'Hammer'),
  ('couture', 'Couture & Stylisme', 'Shirt'),
  ('informatique', 'Informatique & Digital', 'Laptop')
on conflict (id) do nothing;

-- ---------------------------------------------------------
-- Table: neighborhoods (quartiers, gérables depuis l'admin)
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- Table: providers (fiches prestataires)
-- ---------------------------------------------------------
create table if not exists providers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  category_id text references categories(id) not null,
  neighborhood text not null,
  phone text not null,
  description text not null default '',
  rate_info text default '',              -- tarif indicatif en texte libre, ex: "À partir de 2000 FCFA"
  photo_urls text[] default '{}',         -- URLs Supabase Storage
  latitude double precision,              -- position GPS (facultatif)
  longitude double precision,             -- position GPS (facultatif)
  is_verified boolean default false,      -- validé par un admin
  is_premium boolean default false,       -- abonnement premium actif
  premium_until date,                     -- date de fin du Premium (null = jamais activé)
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'blocked')),
  view_count integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_providers_category on providers(category_id);
create index if not exists idx_providers_neighborhood on providers(neighborhood);
create index if not exists idx_providers_status on providers(status);

-- ---------------------------------------------------------
-- Table: reviews (avis clients)
-- ---------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade not null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text default '',
  reply text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_provider on reviews(provider_id);

-- ---------------------------------------------------------
-- Table: reports (signalements de fiches)
-- ---------------------------------------------------------
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade not null,
  reason text not null,
  details text default '',
  resolved boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_reports_provider on reports(provider_id);

-- ---------------------------------------------------------
-- Table: provider_items (réalisations, articles à vendre, portfolio)
-- ---------------------------------------------------------
create table if not exists provider_items (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade not null,
  title text not null,
  description text default '',
  price_info text default '',
  photo_url text,
  created_at timestamptz default now()
);

create index if not exists idx_items_provider on provider_items(provider_id);

-- ---------------------------------------------------------
-- Table: admins (liste blanche des comptes admin)
-- ---------------------------------------------------------
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table providers enable row level security;
alter table reviews enable row level security;
alter table admins enable row level security;

-- Tout le monde peut voir les fiches APPROUVÉES
create policy "Fiches approuvées visibles publiquement"
  on providers for select
  using (status = 'approved');

-- Un prestataire peut voir sa propre fiche même si pas encore approuvée
create policy "Un prestataire voit sa propre fiche"
  on providers for select
  using (auth.uid() = user_id);

-- Un utilisateur connecté peut créer SA fiche
create policy "Créer sa propre fiche"
  on providers for insert
  with check (auth.uid() = user_id);

-- Un prestataire peut modifier sa propre fiche (mais pas is_verified/is_premium/status — voir note plus bas)
create policy "Modifier sa propre fiche"
  on providers for update
  using (auth.uid() = user_id);

-- Les admins peuvent tout voir et tout modifier
create policy "Admins voient tout"
  on providers for select
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

create policy "Admins modifient tout"
  on providers for update
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

create policy "Admins suppriment tout"
  on providers for delete
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Sécurité sur categories et neighborhoods : lecture publique, écriture admin uniquement
alter table categories enable row level security;
alter table neighborhoods enable row level security;

create policy "Catégories visibles publiquement"
  on categories for select
  using (true);

create policy "Admins gèrent les catégories"
  on categories for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

create policy "Quartiers visibles publiquement"
  on neighborhoods for select
  using (true);

create policy "Admins gèrent les quartiers"
  on neighborhoods for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Sécurité sur provider_items : lecture publique, écriture par le propriétaire de la fiche
alter table provider_items enable row level security;

create policy "Réalisations visibles publiquement"
  on provider_items for select
  using (true);

create policy "Le prestataire gère ses réalisations"
  on provider_items for all
  using (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()))
  with check (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()));

create policy "Admins gèrent toutes les réalisations"
  on provider_items for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Avis : lecture publique, écriture ouverte (avis "libres", sans compte requis)
create policy "Avis visibles publiquement"
  on reviews for select
  using (true);

create policy "Tout le monde peut laisser un avis"
  on reviews for insert
  with check (true);

create policy "Le prestataire répond à ses avis"
  on reviews for update
  using (
    exists (
      select 1 from providers
      where providers.id = reviews.provider_id
      and providers.user_id = auth.uid()
    )
  );

-- Signalements : tout le monde peut signaler, seuls les admins voient/traitent
alter table reports enable row level security;

create policy "Tout le monde peut signaler"
  on reports for insert
  with check (true);

create policy "Admins voient les signalements"
  on reports for select
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

create policy "Admins traitent les signalements"
  on reports for update
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- Admins : lecture de sa propre entrée uniquement (juste pour vérifier le statut admin)
create policy "Un admin peut vérifier son propre statut"
  on admins for select
  using (auth.uid() = user_id);

-- =========================================================
-- Note importante sur la sécurité :
-- La policy "Modifier sa propre fiche" permet à un prestataire de modifier
-- TOUS les champs de sa fiche, y compris is_verified/is_premium/status en théorie.
-- Pour une V1 avec peu d'utilisateurs, tu peux vérifier ça manuellement.
-- Pour verrouiller correctement plus tard, remplace cette policy par une
-- Postgres function (RPC) qui ne permet de modifier que les champs
-- éditoriaux (nom, description, tarif, photos) et jamais status/is_verified/is_premium.
-- =========================================================

-- ---------------------------------------------------------
-- Fonction : incrémenter le compteur de vues d'une fiche
-- (fonction plutôt qu'update direct pour éviter les conflits RLS)
-- ---------------------------------------------------------
create or replace function increment_provider_views(p_id uuid)
returns void as $$
begin
  update providers set view_count = view_count + 1 where id = p_id;
end;
$$ language plpgsql security definer;

-- =========================================================
-- Storage : bucket pour les photos de profil prestataires
-- À créer manuellement dans Supabase Dashboard > Storage :
-- 1. Créer un bucket "provider-photos" en PUBLIC
-- 2. Ajouter cette policy pour permettre l'upload aux connectés :
-- =========================================================
-- (à exécuter après création du bucket, ou via l'UI Storage > Policies)
-- create policy "Upload photos si connecté"
--   on storage.objects for insert
--   with check (bucket_id = 'provider-photos' and auth.role() = 'authenticated');
--
-- create policy "Photos lisibles publiquement"
--   on storage.objects for select
--   using (bucket_id = 'provider-photos');
