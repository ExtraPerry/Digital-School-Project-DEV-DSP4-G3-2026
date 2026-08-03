---------------------------------------
-- REVIEW MODERATION STATUS ENUM.
---------------------------------------

-- POST-moderation model: a review is published the moment the renter submits
-- it, exactly as before, and an administrator can act on it afterwards.
-- Pre-moderation was rejected because it would silently change shipped
-- front-office behaviour (renters would stop seeing their own review appear).
--
-- APPROVED : Default. Publicly visible and counted in boats.rating.
-- FLAGGED  : Marked for attention. Still publicly visible and still counted —
--            flagging is triage, not censorship.
-- REJECTED : Hidden from everyone except administrators, and excluded from
--            boats.rating.
create type public.review_moderation_status as enum (
  'APPROVED', 'FLAGGED', 'REJECTED'
);

alter table public.boat_reviews
  add column moderation_status public.review_moderation_status not null default 'APPROVED',
  add column moderated_at timestamp with time zone,
  add column moderated_by uuid references public.users(id) on delete set null;

-- Existing rows inherit APPROVED from the column default, so nothing that is
-- currently visible disappears.

create index boat_reviews_moderation_status_idx
  on public.boat_reviews (moderation_status);

---------------------------------------
-- PUBLIC VISIBILITY.
---------------------------------------

-- Split deliberately into two PERMISSIVE policies rather than one OR-ed
-- expression. `private.is_administrator()` has EXECUTE revoked from `anon`, so
-- naming it in a policy that applies `to anon` risks
-- "permission denied for function is_administrator" on public boat pages.
-- Permissive policies are OR-ed by Postgres, so the anon path below never
-- references the helper at all.
drop policy "Anyone can view boat reviews" on public.boat_reviews;

create policy "Anyone can view non-rejected boat reviews"
on public.boat_reviews
for select
to anon, authenticated
using ( moderation_status <> 'REJECTED' );

create policy "Admins can view every boat review"
on public.boat_reviews
for select
to authenticated
using ( private.is_administrator() );

---------------------------------------
-- RATING EXCLUDES REJECTED REVIEWS.
---------------------------------------

-- Same body as migration 20260709160300 plus the moderation filter, so a
-- rejected review stops contributing to the boat's public average.
create or replace function public.recompute_boat_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_boat_id uuid;
begin
  affected_boat_id := coalesce(new.boat_id, old.boat_id);

  update public.boats
  set rating = coalesce(
    (
      select round(avg(rating)::numeric, 1)
      from public.boat_reviews
      where boat_id = affected_boat_id
        and moderation_status <> 'REJECTED'
    ),
    0
  )
  where id = affected_boat_id;

  return null;
end;
$$;

---------------------------------------
-- MODERATION RPC.
---------------------------------------

-- public.boat_reviews has no UPDATE policy and no UPDATE grant for any client
-- role, so moderation is only possible through this SECURITY DEFINER function.
create or replace function public.admin_moderate_review(
  p_review_id uuid,
  p_status public.review_moderation_status
)
returns public.boat_reviews
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor_user_id uuid;
  previous_status public.review_moderation_status;
  updated_review public.boat_reviews;
begin
  if not private.is_administrator() then
    raise exception 'Only administrators can moderate reviews.'
      using errcode = '42501';
  end if;

  select id into actor_user_id from public.users where auth_id = auth.uid();

  select moderation_status into previous_status
    from public.boat_reviews where id = p_review_id;

  if previous_status is null then
    raise exception 'ADMIN_REVIEW_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  update public.boat_reviews
     set moderation_status = p_status,
         moderated_at = now(),
         moderated_by = actor_user_id
   where id = p_review_id
  returning * into updated_review;

  perform private.record_admin_action(
    'MODERATE_REVIEW',
    'boat_reviews',
    p_review_id,
    jsonb_build_object(
      'previous_moderation_status', previous_status,
      'new_moderation_status', p_status
    )
  );

  return updated_review;
end;
$$;

revoke execute on function public.admin_moderate_review(
  uuid, public.review_moderation_status
) from anon;
grant execute on function public.admin_moderate_review(
  uuid, public.review_moderation_status
) to authenticated;

---------------------------------------
-- REALTIME PUBLICATION.
---------------------------------------

-- Non-rejected reviews are already world-readable, and the admin-only policy
-- is honoured by postgres_changes, so publishing leaks nothing new.
alter publication supabase_realtime add table public.boat_reviews;
