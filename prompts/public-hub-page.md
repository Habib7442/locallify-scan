# Prompt: Public hub page (SEO/Google-discoverable)

## Goal

Build the actual public hub page — `<domain>/<slug>` — per `PRD.md` §5.3.
This doesn't exist yet; everything built so far (onboarding, pricing,
landing, legal pages) is either marketing or the private setup flow. This
is core MVP scope, not a new feature.

**Explicit goal confirmed with the user**: if someone searches Google for
a business that has a Locallify Scan hub, that hub page should be
findable and indexable — not just reachable by scanning a QR code. That
requires:
- Real server-rendered content (name, tagline, links) that Google's
  crawler can read directly — no client-only rendering hiding the text.
- A sitemap so Google discovers these pages exist in the first place.
- Correct per-page metadata (title/description) and JSON-LD structured
  data (`LocalBusiness`) so Google understands what the page is, not just
  that it's text.
- An Open Graph image per hub, so shared links (WhatsApp, social) render
  a proper preview card — this also indirectly helps click-through from
  search/social.

## Skills read

- `supabase` — anonymous/public read path (documented exception to RLS
  being user-scoped: this route runs with no Clerk session, relying on
  the `anon`-role RLS policies already in place: `pages_select_public`
  and `links_select_public`, both scoped to `active = true`).
- `node_modules/next/dist/docs/` — App Router metadata API
  (`generateMetadata`), the `opengraph-image` file convention (`next/og`
  `ImageResponse`), and `sitemap.ts`/`robots.ts` file conventions for this
  Next.js version.

## Existing code inspected

- `supabase/schema.sql` — `pages_select_public` (anon, `active = true`)
  and `links_select_public` (anon, `active = true` AND parent page
  active) already exist and are exactly what this route needs — no new
  RLS policies required.
- `lib/supabase/server.ts` — `createServerSupabaseClient()` calls
  `(await auth()).getToken()` as its `accessToken`. For an anonymous
  visitor this resolves to `null`, which makes the underlying client fall
  back to the anon/publishable key — i.e. this same helper already works
  for anonymous reads, no new client needed.
- Checked current data directly: 2 real `pages` rows exist (`locallify`,
  `habib-tanwir`), both with `tagline: null`, `logo_path: null`,
  `accent: null`, `bg_type: "solid"` — the page must render sensibly with
  all-defaults data (initials instead of a logo, no tagline line, etc.),
  since that's the realistic current state for early users.
