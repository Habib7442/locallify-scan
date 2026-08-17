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
