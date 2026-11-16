# Landing page rebuild — Dobara by Locallify

## Goal
Replace the placeholder `app/page.tsx` with a clean, fast marketing landing page for Dobara aimed at small-town Indian cafe/restaurant owners (non-technical). Structure inspired by petpooja.com (heading → one line → visual/CTA per section, one primary action repeated: "Book a free demo on WhatsApp"), styled with our DESIGN.md dark system. Not a milestone feature (marketing surface, outside M0–M5); serves PRD §1/§2 positioning and the pilot recruitment in §19.

## Skills read
None of the project skills apply (no Clerk/Supabase/Postgres work). Next.js guidance from `node_modules/next/dist/docs/` where needed (fonts, metadata, client components).

## Existing code inspected
- `app/layout.tsx` — already loads **Hanken Grotesk** via `next/font/google` as `--font-body`; no Sharp Grotesk import, no Geist. → Only change: pin weights `["300","400","500","600"]`.
- `app/globals.css` — tokens already match DESIGN.md (`--background #18181a`, `--card #1e1e20`, `--primary #54e0ff`, `--accent #29adff`, `--border #33373b`, `--muted-foreground #7a7a83`), plus `.glassmorphic`, `.gradient-text-accent`, `.hero-card`. Reuse these; add a few small utilities (gradient border, fade-up keyframes, reduced-motion guard).
- `lib/site.ts` — `CONTACT_WHATSAPP = "919707370886"`, `CONTACT_EMAIL`, `whatsappLink()`, `DEMO_WHATSAPP_URL`, `PILOT_WHATSAPP_URL`. All WhatsApp links go through `whatsappLink()`.
- `components/ui/sheet.tsx` (shadcn/base-ui) — available for the mobile menu.
- `public/background-grid.svg` — faint pixel-grid for the hero.
- `app/not-found.tsx` — legal routes were deleted in the UI reset.

