---------------------------------------
-- OWNER HELPERS (private schema).
---------------------------------------

create or replace function private.current_public_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.users
  where auth_id = auth.uid()
  limit 1;
$$;

revoke execute on function private.current_public_user_id() from anon;
grant execute on function private.current_public_user_id() to authenticated;

create or replace function private.is_boat_owner(target_boat_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = target_boat_id
      and owner.auth_id = auth.uid()
  );
$$;

revoke execute on function private.is_boat_owner(uuid) from anon;
grant execute on function private.is_boat_owner(uuid) to authenticated;

---------------------------------------
-- DOCUMENT TYPE: nullable boat_id for owner-level docs.
---------------------------------------

-- LICENSE and SAILOR_CV are owner-level (boat_id null).
-- INSURANCE (and REGISTRATION/OTHER) remain boat-scoped.
-- SAILOR_CV enum value is added in 20260801073541 (separate transaction).

alter table public.boat_documents
  alter column boat_id drop not null;

alter table public.boat_documents
  alter column owner_id set not null;

-- Ensure owner_id is always set for new rows when possible.
create or replace function public.enforce_boat_document_owner()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id is null then
    new.owner_id := private.current_public_user_id();
  end if;

  if new.boat_id is not null then
    if not exists (
      select 1
      from public.boats boat
      where boat.id = new.boat_id
        and boat.owner_id = new.owner_id
    ) and not private.is_administrator() then
      raise exception 'Document boat_id must belong to the document owner.';
    end if;
  end if;

  if new.document_type in ('LICENSE', 'SAILOR_CV') and new.boat_id is not null then
    raise exception 'LICENSE and SAILOR_CV documents must be owner-level (boat_id null).';
  end if;

  if new.document_type = 'INSURANCE' and new.boat_id is null then
    raise exception 'INSURANCE documents must be linked to a boat.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_boat_document_owner on public.boat_documents;
create trigger enforce_boat_document_owner
  before insert or update on public.boat_documents
  for each row execute function public.enforce_boat_document_owner();

-- One LICENSE / SAILOR_CV per owner; one INSURANCE per boat.
create unique index if not exists boat_documents_owner_license_unique
  on public.boat_documents (owner_id)
  where document_type = 'LICENSE' and boat_id is null;

create unique index if not exists boat_documents_owner_sailor_cv_unique
  on public.boat_documents (owner_id)
  where document_type = 'SAILOR_CV' and boat_id is null;

create unique index if not exists boat_documents_boat_insurance_unique
  on public.boat_documents (boat_id)
  where document_type = 'INSURANCE' and boat_id is not null;

---------------------------------------
-- BOAT DOCUMENTS RLS — support owner-level docs.
---------------------------------------

drop policy if exists "Boat owner or admin can view boat documents" on public.boat_documents;
drop policy if exists "Boat owner or admin can insert boat documents" on public.boat_documents;
drop policy if exists "Boat owner or admin can update boat documents" on public.boat_documents;
drop policy if exists "Boat owner or admin can delete boat documents" on public.boat_documents;

create policy "Owner or admin can view boat documents"
on public.boat_documents
for select
to authenticated
using (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
  or (boat_id is not null and private.is_boat_owner(boat_id))
);

create policy "Owner or admin can insert boat documents"
on public.boat_documents
for insert
to authenticated
with check (
  private.is_administrator()
  or (
    owner_id = private.current_public_user_id()
    and (
      boat_id is null
      or private.is_boat_owner(boat_id)
    )
  )
);

create policy "Owner or admin can update boat documents"
on public.boat_documents
for update
to authenticated
using (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
  or (boat_id is not null and private.is_boat_owner(boat_id))
)
with check (
  private.is_administrator()
  or (
    owner_id = private.current_public_user_id()
    and (
      boat_id is null
      or private.is_boat_owner(boat_id)
    )
  )
);

create policy "Owner or admin can delete boat documents"
on public.boat_documents
for delete
to authenticated
using (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
  or (boat_id is not null and private.is_boat_owner(boat_id))
);

---------------------------------------
-- STORAGE — owner-level document paths: owners/{auth_id}/...
---------------------------------------

-- Keep existing boat-scoped policies; add owner-level path support.
create policy "Owner can read own-level boat documents storage"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'boat-documents'
  and (storage.foldername(name))[1] = 'owners'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Owner can upload own-level boat documents storage"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'boat-documents'
  and (storage.foldername(name))[1] = 'owners'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Owner can update own-level boat documents storage"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'boat-documents'
  and (storage.foldername(name))[1] = 'owners'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'boat-documents'
  and (storage.foldername(name))[1] = 'owners'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Owner can delete own-level boat documents storage"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'boat-documents'
  and (storage.foldername(name))[1] = 'owners'
  and (storage.foldername(name))[2] = auth.uid()::text
);

