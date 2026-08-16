# PRD — Locallify Scan

A Linktree-style link-in-bio platform: anyone signs up free and builds a profile
page full of links. The one thing that makes it different — a user can order a
**physical printed QR code** of their profile, and the code always points at
Locallify's own domain, so it can never expire or be held hostage by a vendor.

**Owner:** Habib Tanwir (Locallify)
**Status:** Draft v2 — pivoted from an agency-provisioned model to open self-serve signup + paid printed-QR ordering
**Stack:** Next.js (Vercel) · Clerk (auth) · Supabase (Postgres, Storage, Edge Functions)

---

## 1. Why this exists

Local businesses buy "multi-link" QR codes from third-party tools, print them on
standees, menus, and cards — and then get charged a renewal fee to keep the code
alive, or the code is deactivated mid-use. The printed code points at the vendor's
domain, so the business is locked in. This happened to a real Locallify client
(a ₹2,000 demand after a free trial expired on an already-printed code).

The core promise of this product is the opposite: **the redirect lives on
Locallify's own domain, so a printed code works forever.** Everything else is
built around that trust position.

## 2. Goals and non-goals

**Goals**
- Free, self-serve signup — anyone builds their own link-in-bio profile immediately, no gatekeeping.
- A self-service editor for links, branding, background, accent colour, and theme, with a live preview.
- **Order Printed QR**: a paid feature — a user pays to have their profile's QR code physically printed and shipped to them by Locallify.
- Optional business-type presets (restaurant, clinic, retail, salon, hotel) so a business profile can start with relevant default links — available, not required.
- Track scans and per-button taps, shown in plain language.
- Free in-app QR download (PNG + SVG) for anyone, regardless of whether they order a physical print.

**Non-goals (for now)**
- Not integrated with Lumi. This is a standalone product.
- No advanced conditional routing engine beyond the per-vertical signature behaviours (device/geo routing is a later consideration).
- No automated print-on-demand fulfillment in v1 — printed QR orders are fulfilled manually by Habib (see §5.4, §11).

## 3. Roles

| Role | Who | Can do |
|---|---|---|
| Agency admin | Habib / Locallify | Sees all users and pages, manages the printed-QR order queue (mark printed/shipped), can open/edit any page if support is needed |
| User | Anyone who signs up | Log in, edit their own page only: links, branding, background, logo; view their own analytics; download their QR free; order a printed QR (paid) |
| Customer | The person scanning | Sees the public hub; taps a button; no account |

Row-level isolation is enforced so a user can only ever see and edit their own page — the agency admin is the only role with cross-user access, and that access exists for support/fulfillment, not routine editing.

## 4. Core concepts

- **Hub (page):** one per user — the mobile landing page the QR points to
  (`<domain>/<slug>`). Holds branding + a list of links. Created automatically on signup.
- **Link:** a button on the hub (WhatsApp, Google review, website, call, etc.),
  with a label, optional sub-text, a destination, an order, and an active toggle.
- **Vertical (optional):** a business-type preset a user can pick at signup or later. Decides a starter set of links and, for some verticals, a signature feature. Skippable — a generic profile needs no vertical.
- **QR:** a code that encodes the hub's URL. Because the URL is on Locallify's
  domain, the QR is permanent; the destination behind it is editable anytime.
  Free to download digitally (PNG/SVG); a **physical printed copy is a separate, paid order**.
- **Order (printed QR):** a purchase record — a user pays for a physical printed
  QR code of their hub, submits a shipping address, and Locallify fulfills it manually.
- **Scan / tap:** a scan is a hub view; a tap is a button click. Both are logged
  for analytics.

## 5. Features

### 5.1 Signup & onboarding
- Public, self-serve signup (Clerk). No invitation or agency approval needed.
- On first login, a page/hub is created automatically for the user.
- Vertical selection is offered but optional — skipping starts with an empty/generic link set.

### 5.2 User editor (the "admin panel" for your own page)
Three main tabs plus settings, with a **live phone preview** beside the editor
that updates as changes are made.

**Links tab**
- Add, edit, delete, reorder (up/down), and toggle links on/off.
- Each link has: type, label, sub-text (optional), destination, active state.
- Reordering changes the order shown on the public hub.

**Branding / appearance** (can live in Links tab header or its own tab)
- **Logo upload** (stored in Supabase Storage; shown at the top of the hub).
  Falls back to initials if none.
- **Background:** choose **solid colour** (colour picker) **or an uploaded image**
  (stored in Storage; sensible overlay/scrim applied so text stays readable).
- **Accent colour** (used on button icons / highlights).
- **Theme:** light or dark.
- **Display name + tagline.**

**Analytics tab**
- Total scans, scans this week, top button.
- Scans over the last 14/30 days (line/area chart).
- Taps per button (bar chart).
- Device split (mobile / tablet / desktop).
- Plain-language framing ("142 scans this week, most on Friday evening").

