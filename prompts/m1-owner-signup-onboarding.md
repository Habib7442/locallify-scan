# M1 — Owner sign-up, cafe creation and table setup

## Goal
A cafe owner can go from the landing page to a ready cafe in a few minutes: **sign up → name the cafe (Clerk Organization) → confirm the cafe's web address → add tables (T1…Tn) → see a simple owner home** listing each table's QR link. This creates the `pages` row (the business) and `tables` rows that the M1 scan page (`/r/[business]/t/[table]`) and Live Board need. Serves `PRD.md` §7.1 (per-table QR, setup half) and §7.8 (owner panel, minimal home). Milestone **M1**. Decided 2026-11-16: owners **self-sign-up**.

## Skills read
- `clerk` → `clerk-orgs`: Membership required ⇒ after sign-up the user gets a **`choose-organization` session task**; host it ourselves with `<TaskChooseOrganization redirectUrlComplete=… />` and `ClerkProvider taskUrls`. `auth()` gives `orgId`/`orgRole`. `has({ role: 'org:admin' })`.
- `clerk-nextjs-patterns`: `auth()` in Server Components/Actions, `auth.protect()` in `proxy.ts`. Pending sessions (unfinished task) are treated as signed-out by default.
- `supabase-postgres-best-practices`: owner writes run with the Clerk JWT through RLS (`tables_insert_owner`). Unique slug handling.
- `node_modules/next/dist/docs/`: Server Actions + `useActionState`, `redirect`, `revalidatePath`, route groups.

## Existing code inspected
- `app/sign-in`, `app/sign-up`: bare `<SignIn/>`/`<SignUp/>`. Env: sign-up fallback redirect `/onboarding`.
- `app/layout.tsx`: `ClerkProvider appearance={{ theme: shadcn }}`, Hanken Grotesk, dark tokens.
- `proxy.ts`: protects `/onboarding(.*)`, `/dashboard(.*)`.
- `lib/provisioning.ts`: on `user.created` (webhook) **and** as a fallback, creates `profiles` + a `pages` row for **every** user. Under Dobara this is wrong: invited **staff** would each get a stray page/business.
- `app/api/webhooks/clerk/route.ts`: calls `provisionUser` on `user.created`.
- `lib/supabase/server.ts`: RLS client using the Clerk session token. `lib/supabase/admin.ts`: service role.
- Migration 0010: `pages.clerk_org_id`, `tables` (owner CRUD via RLS), `private.current_business_id()`.
- Clerk Dashboard (done by the user, dev + prod): Membership required, max 1 org per user, members limit 20 (or 5), slugs off, auto-create off, naming rules off, members can't delete orgs.

## Decisions / assumptions (⚠️ = please confirm)
1. **Provisioning change:** `user.created` creates **only the `profiles` row**. The `pages` row (business) is created when the owner's **organization** exists, by a new `ensureBusinessForActiveOrg()`. This keeps staff from getting stray pages. Old link-in-bio `pages` rows already in the DB are untouched.
2. **`ensureBusinessForActiveOrg()`** (server-only, service role, a documented narrow exception like `provisionSignedInUser`). Identity comes **only** from `auth()`: `userId`, `orgId`, `orgRole === 'org:admin'`. Never from request input. Idempotent:
   - If a page with `clerk_org_id = orgId` exists → return it.
   - Else, if this user already owns a page with `clerk_org_id is null` (old link-in-bio row or a pre-change sign-up) → **link it** (set `clerk_org_id`, `display_name` = org name).
   - Else → insert a page: `owner_clerk_id = userId`, `clerk_org_id = orgId`, `display_name` = org name, `slug` = unique slugify(org name), `agency` = Locallify, `active = true`.
   - Unique-violation retry as in `provisionUser`.
3. **Flow & routes** (all owner pages mobile-first, same dark design system as the landing):
   - `/sign-up` and `/sign-in`: restyled Clerk components on a branded split page ("Dobara by Locallify", one line of value). Sign-up redirects to `/onboarding`.
   - `/onboarding/create-cafe`: hosts Clerk's `choose-organization` task via `<TaskChooseOrganization redirectUrlComplete="/onboarding" />`, registered as `taskUrls` in `ClerkProvider`. Clerk **localization** renames "organization" → "cafe" in that UI ("Create your cafe", "Cafe name").
   - `/onboarding` (Server Component): requires `orgId` + admin. Calls `ensureBusinessForActiveOrg()`, then shows a 2-step form:
     - **Step 1 — Your cafe:** cafe name (prefilled), **web address** `scan.locallifyagency.com/r/<slug>` (editable; 3–40 chars, `a-z0-9-`, live availability check; warning "This goes on your printed QR codes — choose carefully"). Saved with a Server Action through the **RLS client** (`pages_update_business_owner`).
     - **Step 2 — Your tables:** "How many tables?" (1–60) → creates `T1…Tn` through the **RLS client** (`tables_insert_owner`). Skips codes that already exist, so it's re-runnable. Optional per-table label can be added later.
     - Done → `onboarded_at = now()` → redirect `/dashboard`.
   - `/dashboard` (owner home, minimal): cafe name + web address, list of tables with their scan URL `https://scan.locallifyagency.com/r/<slug>/t/<code>` (copy button), "Add more tables", and a disabled "Open Live Board" (enabled in the Live Board prompt). Staff (`org:member`) visiting `/dashboard` → redirected to `/board` (placeholder "Live Board coming soon").
   - A signed-in user **without** an org, or a pending task → Clerk sends them through the task. Admin check fails → friendly "Ask your cafe owner" page.
