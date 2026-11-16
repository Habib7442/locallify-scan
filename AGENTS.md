# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** working on **Dobara** (दोबारा — "again"), a restaurant & cafe repeat-visit product built on the **Locallify Scan** QR platform, in this codebase. Brand structure: **Locallify Scan** is the QR platform; **Dobara** is the product sold to restaurants, always shown with **"by Locallify"** in small text. Diners scan a per-table QR, verify their WhatsApp number, and get rewards that bring them back; staff recognise regulars on a live board; owners fill empty tables with one-tap WhatsApp offers. Dobara works alongside the restaurant's existing billing/POS — it never replaces it.

Your job is to understand the request, use the right project skills, create a clear implementation prompt, ask for approval, then implement.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

---

# 1. Product

`PRD.md` is the source of truth. Dobara's pitch: *"Your billing software takes the order. Dobara makes sure the customer comes back."*

Four features (`PRD.md` §7):

- **Table Squad** — everyone at a table scans + verifies → the table unlocks a reward (§7.4)
- **Next-Visit Prize** — staff close the visit with the bill amount → each customer gets a scratch card whose prize is only valid on the next visit (§7.5)
- **Pehchaan (Live Board)** — real-time staff screen that dings when a known customer scans, with name, visit count, notes and pending prizes (§7.6)
- **Fill My Tables** — owner sends a time-limited WhatsApp offer to regulars on a slow day, with a cost estimate first (§7.7)

Supporting pieces: per-table QR codes (§7.1), the customer scan page (§7.2), click-to-chat WhatsApp verification (§7.3), the owner panel (§7.8), and the Locallify admin (§7.9).

Build in milestone order (`PRD.md` §17). **M1 is the priority** — ship it and test it in one real cafe before going wide:

| # | Milestone | Done when |
|---|---|---|
| M0 | Meta & accounts, webhook endpoint stub | Test message received and replied via webhook |
| M1 | Per-table QR → scan page → click-to-chat verify → Live Board ding | A verified scan rings the Live Board in < 3 s |
| M2 | Close visit + scratch card + redeem + day-10 reminder | Full return-visit loop works end to end |
| M3 | Table Squad | 4 test phones unlock a dessert |
| M4 | Fill My Tables + owner panel + opt-outs + allowances | Campaign sends, opt-outs respected, usage tracked |
| M5 | Pilot polish: Hindi/Bengali, print cards, onboarding, error tracking, admin | 3 pilot cafes live |

Do not build v2+ items (`PRD.md` §21) — Google review requests, Dish Passport, per-cafe WhatsApp numbers, POS integrations, weekly owner reports, non-restaurant presets — unless explicitly asked. Do not build anything in `PRD.md` §3 non-goals: no POS/billing/KOT/inventory/GST invoicing, no food ordering, no customer app, no points loyalty. Do not overbuild.

## What happens to the existing Locallify Scan code

The repo started as a link-in-bio product ("Locallify Scan"). Dobara replaced it as the main product on 2026-11-16. Existing code is **reusable infrastructure**, not target scope:

**UI reset (2026-11-16):** all pages and UI components were deleted so the UI can be rebuilt from scratch. The last full version is commit `07d37bb` — restore any file with `git checkout 07d37bb -- <path>` (landing page + animated hero, dashboard/editor, onboarding, public hub `app/[slug]`, legal pages, pricing, checkout).

What remains:

| Existing piece | Status under Dobara |
|---|---|
| `app/layout.tsx`, `app/globals.css` (design tokens), `app/page.tsx` (placeholder), `app/sign-in`, `app/sign-up`, `components/ui/*` (shadcn primitives) | Kept as the base for the new UI |
| Clerk auth, `proxy.ts`, Clerk webhook `app/api/webhooks/clerk`, `lib/provisioning.ts` | Reuse; extend for Clerk Organizations (owner/staff) |
| Supabase clients (`lib/supabase/*`), schema + RLS pattern, `private.is_agency_admin()` | Reuse; new tables follow the same pattern scoped by business |
| Branding data (`pages` theme/fonts/colours/logo/background columns, `lib/themes.ts`, `lib/fonts.ts`, `lib/storage.ts`) | Reuse for the scan page (§7.2 "reuses Locallify Scan branding"); the editor UI was deleted |
| `scans` table | Reuse for `qr_scanned` (§7.1) |
| `qr-code-styling`, `framer-motion` (installed) | Available for the rebuild |
| `lib/site.ts` | Demo WhatsApp number (+91 9707370886) and `whatsappLink()` |
| Order Printed QR / Razorpay API (`app/api/create-order`, `app/api/verify-payment`, `orders` table) | **Parked** (its UI was deleted). Don't extend or delete without asking |
| `app/api/og-metadata`, `lib/link-types.tsx`, `vertical_templates` table | Leftovers from link-in-bio; unused. Don't extend without asking |

