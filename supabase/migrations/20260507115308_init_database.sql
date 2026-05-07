create or replace function enforce_table_timestamps() 
returns trigger as $$ 
begin 
	-- for insert events 
	if tg_op = 'INSERT' then 
		new.created_at = now(); 
		new.updated_at = now(); 
	-- for update events 
	elsif tg_op = 'UPDATE' then 
		new.updated_at = now(); 
		-- prevent changing created_at 
		new.created_at = old.created_at; 
	end if; 
	return new; 
end; 
$$ language plpgsql;

---------------------------------------
-- USER TABLE.
---------------------------------------

create table public.users (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  auth_id uuid not null references auth.users(id) on delete cascade,

  -- Users Data
  first_name text,
  last_name text,
  email text,
  phone text
);

comment on table public.users is 'The user information/representation within this database.';

create trigger enforce_users_timestamps 
  before insert or update on public.users 
  for each row execute function enforce_table_timestamps();

alter table public.users enable row level security;

-- View Policy
create policy "Users can view their own information"
on public.users 
for select 
to authenticated 
using ( auth_id = auth.uid() );

-- Update Policy
create policy "Users can update their own information"
on public.users 
for update 
to authenticated 
using ( auth_id = auth.uid() ) 
with check ( auth_id = auth.uid() );

---------------------------------------
-- USER ROLES TABLE.
---------------------------------------

-- VISITOR : Authenticated user that does not have an email and phone attached.
-- RENTER : Authenticated user that has an email and phone attached.
-- OWNER : Authenticated user that has an email and phone attached and was given permission to show off his boats.
-- ADMINISTRATOR : The Admin that manages the website.
create type public.user_roles_type as enum ('VISITOR', 'RENTER', 'OWNER', 'ADMINISTRATOR');

create table public.user_roles (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),
  
  -- Timestamps & Ownership
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys & Relations
  auth_id uuid unique not null references auth.users(id) on delete cascade,
  user_id uuid unique not null references public.users(id) on delete cascade,
  
  -- User Role Data
  role public.user_roles_type not null default 'VISITOR'
);

comment on table public.user_roles is 'The user role used to descriminate their purpose/permissions within this database.';

create or replace function public.check_role_requirements()
returns trigger as $$
declare
  user_email text;
  user_phone text;
begin
  -- We only need to enforce the check if they are being assigned an elevated role
  if new.role in ('RENTER', 'OWNER', 'ADMINISTRATOR') then
    
    -- Fetch the email and phone from the public.users table
    select email, phone into user_email, user_phone
    from public.users
    where id = new.user_id;

    -- If either is missing (null or empty string), block the action
    if user_email is null or user_email = '' or user_phone is null or user_phone = '' then
      raise exception 'Cannot assign role %. User must have both an email and phone number attached to their profile.', new.role;
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger enforce_user_roles_requirements
  before insert or update on public.user_roles
  for each row execute function public.check_role_requirements();

create trigger enforce_user_roles_timestamps 
  before insert or update on public.user_roles 
  for each row execute function enforce_table_timestamps();

alter table public.user_roles enable row level security;

create policy "Users can view their own role"
  on public.user_roles
  for select 
  to authenticated 
  using ( auth_id = auth.uid() );

---------------------------------------
-- ACTIONS WHEN AUTH USER IS CREATED.
---------------------------------------

-- Auto-creation Trigger (bypasses RLS)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_public_user_id uuid;
begin
  -- 1. Insert the public user and capture its generated ID
  insert into public.users (auth_id, email, phone)
  values (new.id, new.email, new.phone)
  returning id into new_public_user_id;

  -- 2. Insert the default user role using the captured ID
  insert into public.user_roles (auth_id, user_id, role)
  values (new.id, new_public_user_id, 'VISITOR');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update Trigger (bypasses RLS)
create or replace function public.handle_user_update()
returns trigger as $$
begin
  update public.users
  set 
    email = new.email,
    phone = new.phone
  where auth_id = new.id;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();