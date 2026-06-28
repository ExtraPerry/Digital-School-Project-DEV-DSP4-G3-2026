---------------------------------------
-- BOATS TABLE.
---------------------------------------

create table public.boats (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  owner_id uuid references public.users(id) on delete set null,
  port_id uuid not null references public.ports(id) on delete restrict,

  -- Boat Data
  name text not null,
  type public.boat_type not null,
  length_m numeric(5,1) not null check (length_m > 0),
  capacity smallint not null check (capacity > 0),
  price_per_day numeric(10,2) not null check (price_per_day >= 0),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  badge text,
  description text
);

comment on table public.boats is 'The boats listed for rental, owned by users with the OWNER role.';

create trigger enforce_boats_timestamps
  before insert or update on public.boats
  for each row execute function public.enforce_table_timestamps();

alter table public.boats enable row level security;

grant select on public.boats to anon, authenticated;

-- View Policy
create policy "Anyone can view boats"
on public.boats
for select
to anon, authenticated
using ( true );
