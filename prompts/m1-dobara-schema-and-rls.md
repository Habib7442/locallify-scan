# M1 — Dobara schema + RLS (business = `pages` row)

## Goal
Create the database foundation for **M1** (`PRD.md` §17): per-table QR → scan page → WhatsApp verify → Live Board ding. This settles the open decision "what `business_id` points to" (`AGENTS.md` §15) and adds only the tables M1 needs, with row-level security, so that one cafe can never read another's data. Later milestones add prizes (M2), squad rewards and reward settings (M3), campaigns and plans (M4).

**Decided (2026-11-16):** a business **is the existing `pages` row** (it already holds name, slug and branding for the scan page). **Owners self-sign-up**; the onboarding UI is a separate prompt (`m1-owner-signup-onboarding.md`).

## Skills read
- `supabase-postgres-best-practices`: identity/uuid PKs, FK indexes, RLS basics + performance (`(select auth.jwt())` wrapping, security definer helpers in `private`), least privilege, partial indexes.
- `clerk-orgs`: orgs enabled with **Membership required**; default roles `org:admin` and `org:member`; read the org from the session token.
- **Clerk token claims, verified in the installed SDK** (`@clerk/shared/dist/types/jwtv2.d.ts`, `jwtPayloadParser`): session token **v2** carries the active org as `o: { id, slg, rol }`, where `rol` has **no `org:` prefix** (`"admin"`). Token **v1** uses `org_id` / `org_role` (`"org:admin"`). Helpers read both.
- `supabase` (Realtime): `postgres_changes` honours RLS for the subscriber's JWT. Tables must be added to the `supabase_realtime` publication.

## Existing code inspected
- `supabase/schema.sql`: `pages` (uuid PK, `slug` unique, `owner_clerk_id` unique → `profiles`, `agency_id` not null, branding columns, `active`), `scans(page_id, link_id, device, country, referrer)`, `private.is_agency_admin()` (security definer, reads `profiles.role`), RLS enabled on `agencies/profiles/pages`.
- `lib/provisioning.ts`: creates `profiles` + `pages` for a signed-in user (service role, identity from the Clerk session only).
- `supabase/migrations/0009_whatsapp_webhook_events.sql`: raw inbox (stays as is).
- `lib/whatsapp/*`: the webhook. M1 verify matching will write to the new tables.
- `PRD.md` §7.1–7.3, §7.6, §10; `AGENTS.md` §5 trust rules, §7, §8.

## Decisions / assumptions (⚠️ = please confirm)
1. **Business key:** `business_id` = `pages.id` (uuid). Add `pages.clerk_org_id text unique` (nullable until the owner finishes onboarding). Every new table has `business_id uuid not null references pages(id) on delete cascade`.
2. ⚠️ **Roles mapping:** Clerk default roles, no custom roles: **`org:admin` = Owner**, **`org:member` = Staff**. Whoever creates the org (the signing-up owner) becomes `org:admin`. Owners invite staff as `org:member`.
3. **How RLS knows the caller's cafe:** from the **active org in the Clerk JWT**, with no membership table to sync:
   - `private.jwt_org_id()` = `coalesce(jwt->'o'->>'id', jwt->>'org_id')`
   - `private.jwt_org_role()` = `coalesce(jwt->'o'->>'rol', replace(jwt->>'org_role','org:',''))` → `'admin' | 'member'`
   - `private.current_business_id()` (security definer, stable) = `pages.id` where `clerk_org_id = jwt_org_id()` and `active`
   - `private.is_business_staff(bid)` = `bid = current_business_id()` (owner or staff)
   - `private.is_business_owner(bid)` = staff check and `jwt_org_role() = 'admin'`
   - Locallify admin keeps `private.is_agency_admin()`, **read-only** (impersonation + audit log come in M5).

   Limitation: RLS sees only the **active** org. Fine, because staff work at one cafe at a time.
4. **Tables in this migration (M1 only):**
   - `tables`: `id uuid pk`, `business_id`, `code text` (e.g. `T4`, upper-case, `^[A-Z0-9]{1,6}$`), `label text`, `is_active bool default true`, `created_at`. `unique (business_id, code)`.
     PRD's `qr_slug` is **dropped**: the QR URL is `/r/{pages.slug}/t/{code}` (`AGENTS.md` §15 resolved), so slug + code already identify the table.
   - `customers`: `id uuid pk`, `business_id`, `phone_e164 text` (check `^\+[1-9][0-9]{7,14}$`), `name text`, `birthday date null`, `language text default 'en'` check in (`en`,`hi`,`bn`), `opted_in bool default false`, `opted_in_at`, `opted_out_at`, `notes text` (check length ≤ 280), `visit_count int default 0`, `last_visit_at`, `created_at`. `unique (business_id, phone_e164)`.
   - `table_sessions`: `id uuid pk`, `business_id`, `table_id → tables`, `declared_size int null` (1–20), `status text` check in (`open`,`billing`,`closed`,`expired`), `bill_amount numeric(10,2) null` (≥ 0), `opened_at default now()`, `closed_at`, `closed_by text null` (Clerk user id).
     Partial unique index: **one live session per table**, `(table_id) where status in ('open','billing')`.
   - `session_members`: `id uuid pk`, `business_id`, `session_id → table_sessions`, `customer_id → customers null`, `device_id text not null`, `verify_code text null unique`, `verify_expires_at`, `verified_at`, `created_at`.
     `unique (session_id, customer_id)` (one phone counts once per session) and `unique (session_id, device_id)`. `verify_code` is **set to null once used or expired**, so the unique constraint only ever covers live codes.
   - `message_log`: `id uuid pk`, `business_id null` (null until an inbound message is matched to a cafe), `customer_id null`, `direction` in (`in`,`out`), `category` in (`service`,`utility`,`marketing`,`authentication`), `template_name null`, `wa_message_id text unique`, `status text`, `cost_inr numeric(8,2) null`, `created_at`.
   - `scans` (existing): add `table_id uuid null → tables on delete set null` + index. It serves as `qr_scanned` (`AGENTS.md` §1 table).
