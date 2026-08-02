-- ============================================================
-- 06 — DEMO PAYMENTS (linked to reservations in 04)
-- Commission split: owner_amount = rental subtotal,
-- commission_amount = 10% platform fee, amount = total charged.
-- The COMPLETED Mistral rental for Léa has no linked review so the
-- bookings page can demo the "Leave a review" flow.
-- ============================================================

insert into public.payment_transactions (
  id,
  reservation_id,
  provider,
  external_id,
  amount,
  commission_amount,
  owner_amount,
  status
) values
  -- CONFIRMED L'Albatros (Léa) — paid
  (
    '80000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    'STRIPE',
    'cs_test_demo_albatros',
    2240.00,
    203.64,
    2036.36,
    'PAID'
  ),

  -- CONFIRMED Belle Provence (Lucas) — paid
  (
    '80000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    'STRIPE',
    'cs_test_demo_belle_provence',
    1960.00,
    178.18,
    1781.82,
    'PAID'
  ),

  -- PENDING Poséidon (Léa) — checkout in flight
  (
    '80000000-0000-0000-0000-000000000003',
    '50000000-0000-0000-0000-000000000003',
    'STRIPE',
    'cs_test_demo_poseidon_pending',
    3600.00,
    327.27,
    3272.73,
    'PENDING'
  ),

  -- CANCELLED Aquila (Lucas) — expired checkout
  (
    '80000000-0000-0000-0000-000000000004',
    '50000000-0000-0000-0000-000000000004',
    'STRIPE',
    'cs_test_demo_aquila_expired',
    0.00,
    0.00,
    0.00,
    'EXPIRED'
  ),

  -- COMPLETED Mistral (Léa) — paid, no review yet
  (
    '80000000-0000-0000-0000-000000000005',
    '50000000-0000-0000-0000-000000000005',
    'STRIPE',
    'cs_test_demo_mistral_completed',
    2250.00,
    204.55,
    2045.45,
    'PAID'
  )
on conflict (id) do nothing;
