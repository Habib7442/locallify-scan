-- =====================================================================
-- 0013 — Next-Visit Prize (prompts/m2-close-visit-and-scratch-card.md)
-- reward_settings + prizes, close_visit / redeem_prize / set_customer_name
-- RPCs, Live Board feed with prizes. Prize outcomes are decided here,
-- server-side, at close time (AGENTS.md §5).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------
create table public.reward_settings (
  business_id uuid primary key references public.pages (id) on delete cascade,
  scratch_enabled boolean not null default true,
  scratch_min_bill numeric(10, 2) not null default 200 check (scratch_min_bill >= 0),
  prize_validity_days integer not null default 14 check (prize_validity_days between 1 and 90),
  reminder_enabled boolean not null default true,
  scratch_all_members boolean not null default true,
  prizes jsonb not null default '[
    {"label": "₹50 off", "weight": 50},
    {"label": "Free cold drink", "weight": 30},
    {"label": "Free dessert", "weight": 15},
    {"label": "Free meal for 2", "weight": 5}
  ]'::jsonb check (jsonb_typeof(prizes) = 'array'),
  -- M3 (Table Squad) — unused until then
  squad_enabled boolean not null default false,
  squad_reward_text text check (char_length(squad_reward_text) <= 60),
  squad_min_size integer not null default 4 check (squad_min_size between 2 and 20),
  updated_at timestamptz not null default now()
);

