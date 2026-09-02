create table public.tenant_product_configuration (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  product_name text not null default 'CruiseConnect' check (char_length(product_name) between 2 and 80),
  brand_primary char(7) not null default '#173f47' check (brand_primary ~ '^#[0-9A-Fa-f]{6}$'),
  enabled_features text[] not null default array['interests','meetups','vibes','crew-recognition','event-feedback','notifications','commerce'],
  anonymous_vibe_delay_minutes integer not null default 60 check (anonymous_vibe_delay_minutes between 0 and 1440),
  maximum_feedback_questions integer not null default 3 check (maximum_feedback_questions between 1 and 5),
  minimum_reporting_group integer not null default 20 check (minimum_reporting_group >= 20),
  updated_at timestamptz not null default now(),
  check (enabled_features <@ array['interests','meetups','vibes','crew-recognition','event-feedback','notifications','commerce'])
);

alter table public.tenant_product_configuration enable row level security;
create policy product_configuration_member_read on public.tenant_product_configuration for select to authenticated using (public.is_tenant_member(tenant_id));
create policy product_configuration_admin_update on public.tenant_product_configuration for update to authenticated using (public.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[])) with check (public.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[]));
create policy product_configuration_admin_insert on public.tenant_product_configuration for insert to authenticated with check (public.has_tenant_role(tenant_id,array['tisonik_admin','operator_admin']::public.member_role[]));

grant select,insert,update on public.tenant_product_configuration to authenticated;
grant select,insert,update on public.tenant_product_configuration to service_role;
revoke all on public.tenant_product_configuration from anon;
insert into public.tenant_product_configuration (tenant_id)
select id from public.tenants on conflict (tenant_id) do nothing;
comment on table public.tenant_product_configuration is 'Tenant feature and white-label settings only; contains no passenger or crew data.';