---

# 2. Workflow

For every implementation request:

1. Read `AGENTS.md`.
2. Read `PRD.md` for the feature's intended behaviour.
3. Read the skills explicitly mentioned by the user.
4. Read clearly needed supporting skills from the approved skill list.
5. Inspect relevant code.
6. Ask a focused question only if the task has meaningful ambiguity (check Open decisions first — many likely ambiguities are already listed there).
7. Create a detailed prompt file in `prompts/`.
8. Ask: `I prepared the implementation prompt at prompts/<file-name>.md. Is this good to execute?`
9. Implement only after user approval.
10. Run available checks.
11. Share exact steps to test or run the completed feature.

Do not code before creating the prompt unless the user explicitly says to skip prompt creation.

---

# 3. Skills

Use only these skills:

- `.agents/skills/clerk` — routes to the specific Clerk skill needed (setup, Next.js patterns, **organizations** for owner/staff roles, webhooks, custom UI, CLI, backend API)
- `.agents/skills/supabase` — schema, RLS, **Realtime**, Storage, SSR client patterns, migrations, pg_cron
- `.agents/skills/supabase-postgres-best-practices` — load before writing or changing anything that lives in Postgres: tables, columns, RLS policies, indexes, migrations, triggers, functions, cron jobs

Use them for:

- `node_modules/next/dist/docs/`: routing, server/client boundaries, route handlers and Server Actions, cookies, PWA/manifest, UI patterns for this Next.js version
- `clerk`: owner/staff/admin sign-in, Clerk Organizations (one org per business, `owner` and `staff` roles), inviting/removing staff, protecting owner/staff/admin routes
- `supabase`: Dobara schema, RLS keyed on Clerk identity + business membership, Realtime subscriptions for the Live Board and scan page, scheduled jobs

Do not invent new skills.

For the WhatsApp Cloud API, Web Push, Tailwind, shadcn/ui and `qr-code-styling`, use Meta's official docs, package docs, existing project patterns and `node_modules/next/dist/docs/`.

---

# 4. Prompt files

Prompt files live in `prompts/`. Name them after the milestone and feature, e.g.:

- `prompts/m0-whatsapp-webhook-stub.md`
- `prompts/m1-dobara-schema-and-rls.md`
- `prompts/m1-table-qr-and-scan-page.md`
- `prompts/m1-whatsapp-verify.md`
- `prompts/m1-live-board.md`
- `prompts/m2-close-visit-and-scratch-card.md`

Each prompt must include:

- goal (and which `PRD.md` section + milestone it serves)
- skills read
- existing code inspected
- decisions or assumptions
- files likely to change
- implementation requirements
- security requirements
- acceptance criteria (copy the relevant ones from `PRD.md`)
- checks to run
- exact manual test steps expected after implementation

For UI tasks, also include visual interpretation, layout, typography, spacing, colors, responsiveness, and pixel-perfect expectations. The customer scan page and the Live Board are **mobile-first on budget Android phones** — design for that first.

---

# 5. Architecture

Keep these surfaces separate:

