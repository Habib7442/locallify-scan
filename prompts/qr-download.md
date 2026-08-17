# Prompt: Free QR download (Share & QR tab)

## Goal

Let a user download their hub's QR code for free, as PNG and SVG, from a
new "Share & QR" tab in the dashboard — the last unbuilt piece of the core
MVP editor per `AGENTS.md` §1/§11. The QR always encodes the permanent
`scan.locallifyagency.com/<slug>` URL, matching the product's core promise
(§1: it never expires, never depends on a third party). The **paid**
"Order Printed QR" flow is out of scope here — it's blocked on an
unresolved price/shipping decision (`AGENTS.md` §15) — so this tab shows a
disabled "Order Printed QR — coming soon" affordance only, no payment
logic, per "do not build V2/Later items... do not overbuild."

## Skills read

- `supabase` — not directly applicable; no schema or RLS changes, this
  reads data the dashboard already loads (`slug`, `logo_path`).
- No Clerk changes needed either — this is a client-only rendering feature
  behind the existing authenticated `/dashboard` route.

## Existing code inspected

- `app/dashboard/dashboard-editor.tsx` — tab state is
  `useState<"links" | "branding" | "settings">`, tab buttons rendered from
  a hardcoded array with `capitalize` styling (bare key as label — works
  for single words, not for "Share & QR"). Already has `slug` and
  `logoPath` state lifted here, both needed for the QR/logo preview.
- `lib/site.ts` — `SITE_URL = "https://scan.locallifyagency.com"`. The
  full hub URL a QR should encode is `` `${SITE_URL}/${slug}` ``.
- `lib/storage.ts` — `getPublicAssetUrl(path)` turns `logo_path` into a
  public Storage URL; reused here for the optional centre-logo image.