## Decisions / assumptions
1. **Footer legal links** (`/privacy-policy`, `/terms`, `/refund-policy`, `/contact-us`) currently hit the "being rebuilt" 404. I'll link to them anyway; restoring them from `07d37bb` is a separate task (say the word and I'll restore them).
2. **Pricing numbers** come from this brief (Starter ₹1,499 / Growth ₹2,499, etc.), not PRD — the brief is newer.
3. **Fonts:** keep Hanken Grotesk (Sharp Grotesk isn't on Google Fonts); just set weights 300/400/500/600.
4. **Motion:** CSS keyframes only for hero fade-up (no framer-motion on this page — keeps JS small for Lighthouse 90+). Hero preview crossfade = one small client component with `setInterval`.
5. **Client components only where needed:** `Header` (mobile sheet), `HeroPreview` (auto-crossfade, pause on hover, reduced-motion), `FAQ` (accordion), `FinalCTA` form. Everything else is a server component.
6. The phone number in the demo form is free text, only used to build the WhatsApp message on the client — nothing is stored or sent to our server, so no new personal data is collected (DPDP note: none).
7. `react-icons` is installed; use it only for the WhatsApp glyph (lucide has no WhatsApp brand icon). Everything else lucide-react.

## Files likely to change
- `app/page.tsx` — composes the sections
- `app/layout.tsx` — font weights only
- `app/globals.css` — add `.gradient-border`, `.fade-up` + stagger delays, `prefers-reduced-motion` guard, focus-ring base
- **New** `content/landing.ts` — ALL copy (typed `as const`)
- **New** `components/landing/`: `Header.tsx`, `Hero.tsx`, `HeroPreview.tsx`, `WorksWith.tsx`, `Features.tsx`, `WhyDobara.tsx`, `Facts.tsx`, `HowItWorks.tsx`, `Pricing.tsx`, `FAQ.tsx`, `FinalCTA.tsx`, `Footer.tsx`, plus small shared bits `SectionHeading.tsx` (eyebrow + H2 with gradient-italic word + subtitle) and `Container.tsx`.

## Design system (exact)
- Colors: bg `#18181a` (hero, features, facts, pricing, final CTA) / `#1a1a1c` (works-with, why, how, FAQ, footer); card `#1e1e20`; raised `#28282b`; border `#33373b`; text `#fff`; muted `#7a7a83`; cyan `#54e0ff`; blue `#29adff`; green-400 checks only. No cream, gold or purple.
- Gradient `linear-gradient(90deg,#54E0FF 0%,#29ADFF 100%)` — only for: the one accented word per heading, highlight badges, Recommended pricing border, highlight CTA buttons.
- Type: headings weight 400, `tracking-[-0.06em]` at display sizes (−0.04em for H3/card titles), leading 1.15. H1 66px desktop / 38px mobile; H2 48px / 32px. Accent word = `font-semibold italic` + gradient text (add `pr-[0.08em]` so the italic isn't clipped by `background-clip`). Body/subtitles weight 300, `#7a7a83`, 18–22px desktop / 15–16px mobile, leading 1.5, `max-w-[60ch]`.
- Radius: buttons 12px (large CTA 15px), cards 16px, pills full.
- Cards: `bg-white/[0.02] border-white/10 rounded-2xl`; hover `bg-white/[0.05] border-[#54e0ff]/30 -translate-y-1 shadow-[0_10px_40px_rgba(84,224,255,0.1)]`.
- Glass (small floating elements only): `.glassmorphic`.
- Buttons: Primary white/#18181a hover gray-100; Secondary white/5 + white/20 border hover white/10; Highlight gradient/#18181a (final CTA + Recommended plan only). Shadow on CTA `0 12px 32px rgba(0,0,0,.4)`.
- Layout: container `max-w-[1200px] px-5 md:px-8`; sections `py-24 md:py-28`; heading block centered (except hero), pill eyebrow, H2, one-line subtitle, `mb-14`.
- Focus: visible cyan ring (`focus-visible:ring-2 ring-[#54e0ff] ring-offset-2 ring-offset-[#18181a]`) on every interactive element.

## Implementation requirements (sections, in order)
1. **Header** — fixed `top-4`, centered pill `rounded-[20px]` glass, shadow `0 16px 30.7px rgba(0,0,0,.3)`. Left "Dobara" + tiny "by Locallify". Links Features · How it works · Pricing · FAQ (anchor `#id`, smooth via existing `scroll-smooth`; add `scroll-mt-24` to sections). Right: "Book free demo" primary → `DEMO_WHATSAPP_URL`. Mobile: hamburger (`aria-label`) → `Sheet` with the same links + CTA; closes on link click.
2. **Hero** — bg `#18181a`, `background-grid.svg` at opacity .1, 2–3 blurred ellipses (`#A4DCFF`, `#54E0FF`, `mix-blend-mode: plus-lighter`, `blur-[120px]`, `aria-hidden`, `pointer-events-none`) in the top third. Content height (pt ~140px to clear the nav). 2-col on `lg`, stacked on mobile (copy first). Left: eyebrow pill, H1 "Customer aaya? Ab *dobara* aayega.", subtitle, buttons [WhatsApp icon + Book a free demo on WhatsApp] primary / [See how it works] secondary → `#how-it-works`, 3 green checks row. Staggered CSS fade-up (≤800ms total, content visible at rest if animation disabled).
   **HeroPreview** (client): CSS phone frame (~280×560, rounded 40px, `#1e1e20`, border `#33373b`, notch), 3 screens absolutely stacked, crossfade (opacity transition 500ms) every 3500ms: (a) scan page — "Brew House · Table 4", "Welcome back Priya 👋", Table Squad 3/4 seat circles + progress; (b) counter-screen alert card "🔔 Table 4 — Arjun · 6th visit · kam teekha"; (c) scratch card "☕ Free Cold Coffee — valid 14 days". 3 dot buttons below (clickable, `aria-label`, `aria-current`). Pause on hover/focus. `prefers-reduced-motion` → no auto-rotate (first screen static; dots still work). Inactive screens `aria-hidden`.
3. **WorksWith** — slim strip, `#1a1a1c`, muted label + text chips: Petpooja · DotPe · Vyapar · Any billing app · Paper register. Wraps on mobile.
4. **Features** (`#features`) — heading/subtitle per brief; 2×2 cards (1-col mobile). Each: label pill, title, 1–2 lines, tiny built-in visual (pure HTML/CSS): seat circles 4/4 + "free dessert"; mini scratch card; mini counter notification; mini "Tables bharo · 312 people · ₹290" card.
5. **WhyDobara** — `#1a1a1c`, 3×2 grid (2-col tablet, 1-col mobile), lucide icon + title + one line for the 6 items in the brief.
6. **Facts** — 4 numbers: "0" apps to download · "30 sec" to scan & verify · "14 days" prize validity · "1 tap" to fill empty tables. Number 48–64px weight 300, tight tracking; muted label. 2×2 mobile, 4 cols desktop.
7. **HowItWorks** (`#how-it-works`) — 4 numbered steps (01–04) per brief, row on `lg` with thin 1px `#33373b` connecting line behind the number badges; stacked on mobile.
8. **Pricing** (`#pricing`) — heading/subtitle; pilot banner (glass, `border-[#54e0ff]/30`) with "Join the pilot" → `PILOT_WHATSAPP_URL`; 2 cards: Starter ₹1,499/month, Growth ₹2,499/month (gradient 1px border via wrapper + "Recommended" gradient badge + highlight CTA). Feature lists with green-400 checks. CTAs open WhatsApp with the plan named (`whatsappLink("Hi Dobara, I'm interested in the Starter plan")`). Small muted footnote line per brief.
9. **FAQ** (`#faq`) — 7 Qs with short plain answers. Each item: `<h3><button aria-expanded aria-controls>` + region `id` panel; chevron rotates; one open at a time is fine. Answers stay truthful to PRD (no app; works alongside billing; no-WhatsApp → staff can still serve them, printed fallback is under consideration — phrase as "they can still eat and pay as usual; rewards need WhatsApp"; data belongs to the cafe, never shared/sold; messages included in plan, extras ~₹1.2; replying STOP stops them instantly, max 4 offers/month; get started = message us, we visit, set up QR + train staff).
10. **FinalCTA** (`#demo`) — ellipses again; heading "Give every diner a reason to come *dobara*."; subtitle; form (name, cafe name, phone — labelled inputs, `required`, `type="tel" inputMode="tel" autoComplete`) → `preventDefault` → `window.open(whatsappLink("Hi Dobara, I'm {name} from {cafe}. I'd like a free demo. My number: {phone}"), "_blank", "noopener")`. Plus big highlight-gradient "Book a free demo on WhatsApp" link (15px radius).
11. **Footer** — `#1a1a1c`, top border `#33373b`; "Dobara by Locallify", one line, WhatsApp +91 97073 70886 (link), `hello@locallifyagency.com` (mailto), links Privacy Policy · Terms · Refund Policy · Contact, © 2026 Locallify.

Copy rules: plain owner words; banned: CRM, engagement, retention, AI-powered, platform, leverage, seamless. All strings in `content/landing.ts`.

## Security requirements
- No secrets touched; only `NEXT_PUBLIC`-free constants from `lib/site.ts`.
- Form data never leaves the browser except via the user opening WhatsApp; values `encodeURIComponent`-ed (already in `whatsappLink`).
- External links `target="_blank" rel="noopener noreferrer"`.

## Acceptance criteria
- All 11 sections render in order with the exact copy from the brief; one `<h1>`, one `<h2>` per section, `<header>/<nav>/<main>/<footer>` landmarks.
- No horizontal scroll and nothing clipped at 390px, 768px, 1440px.
- Hero preview rotates every 3.5s, pauses on hover, static under reduced motion.
- FAQ is keyboard-operable with correct `aria-expanded`.
- Demo form opens WhatsApp to 919707370886 with the prefilled message.
- Gradient only used where specified; no off-palette colors.
- `npx tsc --noEmit` and `npm run lint` pass; `npm run build` passes.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`

## Manual test steps
1. `npm run dev`, open http://localhost:3000.
2. DevTools device toolbar: 390px, 768px, 1440px — scroll the full page, confirm no sideways scroll and no clipped text.
3. Click each nav link (desktop + mobile sheet) → smooth scroll to the section, heading not hidden under the nav.
4. Watch the hero phone rotate 3 screens; hover → stops; click dots.
5. DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" → reload: no fade-up, no auto-rotate.
6. Tab through the page: visible cyan focus ring everywhere; open/close FAQ items with Enter/Space.
7. Fill the demo form → submit → WhatsApp opens with "Hi Dobara, I'm … from …".
8. Lighthouse (mobile) on `npm run build && npm run start` → Performance/Accessibility ≥ 90.
