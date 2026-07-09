-- ============================================================
-- 01 — REFERENCE PORTS
-- Fixed UUIDs + explicit slugs so the data is reproducible and
-- idempotent across repeated `db reset` / re-seeds.
-- ============================================================

insert into public.ports (id, name, country, slug) values
  ('20000000-0000-0000-0000-000000000001', 'La Rochelle', 'France', 'la-rochelle'),
  ('20000000-0000-0000-0000-000000000002', 'Marseille',   'France', 'marseille'),
  ('20000000-0000-0000-0000-000000000003', 'Nice',        'France', 'nice'),
  ('20000000-0000-0000-0000-000000000004', 'Ajaccio',     'France', 'ajaccio')
on conflict (id) do nothing;
