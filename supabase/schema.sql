-- Locallify Scan — initial schema + RLS
-- Run once, start to finish, in the Supabase Dashboard → SQL Editor.
-- Source of truth for the data model described in AGENTS.md §7 / PRD.md §6.

-- =========================================================================
-- Extensions
-- =========================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- =========================================================================
-- Tables
-- =========================================================================

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  owner_clerk_id text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  clerk_user_id text primary key,
  agency_id uuid not null references public.agencies (id),
  role text not null default 'user' check (role in ('agency_admin', 'user')),
  name text,
  email text,
  created_at timestamptz not null default now()
);

create index profiles_agency_id_idx on public.profiles (agency_id);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id),
  owner_clerk_id text not null unique references public.profiles (clerk_user_id),
  slug text not null unique,
  display_name text,
  tagline text,
  vertical text,
  theme text not null default 'midnight'
    check (theme in ('midnight', 'blanc', 'sunset', 'neon', 'pastel', 'mono')),
  accent text,
  logo_path text,
  bg_type text not null default 'solid' check (bg_type in ('solid', 'image')),
  bg_value text,
  bg_image_brightness numeric not null default 100
    check (bg_image_brightness between 50 and 150),
  bg_image_contrast numeric not null default 100
    check (bg_image_contrast between 50 and 150),
  bg_image_overlay numeric not null default 30
    check (bg_image_overlay between 0 and 90),
  heading_color text,
  tagline_color text,
  link_bg_color text,
  link_text_color text,
  heading_font text not null default 'hanken'
    check (heading_font in ('hanken', 'inter', 'poppins', 'montserrat', 'space_grotesk', 'work_sans', 'roboto', 'playfair')),
  link_font text not null default 'hanken'
    check (link_font in ('hanken', 'inter', 'poppins', 'montserrat', 'space_grotesk', 'work_sans', 'roboto', 'playfair')),
  active boolean not null default true,
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'cancelled')),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pages_agency_id_idx on public.pages (agency_id);
create index pages_active_idx on public.pages (active);
-- owner_clerk_id already indexed via its unique constraint above.

create table public.links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  type text not null,
  label text not null,
  sub text,
  destination text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index links_page_id_idx on public.links (page_id);
create index links_active_idx on public.links (active);

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  link_id uuid references public.links (id) on delete set null,
  created_at timestamptz not null default now(),
  device text,
  country text,
  referrer text
);

create index scans_page_id_idx on public.scans (page_id);
create index scans_link_id_idx on public.scans (link_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id),
  owner_clerk_id text not null references public.profiles (clerk_user_id),
  status text not null default 'pending' check (status in ('pending', 'printed', 'shipped', 'cancelled')),
  shipping_address jsonb,
  price numeric(10, 2),
  currency text not null default 'INR',
  payment_reference text,
  created_at timestamptz not null default now(),
  shipped_at timestamptz
);

create index orders_page_id_idx on public.orders (page_id);
create index orders_owner_clerk_id_idx on public.orders (owner_clerk_id);

create table public.vertical_templates (
  vertical text primary key,
  default_links jsonb not null,
  signature_feature text
);

-- =========================================================================
-- private schema — SECURITY DEFINER helpers, never exposed via the Data API
-- =========================================================================

create schema if not exists private;

create or replace function private.is_agency_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where clerk_user_id = (select auth.jwt() ->> 'sub')
      and role = 'agency_admin'
  );
$$;

revoke all on function private.is_agency_admin() from public;
grant execute on function private.is_agency_admin() to authenticated;

-- =========================================================================
-- RLS
-- =========================================================================

alter table public.agencies enable row level security;
alter table public.agencies force row level security;

create policy agencies_select_authenticated on public.agencies
  for select
  to authenticated
  using (true);

create policy agencies_insert_admin on public.agencies
  for insert
  to authenticated
  with check ((select private.is_agency_admin()));

