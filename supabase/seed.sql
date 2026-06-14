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
  -- 5. BATEAUX
  -- ==============================
  insert into public.boats (owner, name, description, length_meters, width_meters, height_meters, motor_type, has_skipper, daily_cost_euro)
  values (
    v_user_owner1_id, 'Mistral',
    'Voilier de croisière en parfait état, idéal pour les longues traversées côtières. Équipé d''une VHF, d''un GPS chartplotter et d''une cuisine complète à bord. Capacité 6 personnes.',
    12.50, 3.80, 1.90, 'SAIL', false, 450.00
  ) returning id into v_boat1_id;

  insert into public.boats (owner, name, description, length_meters, width_meters, height_meters, motor_type, has_skipper, daily_cost_euro)
  values (
    v_user_owner2_id, 'Belle Provence',
    'Vedette de plaisance rapide et confortable pour des sorties en famille. Moteur récent, bimini intégré et table de cockpit. Idéale pour des journées côtières ensoleillées.',
    8.20, 2.90, 1.10, 'MOTOR', false, 280.00
  ) returning id into v_boat2_id;

  insert into public.boats (owner, name, description, length_meters, width_meters, height_meters, motor_type, has_skipper, daily_cost_euro)
  values (
    v_user_owner1_id, 'L''Albatros',
    'Voilier de plaisance robuste avec skipper disponible sur demande. Parfait pour les débutants souhaitant découvrir la voile en toute sécurité. Permis non obligatoire avec skipper à bord.',
    9.80, 3.20, 1.60, 'SAIL', true, 320.00
  ) returning id into v_boat3_id;

  insert into public.boats (owner, name, description, length_meters, width_meters, height_meters, motor_type, has_skipper, daily_cost_euro)
  values (
    v_user_owner2_id, 'Aquila',
    'Bateau à moteur haut de gamme avec cabine équipée, idéal pour des week-ends prolongés. Motorisation puissante pour naviguer entre les îles méditerranéennes avec aisance et confort.',
    10.50, 3.50, 1.70, 'MOTOR', false, 380.00
  ) returning id into v_boat4_id;

  insert into public.boats (owner, name, description, length_meters, width_meters, height_meters, motor_type, has_skipper, daily_cost_euro)
  values (
    v_user_owner1_id, 'Calypso',
    'Voilier moderne à motorisation hybride (voile + électrique). Silencieux, écologique et autonome grâce à ses panneaux solaires. La navigation éco-responsable à son meilleur niveau.',
    11.20, 3.60, 1.80, 'HYBRID', false, 550.00
  ) returning id into v_boat5_id;

  -- ==============================
  -- 6. CRÉNEAUX DE DISPONIBILITÉ
  -- ==============================
  insert into public.boat_availability_time_slots (boat_id, start_date, end_date) values
    (v_boat1_id, '2026-07-01', '2026-08-31'),   -- Mistral        : juillet – août
    (v_boat2_id, '2026-06-15', '2026-09-30'),   -- Belle Provence : mi-juin – fin septembre
    (v_boat3_id, '2026-05-01', '2026-09-30'),   -- L'Albatros     : mai – fin septembre
    (v_boat4_id, '2026-06-01', '2026-10-31'),   -- Aquila         : juin – fin octobre
    (v_boat5_id, '2026-07-01', '2026-09-30');   -- Calypso        : juillet – fin septembre

  -- ==============================
  -- 7. RÉSERVATIONS
  -- ==============================

  -- Passées (antérieures au 14/06/2026 → permettent de laisser un avis)
  insert into public.boat_reservations (renter_id, boat_id, start_date, end_date) values
    (v_user_renter1_id, v_boat3_id, '2026-05-05', '2026-05-10'),  -- Léa   → L'Albatros
    (v_user_renter2_id, v_boat4_id, '2026-04-15', '2026-04-22');  -- Lucas → Aquila

  -- À venir
  insert into public.boat_reservations (renter_id, boat_id, start_date, end_date) values
    (v_user_renter1_id, v_boat1_id, '2026-07-10', '2026-07-17'),  -- Léa   → Mistral
    (v_user_renter2_id, v_boat2_id, '2026-06-20', '2026-06-25');  -- Lucas → Belle Provence

  -- ==============================
  -- 8. COMMENTAIRES (uniquement sur des séjours passés)
  -- ==============================
  insert into public.boat_reservation_comments (user_id, boat_id, content, score) values
    (v_user_renter1_id, v_boat3_id,
     'Magnifique voilier, Marc est un propriétaire très arrangeant et de bon conseil. L''Albatros est en excellent état, équipement complet et moderne. Je recommande vivement pour une première expérience en voile !',
     5.0),
    (v_user_renter2_id, v_boat4_id,
     'Bateau en excellent état, moteur puissant et silencieux. Cabine très confortable pour passer la nuit en mer. Parfait pour notre week-end aux îles. Sophie est une propriétaire très attentionnée.',
     4.5);

  -- ==============================
  -- 9. DOCUMENTS
  -- ==============================
  insert into public.boat_document_bucket_files (user_id, boat_id, name, type, mime_type, bucket_name, bucket_path) values
    -- Marc Thévenot
    (v_user_owner1_id, null,       'permis_bateau_marc_thevenot.pdf',   'BOAT_LICENSE',    'application/pdf', 'owner-documents', 'marc-thevenot/boat-license.pdf'),
    (v_user_owner1_id, null,       'cv_marin_marc_thevenot.pdf',        'MARITIME_CV',     'application/pdf', 'owner-documents', 'marc-thevenot/maritime-cv.pdf'),
    (v_user_owner1_id, v_boat1_id, 'assurance_mistral_2026.pdf',        'INSURANCE',       'application/pdf', 'owner-documents', 'marc-thevenot/insurance-mistral-2026.pdf'),
    (v_user_owner1_id, v_boat3_id, 'assurance_albatros_2026.pdf',       'INSURANCE',       'application/pdf', 'owner-documents', 'marc-thevenot/insurance-albatros-2026.pdf'),
    -- Sophie Laurent
    (v_user_owner2_id, null,       'permis_bateau_sophie_laurent.pdf',  'BOAT_LICENSE',    'application/pdf', 'owner-documents', 'sophie-laurent/boat-license.pdf'),
    (v_user_owner2_id, null,       'cv_marin_sophie_laurent.pdf',       'MARITIME_CV',     'application/pdf', 'owner-documents', 'sophie-laurent/maritime-cv.pdf'),
    (v_user_owner2_id, v_boat2_id, 'assurance_belle_provence_2026.pdf', 'INSURANCE',       'application/pdf', 'owner-documents', 'sophie-laurent/insurance-belle-provence-2026.pdf'),
    (v_user_owner2_id, v_boat4_id, 'contrat_type_aquila.pdf',           'RENTAL_CONTRACT', 'application/pdf', 'owner-documents', 'sophie-laurent/rental-contract-aquila.pdf');

end $$;
