# Self-provisioning fallback + own-page scoping

## Goal
1. A signed-in Clerk user whose `profiles`/`pages` rows are missing (missed or unreachable `user.created` webhook, e.g. local dev, or a user created before a DB move) gets them created automatically on first visit to `/dashboard` or `/onboarding`, instead of seeing "We couldn't load your hub".
2. Fix: `/dashboard` and `/onboarding` load the page with `.single()` and no owner filter. For an `agency_admin`, RLS returns **every** page, so `.single()` errors as soon as a second business exists. Scope both reads to the caller's own `owner_clerk_id`.

Approved by user ("whatever needed just do it") — 2026-11-16.

## Skills read
- clerk (Next.js patterns: `auth()`, `currentUser()` in Server Components)
- supabase (service-role usage limits)

## Existing code inspected
- `app/api/webhooks/clerk/route.ts` — current provisioning logic (profile upsert + page insert with unique slug)
- `app/dashboard/page.tsx`, `app/onboarding/page.tsx` — unscoped `.single()` page reads
- `lib/supabase/admin.ts`, `lib/supabase/server.ts`
- `app/dashboard/actions.ts`, `app/onboarding/actions.ts` — already scope by `owner_clerk_id` (no change)

## Decisions
- Extract provisioning into `lib/provisioning.ts` (`server-only`), used by both the webhook and the page fallback, so there's one implementation.
- The fallback uses the service-role client **only** for the caller's own verified Clerk `userId` from `auth()` — never an ID from client input. That's a narrow, documented service-role exception (added to AGENTS.md §5): users have no RLS INSERT path on `profiles`/`pages` by design.
- New rows always get role `user`. Promotion to `agency_admin` stays manual.
- Race-safe: profile is an upsert; a page insert that fails with unique violation `23505` is resolved by re-checking for the owner's page, or retrying with a fresh slug (max 3 attempts).

## Files changed
- `lib/provisioning.ts` (new)
- `app/api/webhooks/clerk/route.ts` — call `provisionUser`
- `app/dashboard/page.tsx`, `app/onboarding/page.tsx` — scope by owner, fallback provisioning
- `AGENTS.md` — document the service-role exception

## Security requirements
- Never provision for an ID other than `auth().userId`.
- `lib/provisioning.ts` is `server-only`; no client import path.

## Acceptance criteria
- Deleting a user's `pages` + `profiles` rows, then opening `/dashboard`, recreates them and the editor loads.
- An `agency_admin` with 2+ pages in the DB still loads their **own** dashboard.
- The webhook still creates rows on a real signup.

## Checks
`npx tsc --noEmit`, `npm run lint`

## Manual test
1. `npm run dev`, sign in, open `/dashboard`, and confirm the editor loads.
2. With the service role or SQL, delete your `links`, `pages` and `profiles` rows. Reload `/dashboard`: the rows are recreated with role `user` and a fresh slug. Re-promote yourself to admin if needed.
3. Create a second user's page, then confirm the admin dashboard still shows only your own page.
