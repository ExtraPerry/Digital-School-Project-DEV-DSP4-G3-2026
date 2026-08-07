---------------------------------------
-- THE PHONE NUMBER STOPS GATING ANYTHING.
---------------------------------------

-- The schema has required a phone number alongside an email for every elevated
-- role since the first migration. The platform does not verify phone numbers
-- and has no plan to, so the requirement bought nothing: an account was held
-- back from renting or listing by an unchecked string it could have satisfied
-- with any digits at all.
--
-- It also contradicted the specification, which defines a visitor as somebody
-- who is *not logged in* ("Visiteur : Internaute non authentifié qui consulte
-- les offres") and a renter as a logged-in user. Authentication already carries
-- an email address, so an authenticated account is a RENTER by definition.
--
-- From here the phone is ordinary profile information: stored when given,
-- absent when not, never a precondition. The email keeps its role — it is what
-- an account *is* — so the invariant survives, only narrower:
--
--   VISITOR : Authenticated account with no email address.
--   RENTER  : Authenticated account with an email address.

---------------------------------------
-- ROLE REQUIREMENTS.
---------------------------------------

create or replace function public.check_role_requirements()
returns trigger as $$
declare
  user_email text;
begin
  if new.role in ('RENTER', 'OWNER', 'ADMINISTRATOR') then
    select email into user_email
    from public.users
    where id = new.user_id;

    if user_email is null or btrim(user_email) = '' then
      raise exception
        'Cannot assign role %. User must have an email address attached to their profile.',
        new.role;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

comment on function public.check_role_requirements is
  'Refuses an elevated role to an account with no email address. The phone '
  'number is deliberately not checked — it is unverified profile data.';

---------------------------------------
-- ROLE SYNC.
---------------------------------------

-- Same shape as migration 20260807093000, keyed on the email alone. OWNER and
-- ADMINISTRATOR are still never rewritten, and still may not drop the one
-- detail their role depends on — which is now only the email.
create or replace function public.sync_user_role_with_contact_details()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_role public.user_roles_type;
  has_email boolean;
begin
  select role
  into existing_role
  from public.user_roles
  where user_id = new.id;

  if existing_role is null then
    return new;
  end if;

  has_email := nullif(btrim(coalesce(new.email, '')), '') is not null;

  if existing_role in ('OWNER', 'ADMINISTRATOR') then
    if not has_email then
      raise exception 'ROLE_REQUIRES_CONTACT_DETAILS'
        using errcode = 'P0001';
    end if;

    return new;
  end if;

  if has_email and existing_role = 'VISITOR' then
    update public.user_roles
    set role = 'RENTER'
    where user_id = new.id;
  elsif not has_email and existing_role = 'RENTER' then
    update public.user_roles
    set role = 'VISITOR'
    where user_id = new.id;
  end if;

  return new;
end;
$$;

comment on function public.sync_user_role_with_contact_details is
  'Keeps VISITOR/RENTER equal to "the profile carries an email address". '
  'Leaves OWNER/ADMINISTRATOR alone but refuses to let them lose it.';

-- The trigger still watches `phone` so that clearing it can no longer strand a
-- role: with the phone out of the rule, the sync simply confirms the account
-- stays where it is.
drop trigger if exists sync_user_role_on_contact_change on public.users;
create trigger sync_user_role_on_contact_change
  after insert or update of email, phone on public.users
  for each row execute function public.sync_user_role_with_contact_details();

---------------------------------------
-- SIGNUP.
---------------------------------------

-- Every signup carries an email, so every new account is a RENTER and the
-- upgrade page is reachable from the first login.
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
    then 'RENTER'::public.user_roles_type
    else 'VISITOR'::public.user_roles_type
  end;

  insert into public.user_roles (auth_id, user_id, role)
  values (new.id, new_public_user_id, initial_role);

  return new;
end;
$$ language plpgsql security definer;

---------------------------------------
-- ADMIN ROLE ASSIGNMENT.
---------------------------------------

-- Same body as migration 20260803032742 with the phone dropped from the
-- precondition. The sentinel keeps its name: the UI already translates it, and
-- it still describes the same class of refusal, just a narrower one.
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

  if p_role in ('RENTER', 'OWNER', 'ADMINISTRATOR')
     and (target_user.email is null or btrim(target_user.email) = '')
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

---------------------------------------
-- BACKFILL.
---------------------------------------

-- Everyone held back by the old rule. Nothing is demoted: an account that
-- already holds a role keeps it.
update public.user_roles
set role = 'RENTER'
where role = 'VISITOR'
  and user_id in (
    select id
    from public.users
    where nullif(btrim(coalesce(email, '')), '') is not null
  );
