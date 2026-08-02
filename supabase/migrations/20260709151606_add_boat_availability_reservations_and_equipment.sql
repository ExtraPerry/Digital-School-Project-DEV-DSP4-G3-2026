---------------------------------------
-- BOAT EQUIPMENT ENUM.
---------------------------------------

create type public.boat_equipment as enum ('GPS', 'SLEEPING_BERTHS', 'EQUIPPED_KITCHEN');

---------------------------------------
-- BOAT EQUIPMENT LINKS TABLE.
---------------------------------------

create table public.boat_equipment_links (
  -- Composite Primary Key & Foreign Keys
  boat_id uuid not null references public.boats(id) on delete cascade,
  equipment public.boat_equipment not null,

  constraint boat_equipment_links_pkey primary key (boat_id, equipment)
);

comment on table public.boat_equipment_links is 'Junction table associating boats with their available equipment.';

alter table public.boat_equipment_links enable row level security;

grant select on public.boat_equipment_links to anon, authenticated;

create policy "Anyone can view boat equipment"
on public.boat_equipment_links
for select
to anon, authenticated
using ( true );

---------------------------------------
-- BOAT AVAILABILITY TIME SLOTS TABLE.
---------------------------------------

create table public.boat_availability_time_slots (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys
  boat_id uuid not null references public.boats(id) on delete cascade,

  -- Availability Range
  start_date date not null,
  end_date date not null,

  constraint boat_availability_time_slots_date_check check (end_date >= start_date)
);

comment on table public.boat_availability_time_slots is 'Date ranges during which a boat is available for rental.';

create trigger enforce_boat_availability_time_slots_timestamps
  before insert or update on public.boat_availability_time_slots
  for each row execute function public.enforce_table_timestamps();

create index boat_availability_time_slots_boat_id_idx
  on public.boat_availability_time_slots (boat_id);

create index boat_availability_time_slots_date_range_idx
  on public.boat_availability_time_slots (start_date, end_date);

alter table public.boat_availability_time_slots enable row level security;

grant select on public.boat_availability_time_slots to anon, authenticated;

create policy "Anyone can view boat availability"
on public.boat_availability_time_slots
for select
to anon, authenticated
using ( true );

---------------------------------------
-- BOAT RESERVATIONS TABLE.
---------------------------------------

create table public.boat_reservations (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys
  renter_id uuid references public.users(id) on delete set null,
  boat_id uuid not null references public.boats(id) on delete cascade,

  -- Reservation Range
  start_date date not null,
  end_date date not null,

  constraint boat_reservations_date_check check (end_date >= start_date)
);

comment on table public.boat_reservations is 'Confirmed reservations blocking boat availability for a date range.';

create trigger enforce_boat_reservations_timestamps
  before insert or update on public.boat_reservations
  for each row execute function public.enforce_table_timestamps();

create index boat_reservations_boat_id_idx
  on public.boat_reservations (boat_id);

create index boat_reservations_date_range_idx
  on public.boat_reservations (start_date, end_date);

alter table public.boat_reservations enable row level security;

grant select on public.boat_reservations to anon, authenticated;

create policy "Anyone can view boat reservations"
on public.boat_reservations
for select
to anon, authenticated
using ( true );

---------------------------------------
-- SEARCH AVAILABLE BOATS RPC.
---------------------------------------

-- Returns a paginated list of boats available for a given date range,
-- filtered by port, type, price, length, skipper, and equipment.
-- Availability rule:
--   1. At least one availability slot fully covers [from, to].
--   2. No reservation overlaps [from, to].
-- Sort "relevance" = high rating first, then lower price.
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
    -- No conflicting reservation
    and not exists (
      select 1
      from public.boat_reservations res
      where res.boat_id = b.id
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

---------------------------------------
-- GET BOAT FILTER BOUNDS RPC.
---------------------------------------

-- Returns min/max values for price and length sliders for a given port,
-- so the search UI can set sensible slider ranges on load.
create or replace function public.get_boat_filter_bounds(
  p_port_name text
)
returns table (
  min_price numeric,
  max_price numeric,
  min_length numeric,
  max_length numeric
)
language sql
stable
as $$
  select
    coalesce(min(b.price_per_day), 0) as min_price,
    coalesce(max(b.price_per_day), 5000) as max_price,
    coalesce(min(b.length_m), 5) as min_length,
    coalesce(max(b.length_m), 30) as max_length
  from public.boats b
  inner join public.ports p on p.id = b.port_id
  where p.name = p_port_name;
$$;
