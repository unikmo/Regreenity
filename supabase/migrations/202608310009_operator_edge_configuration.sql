alter table public.tenant_product_configuration
  add column if not exists vconnect_request_options text[] not null default array['coffee-in-atrium','join-trivia','before-show'],
  add column if not exists vconnect_venue_options text[] not null default array['atrium-cafe','trivia-lounge','theatre-entrance','promenade'],
  add column if not exists vconnect_time_options text[] not null default array['today-afternoon','today-evening','tomorrow-morning','tomorrow-afternoon'],
  add column if not exists vibe_retention_days integer not null default 14 check (vibe_retention_days between 1 and 30),
  add column if not exists vconnect_retention_days integer not null default 30 check (vconnect_retention_days between 1 and 90),
  add column if not exists release_channel text not null default 'stable' check (release_channel in ('stable','pilot','paused'));

alter table public.tenant_product_configuration
  add constraint vconnect_request_options_safe check (cardinality(vconnect_request_options) between 1 and 30 and array_to_string(vconnect_request_options,',') !~* '(cabin|stateroom|room-number|dating|hookup|private-room)'),
  add constraint vconnect_venue_options_safe check (cardinality(vconnect_venue_options) between 1 and 30 and array_to_string(vconnect_venue_options,',') !~* '(cabin|stateroom|room-number|dating|hookup|private-room)'),
  add constraint vconnect_time_options_safe check (cardinality(vconnect_time_options) between 1 and 30);

comment on column public.tenant_product_configuration.vconnect_request_options is 'Non-free-text request template identifiers copied to the operator edge; no passenger records.';
comment on column public.tenant_product_configuration.vconnect_venue_options is 'Approved public onboard venue identifiers; cabins and private rooms are prohibited.';
comment on column public.tenant_product_configuration.release_channel is 'Operator deployment control: stable, pilot or paused.';
