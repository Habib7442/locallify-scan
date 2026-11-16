# M1 — Table QR cards + customer scan page

## Goal
1. **Owners get a printable QR card for every table** (`PRD.md` §7.1).
2. **Diners who scan land on a fast, branded scan page** at `/r/{slug}/t/{code}`. It logs the scan, recognises returning devices, and starts WhatsApp verification with a one-time code (`PRD.md` §7.2, §7.3 first half).

Milestone **M1**. The next prompt (`m1-whatsapp-verify.md`) makes the webhook consume the code. The one after (`m1-live-board.md`) rings the board.

## Skills read
- `supabase` / `supabase-postgres-best-practices`: the anonymous scan path runs server-side with the service role and tight, explicit queries (`AGENTS.md` §5/§13). No anon table access. Small migration for the opt-in intent and rate limiting.
- `node_modules/next/dist/docs/`: dynamic route params are Promises; Route Handlers for the POST; `cookies()`; `proxy.ts` can set response cookies; Server Components by default; `metadata`/`viewport`.
- `qr-code-styling` (package docs): client-side QR rendering to canvas/SVG + `download()`.

## Existing code inspected
- `pages` branding columns: `theme`, `accent`, `logo_path`, `bg_type/bg_value`, `bg_image_*`, colour overrides, `heading_font`, `link_font`. `lib/themes.ts` (`THEMES` recipes), `lib/storage.ts` (`getPublicAssetUrl`), `lib/fonts.ts` (**loads 8 Google fonts**, too heavy for a 300 KB page).
- `scans(page_id, link_id, table_id, device, country, referrer)`.
- Migration 0010 tables. `lib/business.ts`, `app/dashboard/*`. `lib/site.ts` (`whatsappLink` targets the sales number; the scan page needs the **Dobara** number).
- `proxy.ts` (Clerk middleware; matcher already covers `/r/*`).

