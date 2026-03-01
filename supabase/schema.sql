-- ============================================================
-- GreenBridge — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";          -- for text search

-- ─── Profiles ────────────────────────────────────────────────
-- Extends Supabase's built-in auth.users table
create table if not exists profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  role        text not null check (role in ('restaurant', 'shelter')),
  org_name    text not null,
  address     text,
  lat         float,
  lng         float,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─── Listings ────────────────────────────────────────────────
create table if not exists listings (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references profiles(id) on delete cascade,
  name          text not null,
  category      text not null check (category in (
                  'Produce','Meat','Dairy','Bakery','Cooked Meals','Beverages','Other')),
  quantity      float not null check (quantity > 0),
  unit          text not null check (unit in ('kg','lbs','portions','liters','pieces','loaves')),
  dietary_tags  text[] not null default '{}',
  photo_url     text,
  expires_at    timestamptz not null,
  status        text not null default 'available'
                  check (status in ('available','claimed','expired')),
  lat           float,
  lng           float,
  co2_saved     float not null default 0,
  water_saved   float not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger listings_updated_at
  before update on listings
  for each row execute function update_updated_at();

-- Index for fast queries
create index listings_restaurant_idx on listings(restaurant_id);
create index listings_status_idx     on listings(status);
create index listings_expires_idx    on listings(expires_at);
create index listings_category_idx   on listings(category);

-- ─── Claims ──────────────────────────────────────────────────
create table if not exists claims (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null references listings(id) on delete cascade,
  shelter_id       uuid not null references profiles(id) on delete cascade,
  claimed_at       timestamptz not null default now(),
  pickup_confirmed bool not null default false,
  notes            text,
  unique (listing_id, shelter_id)   -- one claim per shelter per listing
);

create index claims_shelter_idx  on claims(shelter_id);
create index claims_listing_idx  on claims(listing_id);

-- ─── Predictions ─────────────────────────────────────────────
create table if not exists predictions (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references profiles(id) on delete cascade,
  predicted_category  text not null,
  predicted_qty       float not null,
  risk_level          text not null check (risk_level in ('low','medium','high')),
  confidence          float not null check (confidence between 0 and 1),
  for_date            date not null,
  created_at          timestamptz not null default now()
);

create index predictions_restaurant_idx on predictions(restaurant_id);
create index predictions_date_idx       on predictions(for_date);

-- ─── Real-time Publications ──────────────────────────────────
-- Allow Supabase realtime to broadcast changes
alter publication supabase_realtime add table listings;
alter publication supabase_realtime add table claims;

-- ─── Row-Level Security ──────────────────────────────────────
-- profiles
alter table profiles enable row level security;

create policy "Users can read all profiles"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- listings
alter table listings enable row level security;

create policy "Anyone can read available listings"
  on listings for select using (status = 'available' or restaurant_id = auth.uid());
create policy "Restaurants can insert own listings"
  on listings for insert with check (
    auth.uid() = restaurant_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'restaurant')
  );
create policy "Restaurants can update own listings"
  on listings for update using (auth.uid() = restaurant_id);
create policy "Restaurants can delete own listings"
  on listings for delete using (auth.uid() = restaurant_id);

-- claims
alter table claims enable row level security;

create policy "Shelters can read own claims"
  on claims for select using (auth.uid() = shelter_id);
create policy "Restaurants can read claims on their listings"
  on claims for select using (
    exists (select 1 from listings l where l.id = listing_id and l.restaurant_id = auth.uid())
  );
create policy "Shelters can create claims"
  on claims for insert with check (
    auth.uid() = shelter_id and
    exists (select 1 from profiles where id = auth.uid() and role = 'shelter')
  );
create policy "Shelters can update own claims"
  on claims for update using (auth.uid() = shelter_id);

-- predictions
alter table predictions enable row level security;

create policy "Restaurants can read own predictions"
  on predictions for select using (auth.uid() = restaurant_id);
create policy "Service role can insert predictions"
  on predictions for insert with check (auth.uid() = restaurant_id);

-- ─── Storage Bucket ──────────────────────────────────────────
-- Run in Supabase Dashboard → Storage → New Bucket (or via SQL below)
insert into storage.buckets (id, name, public)
values ('food-photos', 'food-photos', true)
on conflict do nothing;

create policy "Anyone can view food photos"
  on storage.objects for select using (bucket_id = 'food-photos');
create policy "Authenticated users can upload food photos"
  on storage.objects for insert with check (
    bucket_id = 'food-photos' and auth.role() = 'authenticated'
  );
create policy "Users can delete own food photos"
  on storage.objects for delete using (
    bucket_id = 'food-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── Useful Views ────────────────────────────────────────────
-- Aggregate platform stats (used by /api/impact)
create or replace view platform_stats as
select
  count(distinct c.id)                                    as total_rescues,
  sum(l.co2_saved)::float                                 as total_co2_saved,
  sum(l.water_saved)::float                               as total_water_saved,
  sum(l.quantity)::float                                  as total_quantity,
  count(distinct p.id) filter (where p.role = 'restaurant') as active_restaurants,
  count(distinct p.id) filter (where p.role = 'shelter')    as active_shelters
from listings l
left join claims c on c.listing_id = l.id
cross join profiles p
where l.status = 'claimed';
