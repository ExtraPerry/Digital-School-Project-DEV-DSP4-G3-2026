---------------------------------------
-- BOAT SKIPPER OPTION ENUM.
---------------------------------------

create type public.boat_skipper_option as enum ('INCLUDED', 'OPTIONAL', 'NONE');

---------------------------------------
-- BOATS TABLE — ADDITIONAL DETAILS.
---------------------------------------

alter table public.boats
  add column width_m numeric(4,1) not null default 0 check (width_m >= 0),
  add column draft_m numeric(4,1) not null default 0 check (draft_m >= 0),
  add column motorization text,
  add column skipper_option public.boat_skipper_option not null default 'NONE',
  add column deposit_amount numeric(10,2) not null default 0 check (deposit_amount >= 0);

---------------------------------------
-- BOAT REVIEWS TABLE.
---------------------------------------

create table public.boat_reviews (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  boat_id uuid not null references public.boats(id) on delete cascade,

  -- Review Data
  author_name text not null,
  rating numeric(2,1) not null check (rating between 0 and 5),
  comment text not null
);

comment on table public.boat_reviews is 'Renter reviews left on a boat after a rental.';

create trigger enforce_boat_reviews_timestamps
  before insert or update on public.boat_reviews
  for each row execute function public.enforce_table_timestamps();

alter table public.boat_reviews enable row level security;

grant select on public.boat_reviews to anon, authenticated;

-- View Policy
create policy "Anyone can view boat reviews"
on public.boat_reviews
for select
to anon, authenticated
using ( true );
