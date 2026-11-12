select
  c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', 'public.submissions', 'insert') as anon_can_insert,
  has_table_privilege('anon', 'public.submissions', 'select') as anon_can_select,
  has_table_privilege('anon', 'public.submissions', 'update') as anon_can_update,
  has_table_privilege('anon', 'public.submissions', 'delete') as anon_can_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'submissions';

select policyname, cmd, roles, with_check
from pg_policies
where schemaname = 'public' and tablename = 'submissions';