- No QR library installed yet (`package.json` has none). Confirmed via
  `qr-code-styling`'s README and its `package.json` on unpkg (v1.9.2):
  ships its own `types` field (`lib/index.d.ts`, no separate `@types`
  package needed), constructor `type: 'svg' | 'canvas'` only controls how
  it's rendered on-page — `.download({ extension })` (`'png' | 'svg' |
  'jpeg' | 'webp'`) works independently of that, so **one instance**
  constructed with `type: "svg"` can preview crisply at any CSS size and
  still export both PNG and SVG. It's DOM-based (`document` calls
  internally) — must run in a `"use client"` component, never during SSR.
- No existing prompt built the "Share & QR" tab yet — `branding-tab.tsx`
  and `logo-upload.md` establish the pattern for a new dashboard tab file
  + wiring into `dashboard-editor.tsx`'s tab list, reused here.

## Decisions / assumptions

- **Library: `qr-code-styling`** (confirmed with the user)  — supports
  PNG + SVG export and an optional centre logo image out of the box,
  resolving the open decision in `AGENTS.md` §6/§15. I'll update that
  section once this ships.
- **Single high-res `QRCodeStyling` instance**, `type: "svg"`,
  constructed at `width: 1024, height: 1024` (print-quality), displayed
  in the tab scaled down via a fixed-size wrapper (SVG scales cleanly,
  unlike canvas) — no separate "preview" vs "download" instance needed.
- **Colors: black modules on a white background, always** — not tied to
  the page's `accent`/theme colors. A colored or low-contrast QR is a
  real scan-reliability risk, especially once printed small on a sticker;
  free download and (eventually) printed orders should both prioritize
  "definitely scans" over brand-matching. `dotsOptions.type: "rounded"`
  and `cornersSquareOptions.type: "extra-rounded"` for a modern look
  without hurting scannability (still high-contrast, standard finder
  pattern shape).
- **Centre logo is opt-in and only offered if `logo_path` is set** — a
  checkbox, off by default (a busy photo logo can hurt scan reliability
  at small print sizes; PRD §5.3 says "optionally," so default to the
  safer option). When checked, `image: getPublicAssetUrl(logoPath)` with
  `imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 8 }`.
- **New "Share & QR" tab**, inserted between Branding and Settings in the
  tab bar. The tab bar's `capitalize`-styled bare-key rendering doesn't
  fit "Share & QR", so it gets a small label map instead of relying on
  the raw key string (`links`/`branding`/`share`/`settings` → display
  labels).
- **"Order Printed QR" — visibly present but disabled**, with a "Coming
  soon" badge and no click handler wired to anything — establishes the
  spot in the UI without building the payment/shipping flow, which needs
  the still-open pricing decision first.
- **Filenames**: downloads as `<slug>-qr.png` / `<slug>-qr.svg`, not a
  generic name — several users' downloads shouldn't collide if saved to
  the same folder.

## Files likely to change

- `package.json` — add `qr-code-styling` dependency.
- `app/dashboard/qr-tab.tsx` — new. The Share & QR tab: QR preview,
  centre-logo checkbox (if applicable), Download PNG / Download SVG
  buttons, hub URL display with copy-to-clipboard, disabled "Order
  Printed QR" CTA.
- `app/dashboard/dashboard-editor.tsx` — modify. Add `"share"` to the tab
  union, a label map for tab button text, and render `<QrTab />` with
  `slug` + `logoPath` props.
- `AGENTS.md` §6/§15 — modify. Mark the QR library decision resolved
  (`qr-code-styling`).

## Implementation requirements

**`qr-tab.tsx`**
- `"use client"`. Props: `slug: string`, `logoPath: string | null`.
- `useRef` for the container div the QR gets `.append()`-ed into, plus a
  `useRef<QRCodeStyling | null>` for the instance itself.
- `useEffect` (client-only): construct the `QRCodeStyling` instance once
  on mount with the current `slug`/logo state, `.append(containerRef.current)`.
  A second `useEffect` calls `.update({ data, image })` whenever `slug`,
  the logo checkbox, or `logoPath` changes, instead of re-constructing —
  avoids a flash/re-append on every toggle.
- Wrapper around the appended SVG fixed at a reasonable preview size
  (e.g. `w-56 h-56` / ~224px) with `overflow-hidden rounded-[16px]
  border border-[#33373b] bg-white p-4` — white background box so the QR
  (which is always black-on-white regardless of page theme) reads clearly
  against the dark dashboard chrome.
- Hub URL shown as text (`scan.locallifyagency.com/<slug>`) with a copy
  button (`navigator.clipboard.writeText`, brief "Copied" confirmation
  state — same lightweight pattern as other saved-confirmation states in
  this codebase, e.g. `settings-tab.tsx`'s "Saved.").
- "Include my logo in the center" checkbox — only rendered when
  `logoPath` is truthy; unchecked by default.
- Two buttons: "Download PNG" and "Download SVG", each calling
  `qrRef.current?.download({ name: `${slug}-qr`, extension: "png" | "svg" })`.
- "Order Printed QR" section: card with a short description line, a
  disabled button styled clearly as inactive (not just `opacity-50` on an
  active-looking button — should read as genuinely unavailable, e.g. a
  muted "Coming soon" badge next to the label instead of a clickable CTA
  shape).

**`dashboard-editor.tsx`**
- `useState<"links" | "branding" | "share" | "settings">("links")`.
- Tab label map: `{ links: "Links", branding: "Branding", share: "Share & QR", settings: "Settings" }`;
  tab button text renders from the map instead of the raw capitalized key.
- `{tab === "share" && <QrTab slug={slug} logoPath={logoPath} />}` added
  alongside the other tab branches, positioned after Branding.

## Security requirements

- No new writes, no new RLS surface — this tab only reads state the
  dashboard already holds client-side (`slug`, `logoPath`) and renders/
  downloads a QR entirely in the browser. No new Server Action, no new
  Storage access beyond the existing public logo URL.
- The QR encodes only the public hub URL — no user PII embedded in the
  code itself beyond what's already public on the hub page.

## Acceptance criteria

- Share & QR tab shows a live QR pointing at the correct
  `scan.locallifyagency.com/<slug>` URL, updating immediately if the slug
  is changed on the Settings tab and the user returns to Share & QR (no
  stale slug).
- "Download PNG" saves a `<slug>-qr.png`; opening it shows a clean,
  scannable, high-resolution QR.
- "Download SVG" saves a `<slug>-qr.svg`; opening it in a browser/vector
  editor shows a crisp vector QR, not a rasterized embed.
- Scanning either downloaded QR (phone camera) opens the correct hub URL.
- If the user has a logo uploaded, the centre-logo checkbox appears,
  defaults unchecked, and toggling it updates the preview and both
  downloads to include/exclude the logo accordingly.
- If the user has no logo, no checkbox is shown at all.
- "Order Printed QR" is visibly present but not clickable/functional.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. `npm install` (picks up the new `qr-code-styling` dependency),
   `npm run dev`.
2. Sign in, go to `/dashboard` → "Share & QR" tab.
3. Confirm a QR renders in a white box, and the URL text below it reads
   `scan.locallifyagency.com/<your-slug>`.
4. Click the copy button, paste somewhere, confirm it copied the full
   `https://scan.locallifyagency.com/<slug>` URL.
5. Click "Download PNG" — open the downloaded file, confirm it's a large,
   crisp, black-on-white QR.
6. Click "Download SVG" — open it (browser or code editor), confirm it's
   real vector markns (`<path>`/`<rect>` elements), not an embedded raster
   image.
7. Scan either downloaded QR with a phone camera — confirm it opens your
   live hub page.
8. If you have a logo uploaded (Branding tab): return to Share & QR,
   check "Include my logo in the center", confirm the preview updates,
   download both formats again, confirm the logo appears centered and
   the QR still scans correctly.
9. If you don't have a logo uploaded: confirm no logo checkbox appears.
10. Go to Settings, change your slug, save, return to Share & QR: confirm
    the QR/URL updated to the new slug without needing a full page reload.
11. Confirm "Order Printed QR" is visible but not clickable/functional.
