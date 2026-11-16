# Landing page polish — Dobara by Locallify

## Goal
Polish the landing page built in `prompts/landing-page-rebuild.md`. Keep the design system, colours, copy and section order. Marketing surface (outside M0–M5).

## Skills read
None needed (no Clerk/Supabase work).

## Existing code inspected
`components/landing/*` (all sections + `primitives.tsx`), `content/landing.ts`, `app/globals.css`.

## Decisions / assumptions
1. **Contrast (WCAG AA, 4.5:1 for normal text)** — computed:
   - `#9a9aa3` on `#18181a` ≈ **6.4:1**, on `#1d1d20` ≈ **6.0:1** → passes. Used for all body/subtitle/card copy.
   - `#7a7a83` on `#18181a` ≈ **4.2:1**, on `#1d1d20` ≈ **3.9:1** → **fails AA**. The brief says to keep it for tiny meta text, but also to pass AA — these conflict. **Proposal:** tiny meta text uses `#8b8b94` (≈ 5.2:1 / 5.0:1, passes, still visibly dimmer than body). `#7a7a83` stays only on non-text decoration (dashed seat circle, inactive dots).
2. Muted colours become two tokens in `primitives.tsx`: `textBody = text-[#9a9aa3]`, `textMeta = text-[#8b8b94]`, so sections stop hard-coding hex.
3. Alt background changes `#1a1a1c` → `#1d1d20` (WorksWith, WhyDobara, HowItWorks, FAQ, Footer) and those sections get `border-t border-[#33373b]/60`.
4. Hero headline split lives in `content/landing.ts` as two lines (`line1: "Customer aaya?"`, line2 accent heading); `<br className="hidden md:inline">` + `text-wrap: balance` (`text-balance`). On mobile the two parts still wrap naturally/balanced.
5. Prize card date "valid till 30 Nov" is static demo copy in the mockup.

## Files likely to change
`content/landing.ts`, `components/landing/primitives.tsx`, `Hero.tsx`, `HeroPreview.tsx`, `WorksWith.tsx`, `Features.tsx`, `WhyDobara.tsx`, `Facts.tsx`, `HowItWorks.tsx`, `Pricing.tsx`, `FAQ.tsx`, `FinalCTA.tsx`, `Footer.tsx`.

## Implementation requirements
1. **Hero headline:** "Customer aaya?" / "Ab *dobara* aayega." — explicit `<br>` on md+, `text-balance`, gradient italic kept on "dobara".
2. **Hero preview:** scan screen order = greeting card → Table Squad 3/4 → prize card ("☕ Free Cold Coffee · valid till 30 Nov", gradient border) → "Saved on WhatsApp ✓" (green-400 check + text, not colour-only) → "I'm here" button. Other two screens grow to fill similarly (counter: one extra queued row; scratch: centred vertically). Floating glass counter card ("🔔 Table 4 — Arjun" / "6th visit · kam teekha") overlapping the phone's bottom-left, `-rotate-[4deg]`, `shadow-[0_16px_40px_rgba(0,0,0,0.4)]`, `aria-hidden` (decorative duplicate of screen b). Phone ~15% larger on `lg` (290×540 → ~334×620); keep current size below `lg`. Floating card offset stays inside the viewport at 390px (smaller negative offset on mobile, no horizontal overflow).
3. **Spacing:** `Section` `py-16 md:py-20` (was `py-24 md:py-28`); Facts `py-14 md:py-16`; hero bottom `pb-16 md:pb-20`; FinalCTA matches section padding; WorksWith `py-7`.
4. **Readability:** body/subtitles min 16px desktop / 15px mobile (`text-[15px] md:text-base` minimum; hero/section subtitles keep 18–20px desktop); card descriptions 15px; small labels/pills/meta min 13px (raise the 11–12px ones in feature visuals, footnote, form note and phone-mockup text). The phone mockup is visible content, so the 13px minimum applies inside it too.
5. **Feature cards:** visuals ~2× (seat circles 36→64px, prize/notification/fill cards ~2× padding and type), placed in a `flex-1 flex items-center justify-center` area so they sit centred in the remaining space; card padding `p-6 md:p-7`; cards equal height via grid stretch.
6. **Section separation:** as decision 3.
7. **Facts:** label "apps your customers download".
8. Re-check 390 / 768 / 1440 (iframe screenshots) and fix overlaps.

## Security requirements
No change — static marketing page, no data stored.

## Acceptance criteria
- Headline breaks exactly as specified on md+; balanced on mobile.
- Phone screen visibly full; floating counter card overlaps bottom-left without causing horizontal scroll at 390px.
- No body text under 15px; no label under 13px (outside the decorative mockup).
- All text colours on page backgrounds ≥ 4.5:1.
- Alternating backgrounds `#18181a` / `#1d1d20` with 60% border on alt sections.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`

## Manual test steps
1. `npm run dev` → http://localhost:3000.
2. 1440px: headline on two lines, phone column as heavy as copy column, floating card tilted at the phone's bottom-left.
3. 768px and 390px: no sideways scroll, floating card not clipped, headline wraps cleanly.
4. Scroll: sections visibly alternate with a thin divider; spacing tighter than before.
5. Features: each mini visual large and centred in its card.
6. Facts: "0 — apps your customers download".
