-- =========================================================
-- Migration 3 : réalisations / articles des prestataires
-- À exécuter dans Supabase > SQL Editor
-- =========================================================

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

alter table provider_items enable row level security;

drop policy if exists "Réalisations visibles publiquement" on provider_items;
create policy "Réalisations visibles publiquement"
  on provider_items for select
  using (true);

drop policy if exists "Le prestataire gère ses réalisations" on provider_items;
create policy "Le prestataire gère ses réalisations"
  on provider_items for all
  using (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()))
  with check (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()));

drop policy if exists "Admins gèrent toutes les réalisations" on provider_items;
create policy "Admins gèrent toutes les réalisations"
  on provider_items for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()));
