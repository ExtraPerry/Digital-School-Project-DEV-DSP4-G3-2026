---------------------------------------
-- PRIVATE SCHEMA + ADMIN HELPER.
---------------------------------------

-- SECURITY DEFINER helpers must live outside the API-exposed `public` schema
-- (Supabase security checklist). This helper is reused by the admin RLS
-- policies in this and later migrations.
create schema if not exists private;

create or replace function private.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where auth_id = auth.uid()
      and role = 'ADMINISTRATOR'
  );
$$;

revoke execute on function private.is_administrator() from anon;
grant execute on function private.is_administrator() to authenticated;

---------------------------------------
-- RESERVATION STATUS ENUM.
---------------------------------------

-- PENDING    : Reservation created, awaiting payment confirmation (blocks availability).
-- CONFIRMED  : Reservation paid/confirmed (blocks availability).
-- CANCELLED  : Reservation cancelled (does not block availability).
-- COMPLETED  : Rental period finished (does not block future availability).
create type public.reservation_status as enum (
  'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
);

alter table public.boat_reservations
  add column status public.reservation_status not null default 'CONFIRMED',
  add column total_amount numeric(10,2) check (total_amount is null or total_amount >= 0),
  add column currency text not null default 'EUR';

---------------------------------------
-- DATABASE-LEVEL DOUBLE-BOOKING GUARD.
---------------------------------------

-- btree_gist lets us mix equality (boat_id) and range overlap (dates) in a
-- single exclusion constraint. Only active reservations participate, so
-- CANCELLED / COMPLETED rows can freely overlap historical ranges.
create extension if not exists btree_gist;

alter table public.boat_reservations
  add constraint boat_reservations_no_overlap
  exclude using gist (
    boat_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('PENDING', 'CONFIRMED'));

---------------------------------------
-- PAYMENT TRANSACTIONS TABLE.
---------------------------------------

-- Stripe preparation only: rows are written exclusively by the service role
-- (future edge functions). No anon / authenticated write policies exist, so
-- RLS blocks all direct client writes.
create table public.payment_transactions (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys
  reservation_id uuid not null unique references public.boat_reservations(id) on delete cascade,

  -- Payment Data
  provider text not null default 'STRIPE',
  external_id text,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'PENDING'
);

comment on table public.payment_transactions is 'Payment records for reservations, written by service-role edge functions (Stripe).';

create trigger enforce_payment_transactions_timestamps
  before insert or update on public.payment_transactions
  for each row execute function public.enforce_table_timestamps();

alter table public.payment_transactions enable row level security;

grant select on public.payment_transactions to authenticated;

-- The reservation's renter, the boat owner, and administrators may read a
-- payment record. Writes are intentionally left to the service role only.
create policy "Renter, owner, or admin can view payment transactions"
on public.payment_transactions
for select
to authenticated
using (
  private.is_administrator()
  or exists (
    select 1
    from public.boat_reservations reservation
    join public.users renter on renter.id = reservation.renter_id
    where reservation.id = payment_transactions.reservation_id
      and renter.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.boat_reservations reservation
    join public.boats boat on boat.id = reservation.boat_id
    join public.users owner on owner.id = boat.owner_id
    where reservation.id = payment_transactions.reservation_id
      and owner.auth_id = auth.uid()
  )
);

---------------------------------------
-- SEARCH AVAILABLE BOATS RPC — BLOCK ON ACTIVE RESERVATIONS ONLY.
---------------------------------------

-- Rebuilt to ignore CANCELLED / COMPLETED reservations. PENDING must still
-- block, otherwise a boat could be double-booked while a payment is in flight.
create or replace function public.search_available_boats(
  p_port_name text,
  p_from_date date,
  p_to_date date,
  p_boat_types public.boat_type[] default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_min_length numeric default null,
  p_max_length numeric default null,
  p_skipper_included boolean default false,
  p_equipment public.boat_equipment[] default null,
  p_sort_by text default 'relevance',
  p_page int default 1,
  p_page_size int default 12
)
returns table (
  id uuid,
  name text,
  type public.boat_type,
  length_m numeric,
  price_per_day numeric,
  rating numeric,
  badge text,
  port_name text,
  motorization text,
  skipper_option public.boat_skipper_option,
  capacity smallint,
  total_count bigint
)
language sql
stable
as $$
  with available_boats as (
    select
      b.id,
      b.name,
      b.type,
      b.length_m,
      b.price_per_day,
      b.rating,
      b.badge,
      p.name as port_name,
      b.motorization,
      b.skipper_option,
      b.capacity
    from public.boats b
    inner join public.ports p on p.id = b.port_id
    -- Port filter (required)
    where p.name = p_port_name
    -- Type filter (optional multi-select)
    and (p_boat_types is null or b.type = any(p_boat_types))
    -- Price filter
    and (p_min_price is null or b.price_per_day >= p_min_price)
    and (p_max_price is null or b.price_per_day <= p_max_price)
    -- Length filter
    and (p_min_length is null or b.length_m >= p_min_length)
    and (p_max_length is null or b.length_m <= p_max_length)
    -- Skipper filter
    and (not p_skipper_included or b.skipper_option = 'INCLUDED')
    -- Equipment filter: boat must have ALL selected equipment items
    and (
      p_equipment is null
      or (
        select count(*)
        from public.boat_equipment_links el
        where el.boat_id = b.id
          and el.equipment = any(p_equipment)
      ) = array_length(p_equipment, 1)
    )
    -- Availability: at least one slot fully covers [from, to]
    and exists (
      select 1
      from public.boat_availability_time_slots avail
      where avail.boat_id = b.id
        and avail.start_date <= p_from_date
        and avail.end_date >= p_to_date
    )
    -- No conflicting ACTIVE reservation (PENDING or CONFIRMED block; others do not)
    and not exists (
      select 1
      from public.boat_reservations res
      where res.boat_id = b.id
        and res.status in ('PENDING', 'CONFIRMED')
        and res.start_date < p_to_date
        and res.end_date > p_from_date
    )
  )
  select
    ab.*,
    count(*) over () as total_count
  from available_boats ab
  order by
    case when p_sort_by = 'price_asc'  then ab.price_per_day end asc,
    case when p_sort_by = 'price_desc' then ab.price_per_day end desc,
    case when p_sort_by = 'rating'     then ab.rating        end desc,
    -- relevance: highest rating first, then lowest price
    case when p_sort_by = 'relevance' or p_sort_by is null then ab.rating end desc,
    case when p_sort_by = 'relevance' or p_sort_by is null then ab.price_per_day end asc
  limit p_page_size
  offset (p_page - 1) * p_page_size;
$$;
