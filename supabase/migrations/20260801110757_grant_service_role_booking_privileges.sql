---------------------------------------
-- SERVICE ROLE TABLE PRIVILEGES.
-- Edge functions use the service_role key. Local tables only had
-- default "Dxtm" (truncate/trigger/etc.) for service_role — no
-- SELECT/INSERT/UPDATE/DELETE — so checkout failed with
-- "permission denied for table users".
---------------------------------------

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to service_role;

alter default privileges in schema public
  grant execute on functions to service_role;
