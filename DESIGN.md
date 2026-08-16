# DESIGN.md — Link4Coders visual system (reference extraction)

<!-- impeccable:design-schema 1 -->

Reverse-engineered from the actual source at `E:\Web Dev\link4coders` (Next.js 15 + Tailwind v4 + shadcn/ui). This is a **factual record of what that codebase does**, not a proposal for Locallify Scan — values are copied exactly, including its inconsistencies, so nothing here is invented.

---

## 1. Color tokens

Forced dark theme — `:root` and `.dark` define nearly identical dark palettes, so there is effectively no light mode.

| Token | Value | Used for |
|---|---|---|
| `--background` | `#18181a` | Page/body background (near-black, warm-neutral) |
| `--foreground` | `#ffffff` | Primary text |
| `--card` / `--popover` | `#1e1e20` (`.dark`) | Elevated surfaces |
| `--primary` | `#54e0ff` | Buttons, rings, focus, gradient start (cyan) |
| `--primary-foreground` | `#18181a` | Text on primary |
| `--secondary` | `#28282b` (`.dark`) | Secondary surfaces |
| `--muted-foreground` | `#7a7a83` | Body copy, subtitles, nav links |
| `--accent` | `#29adff` | Gradient end (blue), links |
| `--destructive` | `#ef4444` | Errors, sign-out (red variants) |
| `--border` | `#33373b` | Hairlines, card borders |
| `--input` | `#33373b` (`.dark`) | Form field borders |
| `--ring` | `#54e0ff` | Focus rings |
| `--glass-bg` | `rgba(0,0,0,0.20)` | Glassmorphic panels |
| `--glass-border` | `#33373b` / `rgba(51,55,59,0.5)` (`.dark`) | Glass panel borders |
| `--surface-elevated` | `#28282b` | Raised panels |
| `--chart-1..5` | `#54e0ff, #29adff, #67e8f9, #a7f3d0, #fde68a` | Data viz only |

**Section background variants (not tokenized, hardcoded per-section):**
- `#18181a` — hero, featured-profiles, pricing
- `#1a1a1c` — features, footer (slightly lighter, used to visually separate alternating sections)

**Signature gradient** (the one recurring brand device — buttons, headings, badges, avatar rings):
```css
linear-gradient(90deg, #54E0FF 0%, #29ADFF 100%)  /* horizontal, most common */
linear-gradient(180deg, #54E0FF 0%, #29ADFF 100%) /* vertical, .gradient-text-accent utility */
```

**Shimmer text gradient** (`.gradient-text-primary`, used sparingly):
```css
linear-gradient(90deg, #e3faff 0%, #ffffff 48.56%, #e3faff 100%)
```

**Semantic accents (ad hoc, not tokenized):** green-400/500 for "included" checks, gray-500 for "not included," red-400 for destructive/sign-out text.

---

## 2. Typography

**Declared body font:** `'Sharp Grotesk', -apple-system, BlinkMacSystemFont, sans-serif`, loaded via a plain `@import url('https://fonts.googleapis.com/css2?family=Sharp+Grotesk...')` in `globals.css` — **not** via `next/font`, and **not self-hosted**.

