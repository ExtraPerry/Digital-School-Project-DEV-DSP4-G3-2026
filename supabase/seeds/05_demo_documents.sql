-- ============================================================
-- 05 — DEMO OWNER DOCUMENTS
-- Mirrors the owner dashboard mockup:
--   - Marc: LICENSE + SAILOR_CV (owner-level) + INSURANCE on published boats
--   - Horizon (draft) has NO insurance → shows "À téléverser" / Compléter
--   - Sophie: LICENSE + SAILOR_CV + insurance on her published boats
-- Placeholder metadata only (no binary files uploaded to Storage).
-- ============================================================

-- ------------------------------------------------------------
-- Owner-level documents (LICENSE + SAILOR_CV)
-- Path convention: owners/{auth_id}/...
-- ------------------------------------------------------------
insert into public.boat_documents (
  id, boat_id, owner_id, document_type, storage_bucket, storage_path, mime_type
) values
  -- Marc Thévenot
  ('80000000-0000-0000-0000-000000000001',
   null,
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'LICENSE', 'boat-documents',
   'owners/10000000-0000-0000-0000-000000000002/permis-2024.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000002',
   null,
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'SAILOR_CV', 'boat-documents',
   'owners/10000000-0000-0000-0000-000000000002/cv-marin.txt',
   'text/plain'),

  -- Sophie Laurent
  ('80000000-0000-0000-0000-000000000003',
   null,
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'LICENSE', 'boat-documents',
   'owners/10000000-0000-0000-0000-000000000003/permis-sophie.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000004',
   null,
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'SAILOR_CV', 'boat-documents',
   'owners/10000000-0000-0000-0000-000000000003/cv-marin-sophie.txt',
   'text/plain')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Boat-level INSURANCE (published boats only — Horizon draft omitted)
-- Path convention: {boat_id}/...
-- ------------------------------------------------------------
insert into public.boat_documents (
  id, boat_id, owner_id, document_type, storage_bucket, storage_path, mime_type
) values
  -- Marc's published boats
  ('80000000-0000-0000-0000-000000000011',
   '30000000-0000-0000-0000-000000000001',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000001/assurance-mistral.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000012',
   '30000000-0000-0000-0000-000000000003',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000003/assurance-albatros.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000013',
   '30000000-0000-0000-0000-000000000005',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000005/assurance-calypso.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000014',
   '30000000-0000-0000-0000-000000000007',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000007/assurance-corsaire.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000015',
   '30000000-0000-0000-0000-000000000009',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000002'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000009/assurance-vent-douest.pdf',
   'application/pdf'),

  -- Sophie's published boats
  ('80000000-0000-0000-0000-000000000021',
   '30000000-0000-0000-0000-000000000002',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000002/assurance-belle-provence.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000022',
   '30000000-0000-0000-0000-000000000004',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000004/assurance-aquila.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000023',
   '30000000-0000-0000-0000-000000000006',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000006/assurance-poseidon.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000024',
   '30000000-0000-0000-0000-000000000008',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-000000000008/assurance-serenite.pdf',
   'application/pdf'),

  ('80000000-0000-0000-0000-000000000025',
   '30000000-0000-0000-0000-00000000000a',
   (select id from public.users where auth_id = '10000000-0000-0000-0000-000000000003'),
   'INSURANCE', 'boat-documents',
   '30000000-0000-0000-0000-00000000000a/assurance-neptune.pdf',
   'application/pdf')
on conflict (id) do nothing;
