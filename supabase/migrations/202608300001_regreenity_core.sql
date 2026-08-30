-- Aggregate-only Regreenity control plane. Passenger/crew identity and source
-- events remain inside the cruise operator's environment.
create extension if not exists pgcrypto;

create type public.member_role as enum ('regreenity_admin', 'operator_admin', 'operator_analyst', 'operator_viewer');
create type public.sailing_status as enum ('planned', 'active', 'complete', 'cancelled');
create type public.metric_key as enum (
  'eligible_guests', 'activated_guests', 'positive_action_guests',
  'passenger_vibes', 'unique_vibe_recipients', 'top_five_qualifiers',
  'crew_recognitions', 'recognizing_guests', 'recognized_crew',
  'event_feedback_responses', 'event_rating_1', 'event_rating_2',
  'event_rating_3', 'event_rating_4', 'event_rating_5',
  'service_issues', 'issues_acknowledged', 'issues_resolved',
  'commerce_handoffs', 'commerce_confirmed', 'commerce_cancelled',
  'commerce_refunded', 'attributed_net_value', 'social_shares'
);
create type public.dimension_type as enum ('overall', 'department', 'prepared_reason', 'prepared_response', 'product_category', 'event_type');
create type public.connector_status as enum ('pending', 'healthy', 'degraded', 'disabled');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name text not null check (char_length(name) between 2 and 120),
  minimum_reporting_group integer not null default 20 check (minimum_reporting_group >= 20),
  data_region text not null default 'eu-central-1',
  created_at timestamptz not null default now()
);

create table public.memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table public.ships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  operator_ship_ref text not null check (char_length(operator_ship_ref) between 1 and 100),
  display_name text not null check (char_length(display_name) between 1 and 120),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, operator_ship_ref)
);

create table public.sailings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  ship_id uuid not null references public.ships(id) on delete restrict,
  operator_sailing_ref text not null check (char_length(operator_sailing_ref) between 1 and 100),
  departure_date date not null,
  arrival_date date not null check (arrival_date >= departure_date),
  operating_timezone text not null default 'UTC',
  status public.sailing_status not null default 'planned',
  created_at timestamptz not null default now(),
  unique (tenant_id, operator_sailing_ref)
);

create table public.aggregate_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sailing_id uuid references public.sailings(id) on delete restrict,
  external_report_id text not null check (char_length(external_report_id) between 8 and 120),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  generated_at timestamptz not null,
  minimum_group_applied integer not null check (minimum_group_applied >= 20),
  privacy_gateway_version text not null check (char_length(privacy_gateway_version) between 1 and 40),
  schema_version integer not null default 1 check (schema_version = 1),
  received_at timestamptz not null default now(),
  unique (tenant_id, external_report_id)
);

create table public.aggregate_metrics (
  id bigint generated always as identity primary key,
  report_id uuid not null references public.aggregate_reports(id) on delete cascade,
  metric public.metric_key not null,
  dimension public.dimension_type not null default 'overall',
  dimension_value text not null default 'all' check (char_length(dimension_value) between 1 and 100),
  count_value bigint check (count_value is null or count_value >= 0),
  numeric_value numeric(16,2) check (numeric_value is null or numeric_value >= 0),
  currency char(3) check (currency is null or currency ~ '^[A-Z]{3}$'),
  check ((count_value is not null)::integer + (numeric_value is not null)::integer = 1),
  check ((metric = 'attributed_net_value') = (numeric_value is not null)),
  unique (report_id, metric, dimension, dimension_value)
);

create table public.service_health (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sailing_id uuid references public.sailings(id) on delete set null,
  period_start timestamptz not null,
  period_end timestamptz not null check (period_end > period_start),
  deployed_version text not null check (char_length(deployed_version) between 1 and 64),
  uptime_basis_points integer check (uptime_basis_points between 0 and 10000),
  p95_latency_bucket_ms integer check (p95_latency_bucket_ms >= 0),
  sync_success_count bigint not null default 0 check (sync_success_count >= 0),
  sync_failure_count bigint not null default 0 check (sync_failure_count >= 0),
  error_count bigint not null default 0 check (error_count >= 0),
  received_at timestamptz not null default now(),
  unique (tenant_id, sailing_id, period_start, period_end)
);

