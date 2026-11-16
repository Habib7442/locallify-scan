# Dobara landing page

## Goal
Reposition the marketing site from the old link-in-bio product ("Locallify Scan — a QR code that can't be held hostage") to **Dobara by Locallify**: a repeat-visit product for cafes and restaurants (`PRD.md` §1, §6, §7, §16; `PRODUCT.md`).

Approved by user ("do your best") on 2026-11-16, with these decisions:
- **CTA:** "Book a free demo" / "Join the free pilot" opens WhatsApp to Locallify (+91 6000163450, from `/contact-us`). There's no self-signup CTA. Existing owners get an "Owner login" link.
- **Pricing:** a free-pilot banner on top (first 3 cafes in Silchar), then Starter ₹1,499 and Growth ₹2,499 from `PRD.md` §16, plus add-ons.
- **Visuals:** coded UI mockups instead of photos: table QR card, scan page in a phone, Live Board card, scratch card, squad progress, Fill My Tables composer.

## Skills read
None of the approved skills apply (this is a UI-only change, with no Clerk/Supabase changes beyond the existing `SignInButton`/`UserButton`).

## Existing code inspected
`app/page.tsx`, `app/layout.tsx`, `app/pricing/page.tsx`, `components/landing/*`, `lib/site.ts`, `lib/seo.ts`, `app/globals.css` (`.hero-card`, `.glassmorphic`, `.gradient-text-accent`), `app/(legal)/contact-us/page.tsx`.

## Structure (home)
1. **Navbar:** Dobara wordmark + small "by Locallify". Links: Features, How it works, Pricing, FAQ. They work from any page via `/#id`. Signed out: "Owner login" + "Book a demo". Signed in: "Dashboard" + `UserButton`.
2. **Hero:** eyebrow "For cafes & restaurants". H1 "Turn first-time diners into *regulars*." Sub-heading uses the pitch line. CTAs: Book a free demo (WhatsApp) and See how it works. Trust row: No app for customers · Works with your billing · Set up in person. Visual: the scan page in a phone, a table card behind it, and a floating Live Board ding.
3. **Problem** (`#problem`): "Most diners visit once. Then they're gone.", with four problems from PRD §2.
4. **Features** (`#features`): the 4 features from PRD §7.4–7.7, each with a mockup.
5. **How it works** (`#how-it-works`): the diner journey. Scan → verify on WhatsApp → win a next-visit prize → come back and get greeted by name.
6. **Why Dobara** (`#why-dobara`): works with your billing; no app; the customer list is yours; set up in person; table QRs never expire (Locallify Scan platform); respectful WhatsApp.
7. **Pricing** (`#pricing`): pilot banner + 2 plans + add-ons line.
8. **FAQ** (`#faq`): native `<details>` with no JS.
9. **Final CTA + footer:** wordmark, legal links, "Built on Locallify Scan".

`/pricing` reuses the Pricing and FAQ sections. Legal pages keep the shared Navbar/Footer.

## Files
- `lib/site.ts`: product name, WhatsApp contact, `whatsappLink()`, demo/pilot URLs
- `components/brand/DobaraWordmark.tsx` (new)
- `components/landing/mockups.tsx` (new)
- `components/landing/Problem.tsx`, `Features.tsx`, `Faq.tsx` (new)
- `components/landing/Navbar.tsx`, `Hero.tsx`, `HowItWorks.tsx`, `WhyUs.tsx`, `Pricing.tsx`, `Footer.tsx`: rewritten
- `components/landing/LivePreview.tsx`, `Verticals.tsx`, `HeroCollage.tsx`: deleted (link-in-bio only, recoverable from git)
- `app/page.tsx`, `app/pricing/page.tsx`, `app/layout.tsx` (metadata), `lib/seo.ts` (default keywords)

## Requirements
- Keep the existing design system: `#18181a` background, `#54e0ff` accent, Hanken Grotesk, `.hero-card`, and rounded 20–24px cards.
- Mobile-first, with no horizontal scroll at 360px.
- Animations only via `motion-safe:`, so reduced motion is respected.
- Decorative mockups are `aria-hidden`. Headings are in order: one `h1`.
- External WhatsApp links use `target="_blank" rel="noopener noreferrer"`.
- **No fabricated evidence:** no testimonials, no customer counts, no result stats. Mockup names (Brew House, Priya, Arjun) come from the PRD examples and are clearly illustrative.
- Server components by default. Client components only where needed (Navbar for the mobile sheet; Clerk components are already client).

## Acceptance criteria
- No "link in bio", "held hostage", "Create Your Profile" or printed-QR copy remains on the home page or `/pricing`.
- All CTAs open WhatsApp with a prefilled message.
- Nav anchors scroll on home and navigate to `/#id` from other pages.
- `npx tsc --noEmit` and lint on the changed files pass.

## Manual test
1. `npm run dev`, then open `/` at desktop width and at 375px (DevTools device mode).
2. Click each nav link, then repeat from `/terms`.
3. Click "Book a free demo": WhatsApp opens with the prefilled message.
4. Open `/pricing` and check the pilot banner, the 2 plans and the FAQ.
5. Sign in: the navbar shows Dashboard + avatar, and the hero CTA shows "Go to dashboard".
6. In the OS settings, turn on reduced motion and confirm the floating mockups stop animating.

## Follow-ups (not in this task)
- A new OG image for Dobara (the current `og_image.png` is link-in-bio).
- Dobara wording in the privacy policy and terms, since diners' phone numbers are now collected.
