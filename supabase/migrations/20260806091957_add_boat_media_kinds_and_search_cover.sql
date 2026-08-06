---------------------------------------
-- BOAT MEDIA KIND ENUM.
---------------------------------------

-- Gallery images are not interchangeable: the public boat page labels each one
-- ("Cockpit and helm of ...", "Interior living space of ...") and those labels
-- are localized through next-intl, so they cannot be stored as free text in
-- alt_text without breaking the second locale. The kind therefore has to be a
-- closed set the UI can switch on, which is exactly an enum.
--
-- The values mirror the four shots a listing carries today (one cover plus
-- three gallery angles). ONBOARD and INTERIOR are alternatives to each other:
-- motorboats show onboard detail, sailboats and catamarans show the saloon.
create type public.boat_media_kind as enum (
  'COVER', 'COCKPIT', 'INTERIOR', 'ONBOARD', 'EXTERIOR'
);

---------------------------------------
-- BOAT MEDIA COLUMNS.
---------------------------------------

-- kind defaults to COVER so the rows that already exist (one cover per boat)
-- stay valid under the is_cover/kind consistency check added below.
alter table public.boat_media
  add column kind public.boat_media_kind not null default 'COVER',
  add column focal_point text;

comment on column public.boat_media.kind is
  'Shot type. Drives the localized alternative text and the gallery ordering.';

comment on column public.boat_media.focal_point is
  'CSS object-position for this image, e.g. "50% 54%". Null means centered. '
  'Covers are cropped hard by the card and hero layouts, so the subject has to '
  'stay framed at every aspect ratio.';

-- is_cover predates the kind column and is part of the exposed schema, so it is
-- kept rather than replaced. The two must never disagree: a row flagged as the
-- cover but typed EXTERIOR would sort into the gallery and render with the
-- wrong alternative text.
alter table public.boat_media
  add constraint boat_media_cover_matches_kind
  check (is_cover = (kind = 'COVER'));

-- A boat has exactly one cover: the card, the search result and the hero all
-- read a single image and would otherwise pick one non-deterministically.
create unique index boat_media_one_cover_per_boat_idx
  on public.boat_media (boat_id)
  where is_cover;

-- (boat_id, storage_path) is the natural key of a media row: the same object in
-- the same bucket must not be registered twice. It also gives the fixture
-- loader (`npm run seed:media`) a stable conflict target so re-running it
-- updates rows in place instead of duplicating them.
create unique index boat_media_boat_id_storage_path_idx
  on public.boat_media (boat_id, storage_path);

-- The focal point is interpolated straight into a style attribute, so it is
-- constrained to the two-percentage form the UI understands.
alter table public.boat_media
  add constraint boat_media_focal_point_format
  check (focal_point is null or focal_point ~ '^\d{1,3}% \d{1,3}%$');

---------------------------------------
-- REALTIME PUBLICATION.
---------------------------------------

-- useBoats subscribes to boat_media so replacing a listing photo refreshes the
-- search grid, and a subscription only ever fires for published tables.
-- boat_media is safe to publish: its single SELECT policy is
-- `to anon, authenticated using (true)`, so postgres_changes cannot widen
-- access beyond what any visitor can already read.
alter publication supabase_realtime add table public.boat_media;

---------------------------------------
-- SEARCH AVAILABLE BOATS RPC — COVER IMAGE.
---------------------------------------

-- The search grid renders a cover photo per result. Reading boat_media from the
-- client afterwards would mean a second round-trip per page (and an N+1 once
-- filters change), so the cover travels with the row.
--
-- The return type changes, which Postgres cannot do through CREATE OR REPLACE,
-- hence the explicit drop. Argument list and behaviour are otherwise unchanged
-- from migration 20260709160200.
drop function if exists public.search_available_boats(
  text, date, date, public.boat_type[], numeric, numeric, numeric, numeric,
  boolean, public.boat_equipment[], text, int, int
);

create function public.search_available_boats(
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
