---------------------------------------
-- ACCOUNT STATUS ENUM.
---------------------------------------

-- ACTIVE    : Normal account.
-- PENDING   : Reserved. Nothing sets this today — the platform auto-provisions
--             every signup via handle_auth_user_insert(), so there is no
--             approval queue. Declared now so enabling one later needs no
--             enum migration.
-- SUSPENDED : Administrator-disabled. Loses elevated privileges and has every
--             listing taken offline. Does NOT terminate an existing session or
--             block login — that requires the Auth Admin API and is out of scope.
create type public.user_account_status as enum ('ACTIVE', 'PENDING', 'SUSPENDED');

alter table public.users
  add column account_status public.user_account_status not null default 'ACTIVE';

create index users_account_status_idx
  on public.users (account_status);

---------------------------------------
-- COLUMN-SCOPED SELF-UPDATE GRANT.
---------------------------------------

-- SECURITY: migration 20260801094048 granted table-wide UPDATE on public.users
-- to `authenticated`, and the self-update policy carries no column restriction.
-- Adding account_status to this table would therefore have been self-revocable:
-- a suspended member could PATCH their own row back to ACTIVE and re-publish
-- their listings. Postgres has no per-column RLS, so the grant itself must be
-- narrowed.
--
-- The only application write paths on public.users are:
--   src/hooks/useProfileMutations.ts  -> first_name, last_name, phone
--   src/hooks/use-sign-up.ts          -> first_name, last_name
-- Edge functions use the service_role key and are unaffected by this grant.
revoke update on public.users from authenticated;
grant update (first_name, last_name, phone) on public.users to authenticated;

---------------------------------------
-- SUSPENSION MUST REVOKE ADMIN POWER.
---------------------------------------

-- private.is_administrator() previously read the role alone, so a suspended
-- administrator would have kept every privilege this back-office grants.
-- Tying it to account_status makes suspension meaningful for admins too.
--
-- CONSEQUENCE: suspending the last ACTIVE administrator would lock the
-- back-office for everyone, so admin_set_user_status() refuses self-suspension.
create or replace function private.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles role_row
    join public.users user_row on user_row.id = role_row.user_id
    where role_row.auth_id = auth.uid()
      and role_row.role = 'ADMINISTRATOR'
      and user_row.account_status = 'ACTIVE'
  );
$$;

---------------------------------------
-- ROLE ASSIGNMENT RPC.
---------------------------------------

-- No account_status precondition on the TARGET: demoting a suspended account is
-- exactly the remediation an administrator needs, so blocking it would deadlock.
create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role public.user_roles_type
)
returns public.user_roles
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  target_user public.users;
  actor_user_id uuid;
  previous_role public.user_roles_type;
  updated_role public.user_roles;
begin
  if not private.is_administrator() then
    raise exception 'Only administrators can change a user role.'
      using errcode = '42501';
  end if;

  select id into actor_user_id from public.users where auth_id = auth.uid();

  if actor_user_id = p_user_id then
    raise exception 'ADMIN_ROLE_SELF_CHANGE'
      using errcode = 'P0001';
  end if;

  select * into target_user from public.users where id = p_user_id;

  if target_user.id is null then
    raise exception 'ADMIN_USER_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  -- public.check_role_requirements() raises on the same condition, but it is a
  -- plain trigger with a free-text message. Pre-checking lets the UI show a
  -- translated, actionable error instead of a raw Postgres string.
  if p_role in ('RENTER', 'OWNER', 'ADMINISTRATOR')
     and (
       target_user.email is null or btrim(target_user.email) = ''
       or target_user.phone is null or btrim(target_user.phone) = ''
     )
  then
    raise exception 'ADMIN_ROLE_PRECONDITION_CONTACT'
      using errcode = 'P0001';
  end if;

  select role into previous_role from public.user_roles where user_id = p_user_id;

  update public.user_roles
     set role = p_role
   where user_id = p_user_id
  returning * into updated_role;

  perform private.record_admin_action(
    'SET_USER_ROLE',
    'user_roles',
    p_user_id,
    jsonb_build_object('previous_role', previous_role, 'new_role', p_role)
  );

  return updated_role;
end;
$$;

revoke execute on function public.admin_set_user_role(uuid, public.user_roles_type) from anon;
grant execute on function public.admin_set_user_role(uuid, public.user_roles_type) to authenticated;

---------------------------------------
-- ACCOUNT STATUS RPC.
---------------------------------------

-- Suspension is enforcing, not cosmetic: in the same transaction it takes every
-- listing owned by the account offline. enforce_boat_publish_requirements()
-- allows an unconditional true -> false transition and preserves published_at,
-- so republishing later still requires the full document set.
create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_status public.user_account_status
)
returns public.users
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor_user_id uuid;
  previous_status public.user_account_status;
  updated_user public.users;
  unpublished_count integer := 0;
begin
  if not private.is_administrator() then
    raise exception 'Only administrators can change an account status.'
      using errcode = '42501';
  end if;

  select id into actor_user_id from public.users where auth_id = auth.uid();

  -- Prevents an administrator suspending themselves out of the back-office,
  -- which (because is_administrator() now requires ACTIVE) would be
  -- unrecoverable from inside the application.
  if actor_user_id = p_user_id then
    raise exception 'ADMIN_STATUS_SELF_CHANGE'
      using errcode = 'P0001';
  end if;

  select account_status into previous_status from public.users where id = p_user_id;

  if previous_status is null then
    raise exception 'ADMIN_USER_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  update public.users
     set account_status = p_status
   where id = p_user_id
  returning * into updated_user;

  if p_status = 'SUSPENDED' then
    with taken_offline as (
      update public.boats
         set is_published = false
       where owner_id = p_user_id
         and is_published
      returning 1
    )
    select count(*) into unpublished_count from taken_offline;
  end if;

  perform private.record_admin_action(
    'SET_USER_STATUS',
    'users',
    p_user_id,
    jsonb_build_object(
      'previous_status', previous_status,
      'new_status', p_status,
      'boats_unpublished', unpublished_count
    )
  );

  return updated_user;
end;
$$;

revoke execute on function public.admin_set_user_status(uuid, public.user_account_status) from anon;
grant execute on function public.admin_set_user_status(uuid, public.user_account_status) to authenticated;
