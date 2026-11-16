-- =====================================================================
-- RLS tests for migration 0010 (Dobara M1 core).
-- Run in the Supabase SQL editor AFTER applying 0010. Everything runs in
-- one transaction and is ROLLED BACK — no data is left behind.
-- Success = the final "M1 RLS: all checks passed" notice and no errors.
-- =====================================================================
begin;

-- ---------- seed (as postgres, bypassing RLS) ----------
insert into public.agencies (id, name) values ('00000000-0000-0000-0000-0000000000a1', 'Test agency');

insert into public.profiles (clerk_user_id, agency_id, role) values
  ('user_owner_a', '00000000-0000-0000-0000-0000000000a1', 'user'),
  ('user_owner_b', '00000000-0000-0000-0000-0000000000a1', 'user');

insert into public.pages (id, agency_id, owner_clerk_id, slug, display_name, clerk_org_id) values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000a1', 'user_owner_a', 'm1-test-cafe-a', 'Cafe A', 'org_test_a'),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000a1', 'user_owner_b', 'm1-test-cafe-b', 'Cafe B', 'org_test_b');

insert into public.tables (id, business_id, code) values
  ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-00000000000a', 'T1'),
  ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-00000000000b', 'T1');

insert into public.customers (id, business_id, phone_e164, name) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-00000000000a', '+919876543210', 'Priya'),
  ('00000000-0000-0000-0000-0000000000c2', '00000000-0000-0000-0000-00000000000b', '+919812345678', 'Arjun');

insert into public.table_sessions (id, business_id, table_id) values
  ('00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000f1'),
  ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000f2');

insert into public.session_members (business_id, session_id, customer_id, device_id, verified_at) values
  ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000e1', '00000000-0000-0000-0000-0000000000c1', 'device-aaaaaaaaaaaaaaaa', now()),
  ('00000000-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000c2', 'device-bbbbbbbbbbbbbbbb', now());

-- ---------- constraint checks (as postgres) ----------
do $$
begin
  begin
    insert into public.table_sessions (business_id, table_id)
    values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000f1');
    raise exception 'FAIL: second live session on the same table was allowed';
  exception when unique_violation then null;
  end;

  begin
    insert into public.session_members (business_id, session_id, customer_id, device_id)
    values ('00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-0000000000e1',
            '00000000-0000-0000-0000-0000000000c1', 'device-cccccccccccccccc');
    raise exception 'FAIL: same phone joined the same session twice';
  exception when unique_violation then null;
  end;
end $$;

-- ---------- staff of cafe A (v2 token, rol=member) ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"user_staff_a","o":{"id":"org_test_a","rol":"member"}}', true);

do $$
declare n int; last4 text;
begin
  select count(*) into n from public.tables;            assert n = 1, 'staff A should see 1 table';
  select count(*) into n from public.table_sessions;    assert n = 1, 'staff A should see 1 session';
  select count(*) into n from public.session_members;   assert n = 1, 'staff A should see 1 member';
  select count(*) into n from public.customers;         assert n = 0, 'staff must not read customers directly';
  select count(*) into n from public.message_log;       assert n = 0, 'staff must not read message_log';
  select count(*) into n from public.pages where id = '00000000-0000-0000-0000-00000000000a';
  assert n = 1, 'staff A should read own cafe page';

  select phone_last4 into last4 from public.live_board_feed(now() - interval '1 hour') limit 1;
  assert last4 = '3210', 'feed should return masked phone (last 4)';
  select count(*) into n from public.live_board_feed(now() - interval '1 hour');
  assert n = 1, 'feed should only include cafe A';

  perform public.set_customer_note('00000000-0000-0000-0000-0000000000c1', 'kam teekha');

  begin
    perform public.set_customer_note('00000000-0000-0000-0000-0000000000c2', 'cross-cafe');
    raise exception 'FAIL: staff A edited a cafe B customer';
  exception when sqlstate 'P0002' then null;
  end;

  begin
    insert into public.tables (business_id, code) values ('00000000-0000-0000-0000-00000000000a', 'T9');
    raise exception 'FAIL: staff created a table';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------- owner of cafe A (v1 token style, org:admin) ----------
select set_config('request.jwt.claims', '{"sub":"user_owner_a","org_id":"org_test_a","org_role":"org:admin"}', true);

do $$
declare n int; phone text;
begin
  select count(*) into n from public.customers;         assert n = 1, 'owner A should see 1 customer';
  select phone_e164 into phone from public.customers;   assert phone = '+919876543210', 'owner sees full phone';
  select notes into phone from public.customers;        assert phone = 'kam teekha', 'note written by staff RPC';
  insert into public.tables (business_id, code) values ('00000000-0000-0000-0000-00000000000a', 'T2');
  select count(*) into n from public.tables;            assert n = 2, 'owner A can add a table';

  begin
    insert into public.tables (business_id, code) values ('00000000-0000-0000-0000-00000000000b', 'T7');
    raise exception 'FAIL: owner A added a table to cafe B';
  exception when insufficient_privilege then null;
  end;

  update public.customers set notes = 'jain food' where id = '00000000-0000-0000-0000-0000000000c2';
  get diagnostics n = row_count;                        assert n = 0, 'owner A must not update cafe B customers';
end $$;

-- ---------- signed-in user with no org ----------
select set_config('request.jwt.claims', '{"sub":"user_nobody"}', true);

do $$
declare n int;
begin
  select count(*) into n from public.tables;            assert n = 0, 'no-org user sees no tables';
  begin
    perform public.live_board_feed();
    raise exception 'FAIL: no-org user could read the live board';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------- anon (scan-page public key, no JWT) ----------
reset role;
set local role anon;
select set_config('request.jwt.claims', '', true);

do $$
begin
  begin
    perform 1 from public.customers limit 1;
    raise exception 'FAIL: anon read customers';
  exception when insufficient_privilege then null;
  end;
  begin
    perform 1 from public.session_members limit 1;
    raise exception 'FAIL: anon read session_members';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.live_board_feed();
    raise exception 'FAIL: anon called live_board_feed';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
do $$ begin raise notice 'M1 RLS: all checks passed'; end $$;

rollback;
