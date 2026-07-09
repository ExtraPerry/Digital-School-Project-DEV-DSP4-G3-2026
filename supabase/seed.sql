do $$
declare
  -- UUIDs fixes pour la reproductibilité des données de test
  v_auth_admin_id   uuid := '10000000-0000-0000-0000-000000000001';
  v_auth_owner1_id  uuid := '10000000-0000-0000-0000-000000000002';
  v_auth_owner2_id  uuid := '10000000-0000-0000-0000-000000000003';
  v_auth_renter1_id uuid := '10000000-0000-0000-0000-000000000004';
  v_auth_renter2_id uuid := '10000000-0000-0000-0000-000000000005';
  v_auth_visitor_id uuid := '10000000-0000-0000-0000-000000000006';

  -- IDs public.users (remplis après insertion auth via trigger)
  v_user_admin_id   uuid;
  v_user_owner1_id  uuid;
  v_user_owner2_id  uuid;
  v_user_renter1_id uuid;
  v_user_renter2_id uuid;

  -- IDs ports
  v_port_la_rochelle_id uuid;
  v_port_marseille_id   uuid;

  -- IDs bateaux
  v_boat1_id uuid;
  v_boat2_id uuid;
  v_boat3_id uuid;
  v_boat4_id uuid;
  v_boat5_id uuid;

