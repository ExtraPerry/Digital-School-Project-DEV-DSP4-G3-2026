---------------------------------------
-- ADMIN READ ACCESS.
---------------------------------------

-- The administrator back-office needs cross-user reads that the own-row
-- policies on public.users and public.user_roles currently forbid.
-- These policies are PERMISSIVE and therefore ADDITIVE: the existing
-- "Users can view their own information" / "Users can view their own role"
-- policies stay untouched and continue to serve every non-admin.
--
-- Write access is deliberately NOT opened here. Role changes and account
-- suspension go through SECURITY DEFINER RPCs in a later migration so that
-- every mutation is guarded and audited in one place.

create policy "Admins can view all users"
on public.users
for select
to authenticated
using ( private.is_administrator() );

create policy "Admins can view all user roles"
on public.user_roles
for select
to authenticated
using ( private.is_administrator() );

---------------------------------------
-- INDEXES FOR ADMIN LIST SCREENS.
---------------------------------------

-- The admin tables sort by recency and join owner/renter/port, none of which
-- were indexed because the front-office never queried across users.
create index if not exists users_created_at_idx
  on public.users (created_at desc);

create index if not exists boats_owner_id_idx
  on public.boats (owner_id);

create index if not exists boats_port_id_idx
  on public.boats (port_id);

create index if not exists boats_created_at_idx
  on public.boats (created_at desc);

create index if not exists boat_reservations_renter_id_idx
  on public.boat_reservations (renter_id);

create index if not exists boat_reservations_created_at_idx
  on public.boat_reservations (created_at desc);

create index if not exists payment_transactions_status_idx
  on public.payment_transactions (status);

---------------------------------------
-- ADMIN DASHBOARD KPI RPC.
---------------------------------------

-- Returns the four figures drawn on the approved admin dashboard.
--
-- Guarded with an explicit RAISE rather than a WHERE predicate: an
-- aggregate-only query with a WHERE guard still returns one row of zeros to a
-- non-admin instead of failing, which is indistinguishable from "the platform
-- is empty". This mirrors public.upgrade_current_user_to_owner().
create or replace function public.admin_platform_stats()
returns table (
  total_users bigint,
  published_boats bigint,
  reservations_this_month bigint,
  commission_this_month numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not private.is_administrator() then
    raise exception 'Only administrators can read platform statistics.'
      using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.users),
    (select count(*) from public.boats where is_published),
    (select count(*)
       from public.boat_reservations
      where created_at >= date_trunc('month', now())
        and status <> 'CANCELLED'),
    (select coalesce(sum(payment.commission_amount), 0)
       from public.payment_transactions payment
      where payment.status = 'PAID'
        and payment.created_at >= date_trunc('month', now()));
end;
$$;

revoke execute on function public.admin_platform_stats() from anon;
grant execute on function public.admin_platform_stats() to authenticated;

---------------------------------------
-- REALTIME PUBLICATION.
---------------------------------------

-- The supabase_realtime publication previously held only
-- public.reservation_messages, so every other useSupabaseRealtime
-- subscription silently never fired. The admin screens depend on that
-- invalidation, so the tables they read are published here.
--
-- postgres_changes honours RLS: a subscriber only receives a row if their own
-- SELECT policies would let them read it. users and user_roles therefore stay
-- own-row for members and become full-table for administrators.
--
-- public.boat_reservations is deliberately EXCLUDED: its only SELECT policy is
-- `to anon, authenticated using (true)`, so publishing it would broadcast every
-- booking to every connected client. That policy is a pre-existing defect
-- tracked separately; the admin reservations screen refreshes on load instead.
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.user_roles;
alter publication supabase_realtime add table public.boats;
alter publication supabase_realtime add table public.payment_transactions;
