# Prompt: Onboarding page (claim slug, name, tagline, optional vertical)

## Goal

The first real authenticated, data-writing page in the app. Per `PRD.md`
§5.1/§8 flow 1 ("signs up → a page is auto-created → lands in their editor
→ optionally picks a vertical"): after signup, a user should land somewhere
that lets them claim a real slug (their auto-generated one currently looks
like `habibtanwir1906-gmail-com`), set a display name + tagline, and
optionally pick a vertical (restaurant/clinic) to pre-fill starter links.

This is **not** the full multi-tab editor from `PRD.md` §5.2 (Links tab,
branding/logo/background, Analytics tab, Share & QR tab, Settings). That's
a much bigger follow-up build. Scope here is the first-run setup step only
— confirmed with the user as "onboarding page where business will secure
name, update profile, etc."

Explicitly out of scope for this prompt (separate follow-up prompts):
- Logo upload / background image / accent colour / theme (PRD §5.2
  Branding — needs Supabase Storage bucket + policies, its own prompt).
- Links tab (add/edit/reorder/toggle individual links after the initial
  vertical-seeded set).
- Analytics tab — explicitly V2/Later per `AGENTS.md` §1, not MVP.
- Share & QR tab / QR generation / Order Printed QR.
- The subscription/trial paywall discussed earlier this session — not
  implemented yet, pricing/tiers still undecided. This page does not
  gate on subscription status.

## Skills read

- `clerk` → `clerk-nextjs-patterns` (`middleware-strategies.md`,
  `server-actions.md`) — this is the **first genuinely protected route**
  in the app. Current `proxy.ts` runs bare `clerkMiddleware()` with no
  `auth.protect()` call at all, so nothing is gated yet. Adding real
  protection here for the first time.
- `supabase` — RLS-scoped writes via the existing
  `createServerSupabaseClient()` helper (already built this session),
  Server Action patterns, slug-uniqueness check pattern.
- `supabase-postgres-best-practices` — nothing new; schema already has the
  needed indexes/constraints (`pages.slug` unique, `pages.owner_clerk_id`
  unique).

## Existing code inspected

- `supabase/schema.sql` — `pages` table: `owner_clerk_id` unique (one page
  per user, enforced at the DB level), `slug` unique, `vertical` nullable
  text, `display_name`, `tagline`. RLS: `pages_select_own` and
  `pages_update_own` already allow the owning user to `SELECT`/`UPDATE`
  their own row (no `INSERT` policy for authenticated users — pages are
  only ever created by the webhook's service-role client, which already
  happened at signup, so onboarding only ever `UPDATE`s, never inserts).
- `vertical_templates` table — already seeded with `restaurant` and
  `clinic`, each with a `default_links` jsonb array (`type`, `label`
  pairs) and `signature_feature` text. `SELECT` is open to `authenticated`
  (`vertical_templates_select_all`), so this page can read it directly.
- `links` table — no RLS `INSERT` restriction beyond page ownership
  (`links_insert_own`, resolved via `EXISTS` against `pages`), so an
  authenticated user's own Server Action can insert their vertical's
  starter links directly through the RLS-scoped client — no service role
  needed here.
- `lib/supabase/server.ts` — `createServerSupabaseClient()`, RLS-scoped,
  ready to use as-is.
- `app/api/webhooks/clerk/route.ts` — the slug-generation logic
  (`slugify` + uniqueness-suffix loop) this page's slug check should stay
  consistent with, so a user editing their slug gets the same rules the
  webhook used to generate the original one.
- `proxy.ts` — currently `export default clerkMiddleware();` with no
  callback — confirmed to protect nothing today (verified: signup/signin
  work with zero redirects anywhere). Needs its first real
  `auth.protect()` for `/onboarding(.*)`.
- `.env.local` — `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/` —
  currently sends new signups to the landing page, not anywhere useful
  post-signup.

## Decisions / assumptions

- **Route**: `app/onboarding/page.tsx` → `/onboarding`. Not under
  `(legal)` — this is an authenticated app route, not a marketing/legal
  page, so it doesn't reuse the `Navbar`/`Footer` landing chrome. Simple
  standalone layout instead (matches how Clerk's own `/sign-in`,
  `/sign-up` routes already look — no site chrome around the auth UI).
- **Protection**: add `isPublicRoute` matcher to `proxy.ts` covering
  everything *except* `/onboarding(.*)` — i.e. switch from "nothing
  protected" to "protect `/onboarding`, everything else stays public,"
  the minimal change rather than inverting the whole middleware strategy.
- **Redirect on sign-up**: change
  `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` to `/onboarding` so
  new users land here right after signup. Leave
  `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` as `/` — returning
  users have nowhere else built to go yet (no dashboard/editor exists),
  and this page isn't a gate they must pass every sign-in, just a setup
  step reachable anytime.
- **No forced completion**: a user can navigate to `/onboarding` anytime
  to re-edit slug/name/tagline/vertical — it's not a one-time wizard that
  locks after first use. The page always reflects current DB state.
- **After save**: since there's no editor/public-hub page built yet to
  send them to, show an in-page success state ("Saved — the full editor
  is coming soon") rather than redirecting somewhere that doesn't exist.
- **Vertical selection behavior**: choosing a vertical inserts that
  vertical's `default_links` as real `links` rows (position = array
  index, `active = true`) **only if the user currently has zero links** —
  prevents duplicating starter links if they change their vertical
  selection later after already customizing links themselves (once the
  Links tab exists). Switching away from a vertical or picking "Skip /
  generic" never deletes existing links.
- **Slug rules**: lowercase letters, numbers, hyphens only; 3–48 chars;
  can't start/end with a hyphen; reuses the same `slugify()` shape as the
  webhook. Availability checked via a Server Action (debounced client-side
  ~400ms), excluding the user's own current row from the collision check.

## Files likely to change

- `app/onboarding/page.tsx` — new. Server Component: loads the caller's
  `pages` row + the `vertical_templates` list via
  `createServerSupabaseClient()`.
- `app/onboarding/onboarding-form.tsx` — new. Client Component: the form
  itself (slug input w/ live availability, display name, tagline, vertical
  picker with skip option, save button, success state).
- `app/onboarding/actions.ts` — new. Server Actions: `checkSlugAvailable`,
  `saveOnboarding` (updates `pages`, conditionally seeds `links`).
- `proxy.ts` — modify. First real `auth.protect()`, scoped to
  `/onboarding(.*)`.
- `.env.local` — modify. `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding`.

## Implementation requirements

**`app/onboarding/page.tsx`**
- `auth()` → if no `userId`, this shouldn't be reachable (proxy already
  protects it), but still fetch via the RLS-scoped client, which will
  simply return no row for a bad state — handle gracefully with a clear
  error rather than a crash.
