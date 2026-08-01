-- ============================================================
-- 07 — DEMO RESERVATION MESSAGES
-- Chat between Léa (renter) and the owner of L'Albatros about her
-- upcoming CONFIRMED reservation (50000000-...-0001).
-- ============================================================

insert into public.reservation_messages (id, reservation_id, sender_id, content, created_at) values
  (
    '90000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
    'Bonjour ! Nous arriverons vers 9h le premier jour, est-ce que cela vous convient ?',
    now() - interval '2 days'
  ),
  (
    '90000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000001',
    (select owner_id from public.boats where id = '30000000-0000-0000-0000-000000000003'),
    'Bonjour Léa, 9h c''est parfait. Je vous attendrai au ponton B avec les clés et le briefing sécurité.',
    now() - interval '2 days' + interval '25 minutes'
  ),
  (
    '90000000-0000-0000-0000-000000000003',
    '50000000-0000-0000-0000-000000000001',
    (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
    'Super, merci ! À bientôt.',
    now() - interval '2 days' + interval '40 minutes'
  )
on conflict (id) do nothing;
