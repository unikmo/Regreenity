create table public.pilot_request_notifications (
  pilot_request_id uuid primary key references public.pilot_requests(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','sent','failed')),
  attempts integer not null default 0 check (attempts between 0 and 20),
  next_attempt_at timestamptz not null default now(),
  last_error_hash text check (last_error_hash is null or char_length(last_error_hash) = 64),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
alter table public.pilot_request_notifications enable row level security;
revoke all on public.pilot_request_notifications from anon, authenticated;
grant select, insert, update, delete on public.pilot_request_notifications to service_role;
create index pilot_request_notifications_delivery_idx on public.pilot_request_notifications(status,next_attempt_at);
comment on table public.pilot_request_notifications is 'First-party delivery outbox. Contains only an internal enquiry reference and delivery state; no enquiry content.';