- Fetch the caller's `pages` row (`select * from pages` — RLS already
  scopes this to their own row, no `.eq()` needed beyond what RLS
  enforces, but add `.single()` since exactly one row is expected).
- Fetch `vertical_templates` (`select vertical, signature_feature`).
- Pass both down to the client form component as props.

**`app/onboarding/onboarding-form.tsx`**
- Controlled inputs for slug, display name, tagline.
- Slug field: on change (debounced), calls `checkSlugAvailable` Server
  Action, shows inline available/taken/invalid-format state.
- Vertical picker: cards for each seeded vertical (name + one-line
  signature feature description) + a "Skip — generic profile" option,
  single-select, defaults to the page's current `vertical` value (or
  "skip" if null).
- Save button disabled while slug is invalid/taken/checking.
- On submit, calls `saveOnboarding` Server Action; shows success state
  inline on completion, or a form-level error message on failure.
- Dark theme, consistent with the rest of the site
  (`bg-[#18181a]`, `text-white`, `#54e0ff` accent, existing input/button
  styling conventions — no new component library, plain Tailwind +
  existing `components/ui/button.tsx` where it fits).

**`app/onboarding/actions.ts`**
- `"use server"` directives.
- `checkSlugAvailable(slug: string)`: validates format server-side too
  (never trust client validation alone), queries `pages` for a collision
  excluding the caller's own `owner_clerk_id`, returns
  `{ available: boolean; reason?: string }`.
- `saveOnboarding(input)`: re-validates slug format + re-checks
  availability server-side before writing (race-condition safety — the
  debounced client check is a UX hint, not the source of truth). Updates
  the caller's `pages` row via the RLS-scoped client (`.update(...)` —
  RLS's `pages_update_own` policy enforces they can only touch their own
  row; no manual `owner_clerk_id` filter needed, though harmless to add
  for clarity). If a vertical was selected and the user has zero existing
  `links` rows, insert the vertical's `default_links` as real rows.
  Revalidate the path on success (`revalidatePath("/onboarding")`).

**`proxy.ts`**
```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/onboarding(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = { matcher: [ /* unchanged */ ] };
```

## Security requirements

- `/onboarding` is the first route requiring real Clerk protection —
  verify `auth.protect()` actually redirects a signed-out visitor to
  sign-in (not just that the page looks right when signed in).
- All writes go through the RLS-scoped client, never the admin/service-
  role client — this is a client-triggerable authenticated path, exactly
  the case RLS exists for.
- Server Actions re-validate everything server-side (slug format,
  availability, vertical value against the known seeded set) — never
  trust the client-side checks as the actual gate.
- No service-role usage anywhere in this feature.

## Acceptance criteria

- Signed-out visit to `/onboarding` redirects to sign-in.
- Signed-in visit shows the current slug/name/tagline/vertical pre-filled
  from the DB.
- Changing the slug to one already taken by another page shows "taken"
  inline and blocks save; changing to an available one allows save.
- Saving updates the `pages` row (verifiable via a direct DB check).
- Picking a vertical on a page with zero links creates the expected
  `links` rows; re-saving with a different vertical does not duplicate or
  wipe them once links already exist.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` (new route + Server Actions + middleware change)

## Exact manual test steps

1. Sign out completely, visit `http://localhost:3000/onboarding` directly
   — confirm redirect to sign-in.
2. Sign in as the existing test account, visit `/onboarding` — confirm
   the current auto-generated slug, empty name/tagline, and no vertical
   selected are shown.
3. Type a new slug that collides with another existing page's slug (or
   temporarily create a second test page) — confirm "taken" shows and
   Save is disabled.
4. Change to an available slug, fill in display name + tagline, pick
   "Restaurant / cafe," save — confirm the success state appears.
5. Check the database directly: `pages` row has the new slug/name/
   tagline/vertical, and six `links` rows exist matching the restaurant
   vertical's `default_links`.
6. Revisit `/onboarding` — confirm it now shows the saved values, not the
   original defaults.
7. Change vertical to "clinic" and save again — confirm the original six
   restaurant links are still there, unchanged (no duplication, no wipe).
