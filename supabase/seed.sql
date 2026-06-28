insert into public.ports (name, country) values
  ('La Rochelle', 'France'),
  ('Marseille', 'France'),
  ('Nice', 'France'),
  ('Cannes', 'France'),
  ('Saint-Tropez', 'France'),
  ('Toulon', 'France'),
  ('Brest', 'France'),
  ('Lorient', 'France'),
  ('Bordeaux', 'France'),
  ('Biarritz', 'France'),
  ('Bonifacio', 'France');

insert into public.boats (
  port_id, name, type, length_m, width_m, draft_m, capacity, motorization,
  skipper_option, price_per_day, deposit_amount, rating, badge, description
) values
  (
    (select id from public.ports where name = 'La Rochelle'),
    'Aurora', 'SAILBOAT', 12.4, 3.8, 1.9, 6, 'Diesel aux.',
    'OPTIONAL', 280, 500, 4.9, 'favorite',
    'Aurora est un voilier élégant et sûr, parfait pour des sorties à la journée comme pour des navigations de plusieurs jours sur la côte atlantique. Récemment révisé, équipé GPS, VHF et carte marine. 3 cabines doubles, cuisine complète, douche chaude. Sortie idéale au départ de La Rochelle vers l''île de Ré et Oléron.'
  ),
  (
    (select id from public.ports where name = 'Marseille'),
    'Mistral', 'MOTORBOAT', 6, 2.4, 0.6, 5, 'Essence hors-bord',
    'INCLUDED', 110, 300, 4.7, 'skipper',
    'Petit semi-rigide maniable, parfait pour découvrir les calanques avec un skipper expérimenté. Pas de permis nécessaire, idéal pour une sortie à la demi-journée entre amis.'
  ),
  (
    (select id from public.ports where name = 'Nice'),
    'Ocean Star', 'CATAMARAN', 14, 7.2, 1.2, 12, 'Diesel bi-moteur',
    'OPTIONAL', 540, 800, 5.0, null,
    'Catamaran spacieux avec de grands espaces de vie, idéal pour les groupes et les longs séjours. 4 cabines, deux salles d''eau, grand cockpit ombragé et plateforme de bain.'
  ),
  (
    (select id from public.ports where name = 'Bonifacio'),
    'Bella Vita', 'YACHT', 9, 3.1, 0.9, 6, 'Diesel',
    'NONE', 320, 600, 4.6, 'new',
    'Vedette élégante toute neuve, équipée pour des excursions rapides autour de Bonifacio. Bain de soleil avant, sonorisation Bluetooth et glacière intégrée.'
  );

insert into public.boat_reviews (boat_id, author_name, rating, comment) values
  (
    (select id from public.boats where name = 'Aurora'),
    'Léa B.', 5, 'Excellent week-end, propriétaire à l''écoute, bateau très bien entretenu. À refaire !'
  ),
  (
    (select id from public.boats where name = 'Aurora'),
    'Marc T.', 4, 'Bateau conforme à l''annonce, le skipper était top. Petit bémol sur le moteur auxiliaire un peu bruyant.'
  ),
  (
    (select id from public.boats where name = 'Mistral'),
    'Camille R.', 5, 'Parfait pour découvrir les calanques, skipper sympa et très pro.'
  ),
  (
    (select id from public.boats where name = 'Ocean Star'),
    'Julien P.', 5, 'Catamaran spacieux et confortable, idéal pour naviguer en famille.'
  ),
  (
    (select id from public.boats where name = 'Bella Vita'),
    'Sophie M.', 4, 'Très belle vedette, flambant neuve. Embarquement un peu tardif mais sortie au top.'
  );
