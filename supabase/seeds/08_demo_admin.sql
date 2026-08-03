-- ============================================================
-- 08 — DEMO ADMIN FIXTURES
-- Data the administrator back-office needs in order to be
-- demonstrable on a fresh `npx supabase db reset`.
--
-- Seed 02 leaves exactly one VISITOR (Thomas Petit) and deliberately
-- gives him no phone number, so check_role_requirements() blocks every
-- promotion. Without a second, fully-contactable VISITOR the admin
-- "Users & roles" screen has no working happy path to demonstrate.
--
-- Shared demo password (local only): Sailing2026!
-- ============================================================

-- ------------------------------------------------------------
-- auth.users — one promotable VISITOR
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values
  -- Chloé Dubois — Visitor WITH email + phone, so she can be promoted.
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'chloe.dubois@example.com',
   extensions.crypt('Sailing2026!', extensions.gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  ('10000000-0000-0000-0000-000000000007',
   '10000000-0000-0000-0000-000000000007',
   '{"sub":"10000000-0000-0000-0000-000000000007","email":"chloe.dubois@example.com","email_verified":true,"phone_verified":false}',
   'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

-- Contact details complete -> promotable from the admin screen.
update public.users
   set first_name = 'Chloé', last_name = 'Dubois', phone = '+33667890123'
 where auth_id = '10000000-0000-0000-0000-000000000007';

-- Stays VISITOR (the trigger default); promoting her is the demo happy path.

-- ------------------------------------------------------------
-- A suspended account, so the SUSPENDED pill has a live example.
-- Lucas Martin (RENTER) owns no boats, so suspending him in seed does
-- not silently unpublish any listing.
-- ------------------------------------------------------------
update public.users
   set account_status = 'SUSPENDED'
 where auth_id = '10000000-0000-0000-0000-000000000005';

-- ------------------------------------------------------------
-- Audit trail history.
-- Inserted directly (not via private.record_admin_action) because seeds
-- run as `postgres` with no auth.uid(), so the helper could not resolve
-- an actor. Mirrors what the RPCs would have written.
-- ------------------------------------------------------------
insert into public.admin_audit_log (
  id, actor_user_id, actor_email_snapshot, action, target_table, target_id, details
) values
  (
    '90000000-0000-0000-0000-000000000001',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000001'),
    'jean.voisin@sailingloc.com',
    'SET_USER_STATUS',
    'users',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000005'),
    jsonb_build_object(
      'previous_status', 'ACTIVE',
      'new_status', 'SUSPENDED',
      'boats_unpublished', 0
    )
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000001'),
    'jean.voisin@sailingloc.com',
    'SET_USER_ROLE',
    'user_roles',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
    jsonb_build_object('previous_role', 'VISITOR', 'new_role', 'RENTER')
  )
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Review moderation fixtures.
-- One FLAGGED review so the moderation queue and its sidebar
-- badge have a live example on a fresh reset. FLAGGED reviews stay
-- publicly visible — flagging is triage, not censorship — so this
-- does not change what the public boat page shows.
-- ------------------------------------------------------------
update public.boat_reviews
   set moderation_status = 'FLAGGED',
       moderated_at = now(),
       moderated_by = (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000001')
 where id = '70000000-0000-0000-0000-000000000002';

insert into public.admin_audit_log (
  id, actor_user_id, actor_email_snapshot, action, target_table, target_id, details
) values
  (
    '90000000-0000-0000-0000-000000000003',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000001'),
    'jean.voisin@sailingloc.com',
    'MODERATE_REVIEW',
    'boat_reviews',
    '70000000-0000-0000-0000-000000000002',
    jsonb_build_object(
      'previous_moderation_status', 'APPROVED',
      'new_moderation_status', 'FLAGGED'
    )
  )
on conflict (id) do nothing;
