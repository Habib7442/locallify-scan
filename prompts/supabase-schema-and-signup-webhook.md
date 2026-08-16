# Prompt: Supabase schema + RLS + Clerk signup webhook

## Goal

Give the app a working database foundation. Right now Clerk signup creates a
user and nothing else happens — there's no `profiles`/`pages` row, so there's
nowhere to store links, nothing for the public hub to render, and no `orders`
table for the (later) printed-QR feature to write to. This prompt covers:

1. The initial Supabase schema (`agencies`, `profiles`, `pages`, `links`,
   `scans`, `orders`, `vertical_templates`) with RLS per `PRD.md` §6–7.
2. A Clerk `user.created` webhook that auto-creates the matching `profiles` +
   `pages` rows, per the confirmed pivot: open self-serve signup, single
   seeded "Locallify" agency, every new signup defaults to `role='user'`.
3. Supabase client helpers (RLS-scoped + service-role) for later server code
   to use.

Out of scope for this prompt: the actual links/editor UI, the public hub
page, and Order Printed QR — those are separate follow-up prompts that will
depend on this schema existing.

## Skills read

- `supabase` — schema/RLS workflow, `execute_sql` vs `apply_migration`
  distinction, security checklist (wrap `auth.jwt()` in `select`, `TO`
  clause not `auth.role()`, UPDATE needs `WITH CHECK`, service-role
  exposure rules).
- `supabase-postgres-best-practices` — `security-rls-basics.md`,
  `security-rls-performance.md` (index every RLS-referenced column, use a
  `SECURITY DEFINER` helper function for the agency-admin role check to
  avoid a table querying its own RLS policy), `schema-foreign-key-indexes.md`
  (index every FK column).
- `clerk-webhooks` (read earlier this session) — `verifyWebhook(req)` from
  `@clerk/nextjs/webhooks`, route must be excluded from `clerkMiddleware()`
  auth via `proxy.ts`'s matcher, use `svix-id` for idempotency, always
  return 2xx on success.

## Existing code inspected

- `.env.local` already has `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set — a
  Supabase project is already connected. (Note the actual var name is
  `NEXT_PUBLIC_PUBLISHABLE_KEY`, not `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
  `AGENTS.md`'s env table currently says — Supabase's newer publishable-key
  naming. `AGENTS.md` needs updating to match.)
- No `supabase/` folder, no `.mcp.json`, no Supabase CLI installed, no
  `@supabase/supabase-js` in `package.json` — nothing has touched the
  database yet.
- Clerk is already registered as a third-party auth provider in Supabase,
  pointed at the correct domain (`deep-mudfish-4.clerk.accounts.dev`,
  verified working earlier this session).
- `proxy.ts` runs `clerkMiddleware()` with no public-route exceptions yet —
  a new `/api/webhooks/clerk` route needs to be excluded or every webhook
  call gets 401'd before Clerk's own signature check ever runs.
- No `lib/supabase/` directory exists yet.

## Decisions / assumptions

- **No Supabase CLI/MCP setup in this pass.** Given no local Supabase
  tooling exists yet, this prompt ships the schema as a plain
  `supabase/schema.sql` file (source of truth, versioned in the repo) that
  you run once via the Supabase Dashboard's SQL Editor — same pattern as
  the Clerk×Supabase integration doc used earlier. Setting up the CLI for a
  proper migration history is a reasonable future improvement, not a
  blocker for MVP.
- **Single seeded agency.** The schema seeds one `agencies` row
  (`name='Locallify'`) as part of `schema.sql`. `owner_clerk_id` on that row
  is left `NULL` until Habib signs into the app himself (nothing currently
  requires it to be set).
- **Every new signup gets `role='user'`, `agency_id`=the seeded agency.**
  Matches the confirmed pivot (open self-serve signup, no gatekeeping).
  Promoting someone to `agency_admin` is a manual dashboard/SQL action for
  now — no UI for it in this MVP pass.
- **Webhook uses the service-role client**, since Clerk's webhook call has
  no user JWT for RLS to evaluate — this is one of the two documented
  service-role exceptions in `AGENTS.md` §13.
