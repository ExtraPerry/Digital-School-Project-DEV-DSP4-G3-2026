---------------------------------------
-- KEEP VISITOR/RENTER IN STEP WITH THE PROFILE.
---------------------------------------

-- `public.user_roles_type` has always documented what the first two roles mean:
--
--   VISITOR : Authenticated user that does not have an email and phone attached.
--   RENTER  : Authenticated user that has an email and phone attached.
--
-- Nothing ever maintained that. `check_role_requirements` enforces it in one
-- direction only — it refuses an elevated role when the contact details are
-- missing — but no code path has ever promoted an account once the details were
-- supplied. Every signup starts as VISITOR (sign-up collects no phone number)
-- and stayed VISITOR forever, whatever the member later filled in.
--
-- The visible consequence was that /become-owner is unreachable for everyone:
-- `upgrade_current_user_to_owner()` only accepts a RENTER, so a member who had
-- dutifully added their phone number was still told to "complete your profile
-- with a phone number, then try again" — about the phone number already on
-- their profile. Only an administrator editing the role by hand could break the
-- loop, which is not a self-serve upgrade at all.
--
-- The rule is enforced from the profile side from now on, so the role is a
-- consequence of the data rather than a value someone has to remember to set.

create or replace function public.sync_user_role_with_contact_details()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_role public.user_roles_type;
  has_contact_details boolean;
begin
  select role
  into existing_role
  from public.user_roles
  where user_id = new.id;

  -- No role row yet: this is the insert half of `handle_auth_user_insert`,
  -- which writes the role immediately afterwards and computes it itself.
  if existing_role is null then
    return new;
  end if;

  has_contact_details :=
    nullif(btrim(coalesce(new.email, '')), '') is not null
    and nullif(btrim(coalesce(new.phone, '')), '') is not null;

  -- OWNER and ADMINISTRATOR are granted deliberately and carry consequences —
  -- published listings, moderation powers — so they are never rewritten here.
  -- They are held to the same invariant the other way round instead: dropping a
  -- contact detail is refused rather than silently demoting the account or
  -- leaving a role whose own definition it contradicts.
  if existing_role in ('OWNER', 'ADMINISTRATOR') then
    if not has_contact_details then
      raise exception 'ROLE_REQUIRES_CONTACT_DETAILS'
        using errcode = 'P0001';
    end if;

    return new;
  end if;

  if has_contact_details and existing_role = 'VISITOR' then
    update public.user_roles
    set role = 'RENTER'
    where user_id = new.id;
  elsif not has_contact_details and existing_role = 'RENTER' then
    update public.user_roles
    set role = 'VISITOR'
    where user_id = new.id;
  end if;

  return new;
end;
$$;

comment on function public.sync_user_role_with_contact_details is
  'Keeps VISITOR/RENTER equal to "profile carries an email and a phone". '
  'Leaves OWNER/ADMINISTRATOR alone but refuses to let them lose a contact '
  'detail.';

-- `of email, phone` keeps the trigger off every unrelated profile write.
create trigger sync_user_role_on_contact_change
  after insert or update of email, phone on public.users
  for each row execute function public.sync_user_role_with_contact_details();

---------------------------------------
-- SIGNUP STARTS AT THE RIGHT ROLE.
---------------------------------------

-- Same body as migration 20260507115308, except the role is derived instead of
-- hardcoded. A signup that already carries a phone number (an administrator
-- creating an account, an OAuth provider returning one) has no reason to land
-- as a VISITOR and wait for an update that may never come.
create or replace function public.handle_auth_user_insert()
returns trigger as $$
declare
  new_public_user_id uuid;
  initial_role public.user_roles_type;
begin
  insert into public.users (auth_id, email, phone)
  values (new.id, new.email, new.phone)
  returning id into new_public_user_id;

  initial_role := case
    when nullif(btrim(coalesce(new.email, '')), '') is not null
      and nullif(btrim(coalesce(new.phone, '')), '') is not null
    then 'RENTER'::public.user_roles_type
    else 'VISITOR'::public.user_roles_type
  end;

  insert into public.user_roles (auth_id, user_id, role)
  values (new.id, new_public_user_id, initial_role);

  return new;
end;
$$ language plpgsql security definer;

---------------------------------------
-- upgrade_current_user_to_owner() COULD NEVER SUCCEED.
---------------------------------------

-- The function declared its local variable as `current_role`, which is a
-- reserved SQL keyword — Postgres' own "role of the current session". The
-- parser resolves the keyword before PL/pgSQL gets to substitute the variable,
-- so `select role into current_role` wrote to a variable that no later
-- expression ever read. Every comparison saw the session role instead:
--
--   Only RENTER accounts can become OWNER. Current role: postgres.
--
-- Because the function is SECURITY DEFINER, that reads `postgres`, which is
-- neither OWNER, ADMINISTRATOR nor RENTER — so the guard raised for everyone,
-- RENTER accounts included. Self-serve upgrade has never worked; the role sync
-- above would not have been enough on its own.
--
-- Same body, renamed variable. Nothing else about the contract changes.
create or replace function public.upgrade_current_user_to_owner()
returns public.user_roles_type
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_role public.user_roles_type;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select role
  into existing_role
  from public.user_roles
  where auth_id = auth.uid()
  for update;

  if existing_role is null then
    raise exception 'User role not found.';
  end if;

  if existing_role in ('OWNER', 'ADMINISTRATOR') then
    return existing_role;
  end if;

  if existing_role <> 'RENTER' then
    raise exception
      'Only RENTER accounts can become OWNER. Current role: %.',
      existing_role;
  end if;

  update public.user_roles
  set role = 'OWNER'
  where auth_id = auth.uid();

  return 'OWNER'::public.user_roles_type;
end;
$$;

---------------------------------------
-- BACKFILL.
---------------------------------------

-- Accounts that completed their profile before the rule existed. Without this
-- they would stay blocked until they edited a contact detail again, which is
-- precisely the dead end this migration removes.
update public.user_roles
set role = 'RENTER'
where role = 'VISITOR'
  and user_id in (
    select id
    from public.users
    where nullif(btrim(coalesce(email, '')), '') is not null
      and nullif(btrim(coalesce(phone, '')), '') is not null
  );
