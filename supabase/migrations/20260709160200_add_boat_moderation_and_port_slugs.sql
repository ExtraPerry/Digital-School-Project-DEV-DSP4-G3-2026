---------------------------------------
-- BOAT MODERATION FLAGS.
---------------------------------------

-- Boats default to published so the existing search behaviour is unchanged.
-- Moderation can later unpublish a listing without deleting it.
alter table public.boats
  add column is_published boolean not null default true,
  add column published_at timestamp with time zone;

---------------------------------------
-- PORT SLUGS.
---------------------------------------

-- Slugs give ports stable, URL-friendly identifiers for future port pages.
create extension if not exists unaccent;

alter table public.ports
  add column slug text unique;

-- Backfill existing rows (kebab-case, accents stripped) before enforcing NOT NULL.
update public.ports
set slug = trim(both '-' from regexp_replace(lower(unaccent(name)), '[^a-z0-9]+', '-', 'g'))
where slug is null;

alter table public.ports
  alter column slug set not null;

---------------------------------------
-- SEARCH AVAILABLE BOATS RPC — ONLY PUBLISHED BOATS.
---------------------------------------

-- Rebuilt to also hide unpublished boats. Keeps the active-reservation filter
-- introduced in the previous migration; return shape is unchanged.
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
    -- Only published boats are searchable
    and b.is_published = true
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
