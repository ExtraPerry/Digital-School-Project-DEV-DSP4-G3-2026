---------------------------------------
-- RESERVATION MESSAGES (renter ↔ owner chat).
---------------------------------------

---------------------------------------
-- Participant helper: the reservation's renter, the boat's owner,
-- or an administrator.
---------------------------------------

create or replace function private.is_reservation_participant(target_reservation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    private.is_administrator()
    or exists (
      select 1
      from public.boat_reservations reservation
      where reservation.id = target_reservation_id
        and reservation.renter_id = private.current_public_user_id()
    )
    or exists (
      select 1
      from public.boat_reservations reservation
      join public.boats boat on boat.id = reservation.boat_id
      where reservation.id = target_reservation_id
        and boat.owner_id = private.current_public_user_id()
    );
$$;

revoke all on function private.is_reservation_participant(uuid) from public;
grant execute on function private.is_reservation_participant(uuid) to authenticated;

---------------------------------------
-- Table.
---------------------------------------

create table public.reservation_messages (
  -- Primary Key
  id uuid primary key default gen_random_uuid(),

  -- Timestamps
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  -- Foreign Keys
  reservation_id uuid not null references public.boat_reservations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,

  -- Message Data
  content text not null check (char_length(content) between 1 and 2000)
);

comment on table public.reservation_messages is 'Chat messages between the renter and the boat owner, scoped to a reservation.';

create index reservation_messages_reservation_id_created_at_idx
  on public.reservation_messages (reservation_id, created_at);

create trigger enforce_reservation_messages_timestamps
  before insert or update on public.reservation_messages
  for each row execute function public.enforce_table_timestamps();

---------------------------------------
-- RLS.
---------------------------------------

alter table public.reservation_messages enable row level security;

grant select, insert on public.reservation_messages to authenticated;

create policy "Participants can view reservation messages"
on public.reservation_messages
for select
to authenticated
using ( private.is_reservation_participant(reservation_id) );

create policy "Participants can send reservation messages"
on public.reservation_messages
for insert
to authenticated
with check (
  sender_id = private.current_public_user_id()
  and private.is_reservation_participant(reservation_id)
);

---------------------------------------
-- Realtime.
-- The supabase_realtime publication is empty by default; the chat
-- needs INSERT events to reach subscribed clients.
---------------------------------------

alter publication supabase_realtime add table public.reservation_messages;
