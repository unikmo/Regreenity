insert into public.tenants (slug, name, minimum_reporting_group, data_region)
values ('regreenity', 'Regreenity', 20, 'eu-central-1')
on conflict (slug) do update set
  name = excluded.name,
  minimum_reporting_group = excluded.minimum_reporting_group,
  data_region = excluded.data_region;

insert into public.memberships (tenant_id, user_id, role)
select id, '1f7fffa3-25e7-4e67-9922-2f6772803d2c'::uuid, 'regreenity_admin'::public.member_role
from public.tenants where slug = 'regreenity'
on conflict (tenant_id, user_id) do update set role = excluded.role;
