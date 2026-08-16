# Prompt: Privacy Policy page

## Goal

Add a public `/privacy-policy` page. Confirmed with the user: scope for this
pass is Privacy Policy only (not Terms/Refund/Shipping — those can be
separate follow-up prompts under the same route group later), structured as
a `(legal)` route group with flat URLs, matching link4coders' `(marketing)`/
`(dashboard)` grouping convention.

## Skills read

Not a Clerk/Supabase/RLS task — no data model or auth changes. Read
`node_modules/next/dist/docs/` route-group conventions to confirm
`(legal)` behaves as a non-URL-segment grouping folder in this Next.js
version, matching what's already used implicitly by `app/page.tsx` at the
root.

## Existing code inspected

- `app/layout.tsx` — root layout: `ClerkProvider`, Hanken Grotesk font,
  forced `dark` class, no shared "marketing chrome" layout exists yet (the
  landing page composes `Navbar`/`Footer` directly inside `app/page.tsx`,
  not via a layout file).
- `components/landing/Navbar.tsx`, `components/landing/Footer.tsx` — reused
  as-is for consistent site chrome (dark theme, `#18181a` background, same
  nav/footer as the landing page).
- No `components/ui/` typography primitives exist (only `button`, `sheet`)
  — policy body text will use plain Tailwind classes matching the existing
  design tokens (`text-[#7a7a83]` body copy, `text-white` headings,
  `border-[#33373b]` dividers), not a new shadcn component.
- `PRD.md` has no existing Privacy Policy content or data-handling section
  to source from — this prompt's content is derived from the actual data
  flows described in `AGENTS.md` §7 (Clerk auth, Supabase Postgres/Storage,
  Razorpay payments, non-blocking scan/tap logging).

## Decisions / assumptions

- **Route**: `app/(legal)/privacy-policy/page.tsx` → `/privacy-policy`.
  The `(legal)` folder is a pure route group (no URL segment), so this is
  a sibling to the root `/` route, not nested under it.
- **Chrome**: reuse `Navbar` + `Footer` directly in the page (same pattern
  `app/page.tsx` already uses) rather than introducing a new layout file,
  since there's only one legal page in this pass.
- **Content accuracy**: I can accurately describe *what data flows through
  the system* (Clerk, Supabase, Razorpay, scan/tap logs) because that's
  architecture I can read from the code. I **cannot** invent your legal
  business identity — registered company name, business address, support
  email, or a grievance-officer contact are real facts only you can supply,
  and Indian payment-gateway compliance (Razorpay) generally expects a
  named grievance contact. The page will ship with clearly marked
  placeholders (e.g. `[BUSINESS_NAME]`, `[REGISTERED_ADDRESS]`,
  `[SUPPORT_EMAIL]`) for those fields — flagged here so it's not a
  surprise, not a gap I quietly filled in.
- **Effective date**: rendered as "Last updated: {current date}" computed
  at build/request time, not hardcoded.
- Not a Server Action / data-mutating page — fully static content, no
  Supabase/Clerk calls needed on this route itself.

## Files likely to change

- `app/(legal)/privacy-policy/page.tsx` — new. Static Server Component.

## Implementation requirements

Sections, in order:

1. Title + "Last updated" date.
2. **Overview** — one paragraph: Locallify Scan is a link-in-bio hub
   builder; this policy covers both hub owners (users who sign up) and
   hub visitors (the public who scan/view a hub).
3. **Information we collect**
   - From hub owners: name and email (via Clerk, on signup), profile
     content you create (links, branding, background, logo — via Supabase
     Storage/Postgres), shipping address and payment reference if you
     order a printed QR (via Razorpay).
   - From hub visitors: non-identifying scan/tap logs (device type,
     country, referrer) recorded when a public hub is viewed or a button
     is tapped — no account or personal data required to view a hub.
4. **How we use it** — operate the editor/hub, auto-create your account
   on signup, fulfill printed QR orders, show you your own scan/tap
   analytics, respond to support requests.
5. **Third parties / processors** — Clerk (authentication), Supabase
   (database + file storage), Razorpay (payment processing — Locallify
   Scan does not store your card/UPI details; Razorpay handles that
   directly). Each linked to their own privacy policy.
6. **Public visibility** — anything you add to your hub (links, business
   name, logo, background) is publicly visible to anyone who scans your
   QR or visits your hub URL, by design — this is the product.
7. **Data retention & deletion** — your profile is removed when you delete
   your Clerk account; your hub/links/order history follow (state current
   behavior accurately: per the webhook, deleting a Clerk account removes
   the `profiles` row but leaves `pages`/`orders` in place rather than
   cascading — phrase this honestly as "your hub content persists after
   account deletion" rather than promising erasure that doesn't happen,
   since AGENTS.md §13 already decided that behavior on purpose).
8. **Cookies** — Clerk session cookies for authentication; no third-party
   ad-tracking cookies.
9. **Your rights** — request access/correction/deletion by contacting
   support (placeholder email).
10. **Children's privacy** — not directed at children under 18.
11. **Changes to this policy** — will update the "Last updated" date.
12. **Contact / grievance** — `[BUSINESS_NAME]`, `[REGISTERED_ADDRESS]`,
    `[SUPPORT_EMAIL]` placeholders.

Styling: dark theme consistent with the landing page (`bg-[#18181a]`,
`text-white` headings, `text-[#7a7a83]` body, `max-w-3xl` reading column,
generous vertical spacing, `Navbar` + `Footer` top/bottom). Mobile-first,
no overflow.

## Security requirements

None beyond the site defaults — static public content, no data mutation,
no secrets involved.

## Acceptance criteria

- `/privacy-policy` renders with `Navbar` + `Footer`, dark theme, readable
  on mobile (390px) with no horizontal overflow.
- All 12 sections above present.
- Placeholder fields are visually obvious (e.g. `[BUSINESS_NAME]`) so they
  can't accidentally ship to production unedited.
- `npx tsc --noEmit` and `npm run lint` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Exact manual test steps

1. `npm run dev`, visit `http://localhost:3000/privacy-policy`.
2. Confirm Navbar/Footer render identically to the landing page.
3. Confirm all sections read correctly and placeholders are visible.
4. Resize to a 390px-wide viewport, confirm no horizontal scroll and text
   remains readable.
5. Replace the three placeholder fields with your real business details
   before this page goes live for real users/Razorpay review.