⚠️ Caveat worth flagging: Google Fonts does not actually host a font called "Sharp Grotesk" (it's a commercial foundry face). That `@import` almost certainly 404s, so in practice the site is very likely rendering on its `-apple-system, BlinkMacSystemFont` system-sans fallback, not the named display face. Document this as the *intended* choice, not a confirmed rendered one.

**Dead weight:** `next/font/google` also loads Geist Sans + Geist Mono as CSS variables in `layout.tsx`, but neither is applied anywhere — `body` uses `font-sharp-grotesk` exclusively. Legacy/unused.

**Two coexisting type systems:**

**A — Hero (pixel-exact, Figma-derived):**
| Element | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| H1 (desktop) | 66.22px | 78.80px (1.19) | −3.97px | 400 (regular); the final word is 600 italic + accent color |
| H1 (mobile) | 36px | 42px | −1.8px | 400 |
| Subtitle (desktop) | 24.85px | 36.54px (1.47) | −0.75px | 300 (light), color `#7a7a83` |
| Subtitle (mobile) | 14px | 20px | −0.28px | 300 |
| Nav links | 15px | — | −0.45px | 300 |
| Nav brand wordmark | 15px | — | −0.45px | 500 |
| Buttons | 20px (desktop) / 14px (mobile) | — | −0.6px / −0.42px | 500 |

Tracking is consistently tight — roughly **−6% of font size** at display sizes, loosening slightly at body sizes. This is the system's real typographic signature, more than the (unconfirmed) typeface itself.

**B — Everything below the hero (generic Tailwind scale):**
Features/Pricing/FeaturedProfiles/Footer headings use plain `text-4xl md:text-5xl font-bold` (36px/48px, weight 700) with no custom tracking — inherits `font-sharp-grotesk` from the body base layer but ignores the hero's precise pixel system entirely. Body text in these sections uses default Tailwind `text-sm`/`text-base`/`text-lg` on `text-gray-400`/`text-gray-500`, not the `--muted-foreground` token.

**Emphasis pattern:** the single most-important word/phrase in a headline gets `font-semibold italic` + gradient or solid accent color (`text-[#54E0FF]`), while the rest of the headline stays regular weight — used in the hero ("**build.**") and reused as a `bg-clip-text` gradient span in every section heading below it.

---

## 3. Radius

Token scale exists (`--radius: 0.625rem` / 10px base, with sm/md/lg/xl derived at −4px/−2px/+4px) but is **barely used** in real markup. Actual components use bespoke arbitrary values instead:

`rounded-[8px]` (small buttons) · `rounded-[10px]` (sign-up button) · `rounded-[12px]` (badges, mobile CTA, glass panels) · `rounded-[15px]` (desktop CTA) · `rounded-[16px]`/`rounded-2xl` (mobile menu, cards) · `rounded-[20px]` (nav pill) · `rounded-full` (pills, avatars, badges).

## 4. Shadows

All bespoke, no shadow scale/token. Consistently: **soft, large blur, low-ish opacity black**, scaling up with element importance:

- Floating status badge: `0px 8px 16px rgba(0,0,0,0.20)`
- Nav pill: `0px 16px 30.7px rgba(0,0,0,0.30)`
- Mobile CTA: `0px 8px 20px rgba(0,0,0,0.30)`
- Desktop CTA: `0px 12px 32px rgba(0,0,0,0.40)`
- Card hover (colored glow, accent-tinted): `0 10px 40px rgba(84,224,255,0.1)`

## 5. Glassmorphism (`.glassmorphic` utility)

```css
background-color: rgba(0, 0, 0, 0.20);
backdrop-filter: blur(10px);
border: 1px solid rgba(51, 55, 59, 0.5);
```
Used for small floating elements over imagery/gradients (e.g. the "Signed in as…" pill over the hero background), not for full cards.

## 6. Buttons (observed variants, not a formal system)

| Variant | Background | Text | Border | Notes |
|---|---|---|---|---|
| Primary (logged out) | `#ffffff` | `#18181a` | none | hover → `gray-100` |
| Primary (logged in) | gradient `#54E0FF→#29ADFF` | `#18181a` | none | hover reverses gradient direction |
| Secondary/free-tier | `white/5` | white | `white/20` | glass-style, hover `white/10` |
| Ghost/outline (sign out) | transparent | `#54E0FF` | `#54E0FF`/30 | hover bg `#54E0FF`/10 |
| Icon ghost (mobile menu) | transparent | `#7a7a83` | `#33373b` | hover: white text, cyan border |

All buttons are pill-ish (12–15px radius or full), never sharp-cornered.

## 7. Layout

- **Hero:** absolutely-positioned elements at exact Figma pixel coordinates (`top`, `left` as literal px or `clamp()`), inside a `max-w-[1440px]` container, fixed height `879px` desktop / `600px` mobile. Not a flow layout — a direct Figma export. Background: a faint (`opacity: 0.1`) large pixel-grid SVG plus three large soft blurred ellipses in white/`#A4DCFF` using `mix-blend-mode: plus-lighter`, positioned across the top third.
- **Content sections below the hero:** conventional flow layout, `max-w-7xl` (1280px, **different** from the hero's 1440px), `px-4`, `py-20` (80px vertical rhythm) per section.
- **Cards:** `bg-white/[0.02–0.03]` + `border-white/10` + `rounded-2xl` + `backdrop-blur-sm` — a lighter, more transparent glass than the `.glassmorphic` utility; hover state brightens to `white/[0.05]`, border tints to accent/30, lifts `-translate-y-1`.

## 8. Landing page structure (`app/(marketing)/page.tsx`)

```
Header (floating pill nav, fixed-position, logo + 3 links + auth CTA)
Hero (absolute-positioned headline + subtitle + CTA + preview mockup image)
FeaturedProfiles (3-col card grid, product-specific — not transferable)
FeaturesSection (comparison table, free-plan checkmarks)
PricingSection (2-card free/premium comparison)
FooterSection (CTA band + 4-col link footer)
```

Every section repeats the same heading pattern: plain white heading with one gradient-accented phrase, centered, `mb-16`, followed by a `text-gray-400` one-line subtitle — the only structural rhythm that's consistent site-wide outside the hero.

---

## Not extracted

Product-specific content (developer profile cards, tech-stack badges, pricing figures, feature lists) — those are Link4Coders' own product facts, not design tokens, and aren't relevant to Locallify Scan.
