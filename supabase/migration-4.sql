-- =========================================================
-- Migration 4 : signalements de fiches + réponses aux avis
-- À exécuter dans Supabase > SQL Editor
-- =========================================================

-- 1. Table des signalements
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade not null,
  reason text not null,
  details text default '',
  resolved boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_reports_provider on reports(provider_id);

alter table reports enable row level security;

drop policy if exists "Tout le monde peut signaler" on reports;
create policy "Tout le monde peut signaler"
  on reports for insert
  with check (true);

drop policy if exists "Admins voient les signalements" on reports;
create policy "Admins voient les signalements"
  on reports for select
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

drop policy if exists "Admins traitent les signalements" on reports;
create policy "Admins traitent les signalements"
  on reports for update
  using (exists (select 1 from admins where admins.user_id = auth.uid()));

-- 2. Réponse du prestataire à un avis
alter table reviews add column if not exists reply text;
alter table reviews add column if not exists replied_at timestamptz;

drop policy if exists "Le prestataire répond à ses avis" on reviews;
create policy "Le prestataire répond à ses avis"
  on reviews for update
  using (
    exists (
      select 1 from providers
      where providers.id = reviews.provider_id
      and providers.user_id = auth.uid()
    )
  );
