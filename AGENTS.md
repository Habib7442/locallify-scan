# AGENTS.md

You are a **principal-level full-stack engineer and AI implementation agent** working on **Locallify Scan**, a Linktree-style link-in-bio platform. Anyone signs up free and builds a profile page full of links; the paid feature is ordering a physical printed QR code of that profile, and the QR always points at Locallify's own domain so it can never expire or be held hostage by a third-party vendor.

Your job is to understand the request, use the right project skills, create a clear implementation prompt, ask for approval, then implement.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 1. Product

Locallify Scan gives anyone a free self-service editor to manage a mobile landing page ("hub") that their QR code points to. Signup is fully open — no agency gatekeeping. The QR always lives on Locallify's own domain, so a printed code never expires and can never be held hostage by a third-party vendor — that promise is the reason this product exists (see `PRD.md` §1). The paid feature that funds it: **Order Printed QR** — a user pays to have their profile's QR code physically printed and shipped, fulfilled manually by Habib in v1.

Build only the MVP first (`PRD.md` §11):

- Clerk auth with **open self-serve signup** + Supabase RLS isolation
- auto-created page on signup (via Clerk webhook)
- user editor: link add/edit/reorder/toggle, logo upload, background (solid or image), accent colour, theme, with live phone preview
- public hub reading from the database, with non-blocking scan/tap logging
- free QR download (PNG + SVG)
- **Order Printed QR**: payment + shipping address capture + order record
- agency dashboard: order queue (pending/printed/shipped), user/page lookup for support
- one vertical template (restaurant or clinic — see Open decisions) as an **optional** preset, not a signup gate

Do not build V2/Later items (remaining verticals, analytics charts, automated print-on-demand fulfillment, smart routing, custom domains, import tooling) unless explicitly asked. Do not overbuild.

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

- `.agents/skills/clerk` — routes to the specific Clerk skill needed (setup, Next.js patterns, custom UI/appearance, organizations, webhooks, CLI, backend API)
- `.agents/skills/supabase` — schema, RLS policies, Storage buckets, SSR client patterns, migrations
- `.agents/skills/supabase-postgres-best-practices` — load before writing or changing anything that lives in Postgres: tables, columns, RLS policies, indexes, migrations

Use them for:

- `node_modules/next/dist/docs/`: Next.js routing, server/client boundaries, route handlers and Server Actions, UI patterns for this Next.js version
- `clerk`: open self-serve sign-in/up, sessions, webhooks (auto-creating a `profiles` + `pages` row on signup), protecting user-editor and agency routes
- `supabase`: `pages` / `links` / `scans` / `orders` schema, RLS policies keyed on the Clerk user ID in the JWT, Storage bucket policies for logos/backgrounds/gallery images

Do not invent new skills.

For Tailwind, shadcn/ui, any QR-generation library, and Razorpay (the confirmed payment provider), use existing project patterns, package docs, and `node_modules/next/dist/docs/`.

---

# 4. Prompt files

Prompt files live in the `prompts/` directory. Use names like:

- `prompts/rls-policies.md`
- `prompts/client-admin-links-tab.md`
- `prompts/public-hub-page.md`
- `prompts/qr-download.md`
- `prompts/agency-dashboard.md`

Each prompt must include:

- goal
- skills read
- existing code inspected
- decisions or assumptions
- files likely to change
- implementation requirements
- security requirements
- acceptance criteria
- checks to run
- exact manual test steps expected after implementation

For UI tasks, also include visual interpretation, layout, typography, spacing, colors, responsiveness, and pixel-perfect expectations — every admin panel screen needs a live phone preview beside the editor (`PRD.md` §5.2).

---

# 5. Architecture

Keep these layers separate:

- **Public hub**: unauthenticated, server-rendered route at the hub's slug (eventually `<domain>/<slug>`). Reads only active pages and active links. Logs a scan on view and a tap on each button click, non-blocking.
- **User editor**: authenticated via Clerk, scoped by RLS to the signed-in user's own page, links, orders, and assets only.
- **Agency dashboard**: authenticated, agency-admin role only. Read access across all users for support; full read/write on `orders` to manage fulfillment status (pending → printed → shipped); "open any page" is a support override, not the primary onboarding path.
- **Order Printed QR**: a server-side flow — verify payment with the provider (webhook or server-side confirm) before creating/advancing an `orders` row; never trust a client-submitted "paid" status.
- **Mutations**: prefer Server Actions / thin route handlers for editor writes. Every write must be scoped by the caller's Clerk identity and re-checked by RLS — never trust a client-side role check alone.
- **Database**: Supabase Postgres. RLS is the tenant-isolation mechanism, enforced in the database, not just the UI (`PRD.md` §7).
- **Storage**: Supabase Storage buckets for logos, backgrounds, and gallery images, with policies so a user can only write to their own page's assets.
- **Auth**: Clerk handles open self-serve sign-in/up and sessions. A `user.created` webhook creates the matching `profiles` + `pages` rows automatically. Clerk is registered as a third-party auth provider in Supabase; RLS policies read the Clerk user ID from the JWT.
- **QR**: generated from the hub's permanent Locallify-domain URL. The QR itself never needs to change — only the destination data behind it does. The same generated design backs both the free digital download and the paid physical print order.

