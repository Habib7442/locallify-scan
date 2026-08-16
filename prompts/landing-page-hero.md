# Implementation Prompt: Landing Page Redesign (Hero Section)

## 1. Goal
Redesign the landing page hero section of **Locallify Links** (`app/page.tsx`) into a high-craft, modern Persuade surface format inspired by the uploaded reference layout (Appvia format), adapted specifically to Locallify Links' product truth, positioning, and target audience (local business owners).

---

## 2. Skills Read
- `.agents/skills/impeccable` — Persuade mode, landing page visual hierarchy, craft floor, micro-interactions, layout rhythm, color strategy.
- `.agents/skills/clerk` — Auth state integration (`Show when="signed-out"`, `Show when="signed-in"` header actions).

---

## 3. Existing Code Inspected
- `app/page.tsx` — Current Night Market landing page layout and SignPost components.
- `app/layout.tsx` — Header navigation, Clerk provider, and Google fonts (`Plus_Jakarta_Sans` and `Permanent_Marker`).
- `app/globals.css` — CSS custom variables, Tailwind directives, dark/light color tokens, keyframe animations.
- `PRODUCT.md` & `PRD.md` — Product positioning, core message ("QR code that can't be held hostage"), target roles, and non-goals.

---

## 4. Decisions & Assumptions
1. **Format Alignment**: Adhere to the structure seen in the reference image:
   - Header with Logo, Navigation Links, and right-aligned CTA pill.
   - Centered Social Proof / Rating badge at top of Hero.
   - Large, punchy hero headline with clear visual emphasis.
   - Subtitle explaining the anti-hostage guarantee and permanent domain promise.
   - Primary WhatsApp CTA pill button ("Get your permanent QR") + secondary ("See Live Demo").
   - Multi-card interactive mockups showing real product features (Live Mobile Hub preview, Link Manager card, Appearance/Color Picker card, Permanent Domain Trust badge).
2. **Product Truth Preservation**: All copy and visual components will strictly represent Locallify Links (no fabricated features or metrics). The proof point remains the anti-hostage permanent QR promise.
3. **Responsive Design**: The hero visual cards will layout gracefully into a responsive grid/flex array on desktop and stack cleanly on mobile.

---

## 5. Files Likely to Change
- [MODIFY] [app/page.tsx](file:///e:/Web%20Dev/locallify-scan/app/page.tsx)
- [MODIFY] [app/globals.css](file:///e:/Web%20Dev/locallify-scan/app/globals.css)

---

## 6. Implementation Requirements

### Visual Interpretation & Design System
- **Typography**: Clean, high-readability sans (`Plus_Jakarta_Sans`) with display accents for highlights.
- **Color Palette**: High-contrast, sleek glassmorphic elevation with dark slate/midnight background, lantern gold/amber & indigo accent highlights, soft borders, and radial ambient glows.
- **Header**: Sticky/fixed header with logo ("Locallify Links"), navigation links ("Why Us", "How it Works", "Verticals", "Pricing"), and a prominent CTA pill button.
- **Hero Headline & Copy**:
  - Badge: `★★★★★ 100% Permanent QR Guarantee · Zero Vendor Lock-in`
  - Title: `The QR code for your business that can't be held hostage.`
  - Subtitle: `Locallify prints your QR code once on our own domain. The hub behind it stays editable forever — with no surprise renewal fees or vendor shutdowns.`
- **Hero Mockup Cards Array (Inspired by reference image composition)**:
  - **Card 1: Mobile Hub Live Preview**: Interactive phone frame showing a real restaurant/clinic hub with active links ("Order on WhatsApp", "Google Review", "View Menu", "Directions").
  - **Card 2: Dynamic Link Manager**: Mini-editor preview showing link reordering, active toggles, and WhatsApp pre-filled message generator.
  - **Card 3: Appearance & Branding Tool**: Color picker preview (Hex swatch, background image vs solid, theme toggle).
  - **Card 4: Permanent Domain Badge**: Visual card displaying `qr.locallifyagency.com/your-business` with a verified 🔒 "Never Expires" stamp.

---

## 7. Security & Performance Requirements
- All external links (e.g. WhatsApp CTA) set `target="_blank" rel="noopener noreferrer"`.
- Non-blocking layout and responsive image assets.
- Accessibility: High contrast, keyboard focus indicators, `prefers-reduced-motion` compliance.

---

## 8. Acceptance Criteria
- [ ] Header includes working navigation anchor links and CTA pill button.
- [ ] Hero section features rating badge, primary headline, subtitle, and WhatsApp CTA.
- [ ] Hero visual card array displays realistic product mockups (Mobile Hub, Link Manager, Appearance Customizer, Permanent Domain Badge).
- [ ] Micro-animations (hover effects, soft glows, active states) are smooth and performant.
- [ ] Fully responsive on mobile, tablet, and desktop viewports.

---

## 9. Checks to Run
- `npx tsc --noEmit`
- `npm run lint`

---

## 10. Manual Test Steps
1. Run `npm run dev` and open `http://localhost:3000`.
2. Verify top nav links scroll smoothly to their respective sections.
3. Test WhatsApp CTA button opens WhatsApp with the pre-filled message.
4. Verify responsive layout on mobile viewport (< 640px) and desktop viewport (> 1024px).
5. Verify TypeScript and ESLint build checks pass cleanly without errors.
