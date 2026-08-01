---------------------------------------
-- BOOKING FLOW: COMMISSION COLUMNS,
-- REVIEW ↔ RESERVATION LINK, PG_CRON.
---------------------------------------

---------------------------------------
-- Payment commission split (10% platform).
---------------------------------------

alter table public.payment_transactions
  add column commission_amount numeric(10,2)
    check (commission_amount is null or commission_amount >= 0),
  add column owner_amount numeric(10,2)
    check (owner_amount is null or owner_amount >= 0);

comment on column public.payment_transactions.commission_amount is
  'Platform cut (10% of rental subtotal). Written by service-role edge functions.';
comment on column public.payment_transactions.owner_amount is
  'Amount owed to the boat owner (subtotal − commission). Written by service-role edge functions.';

---------------------------------------
-- Link reviews to a completed reservation.
-- Unique = at most one review per rental.
---------------------------------------

alter table public.boat_reviews
  add column reservation_id uuid
    unique
    references public.boat_reservations(id) on delete set null;

create index boat_reviews_reservation_id_idx
  on public.boat_reviews (reservation_id);

grant insert on public.boat_reviews to authenticated;

-- A renter may insert a review only for their own COMPLETED reservation
-- on the matching boat, and only as themselves (reviewer_id).
create policy "Renter can insert review for completed reservation"
on public.boat_reviews
for insert
to authenticated
with check (
  reviewer_id = private.current_public_user_id()
  and reservation_id is not null
  and exists (
    select 1
    from public.boat_reservations reservation
    where reservation.id = boat_reviews.reservation_id
      and reservation.renter_id = private.current_public_user_id()
      and reservation.boat_id = boat_reviews.boat_id
      and reservation.status = 'COMPLETED'
  )
  and not exists (
    select 1
    from public.boat_reviews existing
    where existing.reservation_id = boat_reviews.reservation_id
  )
);

---------------------------------------
-- Auto-complete finished rentals + expire
-- stale PENDING checkouts via pg_cron.
---------------------------------------

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create or replace function private.complete_finished_reservations()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Past rentals: CONFIRMED → COMPLETED (unlocks reviews).
  update public.boat_reservations
  set status = 'COMPLETED'
  where status = 'CONFIRMED'
    and end_date < current_date;

  -- Abandoned checkouts: PENDING older than 24h → CANCELLED
  -- (frees the GiST exclusion slot for other renters).
  with expired_checkouts as (
    update public.boat_reservations
    set status = 'CANCELLED'
    where status = 'PENDING'
      and created_at < now() - interval '24 hours'
    returning id
  )
  update public.payment_transactions
  set status = 'EXPIRED'
  where status = 'PENDING'
    and reservation_id in (select id from expired_checkouts);
end;
$$;

revoke all on function private.complete_finished_reservations() from public;
grant execute on function private.complete_finished_reservations() to postgres;

-- Daily at 01:00 UTC.
select cron.schedule(
  'complete-finished-reservations',
  '0 1 * * *',
  $$select private.complete_finished_reservations()$$
);
