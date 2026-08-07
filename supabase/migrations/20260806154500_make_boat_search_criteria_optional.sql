---------------------------------------
-- OPTIONAL BOAT SEARCH CRITERIA.
---------------------------------------

-- The landing page's "See all" link has to open /search in a neutral state:
-- no filter applied, every published listing on the platform visible. That was
-- impossible while the search RPC made the port and the date window mandatory —
-- the page had to invent a default port (the first one alphabetically) and a
-- default week, which silently filtered the catalogue before the visitor had
-- expressed any criterion at all.
--
-- Port and dates therefore become optional. Passing null skips the matching
-- predicate instead of matching nothing:
--   * p_port_name null                -> every port
--   * p_from_date or p_to_date null   -> no availability window is required, so
--                                        a listing shows up whether or not it
--                                        happens to be free during some default
--                                        week. Availability is then the boat
--                                        page's calendar to answer, not the
--                                        catalogue's.
-- Every other filter behaves exactly as before.
--
-- The three defaults have to be added together: Postgres refuses a parameter
-- with a default that is followed by a parameter without one. The argument
-- types are unchanged, so `create or replace` is enough — no drop, and the
-- existing grants survive.

create or replace function public.search_available_boats(
  p_port_name text default null,
  p_from_date date default null,
  p_to_date date default null,
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
  cover_storage_bucket text,
  cover_storage_path text,
  cover_focal_point text,
  cover_alt_text text,
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
      b.capacity,
      cover.storage_bucket as cover_storage_bucket,
      cover.storage_path as cover_storage_path,
      cover.focal_point as cover_focal_point,
      cover.alt_text as cover_alt_text
    from public.boats b
    inner join public.ports p on p.id = b.port_id
    -- Left join: a listing without a photo still has to appear in the results.
    left join lateral (
      select m.storage_bucket, m.storage_path, m.focal_point, m.alt_text
      from public.boat_media m
      where m.boat_id = b.id
        and m.is_cover
      limit 1
    ) cover on true
    -- Port filter (optional: null means every port)
    where (p_port_name is null or p.name = p_port_name)
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
    -- Availability (optional): with a window, at least one slot must cover it
    and (
      p_from_date is null
      or p_to_date is null
      or exists (
        select 1
        from public.boat_availability_time_slots avail
        where avail.boat_id = b.id
          and avail.start_date <= p_from_date
          and avail.end_date >= p_to_date
      )
    )
    -- No conflicting ACTIVE reservation (PENDING or CONFIRMED block; others do
    -- not). Only meaningful once a window has been given.
    and (
      p_from_date is null
      or p_to_date is null
      or not exists (
        select 1
        from public.boat_reservations res
        where res.boat_id = b.id
          and res.status in ('PENDING', 'CONFIRMED')
          and res.start_date < p_to_date
          and res.end_date > p_from_date
      )
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
-- FILTER BOUNDS FOR THE WHOLE CATALOGUE.
---------------------------------------

-- The sidebar sliders bound whatever the result grid can contain, so they have
-- to follow the port filter into its neutral state: null now means "every
-- port".
--
-- `is_published` is added at the same time. The bounds describe the searchable
-- catalogue, and a draft listing is never searchable — including one would
-- stretch a slider over a price no result can ever have. It went unnoticed
-- while the bounds were always scoped to a single port; across every port it
-- would be plainly wrong.
create or replace function public.get_boat_filter_bounds(
  p_port_name text default null
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
  where (p_port_name is null or p.name = p_port_name)
    and b.is_published = true;
$$;
