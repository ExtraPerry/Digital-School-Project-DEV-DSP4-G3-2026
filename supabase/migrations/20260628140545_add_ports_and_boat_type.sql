---------------------------------------
-- BOAT TYPE ENUM.
---------------------------------------

create type public.boat_type as enum ('SAILBOAT', 'MOTORBOAT', 'CATAMARAN', 'YACHT');

---------------------------------------
-- PORTS TABLE.
---------------------------------------

create table public.ports (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Port Data
  name text not null unique,
  country text not null default 'France'
);

comment on table public.ports is 'The ports available for boat pickup, used to populate the search bar.';

create trigger enforce_ports_timestamps
  before insert or update on public.ports
  for each row execute function public.enforce_table_timestamps();

alter table public.ports enable row level security;

grant select on public.ports to anon, authenticated;

-- View Policy
create policy "Anyone can view ports"
on public.ports
for select
to anon, authenticated
using ( true );