create policy agencies_update_admin on public.agencies
  for update
  to authenticated
  using ((select private.is_agency_admin()))
  with check ((select private.is_agency_admin()));

create policy agencies_delete_admin on public.agencies
  for delete
  to authenticated
  using ((select private.is_agency_admin()));

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- No INSERT/UPDATE/DELETE policy on purpose: only the service-role webhook
-- writes this table (see AGENTS.md §13 "known gotcha" / service-role exceptions).
create policy profiles_select_own on public.profiles
  for select
  to authenticated
  using (
    clerk_user_id = (select auth.jwt() ->> 'sub')
    or (select private.is_agency_admin())
  );

alter table public.pages enable row level security;
alter table public.pages force row level security;

create policy pages_select_own on public.pages
  for select
  to authenticated
  using (
    owner_clerk_id = (select auth.jwt() ->> 'sub')
    or (select private.is_agency_admin())
  );

-- Public hub read path: anonymous visitors may only ever see active pages.
create policy pages_select_public on public.pages
  for select
  to anon
  using (active = true);

-- Pages are auto-created by the webhook via the service-role client;
-- no authenticated INSERT path is needed for MVP.
create policy pages_insert_admin on public.pages
  for insert
  to authenticated
  with check ((select private.is_agency_admin()));

create policy pages_update_own on public.pages
  for update
  to authenticated
  using (
    owner_clerk_id = (select auth.jwt() ->> 'sub')
    or (select private.is_agency_admin())
  )
  with check (
    owner_clerk_id = (select auth.jwt() ->> 'sub')
    or (select private.is_agency_admin())
  );

create policy pages_delete_own on public.pages
  for delete
  to authenticated
  using (
    owner_clerk_id = (select auth.jwt() ->> 'sub')
    or (select private.is_agency_admin())
  );

alter table public.links enable row level security;
alter table public.links force row level security;

create policy links_select_own on public.links
  for select
  to authenticated
  using (
    exists (
      select 1 from public.pages
      where pages.id = links.page_id
        and (
          pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
          or (select private.is_agency_admin())
        )
    )
  );

create policy links_select_public on public.links
  for select
  to anon
  using (
    active = true
    and exists (
      select 1 from public.pages
      where pages.id = links.page_id and pages.active = true
    )
  );

create policy links_insert_own on public.links
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.pages
      where pages.id = links.page_id
        and (
          pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
          or (select private.is_agency_admin())
        )
    )
  );

create policy links_update_own on public.links
  for update
  to authenticated
  using (
    exists (
      select 1 from public.pages
      where pages.id = links.page_id
        and (
          pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
          or (select private.is_agency_admin())
        )
    )
  )
  with check (
    exists (
      select 1 from public.pages
      where pages.id = links.page_id
        and (
          pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
          or (select private.is_agency_admin())
        )
    )
  );

create policy links_delete_own on public.links
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.pages
      where pages.id = links.page_id
        and (
          pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
          or (select private.is_agency_admin())
        )
    )
  );

alter table public.scans enable row level security;
alter table public.scans force row level security;

-- Non-blocking public scan/tap log: no user context required or expected,
-- gated only on the target page being active.
create policy scans_insert_public on public.scans
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.pages
      where pages.id = scans.page_id and pages.active = true
    )
  );

create policy scans_select_own on public.scans
  for select
  to authenticated
  using (
    exists (
      select 1 from public.pages
      where pages.id = scans.page_id
        and (
          pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
          or (select private.is_agency_admin())
        )
    )
  );

-- No UPDATE/DELETE policy: scans are an append-only log.

alter table public.orders enable row level security;
alter table public.orders force row level security;

create policy orders_select_own on public.orders
  for select
  to authenticated
  using (
    owner_clerk_id = (select auth.jwt() ->> 'sub')
    or (select private.is_agency_admin())
  );

create policy orders_insert_own on public.orders
  for insert
  to authenticated
  with check (
    owner_clerk_id = (select auth.jwt() ->> 'sub')
    and exists (
      select 1 from public.pages
      where pages.id = orders.page_id
        and pages.owner_clerk_id = (select auth.jwt() ->> 'sub')
    )
  );