- **Customer scan page** (`/r/[business]/t/[table]`): no login. Server-rendered, branded with the cafe's existing branding settings, < 2 s interactive on 4G, < 300 KB page weight. Creates or joins a table session and issues a verify code. Customer identity is a **signed, httpOnly device cookie** (180 days) linked to a WhatsApp-verified phone — never Clerk.
- **WhatsApp webhook** (`/api/whatsapp/webhook`): GET handles Meta verification; POST verifies `X-Hub-Signature-256` against the app secret **before** parsing anything, matches verify codes to business + table + session, handles STOP/opt-out, records delivery statuses. It runs with the service role because there is no user JWT. It must be idempotent: dedupe on `wa_message_id`.
- **Live Board (Pehchaan)**: staff (Clerk, org role `staff` or `owner`). Installable PWA, Supabase Realtime filtered by business, sound + vibration alerts, auto-reconnect, "Reconnecting…" banner, queued retrying actions. Must survive a full day with the screen on (clean up subscriptions, no leaks).
- **Owner panel**: Clerk org role `owner`. Home stats, customers, rewards settings, tables + QR cards, staff, campaigns, branding, plan & usage.
- **Locallify admin**: Clerk super-admin (the existing `agency_admin` role). Manages businesses, plans, message allowances; read-only impersonation with an audit log.
- **Scheduled jobs**: Vercel Cron or Supabase pg_cron for session expiry (3 h), prize expiry, day-10 reminders. Cron route handlers must check a shared secret.
- **Mutations**: prefer Server Actions or thin route handlers. Every staff/owner write is scoped by the caller's Clerk identity + business membership and re-checked by RLS. Never trust a client-side role check alone.

## Trust rules that are easy to get wrong