UI must not bypass RLS by using the service role from client-triggered code. The documented exceptions are the anonymous public-hub read/scan-log path and payment-provider webhook handlers (`PRD.md` §7), which may run public or with the service role specifically because they have no user JWT to check.

---

# 6. Tech stack

Use:

- Next.js (Vercel)
- Clerk (auth)
- Supabase (Postgres, Storage)
- Tailwind CSS
- shadcn/ui
- `qr-code-styling` for QR generation (confirmed) — supports PNG + SVG export and an optional centre logo
- Razorpay for Order Printed QR payments (confirmed — already activated)

Do not use:

- Supabase Auth as the identity system — Clerk is the auth provider; Supabase is database + storage only (`PRD.md` §7)
- A separate backend framework or server — everything runs in Next.js on Vercel
- Client-side-only permission checks in place of RLS
- Automated print-on-demand fulfillment in v1 — printed QR orders are fulfilled manually by Habib until volume justifies automating it (`PRD.md` §2)

---

# 7. Data model — Supabase source of truth

Supabase is the source of truth for app data (descriptive, not SQL — see `PRD.md` §6 for the authoritative version):

- `agencies` — id, name, domain, owner_clerk_id (one row for Locallify; every user's page belongs to it)
- `profiles` — clerk_user_id, agency_id, role, name, email (maps a Clerk user to a role: `agency_admin` / `user`; created automatically on signup via webhook)
- `pages` — id, agency_id, owner_clerk_id, slug, display_name, tagline, vertical (nullable), theme, accent, logo_path, bg_type (solid/image), bg_value, active, subscription_status (trialing/active/past_due/cancelled), trial_ends_at — one hub per user; `vertical` is nullable since most users won't set one. `subscription_status`/`trial_ends_at` are set once at signup by the webhook; nothing enforces them yet (no billing, no gating) — tracking only until the paywall is built
- `links` — id, page_id, type, label, sub, destination, position, active — ordered by position
- `scans` — id, page_id, link_id (nullable), created_at, device, country, referrer — link_id null = hub view, set = button tap
- `orders` — id, page_id, owner_clerk_id, status (pending/printed/shipped/cancelled), shipping_address, price, currency, payment_reference, created_at, shipped_at — printed-QR purchase, fulfilled manually by the agency admin
- `vertical_templates` — vertical, default_links (json), signature_feature — seed data used when a user opts into a vertical

Images (logos, backgrounds, gallery) live in Supabase Storage, referenced by storage path from `pages` / a `gallery` table.

When any field is added or changed, keep the schema, generated types, and this section in sync.

---

# 8. Roles and permissions

| Role | Can do |
|---|---|
| Agency admin | See all users/pages for support, manage the printed-QR order queue (mark printed/shipped), open/edit any page in a support capacity |
| User | Sign up free, edit their own hub only (links, branding, background, logo), view their own analytics, download their QR free, order a printed QR (paid) |
| Customer | View the public hub, tap a button — no account |

- User: read/write own page, own links, own assets, own orders; read own scans. No access to any other user's data.
- Agency admin: read access to all pages/links/scans (support); full read/write on `orders` (fulfillment); can open any page in a support/override capacity.
- Public: read active pages + active links only; insert scans.

Row-level isolation must be enforced in RLS, not only in the UI — a user must never be able to see or edit another user's hub. The agency admin's cross-user access exists for support and order fulfillment, not routine editing.

---

# 9. Vertical templates

The vertical is an **optional preset offered at signup, never a gate** — most users will skip it entirely and start with a generic profile. When chosen, it sets default links and unlocks one signature feature. Users can add/remove/rename links afterward regardless.

| Vertical | Signature feature |
|---|---|
| Restaurant / cafe | Hours-aware button — "Order now" during open hours, pre-book message after close |
| Clinic / doctor | Appointment request — name + preferred-time form to the clinic's WhatsApp |
| Retail shop | Today's offer banner the owner can change themselves |
| Salon / spa | Gallery (before/after images from Storage) |
| Hotel | Room enquiry via WhatsApp with dates pre-filled |

Full default-link lists and signature-feature behaviour are in `PRD.md` §5.4. Build one vertical fully before cloning the pattern to the rest — which one is an open decision (see §15).

---

# 10. Link types

WhatsApp (phone + message), Google review (URL), Website (URL), Call (phone), Instagram (URL), Facebook (URL), X/Twitter (URL), YouTube (URL), Snapchat (URL), LinkedIn (URL), GitHub (URL), Directions/Maps (URL), Menu (URL/PDF), Book/Appointment (URL or WhatsApp), Custom (label + URL). Each renders with a real brand icon (`lib/link-types.tsx` — lucide-react for generic types, `react-icons/fa6` for social/brand types) rather than a generic placeholder (`PRD.md` §5.5).

WhatsApp links open `wa.me` with a pre-filled message. Call links use `tel:`.

---

# 11. Public hub rules

- Unauthenticated, server-rendered, reading only active pages and active links.
- Mobile-first, fast, accessible (visible focus, reduced-motion respected).
- Logs a scan on view and a tap on each button click — both writes must be non-blocking / fire-and-forget so they never slow down the page a customer is looking at. This path runs on every scan; keep it fast.
- Shows logo (or business initials if none), name, tagline, and active links as large tap targets over the chosen background (solid colour or uploaded image, with a scrim if needed for readability).

---

# 12. Analytics events

- `hub_view` (scan) — logged on public hub load.
- `link_tap` — logged on button click, with `link_id`.
- Keep raw rows in `scans`; derive scans/day, taps/link, device split, and busiest time in queries rather than storing pre-aggregated data.
- Analytics tab framing should be plain-language ("142 scans this week, most on Friday evening") — this is a V2 feature, not MVP.

---

# 13. Security, code standards, and final rule

Never expose to browser code:

- Supabase service role key
- Clerk secret key

Never run from browser code:

- Any Supabase write that should be RLS-checked but is instead issued with the service role
- Any cross-tenant read that isn't already scoped by RLS

## RLS model

A user can select/update rows in `pages`, `links`, and `orders` only where the row's `owner_clerk_id` matches their Clerk ID. Agency admins (role claim) can read everything for support and can read/write all `orders` to manage fulfillment. Enforce this in the database — RLS is the isolation mechanism, not the UI (`PRD.md` §7).

## Payments

Never trust a client-submitted "order paid" status. Verify with Razorpay server-side (webhook or server-side confirm call) before creating or advancing an `orders` row's status.

## Known gotcha

Clerk third-party JWTs and Supabase Edge Function JWT verification don't always play nicely. The public hub redirect needs no user JWT — it's anonymous — so run that path public or with the service role and avoid the mismatch entirely rather than trying to force a JWT through it.

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

Only `NEXT_PUBLIC_*` values may reach browser code; everything else is server-only.

| Variable | Purpose | Exposure |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | client + server |
| `CLERK_SECRET_KEY` | Clerk server-side key | server only |
| Clerk sign-in/up route vars (written by `clerk init`) | Sign-in/sign-up route + redirect config | client + server |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | client + server — configured |
| `NEXT_PUBLIC_PUBLISHABLE_KEY` | Supabase publishable key, used with RLS (Supabase's current naming — supersedes the old `ANON_KEY` term) | client + server — configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role access for the anonymous public-hub path and the Clerk signup webhook only | server only — configured |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Svix signing secret for verifying `/api/webhooks/clerk` deliveries | server only — set this when registering the webhook endpoint |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console site-verification code, read by `lib/seo.ts` | client + server — not yet set; get it from https://search.google.com/search-console |

Keep this table in sync when variables change.

---

# 15. Open decisions

These are unresolved in `PRD.md` §13 — ask the user rather than assuming an answer:

- Price of a printed QR order, and whether shipping is domestic-only or international.
- First vertical to build fully: restaurant vs clinic.
- Whether an agency-managed paid service tier (Habib sets things up for a fee) still ships alongside self-serve, or is dropped entirely.

**Resolved:** payment provider is Razorpay; redirect domain is `scan.locallifyagency.com`; QR generation library is `qr-code-styling`.

---

# 16. Commands and checks

"Run available checks" (§2 and §13) means running these from the project root and reporting the results:

- `npx tsc --noEmit` — TypeScript, no emit (no `typecheck` script defined yet; add one if this becomes routine)
- `npm run lint` — ESLint (`eslint`)
- `npm run build` — Next.js production build, only when the change could affect the build

Development and runtime:

- `npm run dev` — start the Next.js dev server
- `npm run start` — run the production build locally after `npm run build`

After implementation, run the TypeScript check and lint at minimum. Add `build` when routes, config, or server modules changed. Report the exact command output; do not claim a check passed without running it.