## Decisions / assumptions (⚠️ = please confirm)
1. **No writes on a plain GET except the scan log.** WhatsApp/Facebook link-preview crawlers and prefetchers fetch URLs, so a GET must not create sessions or codes. GET renders and inserts **one `scans` row**, skipped for known bot user-agents. Session join and code issue happen on **POST** when the diner taps the button.
2. **Device cookie** `dobara_device`: a random 22-char id, **HMAC-signed** with `DEVICE_COOKIE_SECRET`, `httpOnly`, `Secure`, `SameSite=Lax`, 180 days, path `/`. Issued in **`proxy.ts`** for `/r/*` when missing or invalid (Server Components can't set cookies), so the first render can already read it. Verified server-side on every use; a tampered cookie is ignored and replaced.
3. **Tap "Verify on WhatsApp"** → plain HTML `<form method="post" action="/api/scan/verify">` (works without JS) → Route Handler:
   - rate-limit (decision 6) → resolve cafe + table (active only)
   - **lazy-expire** live sessions older than 3 h on that table → join the table's live session or open one (the partial unique index handles races; retry once)
   - upsert `session_members` for this device: reuse the row if it already has an unexpired code, else issue a new code
   - store the `wants_offers` choice → **303 redirect** to `https://wa.me/{DOBARA_NUMBER}?text=Hi {Cafe} 👋 (code: T4-7KQ2)`
   - The code is `{TABLE}-{4 chars}` from `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (no 0/O/1/I/L), unique (retry on collision), and expires in **15 min**.
4. **Returning visitor:** if the device cookie maps to a **verified** member at this cafe (latest `session_members` with `customer_id`), show "Welcome back, {name} 👋" and a one-tap **"I'm here"** form. `POST /api/scan/here` joins the live session as an already-verified member (`verified_at = now()`, `customer_id` from the device link, no WhatsApp round trip). This is `PRD.md` §7.2's returning flow. A device link exists only after a WhatsApp-verified phone used that device (set by the webhook in the next prompt), so this never lets a device claim an unverified phone.
5. ⚠️ **Opt-in intent before verification:** the "Send me offers on WhatsApp" box (unticked by default) is chosen **before** we know the phone. **Migration 0011** adds `session_members.wants_offers boolean not null default false`. The webhook (next prompt) copies it to `customers.opted_in/opted_in_at` when the code is verified. Opting in is never set by any other path.
6. **Rate limiting without new infrastructure:** migration 0011 also adds `session_members.ip_hash text` (`sha256(ip + DEVICE_COOKIE_SECRET)` truncated, never the raw IP) plus index `(ip_hash, created_at)`. Limits checked in the POST handlers: **≤ 5 new codes per device per 10 min**, **≤ 20 per IP per 10 min** → friendly "Please wait a minute" page (429).
7. **Branding on a budget:** the scan page uses the cafe's **theme colours, accent, logo and background** from `pages` (via `THEMES`) but **only the base font** (Hanken, already loaded by the root layout). The 8 custom heading fonts are not loaded here (page-weight budget). Fonts can return later as a single self-hosted subset if wanted.
8. **Server-only JS:** the scan page is a Server Component with **no client JS** besides what the root layout already ships. Plain forms. Target: interactive in under 2 s on 4G, < 300 KB transferred. The page is excluded from Clerk UI (no Clerk components rendered on it).
9. **Shared Dobara WhatsApp number:** `NEXT_PUBLIC_WHATSAPP_NUMBER` (digits only). For now that's the Meta **test number `15551732813`**, which only delivers to numbers added as test recipients. Switch it when the real Dobara number is live. Added to `.env.local` + Vercel.
10. **Strings:** all scan-page UI text lives in `messages/scan.ts` keyed by language (`en` now; `hi`/`bn` keys stubbed with English until M5) per `AGENTS.md` §10.
11. **QR cards (owner side):** on `/dashboard`, a "Print QR cards" link → `/dashboard/print`. A client page renders one **A6 card per table** (2×2 per A4) with `qr-code-styling` (SVG, error correction **Q**, cafe accent colour on white, optional centre logo), the cafe name, a large table code ("T4"), "Scan to get rewards · Dobara by Locallify", and the short URL. Uses `@media print` CSS and a "Print" button (browser print → Save as PDF). Per-card **Download PNG**. `qr-code-styling` loads only on this owner page (dynamic import), never on the scan page.
12. **Privacy notice** (short, visible on the scan page): "We save your name, WhatsApp number and visits at {Cafe} to give you rewards. Only {Cafe} sees them. Reply STOP anytime." Plus a link to `/privacy-policy`.

## Files likely to change
- **New** `supabase/migrations/0011_scan_page.sql` (`wants_offers`, `ip_hash`, index) + `schema.sql` + `dobara-types.ts`.
- `proxy.ts`: set the signed device cookie on `/r/*`.
- **New** `lib/device.ts` (server-only: sign/verify the cookie with Web Crypto HMAC, readable in both the proxy and Node). **New** `lib/scan.ts` (server-only, service role: `getScanContext(slug, code, deviceId)`, `logScan`, `joinSessionAndIssueCode`, `markHere`, rate limits, code generator). **New** `lib/bots.ts` (UA check).
- **New** `app/r/[business]/t/[table]/page.tsx` (+ `not-found.tsx`), `app/api/scan/verify/route.ts`, `app/api/scan/here/route.ts`.
- **New** `messages/scan.ts`.
- **New** `app/dashboard/print/page.tsx` + `PrintCards.tsx` (client). `app/dashboard/page.tsx` gets the "Print QR cards" link.
- `AGENTS.md` §14: add `NEXT_PUBLIC_WHATSAPP_NUMBER` and `DEVICE_COOKIE_SECRET` as configured. §7: add the new columns.

## Implementation requirements
- **Scan page states:**
  - **New visitor:** cafe logo/name, "Table 4", short line, the offers box (unchecked), big "Verify on WhatsApp" button, privacy note.
  - **Returning visitor:** "Welcome back, Priya 👋" + "I'm here" + a small "Not you? Verify again" link.
  - **Already joined this session:** "You're checked in at Table 4 ✓".
  - **Table inactive / unknown cafe:** friendly 404.
  - (After-billing scratch card is M2.)
- Tap targets ≥ 48 px, body text ≥ 16 px, AA contrast on every theme (fall back to dark text/overlay if needed), not colour-alone, `prefers-reduced-motion` respected, `lang` attribute set.
- `metadata`: title "{Cafe} · Table 4", `robots: noindex`. No OG image work.
- All service-role queries filter by the resolved `business_id`. Never return another cafe's data. Never expose `verify_code` except inside the wa.me redirect for that device's own member row.
- POST handlers: same-origin check (`Origin`/`Sec-Fetch-Site`), the form only. Errors → small HTML error page with a "Try again" link back.

## Security requirements
- `DEVICE_COOKIE_SECRET` server-only (≥ 32 random bytes). Cookie signature compared in constant time.
- The service role is used only in `lib/scan.ts` (documented anonymous scan-page exception).
- Raw IPs are never stored (hashed with the secret).
- Codes: single-use, 15-min expiry, unique, never shown to staff (enforced in 0010).
- Opt-in comes only from an explicit tick, and becomes effective only after WhatsApp verification.
- No new personal data beyond `PRD.md` §13. `wants_offers` is consent intent.

## Acceptance criteria (from `PRD.md` §7.1–7.3 + `AGENTS.md` §10)
- Each table has a QR that opens `/r/{slug}/t/{code}`. Owners can print all cards.
- The scan page needs no login and no app, is **< 300 KB** and interactive in **< 2 s** on throttled "Fast 4G" in Lighthouse mobile, and is branded with the cafe's colours/logo.
- Tapping "Verify on WhatsApp" opens WhatsApp with `Hi Aroma 👋 (code: T4-XXXX)` prefilled. Tapping again within 15 min reuses the same code.
- A link-preview bot hitting the URL creates **no** session/member rows.
- A second device at the same table joins the **same** live session.
- The offers box is unticked by default. Its value is stored as `wants_offers`.
- A 6th code request from one device inside 10 min gets the "Please wait" page.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build` · Lighthouse mobile on `/r/aroma/t/T1` (production build) · curl tests: GET with a bot UA (no member rows), POST without Origin (rejected), and rate limit.

## Manual test steps
1. Run migration `0011_scan_page.sql` in the Supabase SQL editor.
2. Add `NEXT_PUBLIC_WHATSAPP_NUMBER=15551732813` and `DEVICE_COOKIE_SECRET=<I'll generate>` to `.env.local` and Vercel.
3. `npm run dev` → `/dashboard` → **Print QR cards** → 8 cards, Print preview looks right. Download one PNG.
4. Scan the T4 QR (or open `http://<your-PC-IP>:3000/r/aroma/t/T4` on your phone, same Wi-Fi) → the branded page loads quickly.
5. Tick "Send me offers", tap **Verify on WhatsApp** → WhatsApp opens with `Hi Aroma Cafe & Restaurant 👋 (code: T4-XXXX)`. Don't send yet (matching comes in the next prompt).
6. Supabase → `table_sessions`: one open session for T4. `session_members`: your device, a code, `wants_offers = true`. `scans`: one row with `table_id`.
7. Open the same URL in another browser → same session, new member row.