4. ⚠️ **Staff invites are deferred** to the Live Board prompt (owner panel "Staff" is `PRD.md` §7.8 / M4). For the M1 pilot the owner can use the Live Board themselves. Say if you want a minimal "Invite staff by email" box on `/dashboard` now.
5. ⚠️ **Web address after printing:** the slug is editable **only until the first QR is scanned** (`scans` has a row with a `table_id` for this business). After that it's locked, with the note "Contact us to change". This prevents broken printed QRs.
6. QR **images / print cards** are not in this prompt. They're in `m1-table-qr-and-scan-page.md` (`qr-code-styling`). This prompt shows the URLs only.
7. `proxy.ts`: protect `/onboarding(.*)`, `/dashboard(.*)`, `/board(.*)`.
8. Copy lives in `content/owner.ts` (English for now; Hindi/Bengali in M5).

## Files likely to change
- `lib/provisioning.ts`: `provisionUser` creates the profile only; add `ensureBusinessForActiveOrg()` (or a new `lib/business.ts`).
- `app/api/webhooks/clerk/route.ts`: unchanged call, new behaviour.
- `app/layout.tsx`: `ClerkProvider taskUrls` + `localization` (organization → cafe) + appearance variables matching our tokens.
- `app/sign-in/[[...sign-in]]/page.tsx`, `app/sign-up/[[...sign-up]]/page.tsx`: branded layout.
- **New** `app/onboarding/create-cafe/page.tsx`, `app/onboarding/page.tsx`, `app/onboarding/actions.ts`, `app/onboarding/OnboardingSteps.tsx` (client, `useActionState`).
- **New** `app/dashboard/page.tsx`, `app/dashboard/actions.ts` (add tables), `app/board/page.tsx` (placeholder).
- **New** `lib/business.ts` (getCurrentBusiness via RLS, slug validation), `content/owner.ts`.
- `proxy.ts`: add `/board(.*)`.
- `app/sitemap.ts` / `robots.ts`: disallow `/onboarding`, `/dashboard`, `/board`.

## Implementation requirements
- Server Actions validate everything server-side: slug regex + reserved words (`r`, `api`, `admin`, `board`, `dashboard`, `onboarding`, `sign-in`, `sign-up`), table count 1–60, cafe name 2–60 chars. Return typed `{ ok, error }`, with no thrown errors reaching the UI.
- Every owner write goes through `createServerSupabaseClient()` (Clerk JWT + RLS). The **only** service-role use is `ensureBusinessForActiveOrg()`.
- Read "my business" with an explicit `.eq('clerk_org_id', orgId)` filter, never RLS alone with `.single()` (`AGENTS.md` §5).
- UI: dark tokens, Hanken Grotesk, 16px+ inputs, 48px tap targets, visible cyan focus rings, works at 360px. One primary action per step. Progress "Step 1 of 2".

## Security requirements
- Identity from `auth()` only. `orgRole` must be `org:admin` for onboarding/dashboard writes, and RLS enforces it again (`jwt_org_role() = 'admin'`).
- No client-supplied `business_id`, `owner_clerk_id` or `clerk_org_id`, ever.
- Staff never reach owner actions (server check + RLS).
- The slug availability check is a Server Action returning only `available: boolean` (no leakage of other cafes' data). Rate-limit is light (debounced on the client).

## Acceptance criteria
- A new email signs up → is asked to create a cafe (Clerk UI says "cafe") → lands on `/onboarding` with the cafe name prefilled.
- Exactly **one** `pages` row exists for that org, with `clerk_org_id` set. Refreshing `/onboarding` doesn't create another.
- Choosing a taken web address shows "Already taken". A reserved word is rejected.
- Entering 8 tables creates `T1…T8`. Running it again with 10 adds only `T9`, `T10`.
- `/dashboard` lists 10 tables with correct scan URLs.
- A user invited as a member (tested via the Clerk Dashboard) sees no owner pages and gets no `pages` row.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`

## Manual test steps
1. `npm run dev` (uses the Clerk **Development** instance) → http://localhost:3000/sign-up.
2. Sign up with a new email → you're asked to **create your cafe** → enter "Test Cafe".
3. `/onboarding` → Step 1 shows "Test Cafe" and `…/r/test-cafe`. Change it to something taken (e.g. an existing slug) → "Already taken". Save a free one.
4. Step 2 → 8 tables → Done → `/dashboard` lists T1–T8 with URLs.
5. Supabase → `pages`: one row with `clerk_org_id = org_…`. `tables`: 8 rows for it.
6. Clerk Dashboard → Organizations → Test Cafe → invite another email as **Member** → sign up as that user → you land on `/board` (placeholder), not owner pages. Supabase shows **no** new `pages` row for them.
7. Mobile check at 390px: every step is usable one-handed.
