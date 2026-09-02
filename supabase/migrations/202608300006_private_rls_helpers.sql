create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.memberships m where m.tenant_id = target_tenant and m.user_id = auth.uid()) $$;
create function private.has_tenant_role(target_tenant uuid, allowed public.member_role[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.memberships m where m.tenant_id = target_tenant and m.user_id = auth.uid() and m.role = any(allowed)) $$;
revoke all on function private.is_tenant_member(uuid) from public, anon;
revoke all on function private.has_tenant_role(uuid, public.member_role[]) from public, anon;
grant execute on function private.is_tenant_member(uuid) to authenticated;
grant execute on function private.has_tenant_role(uuid, public.member_role[]) to authenticated;

alter policy tenants_member_read on public.tenants using (private.is_tenant_member(id));
alter policy memberships_member_read on public.memberships using (user_id = auth.uid() or private.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[]));
alter policy ships_member_read on public.ships using (private.is_tenant_member(tenant_id));
alter policy sailings_member_read on public.sailings using (private.is_tenant_member(tenant_id));
alter policy reports_member_read on public.aggregate_reports using (private.is_tenant_member(tenant_id));
alter policy metrics_member_read on public.aggregate_metrics using (exists(select 1 from public.aggregate_reports r where r.id=report_id and private.is_tenant_member(r.tenant_id)));
alter policy health_member_read on public.service_health using (private.is_tenant_member(tenant_id));
alter policy connectors_admin_read on public.connector_installations using (private.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[]));
alter policy audit_admin_read on public.audit_events using ((tenant_id is null and exists(select 1 from public.memberships m where m.user_id=auth.uid() and m.role='tisonik_admin')) or (tenant_id is not null and private.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[])));
alter policy product_configuration_member_read on public.tenant_product_configuration using (private.is_tenant_member(tenant_id));
alter policy product_configuration_admin_update on public.tenant_product_configuration using (private.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[])) with check (private.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[]));
alter policy product_configuration_admin_insert on public.tenant_product_configuration with check (private.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[]));

drop function public.is_tenant_member(uuid);
drop function public.has_tenant_role(uuid, public.member_role[]);
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
