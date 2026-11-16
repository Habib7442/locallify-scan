-- M0: raw inbox for the WhatsApp Cloud API webhook.
-- One row per inbound message or delivery status, keyed by a dedupe id so
-- Meta's redeliveries are ignored (AGENTS.md §5 "idempotent"). Independent of
-- business_id on purpose — the Dobara business schema is decided in M1.
-- Only the service role (the signature-verified webhook) touches this table.

create table public.whatsapp_webhook_events (
  id bigint generated always as identity primary key,
  -- message id for messages; "<message id>:<status>" for statuses
  wa_message_id text not null unique,
  kind text not null check (kind in ('message', 'status')),
  from_phone text,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index whatsapp_webhook_events_received_at_idx
  on public.whatsapp_webhook_events (received_at);

-- RLS on with no policies: anon/authenticated get nothing.
alter table public.whatsapp_webhook_events enable row level security;

-- Defence in depth: no table privileges for the API roles either.
revoke all on table public.whatsapp_webhook_events from anon, authenticated;
