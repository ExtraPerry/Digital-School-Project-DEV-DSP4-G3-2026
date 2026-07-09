---------------------------------------
-- LINK REVIEWS TO USERS.
---------------------------------------

-- author_name is kept for display and seed compatibility; reviewer_id links a
-- review to the authenticated reviewer when available.
alter table public.boat_reviews
  add column reviewer_id uuid references public.users(id) on delete set null;

create index boat_reviews_reviewer_id_idx on public.boat_reviews (reviewer_id);

---------------------------------------
-- BOAT RATING RECOMPUTE TRIGGER.
---------------------------------------

-- Keeps the denormalised boats.rating in sync with the average of its reviews
-- so it stops drifting once real reviews exist. SECURITY DEFINER so the update
-- on public.boats succeeds even when a renter (without a boats UPDATE policy)
-- inserts a review.
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
    ),
    0
  )
  where id = affected_boat_id;

  return null;
end;
$$;

create trigger recompute_boat_rating_on_change
  after insert or update or delete on public.boat_reviews
  for each row execute function public.recompute_boat_rating();
