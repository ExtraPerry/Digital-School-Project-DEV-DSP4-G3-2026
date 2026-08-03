---------------------------------------
-- ADMIN ACTION TYPE ENUM.
---------------------------------------

-- SET_USER_ROLE    : An administrator changed a member's platform role.
-- SET_USER_STATUS  : An administrator activated or suspended an account.
-- MODERATE_REVIEW  : An administrator approved, flagged or rejected a review.
-- PUBLISH_BOAT     : An administrator put a listing back online.
-- UNPUBLISH_BOAT   : An administrator took a listing offline.
create type public.admin_action_type as enum (
  'SET_USER_ROLE',
  'SET_USER_STATUS',
  'MODERATE_REVIEW',
  'PUBLISH_BOAT',
  'UNPUBLISH_BOAT'
);

---------------------------------------
-- ADMIN AUDIT LOG TABLE.
---------------------------------------

create table public.admin_audit_log (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  -- ON DELETE SET NULL, not RESTRICT: an administrator who has acted must still
  -- be erasable (GDPR + Supabase Auth account deletion cascades through
  -- public.users). The snapshot below keeps the trail readable afterwards.
  actor_user_id uuid references public.users(id) on delete set null,

  -- Audit Data
  actor_email_snapshot text,
  action public.admin_action_type not null,
  target_table text not null,
  target_id uuid not null,
  details jsonb not null default '{}'::jsonb
);

comment on table public.admin_audit_log is 'Append-only trace of privileged administrator actions. Written exclusively by SECURITY DEFINER RPCs.';

create index admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index admin_audit_log_action_idx
  on public.admin_audit_log (action);

create trigger enforce_admin_audit_log_timestamps
  before insert or update on public.admin_audit_log
  for each row execute function public.enforce_table_timestamps();

alter table public.admin_audit_log enable row level security;

-- Administrators may READ the trail. There is deliberately NO insert, update or
-- delete policy and no corresponding grant: the table is append-only and is
-- written solely by private.record_admin_action() running as SECURITY DEFINER.
-- An administrator therefore cannot forge, rewrite or erase history.
create policy "Admins can view the admin audit log"
on public.admin_audit_log
for select
to authenticated
using ( private.is_administrator() );

grant select on public.admin_audit_log to authenticated;

---------------------------------------
-- AUDIT WRITER HELPER.
---------------------------------------

-- Kept in the `private` schema, which is not exposed through PostgREST
-- (supabase/config.toml -> [api] schemas = ["public", "graphql_public"]),
-- so no client can call it directly. Every public.admin_* RPC calls it inside
-- its own transaction, which is what makes the action and its audit row atomic.
create or replace function private.record_admin_action(
  p_action public.admin_action_type,
  p_target_table text,
  p_target_id uuid,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid;
  actor_email text;
begin
  select id, email into actor_id, actor_email
  from public.users
  where auth_id = auth.uid();

  insert into public.admin_audit_log (
    actor_user_id, actor_email_snapshot, action, target_table, target_id, details
  )
  values (
    actor_id, actor_email, p_action, p_target_table, p_target_id, coalesce(p_details, '{}'::jsonb)
  );
end;
$$;

revoke execute on function private.record_admin_action(
  public.admin_action_type, text, uuid, jsonb
) from anon, authenticated;

---------------------------------------
-- REALTIME PUBLICATION.
---------------------------------------

-- Admin-SELECT-only, so publishing leaks nothing to non-administrators
-- (postgres_changes honours RLS) and the Sécurité screen invalidates live.
alter publication supabase_realtime add table public.admin_audit_log;
