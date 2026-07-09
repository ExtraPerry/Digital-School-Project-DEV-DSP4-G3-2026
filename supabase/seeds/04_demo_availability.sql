-- ============================================================
-- 04 — DEMO AVAILABILITY & RESERVATIONS
-- Relative dates so the dataset stays valid over time. Reservation
-- statuses are mixed to exercise the search RPC filter:
--   PENDING / CONFIRMED  -> block availability
--   CANCELLED / COMPLETED -> do not block
-- Active (PENDING/CONFIRMED) ranges never overlap per boat, satisfying
-- the boat_reservations_no_overlap exclusion constraint.
-- ============================================================

-- ------------------------------------------------------------
-- Availability windows: every boat is bookable for the next 6 months.
-- ------------------------------------------------------------
insert into public.boat_availability_time_slots (id, boat_id, start_date, end_date) values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', current_date, (current_date + interval '6 months')::date),
  ('60000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-00000000000a', current_date, (current_date + interval '6 months')::date)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Reservations (mixed statuses, relative dates)
-- ------------------------------------------------------------
insert into public.boat_reservations (id, renter_id, boat_id, start_date, end_date, status, total_amount, currency) values
  -- CONFIRMED: blocks L'Albatros for a week (~3 weeks out)
  ('50000000-0000-0000-0000-000000000001',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
   '30000000-0000-0000-0000-000000000003',
   (current_date + 20), (current_date + 27), 'CONFIRMED', 2240.00, 'EUR'),

  -- CONFIRMED: blocks Belle Provence (~5 weeks out)
  ('50000000-0000-0000-0000-000000000002',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000005'),
   '30000000-0000-0000-0000-000000000002',
   (current_date + 35), (current_date + 42), 'CONFIRMED', 1960.00, 'EUR'),

  -- PENDING: blocks Poséidon while a payment is in flight (~10 days out)
  ('50000000-0000-0000-0000-000000000003',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
   '30000000-0000-0000-0000-000000000006',
   (current_date + 10), (current_date + 15), 'PENDING', 3600.00, 'EUR'),

  -- CANCELLED: does NOT block Aquila
  ('50000000-0000-0000-0000-000000000004',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000005'),
   '30000000-0000-0000-0000-000000000004',
   (current_date + 5), (current_date + 9), 'CANCELLED', null, 'EUR'),

  -- COMPLETED: a past Mistral rental (does NOT block future availability)
  ('50000000-0000-0000-0000-000000000005',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
   '30000000-0000-0000-0000-000000000001',
   (current_date - 30), (current_date - 25), 'COMPLETED', 2250.00, 'EUR')
on conflict (id) do nothing;
