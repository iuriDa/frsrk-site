-- Safe migration for the "Where to train" admin forms.
-- Calendar tables, auth users, and existing RLS policies are not changed here.
-- Existing sort_order and phone_secondary columns are intentionally preserved.

begin;

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

create index if not exists training_cities_active_name_idx
  on public.training_cities (active, name);

create index if not exists training_organizations_city_active_name_idx
  on public.training_organizations (city_id, active, name);

commit;

-- Просим PostgREST сразу перечитать структуру таблиц после ALTER TABLE.
notify pgrst, 'reload schema';
