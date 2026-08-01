---------------------------------------
-- Table privileges for users / user_roles.
-- RLS policies existed, but authenticated had no GRANT — PostgREST
-- returned 403 "permission denied for table users/user_roles", so the
-- header could see auth.session (Déconnexion) while profile/role queries
-- failed (no owner space, become-owner showed "Connectez-vous").
---------------------------------------

grant select, update on public.users to authenticated;
grant select on public.user_roles to authenticated;