- **Prize outcomes are decided server-side** when the visit is closed (weighted draw from the owner's prize list). "Scratching" only reveals a stored result — the client never picks or submits a prize.
- **Redemption needs staff confirmation** on the Live Board. A customer-side action can never mark a prize, squad reward or campaign offer as redeemed.
- **Verify codes** are single-use, expire after 15 minutes, and are only consumed by the signature-verified webhook. One phone counts once per table session.
- **Phone masking for staff** (last 4 digits) is enforced in what the server returns (view / server-side select), not just hidden in the UI. Only owners can export customers.
- **Marketing sends** only go to opted-in customers with no `opted_out_at`, and respect the caps: 1 campaign per business per day, max 4 marketing messages per customer per month, and the business's monthly allowance. Check all of these server-side immediately before sending.
- **Anonymous scan page live updates** must not open broad anon `select` access on session/customer tables. Use Realtime Broadcast on an unguessable per-session channel, or poll a server route that returns only that device's own state.

The documented service-role exceptions are: the anonymous scan-page server path, the WhatsApp webhook, cron jobs, and the Clerk webhook — each because there is no user JWT. One more narrow exception: `lib/provisioning.ts` (`provisionSignedInUser`) creates a signed-in user's own missing `profiles` + `pages` rows from `/dashboard` / `/onboarding` when the signup webhook was missed — identity comes only from the Clerk session, never request input, and new rows are always role `user`.

Any page/server read of "my page" must filter by `owner_clerk_id = auth().userId` — never rely on RLS alone with `.single()`, because RLS lets an `agency_admin` read every page. UI-triggered code must never use the service role to bypass RLS.

---

# 6. Tech stack

Use:

- Next.js (App Router) on Vercel — this existing codebase
- Clerk — owner/staff/admin auth, Clerk Organizations for business membership and roles
- Supabase — Postgres (target region: Mumbai), RLS, Realtime, Storage (logos, backgrounds, QR card PDFs), pg_cron if chosen
- WhatsApp Cloud API (Meta) — one shared Dobara number in v1
- Web Push + PWA manifest for Live Board alerts
- Tailwind CSS, shadcn/ui
- `qr-code-styling` for per-table QR codes and print cards
- Error tracking (e.g. Sentry) — M5

Do not use:

- Supabase Auth as the identity system — Clerk handles staff/owner/admin; customers use WhatsApp + device cookie
- A separate backend server — everything runs in Next.js on Vercel (+ Supabase cron if chosen)
- Client-side-only permission checks in place of RLS
- Any POS/billing integration, points system, or customer login (`PRD.md` §3)
- Per-cafe WhatsApp numbers / Embedded Signup (v2)

---

# 7. Data model

The authoritative descriptive model is `PRD.md` §10. Dobara adds these tables, all scoped by `business_id` and protected by RLS so one business can never read another's data:

- `tables` — code (e.g. "T4", unique per business), label, qr_slug, is_active
- `customers` — one row per phone per business: phone_e164, name, birthday, language, opted_in, opted_in_at, opted_out_at, notes, visit_count, last_visit_at; unique (business_id, phone_e164)
- `table_sessions` — table_id, declared_size, status (open/billing/closed/expired), bill_amount, opened_at, closed_at, closed_by
- `session_members` — session_id, customer_id (nullable until verified), device_id, verify_code, verify_expires_at, verified_at; unique (session_id, customer_id)
- `squad_rewards` — session_id (unique), reward_text, unlocked_at, served_at
- `reward_settings` — squad_enabled, squad_reward_text, squad_min_size, scratch_enabled, scratch_min_bill, prize_validity_days, reminder_enabled, prizes (jsonb `[{label, weight}]`)
- `prizes` — customer_id, session_id, label, code, status (unscratched/active/redeemed/expired), valid_from, valid_until, redeemed_at, redeemed_by
- `campaigns` — offer_text, audience (jsonb), valid_until, est_cost, sent/delivered/read/redeemed counts, created_by
- `message_log` — customer_id, direction (in/out), category (service/utility/marketing/authentication), template_name, wa_message_id (unique, for idempotency), status, cost_inr
- `business_plans` — plan, monthly_message_allowance, extra_message_price, period_start

Indexes required: `customers(business_id, phone_e164)`, `table_sessions(business_id, status)`, `prizes(customer_id, status)`, `message_log(business_id, created_at)`, plus an index on every foreign key.

Existing tables still in the schema (`supabase/schema.sql`): `agencies`, `profiles`, `pages` (branding lives here), `links`, `scans`, `orders` (parked), `vertical_templates` (parked), `whatsapp_webhook_events` (M0 raw webhook inbox, deduped on `wa_message_id`; service role only).

**`business_id` = `public.pages.id`** (decided 2026-11-16). `pages.clerk_org_id` links a cafe to its Clerk Organization; `org:admin` = Owner, `org:member` = Staff. RLS reads the **active org** from the Clerk JWT (v2 `o.id`/`o.rol`, v1 `org_id`/`org_role`) via `private.current_business_id()` / `private.jwt_org_role()`. PRD's `tables.qr_slug` is dropped — QR URLs use `pages.slug` + `tables.code`. M1 tables (migration `0010`): `tables`, `customers`, `table_sessions`, `session_members`, `message_log`, plus `scans.table_id`. Staff read customers only through `public.live_board_feed()` (masked phone) and write notes through `public.set_customer_note()`. Row types: `lib/supabase/dobara-types.ts`. Migration `0011` adds `session_members.wants_offers` (offers tick, copied to `customers.opted_in` only after WhatsApp verification) and `session_members.ip_hash` (hashed IP for rate limiting). Migration `0012` adds `public.verify_member_code()` (atomic code match → customer upsert → member verified → visit counted once per session) and `public.record_visit()`, both service-role only.

Migrations go in `supabase/migrations/NNNN_name.sql` (next is `0013`), and `supabase/schema.sql` is kept in sync. Whenever a field is added or changed, keep the schema, the types, this section and `PRD.md` §10 in sync.

---

# 8. Roles and permissions

| Role | Auth | Can do |
|---|---|---|
| Customer | None (WhatsApp-verified phone + signed device cookie) | Scan, join a table session, verify, see own squad progress / prizes, scratch own prize |
| Staff | Clerk, org role `staff` | Live Board: see open tables and scanning customers (phones masked), add notes, set squad size, close visit with bill amount, redeem prizes, mark squad reward served. No owner settings, no exports |
| Owner | Clerk, org role `owner` | Everything staff can do in their business + rewards settings, tables & QR cards, customers (unmasked) & export, staff invite/remove, campaigns, branding, plan & usage |
| Locallify admin | Clerk, `agency_admin` (super-admin) | Create/manage businesses, assign plans and message allowances, view message usage/cost per business, read-only impersonation with audit log |

Isolation is enforced in RLS, not just the UI. Staff and owners can only ever touch their own business. Admin access to another business's data must be audit-logged.

---

# 9. WhatsApp messaging

- v1 uses **one shared number** under the Locallify Meta Business Portfolio, with the display name "Dobara by Locallify". Every message names the cafe ("Brew House: …").
- **Click-to-chat first**: the customer sends the pre-filled message (`Hi Brew House 👋 (code: T4-7KQ2)`), which opens a 24-hour service window. Welcome messages, squad progress and scratch-card links go out as **service messages** inside that window.
- Outbound messages outside the window must use approved templates (`PRD.md` §12): `dobara_prize_saved`, `dobara_prize_reminder`, `dobara_birthday`, `dobara_fill_tables`, `dobara_welcome_back`. Assume they're billed as marketing, at roughly ₹0.86–1.09 each.
- Every marketing message ends with "Reply STOP to unsubscribe". An incoming "STOP", "band karo" or "unsubscribe" sets `opted_out_at` immediately — for **every cafe** that phone is a customer of, because the shared v1 number can't tell which cafe is meant.
- "DELETE" asks for confirmation; "DELETE YES" within 10 minutes erases that phone's customer rows in every cafe and redacts it from the raw webhook inbox.
- Log every inbound and outbound message, with its cost, in `message_log`. It drives allowances and admin cost reporting.
- Opt-in on the scan page is explicit, unticked by default, and stored with a timestamp.

---

# 10. Customer scan page rules

- No login, no app download, no password.
- Under 2 s interactive on 4G and under 300 KB page weight, so keep client JS minimal.
- States: new visitor, returning visitor (cookie found: "Welcome back, Arjun 👋", pending prizes, one-tap "I'm here"), and after billing (scratch card).
- English, Hindi and Bengali. The owner picks the default and the customer can switch. All UI strings live in translation files, never hard-coded.
- Show a short privacy notice. The consent text is visible and the box is unticked by default.
- Scratch works with both touch and mouse, with a "Tap to reveal" fallback. Respect reduced motion.
- Large tap targets and readable contrast. Never convey information by colour alone.

---

# 11. Privacy

- Collect only: name, WhatsApp number, optional birthday, visit history, bill amount and staff notes.
- Data is used only by the specific cafe it was collected for. It is never shared across businesses and never sold.
- A "DELETE" message, or a request made to the cafe, deletes that customer's data within 30 days.
- The staff notes UI tells staff to record preferences only ("kam teekha"), never sensitive personal details.
- India's DPDP rules apply. Flag anything that collects new personal data.

---

# 12. Analytics events

`qr_scanned`, `session_joined`, `verify_clicked`, `verified`, `squad_size_set`, `squad_completed`, `squad_reward_served`, `visit_closed`, `scratch_issued`, `scratch_revealed`, `prize_redeemed`, `prize_expired`, `campaign_sent`, `campaign_redeemed`, `opt_out`, `live_board_alert_shown`.

Keep the raw rows and derive the owner metrics in queries: scans, verified customers, new vs returning, repeat-visit rate, prizes issued/redeemed, campaign ROI, messages used. The north-star metric is **repeat visits per cafe per month**.

---

# 13. Security, code standards, and final rule

Never expose these to browser code:

- the Supabase service role key
- the Clerk secret key
- the WhatsApp access token or app secret
- the device-cookie signing secret
- the cron secret

Also:

- Verify the Meta webhook signature on the raw body before trusting anything in it.
- Rate-limit the scan and verify endpoints per IP and per device.
- Every write that should be RLS-checked runs with the user's Clerk JWT, never with the service role from UI-triggered code.
- Audit-log admin impersonation and customer exports.

## Known gotchas

- **Clerk + Supabase:** Clerk is a third-party auth provider in Supabase, and RLS reads the Clerk user ID from `auth.jwt() ->> 'sub'`. Org membership/role claims in the Clerk session token must be confirmed against the Clerk skill before RLS policies rely on them. Realtime subscriptions from the Live Board need the Clerk token passed to the Supabase client too.
- **Anonymous paths** (scan page, WhatsApp webhook, cron) have no user JWT. Run them server-side with the service role and tight, explicit queries rather than forcing a JWT through.
- **Meta webhook retries:** Meta redelivers events, so every handler must be idempotent.

Use TypeScript. Prefer small functions, explicit types, server-only modules, and safe error handling.

Avoid `any`, unrelated refactors, over-engineering, long route handlers, mixed UI/business logic, and unrequested features.

When in doubt:

1. Keep it small.
2. Use the relevant skill.
3. Preserve server/client boundaries.
4. Ask a focused question if needed.
5. Save a prompt before coding.
6. Ask if it is good to execute.
7. Implement after confirmation.
8. Run available checks.
9. Share exact test steps.

---

# 14. Environment variables

Only `NEXT_PUBLIC_*` values may reach browser code. Everything else is server-only.

| Variable | Purpose | Exposure / status |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | client + server — configured |
| `CLERK_SECRET_KEY` | Clerk server-side key | server only — configured |
| Clerk sign-in/up route vars (written by `clerk init`) | Sign-in/sign-up route and redirect config | client + server — configured |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Svix secret for `/api/webhooks/clerk` | server only |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | client + server — configured |
| `NEXT_PUBLIC_PUBLISHABLE_KEY` | Supabase publishable key, used with RLS | client + server — configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role, for the documented anonymous/webhook/cron paths only | server only — configured |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console verification, read by `lib/seo.ts` | client + server — not yet set |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Parked Order Printed QR flow | client+server / server only |
| `WHATSAPP_ACCESS_TOKEN` | Cloud API token for sending messages | server only — configured (temporary test token; replace with System User token) |
| `WHATSAPP_PHONE_NUMBER_ID` | Sending number ID | server only — configured (Meta test number) |
| `WHATSAPP_APP_SECRET` | Verifies `X-Hub-Signature-256` | server only — configured |
| `WHATSAPP_VERIFY_TOKEN` | Meta webhook GET verification | server only — configured |
| `WHATSAPP_GRAPH_VERSION` | Graph API version for Cloud API calls (default `v27.0`) | server only — optional |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Shared Dobara number (digits only) for `wa.me` click-to-chat links | client + server — configured (Meta test number until the real number is live) |
| `DEVICE_COOKIE_SECRET` | Signs the customer device cookie (`dobara_device`) and salts IP hashes | server only — configured (≥ 32 random chars) |
| `CRON_SECRET` | Authenticates scheduled-job routes | server only — proposed, not yet set |

Names marked "proposed" are confirmed or renamed in the prompt that first uses them. Keep this table in sync.

---

# 15. Open decisions

Ask the user rather than assuming an answer to any of these:

- **Scratch cards for squads.** Does every squad member get their own scratch card, or only the bill payer? (Default: owner's choice.)
- **No-WhatsApp fallback.** Should there be a printed "prize code" fallback for customers without WhatsApp?
- **Live Board hardware.** Which budget tablet model, if any, should be recommended?
- **Message overage billing.** Prepaid credits or a post-paid invoice?
- **Default language in Silchar.** Bengali by default, or ask each owner?
- **Plan billing.** Is it manual for the pilot (the admin assigns plans) or automated? Automating it is not in M0–M5.
- **Supabase region.** Confirm the existing project is in Mumbai (`PRD.md` §13), or plan a migration.
- **Scheduled jobs.** Vercel Cron or Supabase pg_cron?

**Resolved:** `business_id` = the existing `pages` row + `clerk_org_id` (2026-11-16); owners **self-sign-up** and create their cafe (Clerk Organization) themselves — only owners and staff ever sign in (2026-11-16); the redirect domain is `scan.locallifyagency.com` (table QR codes are `scan.locallifyagency.com/r/{business_slug}/t/{table_code}`); the QR library is `qr-code-styling`; messaging uses the WhatsApp Cloud API with one shared number in v1; Dobara is the main product (decided 2026-11-16); brand structure — Locallify Scan is the QR platform, **Dobara** ("by Locallify" in small text) is the product sold to restaurants (decided 2026-11-16).

---

# 16. Commands and checks

"Run available checks" (§2 and §13) means running these from the project root and reporting the results:

- `npx tsc --noEmit` — TypeScript type check without emitting files (there's no `typecheck` script yet; add one if this becomes routine)
- `npm run lint` — ESLint (`eslint`)
- `npm run build` — Next.js production build, run only when the change could affect the build

Development and runtime:

- `npm run dev` — start the Next.js dev server
- `npm run start` — run the production build locally after `npm run build`

After implementation, run the TypeScript check and lint at minimum. Add `build` when routes, config or server modules changed. Report the exact command output, and never claim a check passed without running it.
