---------------------------------------
-- SIGNING IN NO LONGER ERASES THE PROFILE PHONE.
---------------------------------------

-- `handle_auth_user_update` copied `auth.users.phone` onto `public.users.phone`
-- on *every* update of `auth.users`. Two things are wrong with that.
--
-- First, the trigger is unqualified — `after update on auth.users` — so it also
-- fires for `last_sign_in_at`, which GoTrue rewrites on every single sign-in.
--
-- Second, `auth.users.phone` is the SMS-authentication phone. This application
-- never sets it: the phone number a member types lives in `public.users.phone`,
-- written by the profile form. So the copy was always `null`, and every sign-in
-- silently deleted the number the member had just saved. Verified before this
-- migration: save "+33600000000", sign in once, read `null` back.
--
-- It stayed invisible because nothing depended on the phone until now. With the
-- role deriving from the profile (migration 20260807093000) the same wipe also
-- demoted RENTER back to VISITOR on sign-in, which put "become an owner" back
-- out of reach one login after it had been unlocked.
--
-- The email still mirrors auth, which is correct — that column is auth's to
-- own. The phone is only ever taken when auth actually has one, and never
-- replaced by a null.
create or replace function public.handle_auth_user_update()
returns trigger as $$
begin
  update public.users
  set
    email = new.email,
    phone = coalesce(new.phone, public.users.phone)
  where auth_id = new.id;

  return new;
end;
$$ language plpgsql security definer;

-- `of email, phone` keeps the trigger out of the sign-in path entirely, so a
-- login stops writing to public.users at all.
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, phone on auth.users
  for each row execute procedure public.handle_auth_user_update();

---------------------------------------
-- REPAIR THE ROLES THE WIPE LEFT BEHIND.
---------------------------------------

-- Accounts demoted between the previous migration and this one. Phone numbers
-- already erased cannot be recovered — they were never stored anywhere else —
-- so this only re-derives the role from whatever the profile still holds.
update public.user_roles
set role = 'RENTER'
where role = 'VISITOR'
  and user_id in (
    select id
    from public.users
    where nullif(btrim(coalesce(email, '')), '') is not null
      and nullif(btrim(coalesce(phone, '')), '') is not null
  );