begin

  -- ==============================
  -- 1. UTILISATEURS AUTH
  -- Le trigger on_auth_user_insert crée automatiquement
  -- public.users et public.user_roles (rôle VISITOR) pour chaque entrée.
  -- Mot de passe commun : Sailing2026!
  -- ==============================
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) values
    -- Jean Voisin — Gérant / Administrateur
    ('00000000-0000-0000-0000-000000000000',
     v_auth_admin_id, 'authenticated', 'authenticated', 'jean.voisin@sailingloc.com',
     crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', false),

    -- Marc Thévenot — Propriétaire (voiliers, La Rochelle)
    ('00000000-0000-0000-0000-000000000000',
     v_auth_owner1_id, 'authenticated', 'authenticated', 'marc.thevenot@example.com',
     crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', false),

    -- Sophie Laurent — Propriétaire (bateaux à moteur, Marseille)
    ('00000000-0000-0000-0000-000000000000',
     v_auth_owner2_id, 'authenticated', 'authenticated', 'sophie.laurent@example.com',
     crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', false),

    -- Léa Bernard — Locataire
    ('00000000-0000-0000-0000-000000000000',
     v_auth_renter1_id, 'authenticated', 'authenticated', 'lea.bernard@example.com',
     crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', false),

    -- Lucas Martin — Locataire
    ('00000000-0000-0000-0000-000000000000',
     v_auth_renter2_id, 'authenticated', 'authenticated', 'lucas.martin@example.com',
     crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', false),

    -- Thomas Petit — Visiteur (pas de téléphone → reste VISITOR)
    ('00000000-0000-0000-0000-000000000000',
     v_auth_visitor_id, 'authenticated', 'authenticated', 'thomas.petit@example.com',
     crypt('Sailing2026!', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', false);

  -- ==============================
  -- 2. RÉCUPÉRATION DES IDs PUBLIC
  -- ==============================
  select id into v_user_admin_id   from public.users where auth_id = v_auth_admin_id;
  select id into v_user_owner1_id  from public.users where auth_id = v_auth_owner1_id;
  select id into v_user_owner2_id  from public.users where auth_id = v_auth_owner2_id;
  select id into v_user_renter1_id from public.users where auth_id = v_auth_renter1_id;
  select id into v_user_renter2_id from public.users where auth_id = v_auth_renter2_id;

  -- ==============================
  -- 3. PROFILS UTILISATEURS
  -- Le téléphone doit être renseigné AVANT la mise à jour des rôles
  -- car le trigger check_role_requirements valide email + phone
  -- pour les rôles RENTER / OWNER / ADMINISTRATOR.
  -- ==============================
  update public.users set first_name = 'Jean',   last_name = 'Voisin',   phone = '+33612345678' where auth_id = v_auth_admin_id;
  update public.users set first_name = 'Marc',   last_name = 'Thévenot', phone = '+33623456789' where auth_id = v_auth_owner1_id;
  update public.users set first_name = 'Sophie', last_name = 'Laurent',  phone = '+33634567890' where auth_id = v_auth_owner2_id;
  update public.users set first_name = 'Léa',   last_name = 'Bernard',  phone = '+33645678901' where auth_id = v_auth_renter1_id;
  update public.users set first_name = 'Lucas',  last_name = 'Martin',   phone = '+33656789012' where auth_id = v_auth_renter2_id;
  update public.users set first_name = 'Thomas', last_name = 'Petit'                            where auth_id = v_auth_visitor_id;

  -- ==============================
  -- 4. RÔLES
  -- ==============================
  update public.user_roles set role = 'ADMINISTRATOR' where auth_id = v_auth_admin_id;
  update public.user_roles set role = 'OWNER'         where auth_id = v_auth_owner1_id;
  update public.user_roles set role = 'OWNER'         where auth_id = v_auth_owner2_id;
  update public.user_roles set role = 'RENTER'        where auth_id = v_auth_renter1_id;
  update public.user_roles set role = 'RENTER'        where auth_id = v_auth_renter2_id;
  -- Thomas Petit reste VISITOR (défaut)

  -- ==============================
  -- 5. PORTS
  -- ==============================
  insert into public.ports (name, country)
  values ('La Rochelle', 'France')
  returning id into v_port_la_rochelle_id;

  insert into public.ports (name, country)
  values ('Marseille', 'France')
  returning id into v_port_marseille_id;

  -- ==============================
  -- 6. BATEAUX
  -- ==============================
  insert into public.boats (
    owner_id, port_id, name, type, length_m, width_m, draft_m, capacity,
    motorization, skipper_option, price_per_day, deposit_amount, rating, badge, description
  )
  values (
    v_user_owner1_id, v_port_la_rochelle_id, 'Mistral', 'SAILBOAT',
    12.5, 3.8, 1.9, 6, 'Diesel auxiliaire', 'NONE', 450.00, 1500.00, 4.8, null,
    'Voilier de croisière en parfait état, idéal pour les longues traversées côtières. Équipé d''une VHF, d''un GPS chartplotter et d''une cuisine complète à bord. Capacité 6 personnes.'
  ) returning id into v_boat1_id;

  insert into public.boats (
    owner_id, port_id, name, type, length_m, width_m, draft_m, capacity,
    motorization, skipper_option, price_per_day, deposit_amount, rating, badge, description
  )
  values (
    v_user_owner2_id, v_port_marseille_id, 'Belle Provence', 'MOTORBOAT',
    8.2, 2.9, 1.1, 8, 'Moteur hors-bord', 'NONE', 280.00, 800.00, 4.6, null,
    'Vedette de plaisance rapide et confortable pour des sorties en famille. Moteur récent, bimini intégré et table de cockpit. Idéale pour des journées côtières ensoleillées.'
  ) returning id into v_boat2_id;

  insert into public.boats (
    owner_id, port_id, name, type, length_m, width_m, draft_m, capacity,
    motorization, skipper_option, price_per_day, deposit_amount, rating, badge, description
  )
  values (
    v_user_owner1_id, v_port_la_rochelle_id, 'L''Albatros', 'SAILBOAT',
    9.8, 3.2, 1.6, 6, 'Diesel auxiliaire', 'OPTIONAL', 320.00, 1000.00, 5.0, 'skipper',
    'Voilier de plaisance robuste avec skipper disponible sur demande. Parfait pour les débutants souhaitant découvrir la voile en toute sécurité. Permis non obligatoire avec skipper à bord.'
  ) returning id into v_boat3_id;

  insert into public.boats (
    owner_id, port_id, name, type, length_m, width_m, draft_m, capacity,
    motorization, skipper_option, price_per_day, deposit_amount, rating, badge, description
  )
  values (
    v_user_owner2_id, v_port_marseille_id, 'Aquila', 'YACHT',
    10.5, 3.5, 1.7, 8, 'Moteur inboard', 'NONE', 380.00, 2000.00, 4.5, null,
    'Bateau à moteur haut de gamme avec cabine équipée, idéal pour des week-ends prolongés. Motorisation puissante pour naviguer entre les îles méditerranéennes avec aisance et confort.'
  ) returning id into v_boat4_id;

  insert into public.boats (
    owner_id, port_id, name, type, length_m, width_m, draft_m, capacity,
    motorization, skipper_option, price_per_day, deposit_amount, rating, badge, description
  )
  values (
    v_user_owner1_id, v_port_la_rochelle_id, 'Calypso', 'SAILBOAT',
    11.2, 3.6, 1.8, 6, 'Hybride (voile + électrique)', 'NONE', 550.00, 2500.00, 4.9, 'eco',
    'Voilier moderne à motorisation hybride (voile + électrique). Silencieux, écologique et autonome grâce à ses panneaux solaires. La navigation éco-responsable à son meilleur niveau.'
  ) returning id into v_boat5_id;

  -- ==============================
  -- 7. AVIS
  -- ==============================
  insert into public.boat_reviews (boat_id, author_name, rating, comment) values
    (v_boat3_id, 'Léa Bernard',
     5.0,
     'Magnifique voilier, Marc est un propriétaire très arrangeant et de bon conseil. L''Albatros est en excellent état, équipement complet et moderne. Je recommande vivement pour une première expérience en voile !'),
    (v_boat4_id, 'Lucas Martin',
     4.5,
     'Bateau en excellent état, moteur puissant et silencieux. Cabine très confortable pour passer la nuit en mer. Parfait pour notre week-end aux îles. Sophie est une propriétaire très attentionnée.');

  -- ==============================
  -- 8. DISPONIBILITÉS
  -- Chaque bateau a une fenêtre de disponibilité couvrant les 6 prochains mois.
  -- ==============================
  insert into public.boat_availability_time_slots (boat_id, start_date, end_date) values
    -- Mistral : disponible toute la saison estivale 2026
    (v_boat1_id, '2026-06-01', '2026-10-31'),
    -- Belle Provence : disponible de juillet à septembre 2026
    (v_boat2_id, '2026-07-01', '2026-09-30'),
    -- L'Albatros : disponible toute la saison 2026
    (v_boat3_id, '2026-06-01', '2026-10-31'),
    -- Aquila : disponible de mai à octobre 2026
    (v_boat4_id, '2026-05-01', '2026-10-31'),
    -- Calypso : disponible de juin à octobre 2026
    (v_boat5_id, '2026-06-01', '2026-10-31');

  -- ==============================
  -- 9. RÉSERVATIONS
  -- Quelques réservations confirmées pour tester l'exclusion par date.
  -- L'Albatros est réservé du 20 au 27 juillet 2026 → doit être exclu
  -- des recherches chevauchant cette période.
  -- ==============================
  insert into public.boat_reservations (renter_id, boat_id, start_date, end_date) values
    (v_user_renter1_id, v_boat3_id, '2026-07-20', '2026-07-27'),
    (v_user_renter2_id, v_boat2_id, '2026-08-10', '2026-08-17');

  -- ==============================
  -- 10. ÉQUIPEMENTS
  -- ==============================
  insert into public.boat_equipment_links (boat_id, equipment) values
    -- Mistral : GPS + cuisine équipée + couchages
    (v_boat1_id, 'GPS'),
    (v_boat1_id, 'EQUIPPED_KITCHEN'),
    (v_boat1_id, 'SLEEPING_BERTHS'),
    -- Belle Provence : GPS uniquement (day boat)
    (v_boat2_id, 'GPS'),
    -- L'Albatros : GPS + couchages
    (v_boat3_id, 'GPS'),
    (v_boat3_id, 'SLEEPING_BERTHS'),
    -- Aquila : tout équipé
    (v_boat4_id, 'GPS'),
    (v_boat4_id, 'EQUIPPED_KITCHEN'),
    (v_boat4_id, 'SLEEPING_BERTHS'),
    -- Calypso : GPS + cuisine équipée + couchages
    (v_boat5_id, 'GPS'),
    (v_boat5_id, 'EQUIPPED_KITCHEN'),
    (v_boat5_id, 'SLEEPING_BERTHS');

end $$;
