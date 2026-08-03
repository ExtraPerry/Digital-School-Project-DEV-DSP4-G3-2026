---------------------------------------
-- TRIGRAM SEARCH INDEXES.
---------------------------------------

-- The admin list screens filter server-side through PostgREST using ILIKE
-- (`.or('email.ilike.%q%,...')`), which cannot use a plain btree index.
-- GIN trigram indexes keep those lookups from degrading into sequential scans
-- as the platform grows.
create extension if not exists pg_trgm;

create index if not exists users_email_trgm_idx
  on public.users using gin (email gin_trgm_ops);

create index if not exists users_first_name_trgm_idx
  on public.users using gin (first_name gin_trgm_ops);

create index if not exists users_last_name_trgm_idx
  on public.users using gin (last_name gin_trgm_ops);

create index if not exists boats_name_trgm_idx
  on public.boats using gin (name gin_trgm_ops);

create index if not exists boat_reviews_comment_trgm_idx
  on public.boat_reviews using gin (comment gin_trgm_ops);

create index if not exists boat_reviews_author_name_trgm_idx
  on public.boat_reviews using gin (author_name gin_trgm_ops);

---------------------------------------
-- BOAT PUBLICATION CONTROL (ADMIN).
---------------------------------------

-- Administrators already hold an UPDATE policy on public.boats, but a raw
-- `.update({ is_published })` from the client would leave no trace, and the
-- PUBLISH_BOAT / UNPUBLISH_BOAT audit actions would never be written.
-- Routing the take-down through a SECURITY DEFINER RPC keeps the change and
-- its audit row in one transaction, exactly like the user and review RPCs.
--
-- enforce_boat_publish_requirements() still applies: unpublishing is always
-- allowed and preserves published_at, while republishing re-checks that the
-- owner has a LICENSE, a SAILOR_CV and an INSURANCE for that boat. Its
-- exception is allowed to propagate so the UI can surface the reason.
create or replace function public.admin_set_boat_published(
  p_boat_id uuid,
  p_is_published boolean
)
returns public.boats
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  previous_state boolean;
  updated_boat public.boats;
begin
  if not private.is_administrator() then
    raise exception 'Only administrators can change a listing publication state.'
      using errcode = '42501';
  end if;

  select is_published into previous_state
    from public.boats where id = p_boat_id;

  if previous_state is null then
    raise exception 'ADMIN_BOAT_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  update public.boats
     set is_published = p_is_published
   where id = p_boat_id
  returning * into updated_boat;

  perform private.record_admin_action(
    case when p_is_published then 'PUBLISH_BOAT'::public.admin_action_type
         else 'UNPUBLISH_BOAT'::public.admin_action_type end,
    'boats',
    p_boat_id,
    jsonb_build_object(
      'previous_is_published', previous_state,
      'new_is_published', p_is_published
    )
  );

  return updated_boat;
end;
$$;

revoke execute on function public.admin_set_boat_published(uuid, boolean) from anon;
grant execute on function public.admin_set_boat_published(uuid, boolean) to authenticated;

---------------------------------------
-- GLOBAL ADMIN SEARCH.
---------------------------------------

-- Backs the "Recherche globale..." field drawn in the approved admin
-- wireframe. A cross-entity UNION genuinely needs SQL; the per-screen filters
-- stay on PostgREST because the existing RLS policies already scope them.
--
-- Guarded with an explicit RAISE rather than a WHERE predicate so a non-admin
-- caller fails loudly instead of receiving a plausible empty result set.
create or replace function public.admin_global_search(
  p_query text,
  p_limit integer default 5
)
returns table (
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  pattern text;
begin
  if not private.is_administrator() then
    raise exception 'Only administrators can run a global search.'
      using errcode = '42501';
  end if;

  if p_query is null or btrim(p_query) = '' then
    return;
  end if;

  pattern := '%' || btrim(p_query) || '%';

  return query
  (
    select
      'user'::text,
      account.id,
      btrim(coalesce(account.first_name, '') || ' ' || coalesce(account.last_name, '')),
      coalesce(account.email, '')
    from public.users account
    where account.email ilike pattern
       or account.first_name ilike pattern
       or account.last_name ilike pattern
    order by account.created_at desc
    limit p_limit
  )
  union all
  (
    select
      'boat'::text,
      boat.id,
      boat.name,
      coalesce(port.name, '')
    from public.boats boat
    left join public.ports port on port.id = boat.port_id
    where boat.name ilike pattern
    order by boat.created_at desc
    limit p_limit
  )
  union all
  (
    select
      'review'::text,
      review.id,
      coalesce(review.author_name, ''),
      left(review.comment, 120)
    from public.boat_reviews review
    where review.comment ilike pattern
       or review.author_name ilike pattern
    order by review.created_at desc
    limit p_limit
  );
end;
$$;

revoke execute on function public.admin_global_search(text, integer) from anon;
grant execute on function public.admin_global_search(text, integer) to authenticated;
