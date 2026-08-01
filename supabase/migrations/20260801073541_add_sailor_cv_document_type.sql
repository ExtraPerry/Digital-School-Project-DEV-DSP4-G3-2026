---------------------------------------
-- Add SAILOR_CV to boat_document_type.
-- Must live in its own migration: Postgres forbids using a newly added
-- enum value in the same transaction as ALTER TYPE ... ADD VALUE
-- (SQLSTATE 55P04).
---------------------------------------

alter type public.boat_document_type add value if not exists 'SAILOR_CV';