-- Status changes (pending → printed → shipped) are admin-only: a user must
-- never be able to mark their own order shipped.
create policy orders_update_admin on public.orders
  for update
  to authenticated
  using ((select private.is_agency_admin()))
  with check ((select private.is_agency_admin()));

-- No DELETE policy.

alter table public.vertical_templates enable row level security;
alter table public.vertical_templates force row level security;

create policy vertical_templates_select_all on public.vertical_templates
  for select
  to anon, authenticated
  using (true);

-- =========================================================================
-- Seed data
-- =========================================================================

insert into public.agencies (name) values ('Locallify');

insert into public.vertical_templates (vertical, default_links, signature_feature) values
(
  'restaurant',
  '[
    {"type": "menu", "label": "View Menu"},
    {"type": "whatsapp", "label": "Order on WhatsApp"},
    {"type": "book", "label": "Book a Table"},
    {"type": "google_review", "label": "Google Review"},
    {"type": "directions", "label": "Directions"},
    {"type": "instagram", "label": "Instagram"}
  ]'::jsonb,
  'Hours-aware button — shows "Order now" during open hours, flips to "We open at 9am — message to pre-book" after close.'
),
(
  'clinic',
  '[
    {"type": "book", "label": "Book Appointment"},
    {"type": "call", "label": "Call Clinic"},
    {"type": "custom", "label": "Consultation Hours"},
    {"type": "directions", "label": "Location"},
    {"type": "custom", "label": "Our Services"},
    {"type": "google_review", "label": "Rate Your Visit"}
  ]'::jsonb,
  'Appointment request — a simple name + preferred-time form that sends straight to the clinic''s WhatsApp.'
);

-- ---------------------------------------------------------------
-- WhatsApp webhook raw inbox (migration 0009)
-- ---------------------------------------------------------------
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

-- ---------------------------------------------------------------
-- Dobara M1 core (migration 0010) — see that file for comments
-- ---------------------------------------------------------------
-- 1. Business link
-- ---------------------------------------------------------------------
alter table public.pages
  add column if not exists clerk_org_id text unique;

-- ---------------------------------------------------------------------
-- 2. Private helpers (security definer, fixed search_path)
-- ---------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.jwt_org_id()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt()) -> 'o' ->> 'id',
    (select auth.jwt()) ->> 'org_id'
  );
$$;

create or replace function private.jwt_org_role()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (select auth.jwt()) -> 'o' ->> 'rol',
    replace((select auth.jwt()) ->> 'org_role', 'org:', '')
  );
$$;

create or replace function private.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
  from public.pages p
  where p.clerk_org_id = private.jwt_org_id()
    and p.clerk_org_id is not null
    and p.active = true
  limit 1;
$$;

create or replace function private.is_business_staff(bid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select bid is not null and bid = private.current_business_id();
$$;

create or replace function private.is_business_owner(bid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_business_staff(bid) and private.jwt_org_role() = 'admin';
$$;

revoke all on function private.jwt_org_id() from public;
revoke all on function private.jwt_org_role() from public;
revoke all on function private.current_business_id() from public;
revoke all on function private.is_business_staff(uuid) from public;
revoke all on function private.is_business_owner(uuid) from public;
grant execute on function private.jwt_org_id() to authenticated;
grant execute on function private.jwt_org_role() to authenticated;
grant execute on function private.current_business_id() to authenticated;
grant execute on function private.is_business_staff(uuid) to authenticated;
grant execute on function private.is_business_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 3. Tables
-- ---------------------------------------------------------------------
create table public.tables (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.pages (id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9]{1,6}$'),
  label text check (char_length(label) <= 60),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, code)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.pages (id) on delete cascade,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  name text check (char_length(name) <= 80),
  birthday date,
  language text not null default 'en' check (language in ('en', 'hi', 'bn')),
  opted_in boolean not null default false,
  opted_in_at timestamptz,
  opted_out_at timestamptz,
  notes text check (char_length(notes) <= 280),
  visit_count integer not null default 0 check (visit_count >= 0),
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, phone_e164)
);

