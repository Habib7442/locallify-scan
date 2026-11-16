-- =====================================================================
-- 0010 — Dobara M1 core: business = pages row, tables, customers,
-- table sessions, session members, message log, RLS, Live Board RPCs.
-- See prompts/m1-dobara-schema-and-rls.md.
--
-- Identity:
--   * business_id = public.pages.id; pages.clerk_org_id links a cafe to
--     its Clerk Organization.
--   * Staff/owner come from the ACTIVE org in the Clerk JWT:
--       v2 token: o.id / o.rol ('admin' | 'member')
--       v1 token: org_id / org_role ('org:admin' | 'org:member')
--     org:admin = Owner, org:member = Staff.
--   * Diners never have a JWT; their paths run server-side with the
--     service role (scan page, WhatsApp webhook) — AGENTS.md §13.
-- =====================================================================

-- ---------------------------------------------------------------------
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
