# Prompt: Track trial status on signup

## Goal

Right now nothing in the schema records subscription/trial state at all.
Add that tracking: every new signup gets `subscription_status = 'trialing'`
and a `trial_ends_at` 7 days out, set automatically by the Clerk webhook
when the page is first created.

**Scope is data-tracking only.** This does **not** yet:
- Enforce anything (no code checks `trial_ends_at` anywhere, the public hub
  doesn't exist yet to gate, nothing goes inactive automatically when a
  trial expires).
- Touch Razorpay (no subscription/billing integration — pricing and tiers
  are still an open decision per our earlier conversation).
- Add any UI showing trial status (that lands with the onboarding page or
  a follow-up "billing" surface).

This is intentionally the smallest useful slice: get the fact stored
correctly first, build enforcement + billing + UI once pricing is locked.
Independent of `prompts/onboarding-page.md` — either can land first.

## Skills read

- `supabase-postgres-best-practices` — additive column change with a
  `DEFAULT`/`CHECK`, no RLS policy change needed (existing
  `pages_select_own`/`pages_update_own` policies already cover any column
  on `pages`).

## Existing code inspected

- `supabase/schema.sql` — `pages` table has no subscription-related
  columns today. This is a **live/production Supabase project** (already
  has real data: 1 agency, 1 profile, 1 page, 2 vertical templates), so
  this needs an `ALTER TABLE` run against the existing database, not a
  fresh `CREATE TABLE` — `schema.sql` alone won't apply this to what's
  already provisioned.
- `app/api/webhooks/clerk/route.ts` — the `user.created` handler's page-
  creation branch (`if (!existingPage) { ... supabase.from("pages").insert(...) }`)
  is the single place a page is ever created — the natural place to set
  the initial trial fields, since it only runs once per user.
- `AGENTS.md` §7 — data model reference table lists `pages` columns; needs
  the two new fields added to stay in sync (explicit house rule: "When any
  field is added or changed, keep the schema... and this section in
  sync").

## Decisions / assumptions

- **Columns live on `pages`**, not a new `subscriptions` table — there's a
  1:1 relationship between a user and their page already (`owner_clerk_id`
  is `unique`), and `pages.active` already represents "does this hub
  work," which is exactly what a future trial-expiry check will need to
  sit next to. A dedicated `subscriptions` table (tracking Razorpay
  subscription IDs, billing history, plan tier) makes more sense once
  actual billing is built — revisit then rather than guessing its shape
  now.
- **Columns**: `subscription_status text not null default 'trialing'
  check (subscription_status in ('trialing', 'active', 'past_due',
  'cancelled'))`, `trial_ends_at timestamptz`.
- **Existing row backfill**: the one real page in the database today (the
  test account) will get `subscription_status = 'trialing'` and
  `trial_ends_at = now() + interval '7 days'` via the `ALTER TABLE`
  default, evaluated at the moment the migration runs — not backdated to
  their actual original signup time. Acceptable for a single test row;
  flagging so it's not a silent surprise.
- **Webhook sets both fields explicitly** on insert (`subscription_status:
  "trialing"`, `trial_ends_at: <now + 7 days, computed in JS>`) rather
  than relying solely on the column default, so the exact trial length is
  visible and intentional in the webhook code, not implicit in the schema.

## Files likely to change

- `supabase/schema.sql` — modify. Add the two columns to the `pages`
  `create table` definition (so a fresh install matches production).
- `supabase/migrations/0001_trial_status.sql` — new. The `ALTER TABLE`
  statement to run once against the live database via the SQL Editor
  (first migration file — starts a real migration trail going forward
  instead of hand-editing `schema.sql` and hoping it stays in sync with
  what's actually been run).
- `app/api/webhooks/clerk/route.ts` — modify. Set `subscription_status`
  and `trial_ends_at` on the page-insert call.
- `AGENTS.md` §7 — modify. Add the two fields to the `pages` row
  description.

## Implementation requirements

**`supabase/migrations/0001_trial_status.sql`**
```sql
alter table public.pages
  add column subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'cancelled')),
  add column trial_ends_at timestamptz not null default (now() + interval '7 days');
```

**`supabase/schema.sql`**: add the same two column definitions into the
existing `pages` `create table` block, matching the migration exactly.

**`app/api/webhooks/clerk/route.ts`**: in the page-insert object, add:
```ts
subscription_status: "trialing",
trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
```

**`AGENTS.md` §7**: extend the `pages` row: `..., subscription_status
(trialing/active/past_due/cancelled), trial_ends_at, active — one hub per
user...`.

## Security requirements

None beyond what's already in place — additive columns, no new write path
exposed (still only ever set via the service-role webhook at creation, or
later by an admin/billing path that doesn't exist yet; the RLS-scoped
client's existing `pages_update_own` policy technically lets a user
`UPDATE` these columns on their own row today since there's no column-level
restriction — **flagging this as a known gap**: once real enforcement
exists, a user being able to set their own `subscription_status = 'active'`
via a direct API call would be a real bypass. Out of scope to fix here
since nothing enforces the field yet, but must be closed (via a trigger,
a column-level policy, or moving writes through a server-only path) before
this field is ever used to gate anything.

## Acceptance criteria

- Migration runs cleanly against the live database with no errors.
- The existing test page gets `subscription_status = 'trialing'` and a
  `trial_ends_at` ~7 days from when the migration runs.
- A fresh signup gets `subscription_status = 'trialing'` and
  `trial_ends_at` exactly 7 days from their `user.created` webhook firing.
- `npx tsc --noEmit` and `npm run lint` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Exact manual test steps

1. Run `supabase/migrations/0001_trial_status.sql` in the Supabase SQL
   Editor.
2. Check the existing test page row — confirm `subscription_status =
   'trialing'` and `trial_ends_at` is ~7 days out.
3. Sign up a fresh test account (with the webhook properly registered and
   verified working from earlier this session).
4. Check the new page row — confirm the same two fields are set correctly,
   `trial_ends_at` exactly 7 days from creation.
