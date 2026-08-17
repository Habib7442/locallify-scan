# Prompt: Agency dashboard — support lookup (read-only)

## Goal

Give Habib (the sole `agency_admin`) a `/agency` screen listing every
user/hub across the platform, for support lookups — per `PRD.md` §5.5
("List of all users/pages (for support lookups)...") and the MVP list in
`AGENTS.md` §1. This ships **only the lookup half** of the agency
dashboard: read-only browse + search, with a link out to each hub's live
public page. The **orders queue** (pending/printed/shipped) is
deliberately deferred — it depends on the `orders` table actually having
rows, which needs Order Printed QR to exist first (blocked on the
still-open price/shipping decision, `AGENTS.md` §15). Full "open/edit any
page in an override capacity" is also deferred — this ships visibility,
not an edit-override flow, to avoid building more than what was asked for.

## Skills read

- `supabase` — RLS checklist re-confirmed: `TO authenticated` alone is
  authentication without authorization, so the existing
  `private.is_agency_admin()` `SECURITY DEFINER` helper (already gates
  every admin-read policy in `supabase/schema.sql`) is what actually
  authorizes cross-user reads here — this feature adds **zero new SQL**,
  it only exercises policies that already exist.
- `supabase-postgres-best-practices` — not directly applicable; no new
  tables/indexes, just a `select` with an existing FK-based embed
  (`pages.owner_clerk_id → profiles.clerk_user_id`).

## Existing code inspected

- `supabase/schema.sql` — confirmed `private.is_agency_admin()` already
  exists and is already wired into `pages`/`links`/`profiles` SELECT
  policies (`... or (select private.is_agency_admin())`). An
  RLS-scoped client (`createServerSupabaseClient()`, not service-role)
  authenticated as the agency admin will therefore already see every
  page/profile — no new migration needed for this feature.
- `pages.owner_clerk_id` is declared `unique references profiles
  (clerk_user_id)` — a true 1:1, so a PostgREST embed
  (`profiles(name, email)`) returns a single nested object per page, not
  an array.
- `proxy.ts` — `isProtectedRoute` currently only matches
  `/onboarding(.*)` and `/dashboard(.*)`. `/agency` needs adding or it's
  reachable while signed out.
- `app/dashboard/page.tsx` — **found a real latent bug** while reviewing
  this for the role-check pattern: its `pages` query has no
  `.eq("owner_clerk_id", userId)` filter, relying purely on RLS +
  `.single()`. That's silently correct today only because Habib's account
  is the only row in the table. The moment a second user signs up, RLS
  will correctly widen Habib's own `/dashboard` load to *all* pages (via
  `is_agency_admin()`), and `.single()` will throw
  ("multiple (or no) rows returned"), breaking Habib's own dashboard.
  Fixing this now, while touching this exact file for the role fetch.
- `app/dashboard/actions.ts`'s `getOwnPage` helper already filters by
  `owner_clerk_id` correctly — the bug is isolated to the initial page
  load in `page.tsx`.
- `app/dashboard/dashboard-editor.tsx` — header already has a
  `Pricing` link + `UserButton`; adding a conditional `Agency` link here
  for admin discoverability (there's currently no way to find `/agency`
  except typing the URL).
- `lib/seo.ts` — `buildMetadata(..., { noIndex: true })` pattern already
  used for `/dashboard`/`/onboarding`; reused for `/agency`.

## Decisions / assumptions

- **Route: `/agency`**, one page, no sub-routes yet (queue/order-detail
  views come later alongside Order Printed QR).
- **Authorization, two layers**: `proxy.ts` requires sign-in (like
  `/dashboard`); the page itself then reads the caller's own
  `profiles.role` and `redirect("/dashboard")` if it isn't
  `agency_admin` — a non-admin signed-in user is bounced, not shown a
  403 page, matching how a support-only screen should behave for regular
  users (nothing to see, so send them where they belong).
