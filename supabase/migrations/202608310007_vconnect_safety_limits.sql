alter table public.tenant_product_configuration
  add column if not exists maximum_vibes_per_sailing_day integer not null default 8 check (maximum_vibes_per_sailing_day between 1 and 8),
  add column if not exists maximum_vconnect_requests_per_sailing_day integer not null default 1 check (maximum_vconnect_requests_per_sailing_day = 1);

alter table public.tenant_product_configuration
  drop constraint if exists tenant_product_configuration_enabled_features_check;

alter table public.tenant_product_configuration
  alter column enabled_features set default array['interests','meetups','vibes','vconnect','crew-recognition','event-feedback','notifications','commerce'];

alter table public.tenant_product_configuration
  add constraint tenant_product_configuration_enabled_features_check
  check (enabled_features <@ array['interests','meetups','vibes','vconnect','crew-recognition','event-feedback','notifications','commerce']);

update public.tenant_product_configuration
set enabled_features = array_append(enabled_features,'vconnect'), updated_at = now()
where not ('vconnect' = any(enabled_features));

comment on column public.tenant_product_configuration.maximum_vibes_per_sailing_day is 'Operator-side hard cap. A ninth attempt pauses anonymous-vibe sending until the next sailing-local day.';
comment on column public.tenant_product_configuration.maximum_vconnect_requests_per_sailing_day is 'Operator-side hard cap of one VConnect request per passenger per sailing-local day.';
