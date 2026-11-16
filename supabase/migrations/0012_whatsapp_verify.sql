-- 0012 — WhatsApp verify (prompts/m1-whatsapp-verify.md)
-- Atomic code matching for the signature-verified webhook. Service role only.

-- ---------------------------------------------------------------------
-- verify_member_code: match a live code → upsert customer → verify member
-- → count the visit once per session. Row-locked so retries/races can't
-- double-verify or double-count.
--   status: 'verified' | 'already' | 'expired' | 'not_found'
-- ---------------------------------------------------------------------
create or replace function public.verify_member_code(
  p_code text,
  p_phone_e164 text,
  p_profile_name text
)
returns table (
  status text,
  business_id uuid,
  cafe_name text,
  table_code text,
  customer_id uuid,
  customer_name text
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_member public.session_members%rowtype;
  v_session_status text;
  v_table_code text;
  v_cafe_name text;
  v_customer_id uuid;
  v_customer_name text;
  v_name text := nullif(left(btrim(coalesce(p_profile_name, '')), 80), '');
begin
  if p_phone_e164 !~ '^\+[1-9][0-9]{7,14}$' then
    return query select 'not_found'::text, null::uuid, null::text, null::text, null::uuid, null::text;
    return;
  end if;

  select * into v_member
  from public.session_members
  where verify_code = upper(btrim(p_code))
  for update;

  if not found then
    return query select 'not_found'::text, null::uuid, null::text, null::text, null::uuid, null::text;
    return;
  end if;

  select s.status, t.code, p.display_name
    into v_session_status, v_table_code, v_cafe_name
  from public.table_sessions s
  join public.tables t on t.id = s.table_id
  join public.pages p on p.id = s.business_id
  where s.id = v_member.session_id;

  if v_member.verify_expires_at is null
     or v_member.verify_expires_at < now()
     or v_session_status not in ('open', 'billing') then
    update public.session_members
       set verify_code = null, verify_expires_at = null
     where id = v_member.id;
    return query select 'expired'::text, v_member.business_id, v_cafe_name, v_table_code, null::uuid, null::text;
    return;
  end if;

  insert into public.customers as c (business_id, phone_e164, name)
  values (v_member.business_id, p_phone_e164, v_name)
  on conflict (business_id, phone_e164)
    do update set name = coalesce(c.name, excluded.name)
  returning c.id, c.name into v_customer_id, v_customer_name;

  -- Fresh explicit tick + verified phone = consent (AGENTS.md §9).
  if v_member.wants_offers then
    update public.customers
       set opted_in = true, opted_in_at = now(), opted_out_at = null
     where id = v_customer_id;
  end if;

  -- Same phone already checked in to this session from another device.
  if exists (
    select 1 from public.session_members m
    where m.session_id = v_member.session_id
      and m.customer_id = v_customer_id
      and m.id <> v_member.id
  ) then
    update public.session_members
       set verify_code = null, verify_expires_at = null
     where id = v_member.id;
    return query select 'already'::text, v_member.business_id, v_cafe_name, v_table_code, v_customer_id, v_customer_name;
    return;
  end if;

  update public.session_members
     set customer_id = v_customer_id,
         verified_at = now(),
         verify_code = null,
         verify_expires_at = null
   where id = v_member.id;

  update public.customers
     set visit_count = visit_count + 1, last_visit_at = now()
   where id = v_customer_id;

  return query select 'verified'::text, v_member.business_id, v_cafe_name, v_table_code, v_customer_id, v_customer_name;
end;
$$;

-- ---------------------------------------------------------------------
-- record_visit: used by the returning-device "I'm here" path. Counts the
-- visit only if this is the customer's only verified membership in the
-- session (i.e. the check-in that just happened) — repeat calls are no-ops
-- once last_visit_at is already inside this session.
-- ---------------------------------------------------------------------
create or replace function public.record_visit(p_customer_id uuid, p_session_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_opened timestamptz;
begin
  select opened_at into v_opened from public.table_sessions where id = p_session_id;
  if v_opened is null then
    return;
  end if;

  update public.customers
     set visit_count = visit_count + 1, last_visit_at = now()
   where id = p_customer_id
     and (last_visit_at is null or last_visit_at < v_opened);
end;
$$;

revoke all on function public.verify_member_code(text, text, text) from public, anon, authenticated;
revoke all on function public.record_visit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.verify_member_code(text, text, text) to service_role;
grant execute on function public.record_visit(uuid, uuid) to service_role;