---------------------------------------
-- BOATS — owner CRUD + published visibility.
---------------------------------------

-- New listings start as drafts until required documents are uploaded.
alter table public.boats
  alter column is_published set default false;

grant insert, update, delete on public.boats to authenticated;

drop policy if exists "Anyone can view boats" on public.boats;

create policy "Anyone can view published boats or own boats"
on public.boats
for select
to anon, authenticated
using (
  is_published = true
  or (
    auth.uid() is not null
    and (
      private.is_administrator()
      or owner_id = private.current_public_user_id()
    )
  )
);

create policy "Owners can insert their own boats"
on public.boats
for insert
to authenticated
with check (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
);

create policy "Owners can update their own boats"
on public.boats
for update
to authenticated
using (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
)
with check (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
);

create policy "Owners can delete their own boats"
on public.boats
for delete
to authenticated
using (
  private.is_administrator()
  or owner_id = private.current_public_user_id()
);

---------------------------------------
-- PUBLISH GATING — LICENSE + SAILOR_CV + INSURANCE required.
---------------------------------------

create or replace function public.enforce_boat_publish_requirements()
returns trigger
language plpgsql
as $$
declare
  has_license boolean;
  has_sailor_cv boolean;
  has_insurance boolean;
begin
  if tg_op = 'UPDATE'
     and new.is_published = true
     and (old.is_published is distinct from true) then

    if new.owner_id is null then
      raise exception 'Cannot publish a boat without an owner.';
    end if;

    select exists (
      select 1
      from public.boat_documents docs
      where docs.owner_id = new.owner_id
        and docs.document_type = 'LICENSE'
        and docs.boat_id is null
    ) into has_license;

    select exists (
      select 1
      from public.boat_documents docs
      where docs.owner_id = new.owner_id
        and docs.document_type = 'SAILOR_CV'
        and docs.boat_id is null
    ) into has_sailor_cv;

    select exists (
      select 1
      from public.boat_documents docs
      where docs.boat_id = new.id
        and docs.document_type = 'INSURANCE'
    ) into has_insurance;

    if not has_license or not has_sailor_cv or not has_insurance then
      raise exception
        'Cannot publish boat: missing required documents (LICENSE, SAILOR_CV, and boat INSURANCE).';
    end if;

    if new.published_at is null then
      new.published_at := now();
    end if;
  end if;

  if new.is_published = false then
    -- Keep published_at history when unpublishing; do not clear it.
    null;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_boat_publish_requirements on public.boats;
create trigger enforce_boat_publish_requirements
  before insert or update on public.boats
  for each row execute function public.enforce_boat_publish_requirements();

---------------------------------------
-- AVAILABILITY SLOTS — owner write policies.
---------------------------------------

grant insert, update, delete on public.boat_availability_time_slots to authenticated;

create policy "Owners can insert availability for their boats"
on public.boat_availability_time_slots
for insert
to authenticated
with check (
  private.is_administrator()
  or private.is_boat_owner(boat_id)
);

create policy "Owners can update availability for their boats"
on public.boat_availability_time_slots
for update
to authenticated
using (
  private.is_administrator()
  or private.is_boat_owner(boat_id)
)
with check (
  private.is_administrator()
  or private.is_boat_owner(boat_id)
);

create policy "Owners can delete availability for their boats"
on public.boat_availability_time_slots
for delete
to authenticated
using (
  private.is_administrator()
  or private.is_boat_owner(boat_id)
);

---------------------------------------
-- UPGRADE RENTER → OWNER (self-serve).
---------------------------------------

create or replace function public.upgrade_current_user_to_owner()
returns public.user_roles_type
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role public.user_roles_type;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select role
  into current_role
  from public.user_roles
  where auth_id = auth.uid()
  for update;

  if current_role is null then
    raise exception 'User role not found.';
  end if;

  if current_role in ('OWNER', 'ADMINISTRATOR') then
    return current_role;
  end if;

  if current_role <> 'RENTER' then
    raise exception
      'Only RENTER accounts can become OWNER. Current role: %.',
      current_role;
  end if;

  update public.user_roles
  set role = 'OWNER'
  where auth_id = auth.uid();

  return 'OWNER'::public.user_roles_type;
end;
$$;

revoke execute on function public.upgrade_current_user_to_owner() from anon;
grant execute on function public.upgrade_current_user_to_owner() to authenticated;
