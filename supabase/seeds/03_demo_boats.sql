-- ============================================================
-- 03 — DEMO BOATS, EQUIPMENT, REVIEWS, MEDIA
-- 10 boats covering all boat_type values, every skipper_option and
-- each equipment item. Owner ids are resolved from auth_id so this
-- file stays independent of the trigger-generated public.users ids.
-- Fixed UUIDs + ON CONFLICT keep re-seeding idempotent.
-- ============================================================

-- ------------------------------------------------------------
-- Boats
-- ------------------------------------------------------------
insert into public.boats (
  id, owner_id, port_id, name, type, length_m, width_m, draft_m, capacity,
  motorization, skipper_option, price_per_day, deposit_amount, rating, badge,
  description, is_published, published_at
) values
  -- 1. Mistral — SAILBOAT, La Rochelle, owner Marc, skipper NONE
  ('30000000-0000-0000-0000-000000000001',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   '20000000-0000-0000-0000-000000000001', 'Mistral', 'SAILBOAT',
   12.5, 3.8, 1.9, 6, 'Diesel auxiliaire', 'NONE', 450.00, 1500.00, 4.8, null,
   'Voilier de croisière en parfait état, idéal pour les longues traversées côtières. Équipé d''une VHF, d''un GPS chartplotter et d''une cuisine complète à bord.',
   true, now()),

  -- 2. Belle Provence — MOTORBOAT, Marseille, owner Sophie, skipper NONE
  ('30000000-0000-0000-0000-000000000002',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   '20000000-0000-0000-0000-000000000002', 'Belle Provence', 'MOTORBOAT',
   8.2, 2.9, 1.1, 8, 'Moteur hors-bord', 'NONE', 280.00, 800.00, 4.6, null,
   'Vedette de plaisance rapide et confortable pour des sorties en famille. Moteur récent, bimini intégré et table de cockpit.',
   true, now()),

  -- 3. L'Albatros — SAILBOAT, La Rochelle, owner Marc, skipper OPTIONAL
  ('30000000-0000-0000-0000-000000000003',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   '20000000-0000-0000-0000-000000000001', 'L''Albatros', 'SAILBOAT',
   9.8, 3.2, 1.6, 6, 'Diesel auxiliaire', 'OPTIONAL', 320.00, 1000.00, 5.0, 'skipper',
   'Voilier de plaisance robuste avec skipper disponible sur demande. Parfait pour les débutants souhaitant découvrir la voile en toute sécurité.',
   true, now()),

  -- 4. Aquila — YACHT, Marseille, owner Sophie, skipper NONE
  ('30000000-0000-0000-0000-000000000004',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   '20000000-0000-0000-0000-000000000002', 'Aquila', 'YACHT',
   10.5, 3.5, 1.7, 8, 'Moteur inboard', 'NONE', 380.00, 2000.00, 4.5, null,
   'Yacht haut de gamme avec cabine équipée, idéal pour des week-ends prolongés. Motorisation puissante pour naviguer entre les îles méditerranéennes.',
   true, now()),

  -- 5. Calypso — SAILBOAT, La Rochelle, owner Marc, skipper NONE
  ('30000000-0000-0000-0000-000000000005',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   '20000000-0000-0000-0000-000000000001', 'Calypso', 'SAILBOAT',
   11.2, 3.6, 1.8, 6, 'Hybride (voile + électrique)', 'NONE', 550.00, 2500.00, 4.9, 'eco',
   'Voilier moderne à motorisation hybride (voile + électrique). Silencieux, écologique et autonome grâce à ses panneaux solaires.',
   true, now()),

  -- 6. Poséidon — CATAMARAN, Nice, owner Sophie, skipper INCLUDED
  ('30000000-0000-0000-0000-000000000006',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   '20000000-0000-0000-0000-000000000003', 'Poséidon', 'CATAMARAN',
   13.4, 7.2, 1.3, 10, 'Deux moteurs diesel', 'INCLUDED', 720.00, 3000.00, 4.9, 'premium',
   'Catamaran spacieux et stable avec skipper professionnel inclus. Vastes espaces de vie, quatre cabines doubles et grand carré lumineux.',
   true, now()),

  -- 7. Le Corsaire — MOTORBOAT, Ajaccio, owner Marc, skipper OPTIONAL
  ('30000000-0000-0000-0000-000000000007',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   '20000000-0000-0000-0000-000000000004', 'Le Corsaire', 'MOTORBOAT',
   7.5, 2.6, 0.9, 6, 'Moteur hors-bord', 'OPTIONAL', 230.00, 700.00, 4.3, null,
   'Bateau à moteur maniable et économique pour explorer les calanques corses. Skipper disponible en option pour les non-initiés.',
   true, now()),

  -- 8. Sérénité — CATAMARAN, Marseille, owner Sophie, skipper NONE
  ('30000000-0000-0000-0000-000000000008',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   '20000000-0000-0000-0000-000000000002', 'Sérénité', 'CATAMARAN',
   12.0, 6.5, 1.2, 8, 'Deux moteurs diesel', 'NONE', 640.00, 2800.00, 4.7, null,
   'Catamaran confortable et facile à manœuvrer, parfait pour une croisière en famille. Grande plage arrière et couchages spacieux.',
   true, now()),

  -- 9. Vent d'Ouest — SAILBOAT, La Rochelle, owner Marc, skipper INCLUDED
  ('30000000-0000-0000-0000-000000000009',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   '20000000-0000-0000-0000-000000000001', 'Vent d''Ouest', 'SAILBOAT',
   10.0, 3.3, 1.7, 6, 'Diesel auxiliaire', 'INCLUDED', 400.00, 1200.00, 4.7, 'skipper',
   'Voilier convivial avec skipper inclus pour une navigation sereine sur la côte atlantique. Idéal pour une première expérience de la voile.',
   true, now()),

  -- 10. Neptune — YACHT, Nice, owner Sophie, skipper INCLUDED
  ('30000000-0000-0000-0000-00000000000a',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   '20000000-0000-0000-0000-000000000003', 'Neptune', 'YACHT',
   15.0, 4.4, 2.1, 10, 'Deux moteurs inboard', 'INCLUDED', 980.00, 4000.00, 4.8, 'premium',
   'Yacht de luxe avec équipage, cabines VIP et espace de réception. L''expérience méditerranéenne ultime pour les grandes occasions.',
   true, now()),

  -- 11. Horizon — MOTORBOAT draft, Brest, owner Marc (missing insurance → Completer)
  ('30000000-0000-0000-0000-00000000000b',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   '20000000-0000-0000-0000-000000000005', 'Horizon', 'MOTORBOAT',
   6.8, 2.5, 0.8, 5, 'Essence hors-bord', 'NONE', 190.00, 500.00, 0.0, null,
   'Brouillon d''annonce : vedette compacte pour sorties côtières à Brest. Assurance encore à téléverser avant publication.',
   false, null)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Equipment links (GPS on all; kitchen and berths distributed)