create table public.connector_installations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key_id text not null unique check (key_id ~ '^rg_[a-zA-Z0-9_-]{12,80}$'),
  secret_digest text not null check (char_length(secret_digest) = 64),
  status public.connector_status not null default 'pending',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);

create table public.pilot_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  work_email text not null check (char_length(work_email) between 5 and 254),
  company text not null check (char_length(company) between 2 and 160),
  role_title text check (role_title is null or char_length(role_title) <= 120),
  message text not null check (char_length(message) between 10 and 4000),
  consented_at timestamptz not null,
  source_path text not null default '/pilot/',
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 3 and 100),
  entity_type text not null check (char_length(entity_type) between 2 and 80),
  entity_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index memberships_user_idx on public.memberships(user_id);
create index ships_tenant_idx on public.ships(tenant_id);
create index sailings_tenant_dates_idx on public.sailings(tenant_id, departure_date desc);
create index aggregate_reports_tenant_period_idx on public.aggregate_reports(tenant_id, period_end desc);
create index aggregate_metrics_report_idx on public.aggregate_metrics(report_id);
create index service_health_tenant_period_idx on public.service_health(tenant_id, period_end desc);
create index pilot_requests_created_idx on public.pilot_requests(created_at desc);
create index audit_events_tenant_created_idx on public.audit_events(tenant_id, created_at desc);

create or replace function public.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.memberships m where m.tenant_id = target_tenant and m.user_id = auth.uid()) $$;
create or replace function public.has_tenant_role(target_tenant uuid, allowed public.member_role[])
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.memberships m where m.tenant_id = target_tenant and m.user_id = auth.uid() and m.role = any(allowed)) $$;
revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.has_tenant_role(uuid, public.member_role[]) from public;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.has_tenant_role(uuid, public.member_role[]) to authenticated;

alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.ships enable row level security;
alter table public.sailings enable row level security;
alter table public.aggregate_reports enable row level security;
alter table public.aggregate_metrics enable row level security;
alter table public.service_health enable row level security;
alter table public.connector_installations enable row level security;
alter table public.pilot_requests enable row level security;
alter table public.audit_events enable row level security;

create policy tenants_member_read on public.tenants for select to authenticated using (public.is_tenant_member(id));
create policy memberships_member_read on public.memberships for select to authenticated using (user_id = auth.uid() or public.has_tenant_role(tenant_id, array['regreenity_admin','operator_admin']::public.member_role[]));
create policy ships_member_read on public.ships for select to authenticated using (public.is_tenant_member(tenant_id));
create policy sailings_member_read on public.sailings for select to authenticated using (public.is_tenant_member(tenant_id));
create policy reports_member_read on public.aggregate_reports for select to authenticated using (public.is_tenant_member(tenant_id));
create policy metrics_member_read on public.aggregate_metrics for select to authenticated using (exists(select 1 from public.aggregate_reports r where r.id = report_id and public.is_tenant_member(r.tenant_id)));
create policy health_member_read on public.service_health for select to authenticated using (public.is_tenant_member(tenant_id));
create policy connectors_admin_read on public.connector_installations for select to authenticated using (public.has_tenant_role(tenant_id, array['regreenity_admin','operator_admin']::public.member_role[]));
create policy pilot_regreenity_admin_read on public.pilot_requests for select to authenticated using (exists(select 1 from public.memberships m where m.user_id = auth.uid() and m.role = 'regreenity_admin'));
create policy audit_admin_read on public.audit_events for select to authenticated using ((tenant_id is null and exists(select 1 from public.memberships m where m.user_id = auth.uid() and m.role = 'regreenity_admin')) or (tenant_id is not null and public.has_tenant_role(tenant_id, array['regreenity_admin','operator_admin']::public.member_role[])));

grant usage on schema public to authenticated;
grant select on public.tenants, public.memberships, public.ships, public.sailings,
  public.aggregate_reports, public.aggregate_metrics, public.service_health,
  public.connector_installations, public.pilot_requests, public.audit_events to authenticated;
revoke all on public.tenants, public.memberships, public.ships, public.sailings,
  public.aggregate_reports, public.aggregate_metrics, public.service_health,
  public.connector_installations, public.pilot_requests, public.audit_events from anon;

comment on schema public is 'Aggregate-only control plane. No passenger/crew identity or source events.';
comment on table public.aggregate_reports is 'Privacy-gateway output only; reporting groups below 20 are rejected.';
