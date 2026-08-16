# Prompt: Pricing page

## Goal

Build a public `/pricing` page showing the three confirmed tiers, and fix
the landing page copy that now directly contradicts it.

**Confirmed this session:**
- Three tiers, monthly billing only (no annual yet): **Starter ₹299/mo**,
  **Pro ₹599/mo** (recommended), **Business ₹999/mo**.
- Feature split:
  - All tiers: unlimited links, all link types, branding/theme
    customization, free QR download.
  - Pro adds: full scan/tap analytics, remove "Powered by Locallify"
    branding.
  - Business adds: vertical signature features (hours-aware button,
    appointment-request form, gallery, today's-offer banner, room
    enquiry).
- Every signup gets a 7-day free trial, **no card required upfront**
  (confirmed earlier: "we will not let user type card first... after free
  trial they will update").
- Order Printed QR remains a separate one-time purchase, independent of
  subscription tier.

**Not in scope for this prompt** (no billing/checkout exists yet):
- Actual Razorpay Subscriptions integration (creating a subscription,
  handling `subscription.charged`/`past_due`/`cancelled` webhooks).
- Per-tier feature gating in the app itself (nothing currently checks
  `subscription_status` or a tier field — there isn't a tier field yet,
  only the `trialing`/`active`/`past_due`/`cancelled` status added
  earlier).
- Upgrade/downgrade/billing management UI.

This page is marketing content only — it tells visitors what they'll
eventually pay for, but every CTA still just leads to free signup (trial
start), since there's nothing to check out yet. Building the actual
subscription billing is a separate, larger follow-up prompt.

## Skills read

None new — static content page, no data/auth changes beyond reusing
existing `Show`/`SignUpButton` patterns already used in `Navbar.tsx`.

## Existing code inspected

- `components/landing/Footer.tsx` — the final CTA section currently says
  **"Free forever · No credit card · Printed QR optional"** and "Create
  Your Free Profile." Once a pricing page exists showing three paid
  tiers, "Free forever" is a direct, visible contradiction on the same
  site — this needs to change as part of this prompt, not deferred
  further (deferred once already, when the copy was still harmless
  because no pricing existed anywhere yet).
- `components/landing/Navbar.tsx` — desktop nav (`Why Us` / `Verticals` /
  `How it Works`, same-page anchor scrolls) and the mobile `Sheet` menu;
  both need a `Pricing` link added, pointing to the real `/pricing` route
  (not a scroll anchor, since it's a separate page). Already has the
  `Show when="signed-out"` / `Show when="signed-in"` pattern to reuse for
  the pricing page's own CTA.
- `components/landing/Hero.tsx` — headline/subhead ("can't be held
  hostage" / "it never expires") intentionally **not** touched here per
  earlier discussion: that claim is about the QR/domain never being
  reassigned by a third party, which stays true regardless of
  subscription tiers, and nothing enforces trial expiry yet so it isn't
  actively false today either. Only the Footer's explicit "Free forever"
  claim is a direct, immediate contradiction once tiers are publicly
  priced.

## Decisions / assumptions

- **Route**: `app/pricing/page.tsx` → `/pricing`, top-level (not under
  `(legal)` — this isn't a legal/compliance page).
- **Chrome**: `Navbar` + `Footer`, same pattern as every other page.
- **CTA per tier**: signed-out visitors get `SignUpButton
  forceRedirectUrl="/onboarding"` (same pattern used everywhere else this
  session); signed-in visitors see a plain link to `/onboarding` instead
  (via `Show when="signed-in"` / `Show when="signed-out"`, matching
  `Navbar.tsx`'s existing pattern) since there's no tier-specific checkout
  to send them to yet — clicking any tier just gets them into their
  (already-trialing) account.
- **Copy**: every tier's CTA reads "Start free trial," with "No credit
  card required" under each price, matching the confirmed model.
- **Footer fix**: replace "Free forever" with "7-day free trial" in the
  trust-badge row; keep "No credit card" and "Printed QR optional" as-is
  (still true). Change the subhead from "Free to sign up and build your
  hub..." to trial-framed copy, and the CTA button label from "Create
  Your Free Profile" to "Start Your Free Trial" for consistency with the
  new pricing page.
- Hero.tsx is explicitly untouched (see above).

## Files likely to change

- `app/pricing/page.tsx` — new.
- `components/landing/Navbar.tsx` — modify. Add `Pricing` link (desktop +
  mobile sheet).
- `components/landing/Footer.tsx` — modify. Fix the "Free forever" trust
  badge and CTA copy.

## Implementation requirements

**`/pricing` page structure:**
1. Header: "Simple, transparent pricing" + one-line subhead mentioning the
   7-day free trial, no card required.
2. Three tier cards side by side (stacked on mobile), Pro visually
   highlighted (border/glow in `#54e0ff`, "Recommended" badge) matching
   the `hero-card` glow pattern already used elsewhere on the landing
   page.
3. Each card: tier name, price (`₹299/mo` etc.), feature checklist (use
   `Check` icons from `lucide-react`, same visual language as the
   Footer's trust badges), CTA button.
4. Below the cards: a short reassurance line — printed QR is a separate
   one-time purchase, not tied to any tier.
5. Dark theme, consistent with every other page (`bg-[#18181a]`,
   `text-white`, `#7a7a83` muted body, `#33373b` borders).

## Security requirements

None — static public content, no data mutation, no secrets.

## Acceptance criteria

- `/pricing` renders with Navbar + Footer, all three tiers with correct
  prices and feature lists, no horizontal overflow at 390px width.
- Pro tier is visually distinguished as recommended.
- Signed-out CTA buttons open Clerk sign-up and land on `/onboarding`
  after signup (reusing `forceRedirectUrl`).
- Signed-in visitors see a link to `/onboarding` instead of a sign-up
  button.
- Navbar (desktop + mobile) links to `/pricing`.
- Footer no longer claims "Free forever" anywhere.
- `npx tsc --noEmit` and `npm run lint` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Exact manual test steps

1. `npm run dev`, visit `/pricing` signed out — confirm three tiers, Pro
   highlighted, prices correct, "Start free trial" CTAs work and land on
   `/onboarding` after signup.
2. Visit `/pricing` signed in — confirm CTAs now link straight to
   `/onboarding` instead of triggering sign-up.
3. Click "Pricing" in the Navbar (desktop) and in the mobile Sheet menu —
   confirm both navigate to `/pricing`.
4. Check the landing page footer — confirm "Free forever" is gone,
   replaced with trial-appropriate copy.
5. Resize to 390px width, confirm no horizontal scroll on `/pricing`.
