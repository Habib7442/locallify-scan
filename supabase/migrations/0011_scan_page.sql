-- 0011 — scan page support (prompts/m1-table-qr-and-scan-page.md)
-- wants_offers: the diner's explicit "send me offers" tick, captured before
--   we know their phone; copied to customers.opted_in only after WhatsApp
--   verification (webhook).
-- ip_hash: sha256(ip + secret), truncated — for rate limiting only; the raw
--   IP is never stored.

alter table public.session_members
  add column if not exists wants_offers boolean not null default false,
  add column if not exists ip_hash text;

create index if not exists session_members_ip_hash_created_idx
  on public.session_members (ip_hash, created_at)
  where ip_hash is not null;

create index if not exists session_members_device_created_idx
  on public.session_members (device_id, created_at);