**Share & QR tab**
- The hub's public URL, with a copy-link button.
- A free downloadable QR (PNG + SVG), optionally with the user's logo in the centre.
- **"Order Printed QR" CTA** — starts the paid physical-print flow (§5.4).
- A visible reassurance that the code lives on Locallify's own domain and won't expire.

**Settings**
- Slug (user-editable; changing it should warn that an already-printed physical QR would need reordering to match).
- Theme, delete/deactivate account.

### 5.3 Public hub page
- Server-rendered from the user's data at `<domain>/<slug>`.
- Shows logo, name, tagline, and the active links as large tap targets, over the
  chosen background (solid or image).
- Mobile-first; fast; accessible (visible focus, reduced-motion respected).
- Logs a scan on view and a tap on each button click (non-blocking).
- WhatsApp links open `wa.me` with a pre-filled message; call links use `tel:`.

### 5.4 Order Printed QR (new — paid feature)
- From the Share & QR tab, a user starts an order: confirms the QR design, pays
  (payment provider **not yet decided** — see §13), and submits a shipping address.
- Order is created with status `pending`. Habib fulfills it manually: prints the
  code, ships it, then marks the order `printed` → `shipped` from the agency dashboard.
- User can see their own order status on their Share & QR tab.
- No automated print-on-demand integration in v1 (§2 non-goals) — this is manual
  fulfillment by design until volume justifies automating it.

### 5.5 Agency dashboard (Habib only)
- **Orders queue**: every printed-QR order across all users, filterable by status
  (pending / printed / shipped), with shipping address and the linked profile.
  Primary daily-use screen for the agency role now — fulfillment, not client provisioning.
- List of all users/pages (for support lookups), with the ability to open any
  page in an override/support capacity.
- Search / filter (later, once volume grows).

### 5.6 Vertical templates (optional presets)
Presets are optional at signup, not a gate. A user can start generic and add a
vertical's default links later, or never use one at all.

| Vertical | Default links | Signature feature |
|---|---|---|
| Restaurant / cafe | View menu, Order on WhatsApp, Book a table, Google review, Directions, Instagram | **Hours-aware button** — during open hours shows "Order now"; after close flips to "We open at 9am — message to pre-book" |
| Clinic / doctor | Book appointment (WhatsApp), Call clinic, Consultation hours, Location, Our services, Rate your visit | **Appointment request** — a simple name + preferred-time form that sends straight to the clinic's WhatsApp |
| Retail shop | Catalogue, Buy on WhatsApp, Today's offer, Store location, Delivery info, Instagram | **Today's offer banner** the owner can change themselves |
| Salon / spa | Book appointment, Service menu + prices, Gallery, WhatsApp, Google review | **Gallery** (before/after images from Storage) |
| Hotel | Book a room, WhatsApp reception, Amenities, Directions, Check-in/out times, Gallery | **Room enquiry** via WhatsApp with dates pre-filled |

Build one vertical fully first (restaurant or clinic — whichever reaches a paying
client fastest), then clone the pattern. Generic (no-vertical) profiles ship before or alongside it, since open signup means most users won't pick a vertical at all.

### 5.7 Link types (initial set)
WhatsApp (phone + message), Google review (URL), Website (URL), Call (phone),
Instagram (URL), Directions/Maps (URL), Menu (URL/PDF), Book/Appointment (URL or
WhatsApp), Custom (label + URL). Each renders with a type-appropriate icon.

## 6. Data model (descriptive — not SQL)

| Table | Key fields | Notes |
|---|---|---|
| `agencies` | id, name, domain, owner_clerk_id | One row for Locallify; every user's page belongs to it |
| `profiles` | clerk_user_id, agency_id, role, name, email | Maps a Clerk user to a role (`agency_admin` / `user`); created automatically on signup via webhook |
| `pages` | id, agency_id, owner_clerk_id, slug, display_name, tagline, vertical (nullable), theme, accent, logo_path, bg_type (solid/image), bg_value, active | One hub per user; `vertical` is nullable — most users won't set one |
| `links` | id, page_id, type, label, sub, destination, position, active | Ordered by position |
| `scans` | id, page_id, link_id (nullable), created_at, device, country, referrer | link_id null = hub view; set = button tap |
| `orders` | id, page_id, owner_clerk_id, status (pending/printed/shipped/cancelled), shipping_address, price, currency, payment_reference, created_at, shipped_at | Printed-QR purchase; fulfilled manually by the agency admin |
| `vertical_templates` | vertical, default_links (json), signature_feature | Seed data used when a user opts into a vertical (can be code-side instead of a table) |

Images (logos, backgrounds, gallery) live in **Supabase Storage**, with the storage
path referenced from `pages` / a `gallery` table.

## 7. Architecture