- **RLS-scoped client, not service-role** — this is a client-triggered
  authenticated read; the admin's own JWT already satisfies
  `is_agency_admin()`, so there's no reason to reach for the service
  role (`AGENTS.md` §5: "UI must not bypass RLS by using the service
  role from client-triggered code").
- **Client-side search/filter over the full fetched list** — PRD §5.5
  explicitly defers real search/filter ("later, once volume grows");
  at current volume a plain substring filter over an already-fetched
  array is simplest and matches other lightweight client-state patterns
  in this codebase (e.g. `settings-tab.tsx`), without adding
  server-side pagination infra for a dataset that doesn't need it yet.
- **"View hub" link only, no edit access** — clicking a row opens the
  public `/[slug]` page in a new tab (the same thing a support call would
  need to check first). Building an actual override-edit flow (loading
  another user's page into the dashboard editor) is real additional scope
  or acceptable to defer, given the user asked for "support lookup"
  specifically.
- **Bug fix bundled in**: `app/dashboard/page.tsx`'s query gets an
  explicit `.eq("owner_clerk_id", userId)`, so Habib's own `/dashboard`
  keeps working correctly once a second real page exists.

## Files likely to change

- `proxy.ts` — modify. Add `/agency(.*)` to `isProtectedRoute`.
- `app/agency/page.tsx` — new. Server Component: role check + redirect,
  data fetch (`pages` joined to `profiles`), renders the view.
- `app/agency/agency-dashboard-view.tsx` — new. Client Component: search
  input + list of hub rows (name/email, slug, public/private badge,
  subscription status, "View hub" link).
- `app/dashboard/page.tsx` — modify. Add the `.eq("owner_clerk_id",
  userId)` fix; fetch `profiles.role` and pass it down.
- `app/dashboard/dashboard-editor.tsx` — modify. Accept a `role` prop;
  render an `Agency` link in the header next to `Pricing`, only when
  `role === "agency_admin"`.

## Implementation requirements

**`proxy.ts`**
```ts
const isProtectedRoute = createRouteMatcher(["/onboarding(.*)", "/dashboard(.*)", "/agency(.*)"]);
```

**`app/agency/page.tsx`**
- `const { userId } = await auth();`
- Look up `profiles.role` for `userId` via the RLS-scoped client;
  `redirect("/dashboard")` if not `"agency_admin"`.
- Query: `pages.select("id, slug, display_name, active,
  subscription_status, trial_ends_at, created_at, owner_clerk_id,
  profiles(name, email)").order("created_at", { ascending: false })`.
- Pass the rows into `AgencyDashboardView`.
- `metadata = buildMetadata({ title: "Agency — Locallify Scan", ...,
  path: "/agency", noIndex: true })`.

**`app/agency/agency-dashboard-view.tsx`**
- `"use client"`. Props: `pages: AgencyPageRow[]` (typed to match the
  select above, with `profiles: { name: string | null; email: string |
  null } | null`).
- Header consistent with the dashboard's dark chrome (logo linking home,
  `UserButton`), a "Dashboard" link back to `/dashboard`.
- Search input filtering the array client-side by slug, display name,
  owner name, or owner email (case-insensitive substring).
- Each row: display name (fallback to slug), owner email, slug/URL,
  a Public/Private badge (from `active`), subscription status text,
  and a "View hub" link (`target="_blank"`) to `/${slug}`.
- Empty state when the search matches nothing.
- Row count summary ("N hubs").

**`app/dashboard/page.tsx`**
- Add `import { auth } from "@clerk/nextjs/server";` and `const { userId
  } = await auth();`.
- Add `.eq("owner_clerk_id", userId ?? "")` to the existing `pages`
  query, before `.single()`.
- Add a second query (or a second `.select` field) for the caller's own
  `profiles.role`; pass `role` into `<DashboardEditor />`.

**`app/dashboard/dashboard-editor.tsx`**
- Accept `role: string` in props / `PageData`-adjacent prop (not part of
  `PageData` itself, since it describes the caller, not the page).
- In the header's right-hand group, add `{role === "agency_admin" &&
  <Link href="/agency" ...>Agency</Link>}` before the `Pricing` link.

## Security requirements

- No new RLS policies — this feature only exercises the existing
  `is_agency_admin()`-gated SELECT policies, already reviewed and in
  production use for the `/dashboard` load itself.
- No service-role usage — RLS-scoped client throughout, same as every
  other authenticated read in this codebase.
- Role check happens **server-side** on every load of `/agency` (not
  cached client-side, not inferred from a Clerk claim alone) — a
  non-admin hitting the URL directly gets redirected before any
  cross-user data is fetched, not after.
- `/agency` requires sign-in via `proxy.ts` (defense in depth alongside
  the in-page role check).

## Acceptance criteria

- Signed out → hitting `/agency` redirects to sign-in (via `proxy.ts`).
- Signed in as a regular `user` role → hitting `/agency` redirects to
  `/dashboard`, no page/profile data leaks into the response.
- Signed in as `agency_admin` → `/agency` lists every hub in the
  database (not just Habib's), each with owner email, slug, status.
- Search filters the list live as you type, matching name/slug/email.
- "View hub" opens the correct public `/[slug]` page in a new tab.
- Regular users' own `/dashboard` still loads correctly (verifies the
  bug fix) even once more than one `pages` row exists.
- The `Agency` header link appears only for `agency_admin`, not for
  regular users.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. `npm run dev`.
2. Signed out, visit `/agency` directly — confirm redirect to sign-in.
3. Sign in as Habib (agency_admin), visit `/dashboard` — confirm it
   still loads correctly and confirm a new "Agency" link appears in the
   header.
4. Click "Agency" (or visit `/agency` directly) — confirm the list shows
   at least Habib's own hub, with correct email/slug/status.
5. Type a search term (part of a name, slug, or email) — confirm the
   list filters live, and clears back to the full list when the search
   box is emptied.
6. Click "View hub" on a row — confirm it opens that hub's live public
   page in a new tab.
7. If you have (or can create) a second test account: sign in as that
   regular user, confirm `/dashboard` loads only *their* hub (not a
   crash), and confirm visiting `/agency` directly redirects them to
   `/dashboard` without showing any other user's data — then confirm the
   agency admin's `/agency` list now shows both hubs.
