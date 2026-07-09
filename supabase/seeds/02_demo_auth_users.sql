-- ============================================================
-- 02 — DEMO AUTH USERS
-- Creates auth.users + auth.identities, then fills profiles and
-- elevates roles. The on_auth_user_insert trigger auto-creates the
-- matching public.users + public.user_roles (VISITOR) rows.
--
-- auth.identities rows (provider 'email') are required by recent GoTrue
-- versions for reliable email/password login.
--
-- Shared demo password (local only): Sailing2026!
-- ============================================================

-- ------------------------------------------------------------
-- auth.users
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values
  -- Jean Voisin — Administrator
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'jean.voisin@sailingloc.com',
   crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),

  -- Marc Thévenot — Owner
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'marc.thevenot@example.com',
   crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),

  -- Sophie Laurent — Owner
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'sophie.laurent@example.com',
   crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),

  -- Léa Bernard — Renter
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'lea.bernard@example.com',
   crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),

  -- Lucas Martin — Renter
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'lucas.martin@example.com',
   crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', ''),

  -- Thomas Petit — Visitor (no phone → stays VISITOR)
  ('00000000-0000-0000-0000-000000000000',
   '10000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'thomas.petit@example.com',
   crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{}', false, '', '', '', '')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- auth.identities (email provider)
-- ------------------------------------------------------------
insert into auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) values
  ('1a000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'email',
   jsonb_build_object('sub', '10000000-0000-0000-0000-000000000001', 'email', 'jean.voisin@sailingloc.com', 'email_verified', true, 'phone_verified', false),
   now(), now(), now()),

  ('1a000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'email',
   jsonb_build_object('sub', '10000000-0000-0000-0000-000000000002', 'email', 'marc.thevenot@example.com', 'email_verified', true, 'phone_verified', false),
   now(), now(), now()),

  ('1a000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'email',
   jsonb_build_object('sub', '10000000-0000-0000-0000-000000000003', 'email', 'sophie.laurent@example.com', 'email_verified', true, 'phone_verified', false),
   now(), now(), now()),

  ('1a000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'email',
   jsonb_build_object('sub', '10000000-0000-0000-0000-000000000004', 'email', 'lea.bernard@example.com', 'email_verified', true, 'phone_verified', false),
   now(), now(), now()),

  ('1a000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'email',
   jsonb_build_object('sub', '10000000-0000-0000-0000-000000000005', 'email', 'lucas.martin@example.com', 'email_verified', true, 'phone_verified', false),
   now(), now(), now()),

  ('1a000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'email',
   jsonb_build_object('sub', '10000000-0000-0000-0000-000000000006', 'email', 'thomas.petit@example.com', 'email_verified', true, 'phone_verified', false),
   now(), now(), now())
on conflict (provider_id, provider) do nothing;

-- ------------------------------------------------------------
-- Profiles — phone must be set BEFORE role elevation because
-- check_role_requirements validates email + phone for elevated roles.
-- ------------------------------------------------------------
update public.users set first_name = 'Jean',   last_name = 'Voisin',   phone = '+33612345678' where auth_id = '10000000-0000-0000-0000-000000000001';
update public.users set first_name = 'Marc',   last_name = 'Thévenot', phone = '+33623456789' where auth_id = '10000000-0000-0000-0000-000000000002';
update public.users set first_name = 'Sophie', last_name = 'Laurent',  phone = '+33634567890' where auth_id = '10000000-0000-0000-0000-000000000003';
update public.users set first_name = 'Léa',    last_name = 'Bernard',  phone = '+33645678901' where auth_id = '10000000-0000-0000-0000-000000000004';
update public.users set first_name = 'Lucas',  last_name = 'Martin',   phone = '+33656789012' where auth_id = '10000000-0000-0000-0000-000000000005';
update public.users set first_name = 'Thomas', last_name = 'Petit'                            where auth_id = '10000000-0000-0000-0000-000000000006';

-- ------------------------------------------------------------
-- Roles
-- ------------------------------------------------------------
update public.user_roles set role = 'ADMINISTRATOR' where auth_id = '10000000-0000-0000-0000-000000000001';
update public.user_roles set role = 'OWNER'         where auth_id = '10000000-0000-0000-0000-000000000002';
update public.user_roles set role = 'OWNER'         where auth_id = '10000000-0000-0000-0000-000000000003';
update public.user_roles set role = 'RENTER'        where auth_id = '10000000-0000-0000-0000-000000000004';
update public.user_roles set role = 'RENTER'        where auth_id = '10000000-0000-0000-0000-000000000005';
-- Thomas Petit stays VISITOR (default)
