-- A tenant/sailing can submit exactly one accepted aggregate report per period.
-- This prevents retries with a changed external ID from double-counting KPIs.
create unique index aggregate_reports_period_unique
on public.aggregate_reports (
  tenant_id,
  coalesce(sailing_id, '00000000-0000-0000-0000-000000000000'::uuid),
  period_start,
  period_end
);
