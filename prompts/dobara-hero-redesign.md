# Dobara hero redesign ("one evening" story)

## Goal
Replace only the landing hero with a warm, premium "cafe at night" hero that explains Dobara in about 8 seconds through a looping animated story, for non-technical cafe owners. The full brief was supplied by the user on 2026-11-16 and is followed exactly. Key points are summarised here.

## Decisions
- Demo WhatsApp number: **+91 9707370886**, set in `lib/site.ts` as `CONTACT_WHATSAPP`. Every "Book a demo" CTA (navbar, pricing, footer, hero) uses it, with the prefilled text "Hi Dobara, I want a demo". The `/contact-us` legal page still lists +91 6000163450 separately.
- `framer-motion` is installed for the scene. The copy entrance, background glows, swash draw and dot pulse are pure CSS, so the headline (the LCP element) paints without waiting for JS.
- All hero text lives in one `HERO_CONTENT` object at the top of `components/landing/Hero.tsx`. The scene text is passed down as props.
- The scene is a fixed 560×540 design box, scaled with CSS `scale` per breakpoint inside a wrapper of fixed size, so layout shift is 0.
- Reduced motion: no entrance, glows, floating or loop. The scene renders its final "all 4 done" state.
- The loop pauses when off-screen (IntersectionObserver). Clicking a step dot jumps to that step, pauses autoplay for 8 s, then resumes.

## Files
- `components/landing/Hero.tsx`: content object + layout
- `components/landing/hero/HeroCopy.tsx`, `HeroBackground.tsx`, `HeroScene.tsx`, `CafeTable.tsx`, `PhoneMock.tsx`, `StaffTablet.tsx`, `ScratchCard.tsx`, `StepDots.tsx`, `types.ts`
- `app/globals.css`: hero keyframes + reduced-motion overrides
- `lib/site.ts`: number + demo message

## Accessibility
- One `h1`, and the CTAs are real `<a>` elements with visible focus rings.
- The scene is `role="group"` with the specified aria-label. The visual parts and caption chips are `aria-hidden`, and the step dots are labelled buttons.

## Checks
`npx tsc --noEmit`, eslint on the changed files, then render at 1440px and 390px.
