---------------------------------------
-- ENUMS
---------------------------------------

create type public.boat_motor_type as enum ('SAIL', 'MOTOR', 'ELECTRIC', 'HYBRID');

create type public.boat_document_type as enum ('BOAT_LICENSE', 'INSURANCE', 'MARITIME_CV', 'RENTAL_CONTRACT');

---------------------------------------
-- BOATS TABLE
---------------------------------------

create table public.boats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  owner uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  length_meters numeric(5,2),
  width_meters numeric(5,2),
  height_meters numeric(5,2),
  motor_type public.boat_motor_type not null,
  has_skipper boolean not null default false,
  daily_cost_euro numeric(8,2) not null check (daily_cost_euro > 0)
);

comment on table public.boats is 'Boats listed for rental on the platform.';

create trigger enforce_boats_timestamps
  before insert or update on public.boats
  for each row execute function public.enforce_table_timestamps();

alter table public.boats enable row level security;

create policy "Anyone can view boats"
  on public.boats for select
  to anon, authenticated
  using (true);

create policy "Owners and admins can create boats"
  on public.boats for insert
  to authenticated
  with check (
    owner = (select id from public.users where auth_id = auth.uid())
    and (select role from public.user_roles where auth_id = auth.uid()) in ('OWNER', 'ADMINISTRATOR')
  );

create policy "Boat owners and admins can update boats"
  on public.boats for update
  to authenticated
  using (
    owner = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  )
  with check (
    owner = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

create policy "Boat owners and admins can delete boats"
  on public.boats for delete
  to authenticated
  using (
    owner = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

---------------------------------------
-- BOAT AVAILABILITY TIME SLOTS TABLE
---------------------------------------

create table public.boat_availability_time_slots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  boat_id uuid not null references public.boats(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  constraint valid_availability_date_range check (end_date > start_date)
);

comment on table public.boat_availability_time_slots is 'Periods during which a boat is available for rental.';

create trigger enforce_boat_availability_time_slots_timestamps
  before insert or update on public.boat_availability_time_slots
  for each row execute function public.enforce_table_timestamps();

alter table public.boat_availability_time_slots enable row level security;

create policy "Anyone can view boat availability"
  on public.boat_availability_time_slots for select
  to anon, authenticated
  using (true);

create policy "Boat owners and admins can manage availability"
  on public.boat_availability_time_slots for all
  to authenticated
  using (
    (select owner from public.boats where id = boat_id) = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  )
  with check (
    (select owner from public.boats where id = boat_id) = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

---------------------------------------
-- BOAT RESERVATIONS TABLE
---------------------------------------

create table public.boat_reservations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  renter_id uuid not null references public.users(id) on delete cascade,
  boat_id uuid not null references public.boats(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  constraint valid_reservation_date_range check (end_date > start_date)
);

comment on table public.boat_reservations is 'Reservations made by renters for a specific boat and date range.';

create trigger enforce_boat_reservations_timestamps
  before insert or update on public.boat_reservations
  for each row execute function public.enforce_table_timestamps();

alter table public.boat_reservations enable row level security;

create policy "Renters, boat owners, and admins can view reservations"
  on public.boat_reservations for select
  to authenticated
  using (
    renter_id = (select id from public.users where auth_id = auth.uid())
    or (select owner from public.boats where id = boat_id) = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

create policy "Authenticated users can create reservations"
  on public.boat_reservations for insert
  to authenticated
  with check (
    renter_id = (select id from public.users where auth_id = auth.uid())
    and (select role from public.user_roles where auth_id = auth.uid()) in ('RENTER', 'OWNER', 'ADMINISTRATOR')
  );

create policy "Renters and admins can update reservations"
  on public.boat_reservations for update
  to authenticated
  using (
    renter_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  )
  with check (
    renter_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

create policy "Renters and admins can delete reservations"
  on public.boat_reservations for delete
  to authenticated
  using (
    renter_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

---------------------------------------
-- BOAT RESERVATION COMMENTS TABLE
---------------------------------------

create table public.boat_reservation_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,
  boat_id uuid not null references public.boats(id) on delete cascade,
  content text not null,
  score numeric(2,1) not null,
  constraint valid_comment_score check (score >= 1.0 and score <= 5.0)
);

comment on table public.boat_reservation_comments is 'Reviews and ratings left by renters after completing a rental.';

create trigger enforce_boat_reservation_comments_timestamps
  before insert or update on public.boat_reservation_comments
  for each row execute function public.enforce_table_timestamps();

alter table public.boat_reservation_comments enable row level security;

create policy "Anyone can view comments"
  on public.boat_reservation_comments for select
  to anon, authenticated
  using (true);

create policy "Renters and owners can create comments"
  on public.boat_reservation_comments for insert
  to authenticated
  with check (
    user_id = (select id from public.users where auth_id = auth.uid())
    and (select role from public.user_roles where auth_id = auth.uid()) in ('RENTER', 'OWNER', 'ADMINISTRATOR')
  );

create policy "Comment authors and admins can update comments"
  on public.boat_reservation_comments for update
  to authenticated
  using (
    user_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  )
  with check (
    user_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

create policy "Comment authors and admins can delete comments"
  on public.boat_reservation_comments for delete
  to authenticated
  using (
    user_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

---------------------------------------
-- BOAT DOCUMENT BUCKET FILES TABLE
---------------------------------------

create table public.boat_document_bucket_files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,
  -- nullable : CV marin et permis ne sont pas liés à un seul bateau
  boat_id uuid references public.boats(id) on delete set null,
  name text not null,
  type public.boat_document_type not null,
  mime_type text not null,
  bucket_name text not null,
  bucket_path text not null
);

comment on table public.boat_document_bucket_files is 'Owner documents (boat license, insurance, maritime CV) stored in Supabase Storage.';

create trigger enforce_boat_document_bucket_files_timestamps
  before insert or update on public.boat_document_bucket_files
  for each row execute function public.enforce_table_timestamps();

alter table public.boat_document_bucket_files enable row level security;

create policy "Document owners and admins can view documents"
  on public.boat_document_bucket_files for select
  to authenticated
  using (
    user_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );

create policy "Owners and admins can upload documents"
  on public.boat_document_bucket_files for insert
  to authenticated
  with check (
    user_id = (select id from public.users where auth_id = auth.uid())
    and (select role from public.user_roles where auth_id = auth.uid()) in ('OWNER', 'ADMINISTRATOR')
  );

create policy "Document owners and admins can delete documents"
  on public.boat_document_bucket_files for delete
  to authenticated
  using (
    user_id = (select id from public.users where auth_id = auth.uid())
    or (select role from public.user_roles where auth_id = auth.uid()) = 'ADMINISTRATOR'
  );
