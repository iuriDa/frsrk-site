-- Раздел «Где заниматься»: муниципалитеты и организации.
-- CRUD защищается RLS через RPC public.is_content_editor().
-- sort_order и phone_secondary сохраняются для совместимости со старыми данными.

create extension if not exists pgcrypto;

create table if not exists public.training_cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  territory_type text not null default 'city' check (territory_type in ('city', 'district')),
  map_x numeric(6, 3) not null default 50 check (map_x >= 0 and map_x <= 100),
  map_y numeric(6, 3) not null default 50 check (map_y >= 0 and map_y <= 100),
  responsible_name text,
  responsible_role text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_organizations (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.training_cities(id) on delete cascade,
  name text not null,
  organization_type text not null default 'sports_section' check (
    organization_type in ('sports_section', 'sports_club', 'sports_school', 'school', 'studio', 'other')
  ),
  organization_type_other text,
  address text,
  phone text,
  phone_secondary text,
  max_url text,
  website text,
  vk text,
  telegram text,
  coach_name text,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (organization_type <> 'other' or nullif(btrim(organization_type_other), '') is not null)
);

alter table public.training_cities
  add column if not exists territory_type text not null default 'city';

alter table public.training_organizations
  add column if not exists organization_type text not null default 'sports_section',
  add column if not exists organization_type_other text,
  add column if not exists max_url text;

update public.training_cities
set territory_type = 'city'
where territory_type is null;

update public.training_organizations
set organization_type = 'sports_section'
where organization_type is null;

alter table public.training_cities
  alter column territory_type set default 'city',
  alter column territory_type set not null;

alter table public.training_organizations
  alter column organization_type set default 'sports_section',
  alter column organization_type set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'training_cities_territory_type_check'
      and conrelid = 'public.training_cities'::regclass
  ) then
    alter table public.training_cities
      add constraint training_cities_territory_type_check
      check (territory_type in ('city', 'district')) not valid;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'training_organizations_organization_type_check'
      and conrelid = 'public.training_organizations'::regclass
  ) then
    alter table public.training_organizations
      add constraint training_organizations_organization_type_check
      check (organization_type in ('sports_section', 'sports_club', 'sports_school', 'school', 'studio', 'other')) not valid;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'training_organizations_other_type_required_check'
      and conrelid = 'public.training_organizations'::regclass
  ) then
    alter table public.training_organizations
      add constraint training_organizations_other_type_required_check
      check (organization_type <> 'other' or nullif(btrim(organization_type_other), '') is not null) not valid;
  end if;
end;
$$;

create index if not exists training_cities_active_sort_idx
  on public.training_cities (active, sort_order, name);

create index if not exists training_organizations_city_active_sort_idx
  on public.training_organizations (city_id, active, sort_order, name);

create index if not exists training_cities_active_name_idx
  on public.training_cities (active, name);

create index if not exists training_organizations_city_active_name_idx
  on public.training_organizations (city_id, active, name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists training_cities_set_updated_at on public.training_cities;
create trigger training_cities_set_updated_at
  before update on public.training_cities
  for each row execute function public.set_updated_at();

drop trigger if exists training_organizations_set_updated_at on public.training_organizations;
create trigger training_organizations_set_updated_at
  before update on public.training_organizations
  for each row execute function public.set_updated_at();

alter table public.training_cities enable row level security;
alter table public.training_organizations enable row level security;

drop policy if exists "Public can read training cities" on public.training_cities;
create policy "Public can read training cities"
  on public.training_cities
  for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Editors can manage training cities" on public.training_cities;
create policy "Editors can manage training cities"
  on public.training_cities
  for all
  to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());

drop policy if exists "Public can read training organizations" on public.training_organizations;
create policy "Public can read training organizations"
  on public.training_organizations
  for select
  to anon, authenticated
  using (
    active = true
    and exists (
      select 1
      from public.training_cities
      where training_cities.id = training_organizations.city_id
        and training_cities.active = true
    )
  );

drop policy if exists "Editors can manage training organizations" on public.training_organizations;
create policy "Editors can manage training organizations"
  on public.training_organizations
  for all
  to authenticated
  using (public.is_content_editor())
  with check (public.is_content_editor());