**Auth & multi-tenancy — Clerk + Supabase**
- Clerk handles open self-serve sign-in/sign-up and sessions.
- Clerk is registered as a **third-party auth provider** in Supabase. The Clerk
  session token is passed to Supabase, and **RLS policies read the Clerk user ID
  from the JWT** to scope every query.
- RLS model: a user can select/update rows in `pages`, `links`, and `orders` only
  where the row's `owner_clerk_id` matches their Clerk ID; the agency admin (role
  claim) can access everything for support and order fulfillment. Enforce this in
  the database, not just the UI.
- A Clerk webhook (`user.created`) creates the matching `profiles` row and an
  empty `pages` row automatically — signup must not require any manual step.

**Storage**
- Supabase Storage buckets for logos and background/gallery images, with policies
  so a user can only write to their own page's assets.

**Public redirect / hub + scan logging**
- The public hub route is unauthenticated (customers have no account). Render it in
  Next.js (server component) reading the page + active links.
- Scan/tap logging writes to `scans` without blocking the response (fire-and-forget
  / queued). Keep this path fast — it runs on every scan.
- If a Supabase Edge Function is used for redirect logic, note a known gotcha:
  Clerk third-party JWTs and Edge Function JWT verification don't always play nicely
  — but the public redirect needs no user JWT (it's anonymous), so run it public or
  with the service role and avoid that issue entirely.

**Payments (Order Printed QR)**
- Provider **not yet decided** — see §13. Needs to support one-time purchases and,
  given the ₹-denominated example in §1, likely wants strong India support (e.g.
  Razorpay) as well as international cards if the audience isn't India-only.
- Order creation should be a server-side action; never trust a client-submitted
  "paid" status without verifying with the payment provider (webhook or server-side confirm).

**Hosting & domain**
- Next.js on Vercel.
- A dedicated domain so every printed code sits under Locallify-owned
  infrastructure — the whole anti-hostage promise depends on owning this.

**QR generation**
- Generate client-side or server-side with a QR library; support PNG + SVG export
  and optional centre logo. Same generated design is used for both the free digital
  download and the physical print order.

## 8. Key user flows

1. **Someone signs up:** visits the site → signs up free (Clerk) → a page is
   auto-created → lands in their editor → optionally picks a vertical → adds
   links, logo, branding → publishes. No agency involvement required.
2. **User orders a printed QR:** opens Share & QR tab → clicks "Order Printed QR"
   → pays → enters shipping address → order status `pending`. Habib sees it in
   the agency dashboard's order queue, prints and ships it, marks it `shipped`.
   User sees the status update on their own Share & QR tab.
3. **Customer scans:** scans the physical code → hub loads on their phone → taps
   "Book appointment" → WhatsApp opens with a pre-filled message → scan + tap logged.

## 9. Permissions summary
- User: read/write own page, own links, own assets, own orders; read own scans. No access to any other user's data.
- Agency admin: full read access to all pages/links/scans (for support); full read/write on all `orders` (to manage fulfillment status); can open any page in a support/override capacity.
- Public: read active pages + active links only; insert scans.

## 10. Analytics events
- `hub_view` (scan) — on public hub load.
- `link_tap` — on button click, with link_id.
- Derived views: scans/day, taps/link, device split, busiest time. Keep raw rows;
  aggregate in queries.

## 11. Phased scope

**MVP**
- Clerk auth (open self-serve signup) + RLS isolation.
- Auto-created page on signup (via webhook).
- User editor: link add/edit/reorder/toggle + logo upload + background
  (solid or image) + accent + theme, with live preview.
- Public hub reading from DB + scan/tap logging.
- Free QR download (PNG + SVG).
- **Order Printed QR**: payment + shipping address capture + order record.
- Agency dashboard: order queue (pending/printed/shipped), user/page lookup for support.
- One vertical template (restaurant or clinic) as an optional preset.

**V2**
- Remaining verticals + their signature features (hours-aware button, appointment
  request, offer banner, gallery, room enquiry).
- Analytics tab (charts, device split, plain-language summaries).
- Automated print-on-demand fulfillment (replacing manual printing/shipping).

**Later**
- Optional smart routing (device/hours/geo) as per-link rules.
- "Import from other link-in-bio tools" migration.
- Custom domain per user (their own domain in front of the hub).

## 12. Business model
Free self-serve profile; revenue comes from the **Order Printed QR** one-time
purchase, fulfilled manually by Locallify. An optional agency-managed service
tier (Habib sets up/edits a page on a client's behalf for a fee) may still exist
alongside self-serve, but it's no longer the primary onboarding path.

## 13. Open decisions
- Payment provider for Order Printed QR (Razorpay vs Stripe vs other) — needs
  deciding before that feature can be built.
- Price of a printed QR order, and whether shipping is domestic-only or international.
- First vertical to build fully: restaurant vs clinic.
- Redirect domain: subdomain of the agency domain vs a short standalone domain.
- Whether an agency-managed service tier (Habib sets things up for a fee) still ships alongside self-serve, or is dropped entirely.