-- ------------------------------------------------------------
insert into public.boat_equipment_links (boat_id, equipment) values
  ('30000000-0000-0000-0000-000000000001', 'GPS'),
  ('30000000-0000-0000-0000-000000000001', 'EQUIPPED_KITCHEN'),
  ('30000000-0000-0000-0000-000000000001', 'SLEEPING_BERTHS'),

  ('30000000-0000-0000-0000-000000000002', 'GPS'),

  ('30000000-0000-0000-0000-000000000003', 'GPS'),
  ('30000000-0000-0000-0000-000000000003', 'SLEEPING_BERTHS'),

  ('30000000-0000-0000-0000-000000000004', 'GPS'),
  ('30000000-0000-0000-0000-000000000004', 'EQUIPPED_KITCHEN'),
  ('30000000-0000-0000-0000-000000000004', 'SLEEPING_BERTHS'),

  ('30000000-0000-0000-0000-000000000005', 'GPS'),
  ('30000000-0000-0000-0000-000000000005', 'EQUIPPED_KITCHEN'),
  ('30000000-0000-0000-0000-000000000005', 'SLEEPING_BERTHS'),

  ('30000000-0000-0000-0000-000000000006', 'GPS'),
  ('30000000-0000-0000-0000-000000000006', 'EQUIPPED_KITCHEN'),
  ('30000000-0000-0000-0000-000000000006', 'SLEEPING_BERTHS'),

  ('30000000-0000-0000-0000-000000000007', 'GPS'),

  ('30000000-0000-0000-0000-000000000008', 'GPS'),
  ('30000000-0000-0000-0000-000000000008', 'SLEEPING_BERTHS'),

  ('30000000-0000-0000-0000-000000000009', 'GPS'),
  ('30000000-0000-0000-0000-000000000009', 'EQUIPPED_KITCHEN'),

  ('30000000-0000-0000-0000-00000000000a', 'GPS'),
  ('30000000-0000-0000-0000-00000000000a', 'EQUIPPED_KITCHEN'),
  ('30000000-0000-0000-0000-00000000000a', 'SLEEPING_BERTHS')
