alter table public.tenant_product_configuration
  drop constraint if exists tenant_product_configuration_maximum_vibes_per_sailing_day_check;

alter table public.tenant_product_configuration
  alter column maximum_vibes_per_sailing_day set default 5;

update public.tenant_product_configuration
set maximum_vibes_per_sailing_day = 5, updated_at = now()
where maximum_vibes_per_sailing_day > 5;

alter table public.tenant_product_configuration
  add constraint tenant_product_configuration_maximum_vibes_per_sailing_day_check
  check (maximum_vibes_per_sailing_day between 1 and 5);

comment on column public.tenant_product_configuration.maximum_vibes_per_sailing_day is 'Operator-side hard cap. A sixth attempt pauses anonymous-vibe sending until the next sailing-local day.';