5. **Indexes:** every FK; `customers(business_id, phone_e164)` (covered by the unique); `table_sessions(business_id, status)`; `session_members(business_id, created_at desc)` for the Live Board feed; `message_log(business_id, created_at)`.
6. **RLS policies** (all tables `enable row level security`; `anon` gets nothing on any new table):
   | Table | Staff (owner or staff) | Owner extra | Agency admin |
   |---|---|---|---|
   | `tables` | select | insert/update/delete | select |
   | `table_sessions` | select | — | select |
   | `session_members` | select | — | select |
   | `customers` | **no direct select** (masked RPC instead) | select; update (name, birthday, language, notes) | select |
   | `message_log` | — | select | select |
   | `pages` (existing) | select own business row | update own business row (branding) | (existing) |

   Writes to sessions, members and customers happen in **server code**: the anonymous scan page and the webhook use the service role (documented exceptions), and staff actions come in later prompts via security definer RPCs. M1 adds one staff write, **customer notes**, via the RPC below.
7. **Phone masking for staff, enforced server-side:** security definer RPC `public.live_board_feed(p_since timestamptz)` returns rows for `current_business_id()` only: session member id, table code, session id/status, `verified_at`, customer id, name, `'…' || right(phone_e164, 4)`, visit_count, last_visit_at, notes. Requires `is_business_staff`. Execute is granted to `authenticated` only. Plus `public.set_customer_note(p_customer_id uuid, p_note text)` (staff, own business, ≤ 280 chars).
8. **Realtime:** add `session_members` and `table_sessions` to the `supabase_realtime` publication. The Live Board subscribes with its Clerk token. RLS limits events to its business, and the payload holds ids only (no phone), after which the board calls `live_board_feed`. The anonymous scan page does **not** use postgres_changes (`AGENTS.md` §5).
9. **Clerk Dashboard (your action, before the onboarding prompt):** Organizations → **Enable**, Membership mode **Membership required**. Keep default roles. Allow users to create organizations, limited to **1 org per user** (the owner's cafe). Confirm the session token is **v2**; Supabase already accepts Clerk tokens.
10. Old link-in-bio columns on `pages` (theme, links, etc.) are left untouched. `links`, `orders` and `vertical_templates` are not modified.

## Files likely to change
- **New** `supabase/migrations/0010_dobara_m1_core.sql`: `pages.clerk_org_id`, private helpers, 5 new tables, `scans.table_id`, indexes, RLS policies, RPCs, Realtime publication, revokes.
- `supabase/schema.sql`: kept in sync.
- **New** `lib/supabase/database.types.ts`: hand-written types for the new tables/RPCs (or generated with `supabase gen types` if the CLI is linked).
- `AGENTS.md` §7 (business_id settled, `qr_slug` dropped, tables added, next migration `0011`), §15 (move the decisions to Resolved), and `PRD.md` §10 (note `qr_slug` dropped and the `pages` mapping).

## Security requirements
- All helpers are `security definer`, `set search_path = ''`, `stable`, schema-qualified, and live in `private`. `revoke all … from public` and grant execute only where needed.
- Policies use `(select private.fn())` wrapping for performance.
- No `anon` access to any new table. `revoke all on <new tables> from anon`.
- Staff never get `phone_e164`, from either a table select or the RPC. Only owners (and the read-only agency admin) can read full phones.
- `verify_code` is never readable by staff (not in the RPC). Only the service-role scan and webhook paths read it.
- Collects no new personal data beyond `PRD.md` §13 (name, phone, birthday, language, notes, visits).

## Acceptance criteria
- The migration applies cleanly to the project at `bvylyz…` and is idempotent where practical.
- With a Clerk JWT for **org A staff**: can select A's tables, sessions and members; **cannot** select A's `customers` directly; `live_board_feed` returns masked phones; sees **nothing** from org B.
- With a JWT for **org A owner**: can select A's customers with full phones and manage A's tables; nothing from B.
- `anon` (publishable key, no JWT): every new table returns permission denied / empty.
- A second live session on the same table is rejected by the partial unique index.
- The same phone can't join the same session twice.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`, plus SQL tests run in the Supabase SQL editor. They impersonate JWTs with `set local role authenticated; set local request.jwt.claims = '{"sub":"user_x","o":{"id":"org_A","rol":"member"}}'` and assert the visibility rules above for staff, owner, other org and anon. Test rows are created inside a transaction and rolled back.

## Manual test steps
1. Clerk Dashboard: enable Organizations (decision 9).
2. Supabase SQL editor: run `0010_dobara_m1_core.sql`. It succeeds.
3. Run the RLS test script I provide (`supabase/tests/m1_rls.sql`, everything in a rolled-back transaction). Every `assert` passes.
4. Supabase → Database → Publications: `supabase_realtime` includes `session_members` and `table_sessions`.

## Out of scope (next M1 prompts)
- `m1-owner-signup-onboarding.md`: sign up → create org → create/link the `pages` row → add tables.
- `m1-table-qr-and-scan-page.md`: `/r/[business]/t/[table]`, device cookie, session join, verify code.
- `m1-whatsapp-verify.md`: the webhook matches the code → customer + member verified.
- `m1-live-board.md`: staff PWA, Realtime ding.