on conflict (boat_id, equipment) do nothing;

-- ------------------------------------------------------------
-- Reviews (reviewer_id linked to renter users; author_name kept)
-- The recompute_boat_rating trigger will align boats.rating with these.
-- ------------------------------------------------------------
insert into public.boat_reviews (id, boat_id, reviewer_id, author_name, rating, comment) values
  ('70000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000003',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
   'Léa Bernard', 5.0,
   'Magnifique voilier, Marc est un propriétaire très arrangeant et de bon conseil. L''Albatros est en excellent état. Je recommande vivement pour une première expérience en voile !'),

  ('70000000-0000-0000-0000-000000000002',
   '30000000-0000-0000-0000-000000000004',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000005'),
   'Lucas Martin', 4.5,
   'Bateau en excellent état, moteur puissant et silencieux. Cabine très confortable pour passer la nuit en mer. Parfait pour notre week-end aux îles.'),

  ('70000000-0000-0000-0000-000000000003',
   '30000000-0000-0000-0000-000000000001',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000005'),
   'Lucas Martin', 4.8,
   'Le Mistral est un voilier fiable et bien équipé. Traversée impeccable, rien à redire. À refaire sans hésiter.'),

  ('70000000-0000-0000-0000-000000000004',
   '30000000-0000-0000-0000-000000000006',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000004'),
   'Léa Bernard', 4.9,
   'Catamaran spacieux et skipper aux petits soins. Une journée inoubliable au large de Nice, parfait pour un groupe.')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Media (one cover image per boat; path convention {boat_id}/cover.jpg)
-- Placeholder rows only — no actual files are uploaded by the seed.
-- ------------------------------------------------------------
insert into public.boat_media (id, boat_id, storage_bucket, storage_path, sort_order, is_cover, alt_text) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'boat-images', '30000000-0000-0000-0000-000000000001/cover.jpg', 0, true, 'Mistral amarré au port'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'boat-images', '30000000-0000-0000-0000-000000000002/cover.jpg', 0, true, 'Belle Provence en navigation'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'boat-images', '30000000-0000-0000-0000-000000000003/cover.jpg', 0, true, 'L''Albatros voiles hissées'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'boat-images', '30000000-0000-0000-0000-000000000004/cover.jpg', 0, true, 'Aquila au mouillage'),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'boat-images', '30000000-0000-0000-0000-000000000005/cover.jpg', 0, true, 'Calypso et ses panneaux solaires'),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'boat-images', '30000000-0000-0000-0000-000000000006/cover.jpg', 0, true, 'Poséidon catamaran de luxe'),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', 'boat-images', '30000000-0000-0000-0000-000000000007/cover.jpg', 0, true, 'Le Corsaire dans les calanques'),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', 'boat-images', '30000000-0000-0000-0000-000000000008/cover.jpg', 0, true, 'Sérénité au coucher du soleil'),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', 'boat-images', '30000000-0000-0000-0000-000000000009/cover.jpg', 0, true, 'Vent d''Ouest sous voiles'),
  ('40000000-0000-0000-0000-00000000000a', '30000000-0000-0000-0000-00000000000a', 'boat-images', '30000000-0000-0000-0000-00000000000a/cover.jpg', 0, true, 'Neptune yacht de luxe')
on conflict (id) do nothing;