create table public.prizes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.pages (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  session_id uuid not null references public.table_sessions (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 40),
  code text not null check (code ~ '^[A-Z0-9]{6}$'),
  status text not null default 'unscratched'
    check (status in ('unscratched', 'active', 'redeemed', 'expired')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  revealed_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by text,
  redeemed_session_id uuid references public.table_sessions (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (customer_id, session_id),
  unique (business_id, code)
);

-- prizes(business_id) is covered by unique (business_id, code)
create index prizes_session_id_idx on public.prizes (session_id);
create index prizes_redeemed_session_id_idx on public.prizes (redeemed_session_id);
create index prizes_business_status_idx on public.prizes (business_id, status);
create index prizes_customer_open_idx on public.prizes (customer_id, valid_until)
  where status in ('unscratched', 'active');

-- ---------------------------------------------------------------------
-- 2. Privileges + RLS
-- ---------------------------------------------------------------------
revoke all on table public.reward_settings, public.prizes from anon;
revoke insert, update, delete on table public.prizes from authenticated;

alter table public.reward_settings enable row level security;
alter table public.reward_settings force row level security;
alter table public.prizes enable row level security;
alter table public.prizes force row level security;

create policy reward_settings_select_staff on public.reward_settings
  for select to authenticated
  using ((business_id = (select private.current_business_id())) or (select private.is_agency_admin()));

create policy reward_settings_insert_owner on public.reward_settings
  for insert to authenticated
  with check (business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin');

create policy reward_settings_update_owner on public.reward_settings
  for update to authenticated
  using (business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin')
  with check (business_id = (select private.current_business_id()) and (select private.jwt_org_role()) = 'admin');

create policy prizes_select_staff on public.prizes
  for select to authenticated
  using ((business_id = (select private.current_business_id())) or (select private.is_agency_admin()));

-- ---------------------------------------------------------------------
-- 3. Helpers
-- ---------------------------------------------------------------------
-- Weighted random pick from [{label, weight}, …]. Server-side only.
create or replace function private.draw_prize(p_prizes jsonb)
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  v_total numeric := 0;
  v_roll numeric;
  v_item jsonb;
begin
  for v_item in select * from jsonb_array_elements(p_prizes) loop
    v_total := v_total + greatest(coalesce((v_item ->> 'weight')::numeric, 0), 0);
  end loop;
  if v_total <= 0 then
    return null;
  end if;
  v_roll := random() * v_total;
  for v_item in select * from jsonb_array_elements(p_prizes) loop
    v_roll := v_roll - greatest(coalesce((v_item ->> 'weight')::numeric, 0), 0);
    if v_roll < 0 then
      return left(btrim(v_item ->> 'label'), 40);
    end if;
  end loop;
  return left(btrim(p_prizes -> -1 ->> 'label'), 40);
end;
$$;

create or replace function private.new_prize_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 1 + floor(random() * 31)::int, 1), '')
  from generate_series(1, 6);
$$;

revoke all on function private.draw_prize(jsonb) from public;
revoke all on function private.new_prize_code() from public;

-- ---------------------------------------------------------------------
-- 4. Staff RPCs
-- ---------------------------------------------------------------------
-- Close a table's visit with the bill amount; issue scratch cards.
create or replace function public.close_visit(p_session_id uuid, p_bill_amount numeric)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_bid uuid := private.current_business_id();
  v_session public.table_sessions%rowtype;
  v_settings public.reward_settings%rowtype;
  v_customer uuid;
  v_label text;
  v_valid_until timestamptz;
  v_issued integer := 0;
  v_attempt integer;
begin
  if v_bid is null then
    raise exception 'not a member of an active business' using errcode = '42501';
  end if;
  if p_bill_amount is null or p_bill_amount < 0 or p_bill_amount > 100000 then
    raise exception 'invalid bill amount' using errcode = '22023';
  end if;

  select * into v_session from public.table_sessions
   where id = p_session_id and business_id = v_bid
   for update;
  if not found then
    raise exception 'visit not found' using errcode = 'P0002';
  end if;
  if v_session.status not in ('open', 'billing') then
    raise exception 'visit already closed' using errcode = '55000';
  end if;

  update public.table_sessions
     set status = 'closed',
         bill_amount = round(p_bill_amount, 2),
         closed_at = now(),
         closed_by = (select auth.jwt()) ->> 'sub'
   where id = v_session.id;

  select * into v_settings from public.reward_settings where business_id = v_bid;
  if not found then
    insert into public.reward_settings (business_id) values (v_bid)
    on conflict (business_id) do nothing;
    select * into v_settings from public.reward_settings where business_id = v_bid;
  end if;

  if not v_settings.scratch_enabled or p_bill_amount < v_settings.scratch_min_bill then
    return 0;
  end if;

  -- End of day (IST) N days from now.
  v_valid_until := ((date_trunc('day', now() at time zone 'Asia/Kolkata')
                    + make_interval(days => v_settings.prize_validity_days + 1)
                    - interval '1 second') at time zone 'Asia/Kolkata');

  for v_customer in
    select m.customer_id
      from public.session_members m
     where m.session_id = v_session.id
       and m.customer_id is not null
       and m.verified_at is not null
     group by m.customer_id
     order by min(m.verified_at)
     limit case when v_settings.scratch_all_members then 100 else 1 end
  loop
    v_label := private.draw_prize(v_settings.prizes);
    continue when v_label is null;
    for v_attempt in 1..5 loop
      begin
        insert into public.prizes (business_id, customer_id, session_id, label, code, valid_until)
        values (v_bid, v_customer, v_session.id, v_label, private.new_prize_code(), v_valid_until)
        on conflict (customer_id, session_id) do nothing;
        if found then
          v_issued := v_issued + 1;
        end if;
        exit;
      exception when unique_violation then
        -- code collision (business_id, code) — try another code
        continue;
      end;
    end loop;
  end loop;

  return v_issued;
end;
$$;

-- Redeem a prize — only on a later visit, before it expires (AGENTS.md §5).
create or replace function public.redeem_prize(p_prize_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_bid uuid := private.current_business_id();
  v_prize public.prizes%rowtype;
  v_new_session uuid;
begin
  if v_bid is null then
    raise exception 'not a member of an active business' using errcode = '42501';
  end if;

  select * into v_prize from public.prizes
   where id = p_prize_id and business_id = v_bid
   for update;
  if not found then
    raise exception 'prize not found' using errcode = 'P0002';
  end if;
  if v_prize.status not in ('unscratched', 'active') then
    raise exception 'prize already used or expired' using errcode = '55000';
  end if;
  if v_prize.valid_until < now() then
    update public.prizes set status = 'expired' where id = v_prize.id;
    raise exception 'prize expired' using errcode = '55000';
  end if;

  select s.id into v_new_session
    from public.session_members m
    join public.table_sessions s on s.id = m.session_id
   where m.customer_id = v_prize.customer_id
     and m.verified_at is not null
     and s.business_id = v_bid
     and s.status in ('open', 'billing')
     and s.id <> v_prize.session_id
     and s.opened_at > v_prize.valid_from
   order by s.opened_at desc
   limit 1;
  if v_new_session is null then
    raise exception 'prize can only be used on the next visit' using errcode = '55000';
  end if;

  update public.prizes
     set status = 'redeemed',
         redeemed_at = now(),
         redeemed_by = (select auth.jwt()) ->> 'sub',
         redeemed_session_id = v_new_session
   where id = v_prize.id;
end;
$$;

-- Staff/owner correct a customer's name (own cafe).
create or replace function public.set_customer_name(p_customer_id uuid, p_name text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_bid uuid := private.current_business_id();
  v_name text := nullif(left(btrim(coalesce(p_name, '')), 40), '');
begin
  if v_bid is null then
    raise exception 'not a member of an active business' using errcode = '42501';
  end if;
  update public.customers set name = v_name where id = p_customer_id and business_id = v_bid;
  if not found then
    raise exception 'customer not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.close_visit(uuid, numeric) from public, anon;
revoke all on function public.redeem_prize(uuid) from public, anon;
revoke all on function public.set_customer_name(uuid, text) from public, anon;
grant execute on function public.close_visit(uuid, numeric) to authenticated;
grant execute on function public.redeem_prize(uuid) to authenticated;
grant execute on function public.set_customer_name(uuid, text) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Live Board feed with prizes (return type changes → drop + create)
-- ---------------------------------------------------------------------
drop function if exists public.live_board_feed(timestamptz);

create function public.live_board_feed(p_since timestamptz default now() - interval '12 hours')
returns table (
  member_id uuid,
  session_id uuid,
  session_status text,
  bill_amount numeric,
  table_code text,
  table_label text,
  joined_at timestamptz,
  verified_at timestamptz,
  customer_id uuid,
  customer_name text,
  phone_last4 text,
  visit_count integer,
  last_visit_at timestamptz,
  notes text,
  prize_id uuid,
  prize_label text,
  prize_status text,
  prize_valid_until timestamptz,
  prize_session_id uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_bid uuid := private.current_business_id();
begin
  if v_bid is null then
    raise exception 'not a member of an active business' using errcode = '42501';
  end if;

  return query
    select
      m.id, s.id, s.status, s.bill_amount, t.code, t.label, m.created_at, m.verified_at,
      c.id, c.name,
      case when c.phone_e164 is null then null else right(c.phone_e164, 4) end,
      c.visit_count, c.last_visit_at, c.notes,
      p.id, p.label, p.status, p.valid_until, p.session_id
    from public.session_members m
    join public.table_sessions s on s.id = m.session_id
    join public.tables t on t.id = s.table_id
    left join public.customers c on c.id = m.customer_id
    left join lateral (
      select pr.id, pr.label, pr.status, pr.valid_until, pr.session_id
        from public.prizes pr
       where pr.customer_id = c.id
         and pr.status in ('unscratched', 'active')
         and pr.valid_until >= now()
       order by pr.valid_until asc
       limit 1
    ) p on true
    where m.business_id = v_bid
      and m.created_at >= p_since
    order by m.created_at desc
    limit 200;
end;
$$;

revoke all on function public.live_board_feed(timestamptz) from public, anon;
grant execute on function public.live_board_feed(timestamptz) to authenticated;

-- ---------------------------------------------------------------------
-- 6. Realtime: board refetches when prizes change too
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.prizes;
