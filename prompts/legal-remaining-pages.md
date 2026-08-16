# Prompt: Remaining legal pages (Terms, Shipping, Refunds, Contact)

## Goal

Build the four remaining pages Razorpay requires to approve
`scan.locallifyagency.com` as an additional business website (confirmed via
their docs: Terms & Conditions, Privacy Policy ✅ already live, Shipping
Policy, Cancellation & Refunds, Contact Us). Same route group and pattern as
`app/(legal)/privacy-policy/page.tsx`, built earlier this session and
already approved.

## Skills read

None new — same as the Privacy Policy prompt (no Clerk/Supabase/RLS
surface; static content pages only).

## Existing code inspected

- `app/(legal)/privacy-policy/page.tsx` — the established pattern: `Navbar`
  + `Footer` chrome, `pt-40 sm:pt-52` top clearance for the floating nav,
  `max-w-3xl` reading column, a local `Section` helper component, dark
  theme tokens (`text-white` headings, `text-[#a1a1aa]` body — note: body
  color here is actually `#a1a1aa`, slightly lighter than the
  `#7a7a83` used elsewhere on the landing page; reuse the exact
  `Section` component so all legal pages stay visually consistent with
  each other, not necessarily with the landing page's own muted tone).
- `components/landing/Footer.tsx` — already links to `/privacy-policy`;
  will extend to link to all four new pages too.
- Contact details confirmed this session: business name **Locallify
  Scan**, support email **hello@locallifyagency.com**, WhatsApp
  **+91 6000163450** (from locallifyagency.com's live site), general
  location **Silchar, Assam, India** (no formal street address available).
- `AGENTS.md` §15 open decisions — **printed QR price and
  domestic-vs-international shipping scope are still unresolved.** These
  pages need to say something concrete, so see placeholders below rather
  than guessing a real commitment.

## Decisions / assumptions

- **Routes**: `app/(legal)/terms/page.tsx`, `app/(legal)/shipping-policy/page.tsx`,
  `app/(legal)/refund-policy/page.tsx`, `app/(legal)/contact-us/page.tsx` →
  `/terms`, `/shipping-policy`, `/refund-policy`, `/contact-us`.
- **Shipping scope placeholder**: since domestic-vs-international is an
  open PRD decision, the Shipping Policy will default to **"we currently
  ship within India only"** (safest, smallest commitment, matches the
  business being India-based) with an inline note that this is the current
  default, easy to broaden later once you decide.
- **Fulfillment timeline placeholder**: `AGENTS.md` confirms printed QR
  orders are fulfilled manually by Habib in v1, but no turnaround time is
  decided. Will state **"typically dispatched within 7–10 business days
  after payment confirmation"** as a clearly-editable placeholder, not a
  committed SLA.
- **Refund policy for printed QR**: no refund policy has been decided
  either. Will use an industry-standard default for custom-printed goods —
  **full refund if cancelled before printing starts, no refund once
  printing has begun** — flagged as a default you should confirm, not a
  locked decision.
- **Subscription terms in the Terms & Conditions page**: the
  trial→subscription model discussed this session (7-day trial, card
  required, monthly charge) is **not implemented in code yet** and pricing/
  tier structure isn't finalized. The Terms page will describe the
  mechanism generically (trial period, then recurring billing at the price
  shown at signup, cancel anytime) **without hardcoding a price or tier
  names**, so this page doesn't lock in numbers before that decision is
  made. Will revisit this section once the subscription feature itself is
  built.
- Reuse the exact `Section` helper pattern from `privacy-policy/page.tsx`
  on every new page for visual consistency.

## Files likely to change

- `app/(legal)/terms/page.tsx` — new.
- `app/(legal)/shipping-policy/page.tsx` — new.
- `app/(legal)/refund-policy/page.tsx` — new.
- `app/(legal)/contact-us/page.tsx` — new.
- `components/landing/Footer.tsx` — modify. Add links to all four new
  pages alongside the existing Privacy Policy link.

## Implementation requirements

**Terms & Conditions** (`/terms`): overview of the service (free hub
builder + optional printed QR purchase + subscription trial mechanism),
eligibility (18+), account responsibilities, acceptable use (no illegal
content on hubs), the public-visibility fact (same as Privacy Policy),
intellectual property (you own your content; we own the platform), the
trial/subscription mechanism described generically as above, printed QR
orders reference the Refund/Shipping policies, limitation of liability,
governing law (India), changes to terms, contact.

**Shipping & Delivery Policy** (`/shipping-policy`): scope (physical
printed QR orders only — the free digital hub/QR has nothing to ship),
India-only placeholder, manual fulfillment by Locallify, the 7–10 business
day placeholder turnaround, how order status is communicated (currently
manual — no tracking/notification system built yet, be honest about that),
what to do if an order doesn't arrive, contact for shipping questions.

**Cancellation & Refunds Policy** (`/refund-policy`): two sections —
printed QR orders (cancel-before-printing = full refund, no refund after
printing starts, defective/damaged-on-arrival replacement promise), and
subscription (cancel anytime, effective end of current billing period, no
partial-period refunds — standard SaaS default, described generically
without hardcoding price).

**Contact Us** (`/contact-us`): business name, support email (mailto
link), WhatsApp link (`https://wa.me/916000163450`), general location,
and for which topics to use which channel (support/general → email,
quick questions → WhatsApp).

Styling: identical structure to `privacy-policy/page.tsx` — `Navbar` +
`Footer`, `Section` helper, `pt-40 sm:pt-52 pb-24 px-4`, `max-w-3xl`
reading column, "Last updated" date computed at request time.

**Footer**: add all five legal links (existing Privacy Policy + four new)
in a small row, wrapping on mobile, styled like the existing Privacy
Policy link.

## Security requirements

None — static public content, no data mutation, no secrets.

## Acceptance criteria

- All four routes render with `Navbar` + `Footer`, dark theme, no
  horizontal overflow at 390px width.
- Footer links to all five legal pages.
- Every placeholder (pricing, shipping scope, refund window, turnaround
  time) is worded so it's obviously a default to confirm, not stated as a
  locked commitment.
- `npx tsc --noEmit` and `npm run lint` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Exact manual test steps

1. `npm run dev`, visit `/terms`, `/shipping-policy`, `/refund-policy`,
   `/contact-us`.
2. Confirm Navbar/Footer render identically to Privacy Policy and the
   landing page.
3. Confirm Footer now links to all five legal pages from any page.
4. Resize to 390px width, confirm no horizontal scroll.
5. Before registering `scan.locallifyagency.com` as an additional Razorpay
   website, review and firm up the placeholders (shipping scope, refund
   window, fulfillment turnaround) with real decisions.
