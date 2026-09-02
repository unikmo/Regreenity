-- Server-only permissions for the Tisonik control plane. The service role
-- bypasses RLS, but PostgreSQL table privileges are still required when the
-- project's automatic API grants are disabled.
grant usage on schema public to service_role;

grant select on public.tenants, public.memberships, public.ships, public.sailings,
  public.aggregate_reports, public.aggregate_metrics, public.service_health,
  public.connector_installations, public.pilot_requests, public.audit_events
  to service_role;

grant insert on public.aggregate_reports, public.aggregate_metrics,
  public.pilot_requests, public.audit_events
  to service_role;

grant update on public.connector_installations, public.service_health
  to service_role;

grant delete on public.aggregate_reports
  to service_role;

grant usage, select on all sequences in schema public to service_role;