- **UUIDs for all primary keys** (`gen_random_uuid()`), text for
  `clerk_user_id`/`owner_clerk_id` (Clerk IDs aren't UUIDs).
- **RLS policies split by action** (not `FOR ALL`) for clarity, per the
  security-checklist pattern shown in the skill.

## Files likely to change

- `supabase/schema.sql` — new. Full schema + RLS, meant to be run once by
  hand right now, and to stay the readable source of truth going forward.
- `lib/supabase/server.ts` — new. `createServerSupabaseClient()` (RLS-scoped,
  uses the caller's Clerk token) for future authenticated server code.
- `lib/supabase/admin.ts` — new. `createAdminClient()` (service-role,
  server-only) — used only by the webhook route and other explicitly
  anonymous/public paths (never client-triggered).
- `app/api/webhooks/clerk/route.ts` — new. Handles `user.created`,
  `user.updated`, `user.deleted`.
- `proxy.ts` — modify. Add `/api/webhooks(.*)` as a public route.
- `.env.local` — modify. Add `CLERK_WEBHOOK_SIGNING_SECRET` (you'll get this
  from the Clerk Dashboard after registering the webhook endpoint, or from
  `clerk webhooks token` when tunneling locally — no value to fill in now).
- `package.json` — add `@supabase/supabase-js` (pinned version, per the
  skill's supply-chain checklist).
- `AGENTS.md` §14 — fix the env var table (`NEXT_PUBLIC_PUBLISHABLE_KEY`,
  not `NEXT_PUBLIC_SUPABASE_ANON_KEY`; mark Supabase vars as configured; add
  `CLERK_WEBHOOK_SIGNING_SECRET`).

## Implementation requirements

**Schema (`supabase/schema.sql`)** — tables per `PRD.md` §6, plus indexes on
every FK and every RLS-referenced column:

- `agencies(id, name, domain, owner_clerk_id, created_at)`
- `profiles(clerk_user_id pk, agency_id fk, role check in ('agency_admin','user') default 'user', name, email, created_at)`
- `pages(id, agency_id fk, owner_clerk_id fk→profiles, slug unique, display_name, tagline, vertical nullable, theme check('light','dark') default 'dark', accent, logo_path, bg_type check('solid','image') default 'solid', bg_value, active default true, created_at, updated_at)`
- `links(id, page_id fk→pages on delete cascade, type, label, sub, destination, position default 0, active default true, created_at)`
- `scans(id, page_id fk→pages on delete cascade, link_id fk→links on delete set null nullable, created_at, device, country, referrer)`
- `orders(id, page_id fk→pages, owner_clerk_id fk→profiles, status check('pending','printed','shipped','cancelled') default 'pending', shipping_address jsonb, price numeric(10,2), currency default 'INR', payment_reference, created_at, shipped_at nullable)`
- `vertical_templates(vertical pk, default_links jsonb, signature_feature)`

Seed: one `agencies` row (`name='Locallify'`), and rows for the two verticals
named in `PRD.md` §5.6 (restaurant, clinic) with their default link lists —
the rest can be added when those verticals are actually built.

**RLS** — enable + force on every table. Create `private` schema with
`private.is_agency_admin()` (`SECURITY DEFINER`, checks
`profiles.role = 'agency_admin'` for `(select auth.jwt()->>'sub')`, revoke
execute from `PUBLIC`/`anon`/`authenticated`, grant to `authenticated` only).

- `profiles`: `SELECT` own row or admin. No client-side `INSERT`/`UPDATE`/
  `DELETE` policy at all — only the service-role webhook writes this table.
- `agencies`: `SELECT` to any authenticated user (no secrets in this table);
  `INSERT`/`UPDATE`/`DELETE` admin-only.
- `pages`: `SELECT` own or admin (authenticated) **and** `active = true`
  (anon — this is the public hub read path). `UPDATE`/`DELETE` own or
  admin, with matching `WITH CHECK`. `INSERT` admin-only (pages are
  auto-created by the webhook via service role; no authenticated insert
  path needed for MVP).
- `links`: ownership resolved via `EXISTS (SELECT 1 FROM pages WHERE
  pages.id = links.page_id AND ...)` since `links` has no direct
  `owner_clerk_id` column. `SELECT` own/admin (authenticated) or
  `active = true AND parent page active = true` (anon). `INSERT`/`UPDATE`/
  `DELETE` own/admin only.
- `scans`: `INSERT` open to `anon` **and** `authenticated`, gated on the
  target page being `active = true` (this is the non-blocking public
  scan/tap-log path — no user context required or expected). `SELECT` own
  page's scans or admin. No `UPDATE`/`DELETE` policy — scans are an
  append-only log.
- `orders`: `SELECT` own or admin. `INSERT` by the owning user only, and
  only for a page they actually own (`WITH CHECK` validates both
  `owner_clerk_id` match and page ownership). `UPDATE` (status changes)
  admin-only — a user must never be able to mark their own order
  `shipped`. No `DELETE` policy.
- `vertical_templates`: `SELECT` to `anon` and `authenticated` (needed at
  signup vertical-picker and on the public hub); no write policy needed
  yet (seeded via `schema.sql` directly).

**Supabase clients**

- `lib/supabase/server.ts`: `createServerSupabaseClient()` using
  `createClient(url, publishableKey, { accessToken: async () => (await
  auth()).getToken() })` — RLS-scoped, for future authenticated
  Server Actions/route handlers.
- `lib/supabase/admin.ts`: `createAdminClient()` using the service-role
  key. Server-only module (no `"use client"` anywhere near it). A top-of-file
  comment stating it must only be called from the webhook route and other
  explicitly anonymous/service paths — never from anything a browser can
  trigger directly.

**Webhook (`app/api/webhooks/clerk/route.ts`)**

- `verifyWebhook(req)` from `@clerk/nextjs/webhooks` — verify before
  touching `evt.data` at all; return 400 on failure.
- `user.created`: upsert into `profiles` (`clerk_user_id`, `agency_id` =
  the seeded Locallify agency's id, `role='user'`, `name`, primary
  `email`), then upsert an initial `pages` row for that user (`slug`
  generated from name/id, `active=true`, sensible defaults for
  theme/bg/accent). Upsert on `clerk_user_id` conflict — Svix retries mean
  this must be idempotent, not just insert-or-fail.
- `user.updated`: update `profiles.name`/`email`.
- `user.deleted`: delete the `profiles` row (cascades are not defined for
  this FK on purpose — decide in review whether `pages` should cascade-
  delete or just get orphaned/deactivated; default to leaving `pages`
  alone and just removing the `profiles` row, since deleting a user's
  printed-QR history/orders on account deletion is the riskier default).
- Always return 200 on successful handling, even if a sub-step no-ops.

**`proxy.ts`**: add `/api/webhooks(.*)` to the public-route matcher (see
`clerk-webhooks` skill pattern) so Clerk's own middleware doesn't 401 the
webhook before signature verification runs.

## Security requirements

- `SUPABASE_SERVICE_ROLE_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET`: server-only,
  never `NEXT_PUBLIC_`.
- `verifyWebhook` runs before any use of `evt.data`, full stop.
- RLS enabled + forced on every table, no exceptions.
- Every policy referencing `auth.jwt()` wraps it in `(select ...)` (see
  `security-rls-performance.md` — otherwise it's re-evaluated per row).
- `private.is_agency_admin()` is `SECURITY DEFINER` with `search_path = ''`,
  lives in the `private` schema (not `public`, so it's not reachable via
  the Data API), and execute is revoked from `PUBLIC`/`anon` — this is the
  one place RLS gets intentionally bypassed, and it must not become a
  public endpoint.
- The admin Supabase client (`lib/supabase/admin.ts`) is imported only by
  the webhook route in this pass — nothing else.

## Acceptance criteria

- `supabase/schema.sql` runs cleanly start-to-finish in the Supabase SQL
  Editor with no errors, on a project that has nothing but the Clerk
  third-party auth integration configured.
- A new Clerk sign-up produces exactly one `profiles` row and exactly one
  `pages` row, within a few seconds, with `role='user'` and the seeded
  Locallify `agency_id`.
- Re-delivering the same `user.created` event (simulating a Svix retry)
  does not create a duplicate `profiles`/`pages` row.
- Querying `pages`/`links` as one authenticated user never returns another
  user's rows; querying as `anon` only ever returns rows where
  `active = true`.
- A row inserted directly with the anon/publishable key into `profiles`,
  bypassing the webhook, is rejected (no INSERT policy exists for that
  table).
- `npx tsc --noEmit` and `npm run lint` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (route handler + new server modules touch build output)

## Exact manual test steps

1. Run `supabase/schema.sql` in the Supabase Dashboard → SQL Editor.
   Confirm no errors and that all 7 tables + the `private` schema exist
   under Database → Tables.
2. Add `CLERK_WEBHOOK_SIGNING_SECRET` to `.env.local`:
   - Local testing: `clerk webhooks listen --token "$(clerk webhooks
     token)" --forward-to http://localhost:3000/api/webhooks/clerk`, then
     add the printed relay URL as a webhook endpoint in the Clerk
     Dashboard (subscribe to `user.created`, `user.updated`,
     `user.deleted`), and copy the signing secret it gives you.
3. `npm run dev` in one terminal, the `clerk webhooks listen` tunnel in
   another.
4. Open an incognito window → `http://localhost:3000/sign-up` → create a
   test account.
5. Watch the dev server terminal for the webhook `POST /api/webhooks/clerk`
   log line and confirm it returns `200`.
6. In Supabase Dashboard → Table Editor → `profiles`, confirm the new row:
   correct `clerk_user_id`, `role='user'`, `agency_id` = the seeded
   Locallify agency.
7. In Table Editor → `pages`, confirm a matching row exists with
   `owner_clerk_id` matching the new profile and `active=true`.
8. In Clerk Dashboard → Users, edit the test user's name → confirm the
   `profiles.name` value updates within a few seconds.
9. Delete the test user in Clerk Dashboard → confirm the `profiles` row is
   removed (and decide/observe what happens to the `pages` row per the
   `user.deleted` behavior above).
10. In the Supabase SQL Editor, run a query as the `anon` role attempting
    to `select * from profiles` — confirm it returns zero rows (no policy
    grants anon access).
