-- =====================================================================
-- Tests for migration 0013 (prizes). Run in the Supabase SQL editor after
-- 0013. Everything is ROLLED BACK. Success = the last result row says
-- "M2 prizes: all checks passed" and no error appears.
-- =====================================================================
begin;

insert into public.agencies (id, name) values ('00000000-0000-0000-0000-0000000000a1', 'Test agency');
insert into public.profiles (clerk_user_id, agency_id, role) values
  ('m2_owner_a', '00000000-0000-0000-0000-0000000000a1', 'user'),
  ('m2_owner_b', '00000000-0000-0000-0000-0000000000a1', 'user');
insert into public.pages (id, agency_id, owner_clerk_id, slug, display_name, clerk_org_id) values
  ('00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000000a1', 'm2_owner_a', 'm2-test-a', 'Cafe A', 'org_m2_a'),
  ('00000000-0000-0000-0000-00000000020b', '00000000-0000-0000-0000-0000000000a1', 'm2_owner_b', 'm2-test-b', 'Cafe B', 'org_m2_b');
insert into public.tables (id, business_id, code) values
  ('00000000-0000-0000-0000-0000000002f1', '00000000-0000-0000-0000-00000000020a', 'T1'),
  ('00000000-0000-0000-0000-0000000002f2', '00000000-0000-0000-0000-00000000020a', 'T2');
insert into public.customers (id, business_id, phone_e164, name) values
  ('00000000-0000-0000-0000-0000000002c1', '00000000-0000-0000-0000-00000000020a', '+919800000001', 'Priya'),
  ('00000000-0000-0000-0000-0000000002c2', '00000000-0000-0000-0000-00000000020a', '+919800000002', 'Arjun');
-- One prize with all the weight, so the draw is deterministic.
insert into public.reward_settings (business_id, prizes, scratch_min_bill)
values ('00000000-0000-0000-0000-00000000020a', '[{"label":"Free Cold Coffee","weight":1}]', 200);

-- Visit 1 at T1: two verified diners.
insert into public.table_sessions (id, business_id, table_id, opened_at)
values ('00000000-0000-0000-0000-0000000002e1', '00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002f1', now() - interval '2 hours');
insert into public.session_members (business_id, session_id, customer_id, device_id, verified_at) values
  ('00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002e1', '00000000-0000-0000-0000-0000000002c1', 'dev-m2-aaaaaaaaaaaaa', now() - interval '2 hours'),
  ('00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002e1', '00000000-0000-0000-0000-0000000002c2', 'dev-m2-bbbbbbbbbbbbb', now() - interval '2 hours');
-- A below-minimum visit at T2.
insert into public.table_sessions (id, business_id, table_id)
values ('00000000-0000-0000-0000-0000000002e2', '00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002f2');
insert into public.session_members (business_id, session_id, customer_id, device_id, verified_at) values
  ('00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002e2', '00000000-0000-0000-0000-0000000002c1', 'dev-m2-ccccccccccccc', now());

-- ---------- staff of cafe A ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"m2_staff_a","o":{"id":"org_m2_a","rol":"member"}}', true);

do $$
declare n int; v_prize uuid; lbl text;
begin
  n := public.close_visit('00000000-0000-0000-0000-0000000002e1', 450);
  assert n = 2, format('expected 2 scratch cards, got %s', n);
  select count(*) into n from public.prizes where session_id = '00000000-0000-0000-0000-0000000002e1';
  assert n = 2, 'staff can read the two prizes';
  select label into lbl from public.prizes limit 1;
  assert lbl = 'Free Cold Coffee', 'weighted draw used the settings';

  begin
    perform public.close_visit('00000000-0000-0000-0000-0000000002e1', 450);
    raise exception 'FAIL: closed the same visit twice';
  exception when sqlstate '55000' then null;
  end;

  n := public.close_visit('00000000-0000-0000-0000-0000000002e2', 150);
  assert n = 0, 'below minimum bill gives no card';

  -- Same visit: Priya has no newer open visit yet, so redeem is refused.
  select id into v_prize from public.prizes where customer_id = '00000000-0000-0000-0000-0000000002c1';
  begin
    perform public.redeem_prize(v_prize);
    raise exception 'FAIL: redeemed without a new visit';
  exception when sqlstate '55000' then null;
  end;

  update public.reward_settings set scratch_min_bill = 1 where business_id = '00000000-0000-0000-0000-00000000020a';
  get diagnostics n = row_count;
  assert n = 0, 'staff must not change reward settings';

  perform public.set_customer_name('00000000-0000-0000-0000-0000000002c2', 'Arjun K');
end $$;

-- Priya comes back: a new verified visit at T1 (as postgres). Opened a
-- minute later because now() is fixed inside one transaction.
reset role;
insert into public.table_sessions (id, business_id, table_id, opened_at)
values ('00000000-0000-0000-0000-0000000002e3', '00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002f1', now() + interval '1 minute');
insert into public.session_members (business_id, session_id, customer_id, device_id, verified_at) values
  ('00000000-0000-0000-0000-00000000020a', '00000000-0000-0000-0000-0000000002e3', '00000000-0000-0000-0000-0000000002c1', 'dev-m2-ddddddddddddd', now());

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"m2_staff_a","o":{"id":"org_m2_a","rol":"member"}}', true);
do $$
declare v_prize uuid; st text; n int;
begin
  select id into v_prize from public.prizes where customer_id = '00000000-0000-0000-0000-0000000002c1';
  select count(*) into n from public.live_board_feed() f where f.prize_id = v_prize;
  assert n >= 1, 'board feed shows the active prize';
  perform public.redeem_prize(v_prize);
  select status into st from public.prizes where id = v_prize;
  assert st = 'redeemed', 'prize redeemed on the next visit';
  begin
    perform public.redeem_prize(v_prize);
    raise exception 'FAIL: redeemed twice';
  exception when sqlstate '55000' then null;
  end;
end $$;

-- ---------- owner of cafe A: settings ----------
select set_config('request.jwt.claims', '{"sub":"m2_owner_a","o":{"id":"org_m2_a","rol":"admin"}}', true);
do $$
declare n int;
begin
  update public.reward_settings set scratch_min_bill = 300 where business_id = '00000000-0000-0000-0000-00000000020a';
  get diagnostics n = row_count;
  assert n = 1, 'owner can change reward settings';
end $$;

-- ---------- staff of cafe B: no cross-cafe access ----------
select set_config('request.jwt.claims', '{"sub":"m2_staff_b","o":{"id":"org_m2_b","rol":"member"}}', true);
do $$
declare n int;
begin
  select count(*) into n from public.prizes;
  assert n = 0, 'cafe B sees no cafe A prizes';
  begin
    perform public.close_visit('00000000-0000-0000-0000-0000000002e3', 999);
    raise exception 'FAIL: cafe B closed a cafe A visit';
  exception when sqlstate 'P0002' then null;
  end;
end $$;

-- ---------- anon ----------
reset role;
set local role anon;
do $$
begin
  begin
    perform 1 from public.prizes limit 1;
    raise exception 'FAIL: anon read prizes';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.close_visit('00000000-0000-0000-0000-0000000002e1', 1);
    raise exception 'FAIL: anon closed a visit';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
select 'M2 prizes: all checks passed' as result;
rollback;