create table public.table_sessions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.pages (id) on delete cascade,
  table_id uuid not null references public.tables (id) on delete cascade,
  declared_size integer check (declared_size between 1 and 20),
  status text not null default 'open'
    check (status in ('open', 'billing', 'closed', 'expired')),
  bill_amount numeric(10, 2) check (bill_amount >= 0),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_by text  -- Clerk user id of the staff member
);

create table public.session_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.pages (id) on delete cascade,
  session_id uuid not null references public.table_sessions (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  device_id text not null check (char_length(device_id) between 16 and 64),
  -- Live codes only: set to null once used or expired, so uniqueness
  -- never covers dead codes.
  verify_code text unique,
  verify_expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, customer_id),
  unique (session_id, device_id)
);

create table public.message_log (
  id uuid primary key default gen_random_uuid(),
  -- null until an inbound message is matched to a cafe
  business_id uuid references public.pages (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  direction text not null check (direction in ('in', 'out')),
  category text check (category in ('service', 'utility', 'marketing', 'authentication')),
  template_name text,
  wa_message_id text unique,
  status text,
  cost_inr numeric(8, 2) check (cost_inr >= 0),
  created_at timestamptz not null default now()
);

-- Existing scan log doubles as qr_scanned (AGENTS.md §1).
alter table public.scans
  add column if not exists table_id uuid references public.tables (id) on delete set null;

-- ---------------------------------------------------------------------
-- 4. Indexes (every FK + the access patterns in PRD §10)
-- ---------------------------------------------------------------------
-- tables(business_id) is covered by unique (business_id, code)
-- customers(business_id, phone_e164) is covered by its unique constraint
create index table_sessions_business_status_idx on public.table_sessions (business_id, status);
create index table_sessions_table_id_idx on public.table_sessions (table_id);
-- One live session per table.
create unique index table_sessions_one_live_per_table
  on public.table_sessions (table_id)
  where status in ('open', 'billing');

-- session_members(session_id) is covered by unique (session_id, customer_id)
create index session_members_customer_id_idx on public.session_members (customer_id);
create index session_members_business_created_idx on public.session_members (business_id, created_at desc);

create index message_log_business_created_idx on public.message_log (business_id, created_at);
create index message_log_customer_id_idx on public.message_log (customer_id);

create index scans_table_id_idx on public.scans (table_id);

-- ---------------------------------------------------------------------
-- 5. Privileges: no anon access to any new table; authenticated access
--    is further narrowed by RLS below.
-- ---------------------------------------------------------------------
revoke all on table public.tables, public.customers, public.table_sessions,
  public.session_members, public.message_log from anon;

-- Staff/owner never write sessions/members/message_log directly
-- (server paths use the service role; staff actions go through RPCs).
revoke insert, update, delete on table public.table_sessions,
  public.session_members, public.message_log from authenticated;

-- Customers: no direct insert/delete from the app; owners may update
-- only these columns.
revoke insert, update, delete on table public.customers from authenticated;
grant update (name, birthday, language, notes) on table public.customers to authenticated;

-- ---------------------------------------------------------------------
-- 6. Row-level security
-- ---------------------------------------------------------------------
alter table public.tables enable row level security;
alter table public.tables force row level security;
alter table public.customers enable row level security;
alter table public.customers force row level security;
alter table public.table_sessions enable row level security;
alter table public.table_sessions force row level security;
alter table public.session_members enable row level security;
alter table public.session_members force row level security;
alter table public.message_log enable row level security;
alter table public.message_log force row level security;

-- tables: staff read; owner manages.
create policy tables_select_staff on public.tables
  for select to authenticated
  using ((business_id = (select private.current_business_id())) or (select private.is_agency_admin()));

create policy tables_insert_owner on public.tables
  for insert to authenticated
  with check ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'));

create policy tables_update_owner on public.tables
  for update to authenticated
  using ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'))
  with check ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'));

create policy tables_delete_owner on public.tables
  for delete to authenticated
  using ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'));

-- customers: owners only (staff use the masked RPC below).
create policy customers_select_owner on public.customers
  for select to authenticated
  using ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin') or (select private.is_agency_admin()));

create policy customers_update_owner on public.customers
  for update to authenticated
  using ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'))
  with check ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'));

-- sessions + members: staff read (Live Board + Realtime).
create policy table_sessions_select_staff on public.table_sessions
  for select to authenticated
  using ((business_id = (select private.current_business_id())) or (select private.is_agency_admin()));

create policy session_members_select_staff on public.session_members
  for select to authenticated
  using ((business_id = (select private.current_business_id())) or (select private.is_agency_admin()));

-- message log: owners read their own; unmatched rows (null business) are
-- service-role only.
create policy message_log_select_owner on public.message_log
  for select to authenticated
  using ((business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin') or (select private.is_agency_admin()));

-- pages: staff of the cafe can read its row; the owner can edit branding.
create policy pages_select_business_staff on public.pages
  for select to authenticated
  using ((id = (select private.current_business_id())));

create policy pages_update_business_owner on public.pages
  for update to authenticated
  using ((id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'))
  with check ((id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin'));

-- ---------------------------------------------------------------------
-- 7. Live Board RPCs — phone masking enforced server-side (AGENTS.md §5)
-- ---------------------------------------------------------------------
create or replace function public.live_board_feed(p_since timestamptz default now() - interval '12 hours')
returns table (
  member_id uuid,
  session_id uuid,
  session_status text,
  table_code text,
  table_label text,
  joined_at timestamptz,
  verified_at timestamptz,
  customer_id uuid,
  customer_name text,
  phone_last4 text,
  visit_count integer,
  last_visit_at timestamptz,
  notes text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_bid uuid := private.current_business_id();
begin
  if v_bid is null then
    raise exception 'not a member of an active business' using errcode = '42501';
  end if;

  return query
    select
      m.id,
      s.id,
      s.status,
      t.code,
      t.label,
      m.created_at,
      m.verified_at,
      c.id,
      c.name,
      case when c.phone_e164 is null then null else right(c.phone_e164, 4) end,
      c.visit_count,
      c.last_visit_at,
      c.notes
    from public.session_members m
    join public.table_sessions s on s.id = m.session_id
    join public.tables t on t.id = s.table_id
    left join public.customers c on c.id = m.customer_id
    where m.business_id = v_bid
      and m.created_at >= p_since
    order by m.created_at desc
    limit 200;
end;
$$;

create or replace function public.set_customer_note(p_customer_id uuid, p_note text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_bid uuid := private.current_business_id();
begin
  if v_bid is null then
    raise exception 'not a member of an active business' using errcode = '42501';
  end if;

  update public.customers
     set notes = nullif(left(btrim(coalesce(p_note, '')), 280), '')
   where id = p_customer_id
     and business_id = v_bid;

  if not found then
    raise exception 'customer not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.live_board_feed(timestamptz) from public, anon;
revoke all on function public.set_customer_note(uuid, text) from public, anon;
grant execute on function public.live_board_feed(timestamptz) to authenticated;
grant execute on function public.set_customer_note(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 8. Realtime for the Live Board (RLS applies per subscriber JWT)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.session_members, public.table_sessions;

-- ---------------------------------------------------------------
-- Scan page support (migration 0011)
-- ---------------------------------------------------------------
alter table public.session_members
  add column if not exists wants_offers boolean not null default false,
  add column if not exists ip_hash text;

create index if not exists session_members_ip_hash_created_idx
  on public.session_members (ip_hash, created_at)
  where ip_hash is not null;

create index if not exists session_members_device_created_idx
  on public.session_members (device_id, created_at);
