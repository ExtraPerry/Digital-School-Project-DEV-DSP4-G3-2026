---------------------------------------
-- BOAT MEDIA TABLE.
---------------------------------------

-- Public gallery images for a boat. Files live in the `boat-images` storage
-- bucket under the path convention `{boat_id}/...`.
create table public.boat_media (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys
  boat_id uuid not null references public.boats(id) on delete cascade,

  -- Media Data
  storage_bucket text not null default 'boat-images',
  storage_path text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  alt_text text
);

comment on table public.boat_media is 'Public gallery images for a boat, stored in the boat-images bucket.';

create trigger enforce_boat_media_timestamps
  before insert or update on public.boat_media
  for each row execute function public.enforce_table_timestamps();

create index boat_media_boat_id_idx on public.boat_media (boat_id);

alter table public.boat_media enable row level security;

grant select on public.boat_media to anon, authenticated;
grant insert, update, delete on public.boat_media to authenticated;

create policy "Anyone can view boat media"
on public.boat_media
for select
to anon, authenticated
using ( true );

create policy "Boat owner or admin can insert boat media"
on public.boat_media
for insert
to authenticated
with check (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_media.boat_id
      and owner.auth_id = auth.uid()
  )
);

create policy "Boat owner or admin can update boat media"
on public.boat_media
for update
to authenticated
using (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_media.boat_id
      and owner.auth_id = auth.uid()
  )
)
with check (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_media.boat_id
      and owner.auth_id = auth.uid()
  )
);

create policy "Boat owner or admin can delete boat media"
on public.boat_media
for delete
to authenticated
using (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_media.boat_id
      and owner.auth_id = auth.uid()
  )
);

---------------------------------------
-- BOAT DOCUMENT TYPE ENUM.
---------------------------------------

create type public.boat_document_type as enum (
  'INSURANCE', 'REGISTRATION', 'LICENSE', 'OTHER'
);

---------------------------------------
-- BOAT DOCUMENTS TABLE.
---------------------------------------

-- Private owner documents (insurance, registration, ...). Files live in the
-- private `boat-documents` bucket. No public access at any level.
create table public.boat_documents (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys
  boat_id uuid not null references public.boats(id) on delete cascade,
  owner_id uuid references public.users(id) on delete cascade,

  -- Document Data
  document_type public.boat_document_type not null default 'OTHER',
  storage_bucket text not null default 'boat-documents',
  storage_path text not null,
  mime_type text
);

comment on table public.boat_documents is 'Private owner documents for a boat, stored in the private boat-documents bucket.';

create trigger enforce_boat_documents_timestamps
  before insert or update on public.boat_documents
  for each row execute function public.enforce_table_timestamps();

create index boat_documents_boat_id_idx on public.boat_documents (boat_id);

alter table public.boat_documents enable row level security;

grant select, insert, update, delete on public.boat_documents to authenticated;

create policy "Boat owner or admin can view boat documents"
on public.boat_documents
for select
to authenticated
using (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_documents.boat_id
      and owner.auth_id = auth.uid()
  )
);

create policy "Boat owner or admin can insert boat documents"
on public.boat_documents
for insert
to authenticated
with check (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_documents.boat_id
      and owner.auth_id = auth.uid()
  )
);

create policy "Boat owner or admin can update boat documents"
on public.boat_documents
for update
to authenticated
using (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_documents.boat_id
      and owner.auth_id = auth.uid()
  )
)
with check (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_documents.boat_id
      and owner.auth_id = auth.uid()
  )
);

create policy "Boat owner or admin can delete boat documents"
on public.boat_documents
for delete
to authenticated
using (
  private.is_administrator()
  or exists (
    select 1
    from public.boats boat
    join public.users owner on owner.id = boat.owner_id
    where boat.id = boat_documents.boat_id
      and owner.auth_id = auth.uid()
  )
);

---------------------------------------
-- STORAGE BUCKETS.
---------------------------------------

-- Buckets are created in SQL so they survive every `db reset` and apply on
-- `db push` to remote (config.toml bucket blocks are local-only).
insert into storage.buckets (id, name, public)
values
  ('boat-images', 'boat-images', true),
  ('boat-documents', 'boat-documents', false)
on conflict (id) do nothing;

---------------------------------------
-- STORAGE OBJECT POLICIES — BOAT IMAGES (public read, owner/admin write).
---------------------------------------

-- Path convention: `boat-images/{boat_id}/...` — the first folder segment is
-- the boat id, used to authorise the boat owner.
create policy "Public read boat images"
on storage.objects
for select
to anon, authenticated
using ( bucket_id = 'boat-images' );

create policy "Boat owner or admin can upload boat images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'boat-images'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);

create policy "Boat owner or admin can update boat images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'boat-images'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
)
with check (
  bucket_id = 'boat-images'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);

create policy "Boat owner or admin can delete boat images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'boat-images'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);

---------------------------------------
-- STORAGE OBJECT POLICIES — BOAT DOCUMENTS (owner/admin only, private).
---------------------------------------

-- Path convention: `boat-documents/{boat_id}/...` — only the boat owner (or an
-- administrator) may read or write the boat's private documents.
create policy "Boat owner or admin can read boat documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'boat-documents'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);

create policy "Boat owner or admin can upload boat documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'boat-documents'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);

create policy "Boat owner or admin can update boat documents storage"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'boat-documents'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
)
with check (
  bucket_id = 'boat-documents'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);

create policy "Boat owner or admin can delete boat documents storage"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'boat-documents'
  and (
    private.is_administrator()
    or exists (
      select 1
      from public.boats boat
      join public.users owner on owner.id = boat.owner_id
      where owner.auth_id = auth.uid()
        and boat.id::text = (storage.foldername(name))[1]
    )
  )
);
