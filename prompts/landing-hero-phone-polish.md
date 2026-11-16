# Landing polish — hero phone screens + squad initials

## Goal
Make the hero phone look like a real app and tidy two small details. Keep copy, CTAs, colours and sections otherwise unchanged. Marketing surface (outside M0–M5).

## Skills read
None needed.

## Existing code inspected
`components/landing/HeroPreview.tsx` (3 screens: scan / counter / scratch + floating counter card), `Features.tsx` (`SquadVisual`), `Hero.tsx`, `WhyDobara.tsx`, `HowItWorks.tsx`, `primitives.tsx`, `content/landing.ts`.

## Decisions / assumptions
1. **Slider screens are replaced** by the three new customer screens (a/b/c). The old in-phone "counter screen" slide goes away. Staff recognition still shows through the floating "🔔 Table 4 — Arjun" card, which stays.
2. All three screens share one `AppShell`: top bar (gradient-ringed "BH" logo circle + "Brew House · Table 4"), a `flex-1` middle that centres the content vertically, and a full-width bottom button (h-12, white, 12px radius). This removes the empty gaps.
3. Phone frame: border `rgba(255,255,255,0.12)` (`border-white/12`), screen bg `#1e1e20`, frame body slightly darker (`#18181a`) so the edge reads, plus a cyan glow (`#54E0FF`, ~12% opacity, `blur-[80px]`, `aria-hidden`) behind the phone.
4. Inner cards on the `#1e1e20` screen use `bg-white/[0.04]` + `border-white/10` so they still separate from the screen.
5. Screen c rows: Visits **6**, Next prize **Free Dessert**, Last visit **12 Nov**. Static demo data.
6. Squad initials P, R, A, S: dark text (`#18181a`, semibold) on the gradient circles, each with a small cyan check badge (`#54e0ff` circle, dark check icon, ring in card colour) at bottom-right. The visual stays `aria-hidden`; the "4/4 · free dessert" pill keeps the meaning in text.
7. **Readability item (3) is already met** from the last polish: eyebrow pill is 13px; feature/step/Why descriptions are 15px (16px desktop) in `#9a9aa3`. I'll re-verify, and only change anything that falls short.
8. CTA text unchanged.

## Files likely to change
`content/landing.ts` (heroPreview copy), `components/landing/HeroPreview.tsx`, `components/landing/Features.tsx` (SquadVisual), `content/landing.ts` features squad `initials`.

## Implementation requirements
- `heroPreview` copy restructured: `shell { logo: "BH", place: "Brew House · Table 4" }`; `welcome { title, squadTitle, squadCount, squadHint, button: "I'm here" }`; `prize { header, prize: "☕ Free Cold Coffee", validity: "valid 14 days", saved: "Saved on your WhatsApp", button: "Show at counter" }`; `thanks { title: "Thanks for visiting!", subtitle: "Your prize is saved", rows: [{label:"Visits",value:"6"},{label:"Next prize",value:"Free Dessert"},{label:"Last visit",value:"12 Nov"}], button: "Open WhatsApp" }`; `screenNames` updated; `floating` kept.
- Screen a: avatar circles with initials (3 filled P/R/A + 1 dashed empty) to match "3/4".
- Screen b: scratch card with gradient border + a subtle scratched-foil texture strip; "✓ Saved on your WhatsApp" with a green-400 check icon + text.
- Screen c: title, subtitle, a 3-row `dl` list with dividers.
- Text min 13px inside the phone. Keep the rotation, pause-on-hover, dots and reduced-motion behaviour.
- Phone sizes unchanged (286×610 mobile, 334×640 desktop). Floating card positions re-checked against the new layout so it doesn't cover the bottom button or key text.

## Security requirements
None (static marketing UI).

## Acceptance criteria
- Each slide fills the screen: top bar at top, content centred, button pinned at the bottom, with no large empty gaps.
- Phone edge visible against the background; soft cyan glow behind it.
- Squad feature card shows P, R, A, S with check badges.
- Nothing overlaps badly at 390px or 1440px; no horizontal scroll.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`

## Manual test steps
1. `npm run dev` → http://localhost:3000.
2. Watch the phone cycle: Welcome back Priya → Free Cold Coffee → Thanks for visiting. Each has the BH top bar and a bottom button.
3. 390px and 1440px: the floating Arjun card doesn't hide the button or the main text.
4. Features → Table Squad card shows P R A S with cyan check badges.
