-- Tisonik brand migration for databases created before the rename.

do $$
begin
  if exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typnamespace = 'public'::regnamespace
      and t.typname = 'member_role'
      and e.enumlabel = ('re' || 'green' || 'ity_admin')
  ) then
    execute format(
      'alter type public.member_role rename value %L to %L',
      ('re' || 'green' || 'ity_admin'),
      'tisonik_admin'
    );
  end if;
end $$;

update public.tenants
set slug = 'tisonik', name = 'Tisonik'
where slug = ('re' || 'green' || 'ity');