- `links` table is currently **empty** — nobody has gone through a real
  Links-editing flow yet (that tab doesn't exist), and the one vertical-
  seeding path (in `app/onboarding/actions.ts`) only fires when a user
  actually saves with a vertical selected, which hasn't happened for the
  two existing test pages. The page must render a sensible empty state
  (no links yet) rather than assuming links always exist.
- Existing seeded `links` (when a vertical was picked) have `destination:
  ""` — placeholder, since there's no Links tab yet to set real
  destinations. Buttons with an empty destination should not render as
  broken/dead links; render them but skip wiring `href` if destination is
  empty (out of scope to build the Links editor here — that's a separate
  future prompt).

## Decisions / assumptions

- **Route**: `app/[slug]/page.tsx`, fully public, no Clerk protection
  (`proxy.ts`'s current `isProtectedRoute` only matches `/onboarding`, so
  no change needed there).
- **Data fetching**: `createServerSupabaseClient()` (RLS-scoped, works
  anonymously as established above) — `.eq("slug", params.slug).eq("active", true).single()`
  for the page, explicit `active = true` filters even though RLS already
  enforces it, for clarity and to get a clean "not found" path. `links`
  query filtered `active = true`, ordered by `position`.
- **Not found**: unknown or inactive slug → Next.js `notFound()` → real
  404, not a client-side error state (matters for SEO — a fake 200 page
  with "not found" text is bad practice; Google should see a real 404).
- **`generateMetadata`**: per-page `title` (business display name, falling
  back to the slug if no display name set), `description` (tagline,
  falling back to a generic "Business links and contact — powered by
  Locallify Scan" so pages without a tagline yet still get *something*
  indexable rather than an empty description), canonical URL pointing at
  `https://scan.locallifyagency.com/<slug>`.
- **OG image**: `app/[slug]/opengraph-image.tsx` using `ImageResponse`
  from `next/og` — dynamically renders the business name + tagline +
  logo (if set) or initials, on the page's accent/background color.
  Auto-wired into metadata by the file convention, no manual `<meta
  property="og:image">` needed.
- **JSON-LD**: `LocalBusiness` schema (`name`, `description`, `url`) via a
  `<script type="application/ld+json">` in the page itself — no separate
  library needed, just a typed object serialized inline.
- **Sitemap**: `app/sitemap.ts` — queries all `active = true` pages via
  the **admin client** (this is a build-time/request-time enumeration of
  every public slug across all users, not a single-user request — it's
  explicitly analogous to the anon public-hub read path already
  documented as a service-role exception in `AGENTS.md` §13, since a
  sitemap has no natural RLS "own row" scope to run under).
- **`robots.ts`**: allow crawling of hub pages (`/[slug]`) and marketing/
  legal pages; disallow `/onboarding` and `/api/*`.
- **Scan logging**: log a `hub_view` scan (page_id, link_id = null,
  device/referrer from request headers) on every page load — **non-
  blocking**, per `AGENTS.md` §11/§13 ("this path runs on every scan, keep
  it fast"). Implemented as a fire-and-forget insert (not awaited before
  responding) using the admin client (anonymous write path, matches the
  documented service-role exception for scan logging).
- **Link tap logging**: out of scope for this prompt — meaningful tap
  logging needs a real `destination` to navigate to, and the Links editor
  (which sets real destinations) doesn't exist yet. Rendering links now
  without tap-tracking wiring, to be added when the Links tab ships.
- **Rendering**: server-rendered content only for the core text (name,
  tagline, link labels) — no client component wrapping the primary
  content, so Google's crawler (and any GEO/AI answer engine crawler)
  sees real HTML on first response, not JS-rendered-only text. A logo
  falls back to business initials per `PRD.md` §11 if `logo_path` is
  unset (true for both current test pages).
- **Background**: solid color only for this pass (`bg_type: "image"`
  rendering + Storage-backed backgrounds is part of the Branding/editor
  prompt, not built yet — both current pages are `bg_type: "solid"`
  anyway).

## Files likely to change

- `app/[slug]/page.tsx` — new. Server Component, `generateMetadata`,
  `notFound()` handling, JSON-LD, non-blocking scan log.
- `app/[slug]/opengraph-image.tsx` — new. Dynamic per-hub OG image.
- `app/sitemap.ts` — new. Enumerates all active hub slugs + the static
  marketing/legal pages.
- `app/robots.ts` — new.

## Implementation requirements

**`app/[slug]/page.tsx`**
- `generateMetadata({ params })`: fetch the page row, return
  `title`/`description`/`alternates.canonical` as above; return a generic
  "not found" metadata object if the page doesn't exist (don't throw
  before Next.js's own 404 handling takes over).
- Main render: logo (or initials avatar), display name, tagline (if set),
  list of active links as large tap targets (WhatsApp → `wa.me`, Call →
  `tel:`, others → `destination` href, skip `href` if destination is
  empty), over the page's `bg_value` (solid color for this pass).
  Mobile-first, large tap targets, visible focus states, respects
  `prefers-reduced-motion`.
- JSON-LD `LocalBusiness` block with the page's real data.
- Non-blocking `hub_view` scan insert: call the admin client's insert
  without `await`-blocking the response (fire it, catch/log errors, don't
  let it affect render timing).

**`app/[slug]/opengraph-image.tsx`**
- `ImageResponse` (1200×630), business name + tagline text, logo image if
  set, otherwise an initials badge, using the page's `accent`/`bg_value`
  colors, falling back to the site's `#54e0ff`/`#18181a` defaults when
  unset (true for both current pages).

**`app/sitemap.ts`**
- Static entries: `/`, `/pricing`, `/privacy-policy`, `/terms`,
  `/shipping-policy`, `/refund-policy`, `/contact-us`.
- Dynamic entries: one per `active = true` page, `https://scan.locallifyagency.com/<slug>`.

**`app/robots.ts`**
- Allow: `/`, `/[slug]` pages, marketing/legal pages.
- Disallow: `/onboarding`, `/api/*`, `/sign-in`, `/sign-up`.
- Reference the sitemap.

## Security requirements

- No RLS changes — reuses existing `anon`-scoped policies exactly as
  designed.
- Sitemap generation uses the admin client since it legitimately needs to
  enumerate across all users' public pages, not a single owner's row —
  consistent with the one other documented service-role exception
  (anonymous public-hub path). Read-only, no write capability exposed.
- Scan-log insert uses the admin client for the same reason the webhook
  does: no user JWT exists on this anonymous path.

## Acceptance criteria

- Visiting `/locallify` or `/habib-tanwir` renders the real page (name,
  fallback-initials avatar, no tagline line since both are null, no links
  since the table is empty — a sensible empty state, not an error).
- Visiting an unknown slug (`/does-not-exist`) returns a real 404.
- Visiting an inactive page's slug also returns a real 404 (not a "this
  page is deactivated" 200 — matches the RLS boundary).
- `view-source` (or equivalent) on a hub page shows the business name and
  tagline as real text in the initial HTML response, not only after JS
  runs.
- `/sitemap.xml` lists both current active hub slugs plus the static
  pages.
- `/robots.txt` allows hub pages, disallows `/onboarding` and `/api`.
- Sharing a hub URL (e.g. pasting into a chat app that unfurls links)
  shows a generated OG image with the business name.
- A scan row appears in the `scans` table after visiting a hub page, with
  `link_id` null.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. `npm run dev`, visit `http://localhost:3000/locallify` — confirm it
   renders (name "Locallify", initials avatar, no tagline/links shown).
2. Visit `http://localhost:3000/does-not-exist` — confirm a real 404.
3. View page source (not devtools-rendered DOM) on `/locallify` — confirm
   the business name appears in the raw HTML.
4. Visit `http://localhost:3000/sitemap.xml` — confirm both hub slugs and
   the static pages are listed.
5. Visit `http://localhost:3000/robots.txt` — confirm the expected allow/
   disallow rules.
6. Visit `http://localhost:3000/locallify/opengraph-image` directly (or
   use a social-preview debugger against a public tunnel) — confirm an
   image renders with the business name.
7. Check the `scans` table directly — confirm a new row was added for the
   `/locallify` visit with `link_id` null.
8. In Supabase, set the `habib-tanwir` page's `active` to `false`, revisit
   `/habib-tanwir` — confirm it now 404s.
