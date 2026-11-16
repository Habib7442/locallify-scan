# M1 — Live Board (Pehchaan): staff screen that dings

## Goal
A staff/owner screen at `/board` that **dings within 3 seconds** when a diner verifies or taps "I'm here". It shows the table, name, visit count and notes (phone masked). It's an installable PWA that survives a full day with the screen on: auto-reconnect, "Reconnecting…" banner, no leaks. This is the **M1 done-when** (`PRD.md` §17): *"A verified scan rings the Live Board in < 3 s."* Serves `PRD.md` §7.6 and `AGENTS.md` §5 (Live Board).

## Skills read
- `supabase` (Realtime): `postgres_changes` on `session_members` (already in the `supabase_realtime` publication, migration 0010). RLS filters events by the subscriber's JWT. A channel filter `business_id=eq.{id}` reduces traffic. Status callbacks (`SUBSCRIBED`, `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`) drive reconnects. Always `removeChannel` on unmount.
- `clerk` / `clerk-nextjs-patterns`: the browser Supabase client gets its token from `useAuth().getToken()` (`lib/supabase/client.ts`). The Clerk session token is short-lived (~60 s), so Realtime must get fresh tokens: the supabase-js `accessToken` callback is used for REST, and Realtime is re-authed with `supabase.realtime.setAuth()` on an interval (verified against the installed supabase-js during implementation).
- `node_modules/next/dist/docs/`: `app/manifest.ts` (PWA manifest), client components, `metadata`/`viewport`.

## Existing code inspected
- Migration 0010: `public.live_board_feed(p_since)` (masked phone, own business only), `public.set_customer_note(id, note)`. RLS select on `session_members`/`table_sessions` for staff.
- Migration 0012: members become verified via the webhook (`verified_at` set, UPDATE) or "I'm here" (INSERT with `verified_at`, or UPDATE).
- `lib/supabase/client.ts` (`useSupabaseBrowserClient`), `app/board/page.tsx` (placeholder), `app/board/layout.tsx` (ClerkShell), `components/owner/OwnerShell.tsx`, `lib/business.ts` (`getOrgContext`, `getCurrentBusiness`).

## Decisions / assumptions (⚠️ = please confirm)
1. **What rings:** a `session_members` change for this cafe where `verified_at` goes from empty to set (UPDATE) or is inserted already set (INSERT). Unverified joins (someone just tapped Verify) show quietly as "Waiting for WhatsApp…" with no ding.
2. **On every event**, the board re-fetches `live_board_feed(now() − 12 h)` (one small RPC) rather than trusting the payload. The Realtime payload has ids only, never phones, and the RPC does the masking (`AGENTS.md` §5).
3. **Layout (tablet/phone, dark, big type):**
   - **Top bar:** cafe name, a live status dot (green "Live" / amber "Reconnecting…"), sound on/off.
   - **"Just arrived"**: the newest check-ins as large cards. "🔔 Table 4 · Priya", "3rd visit" (or "New customer"), the note ("kam teekha"), time ago. A new card flashes for 10 s.
   - **"Tables now"**: open sessions grouped by table, with who's checked in.
   - **Tap a customer** → a sheet with an "Add note" field (≤ 280 chars) and helper text "Only food preferences, like 'kam teekha'. No personal details." (`AGENTS.md` §11) → `set_customer_note`.
4. **Ding:** a short two-tone chime generated with the **Web Audio API** (no audio file) + `navigator.vibrate(200)` + the card flash. Browsers block sound until a tap, so a big **"Start Live Board"** button arms sound and requests a **Screen Wake Lock** (keeps the tablet awake), re-acquired on visibility change.
5. **Reliability for a full day:**
   - one channel per mount, removed on unmount
   - on `CHANNEL_ERROR`/`TIMED_OUT`/`CLOSED` → banner + exponential backoff resubscribe (1 s → 30 s)
   - after any reconnect, plus every 60 s and on `visibilitychange` → refetch the feed (catches events missed while offline)
   - Realtime token refreshed every 45 s
   - no growing arrays: the feed is replaced, not appended (max 200 rows from the RPC)
6. **Who can open it:** owners and staff (any org member). Owners also get an "Open Live Board" link on `/dashboard`, replacing "Coming soon".
7. ⚠️ **PWA:** add `app/manifest.ts` (name "Dobara Live Board", `start_url: /board`, `display: standalone`, dark theme, the existing icons in `public/`) so staff can "Add to Home screen". **Web Push notifications** (alerts while the app is closed) are **not** in M1. They come in a later prompt, because the M1 goal is the on-screen ding.
8. **Queued, retrying actions** (`AGENTS.md` §5): the only M1 action is "Add note". It retries up to 3 times with backoff and shows "Saved" / "Will retry". Close visit and redeem come in M2.
9. Copy goes in `content/board.ts`.

## Files likely to change
- `app/board/page.tsx` (server: auth + business → renders client board) + **new** `app/board/LiveBoard.tsx` (client), `app/board/useLiveFeed.ts` (Realtime + refetch + reconnect), `app/board/chime.ts` (Web Audio), `app/board/NoteSheet.tsx`.
- **New** `app/manifest.ts`, `content/board.ts`.
- `app/dashboard/page.tsx` + `content/owner.ts`: an enabled "Open Live Board" link.
- `lib/supabase/client.ts`: expose Realtime auth refresh if needed.

## Security requirements
- The board uses only the **RLS-scoped** browser client with the Clerk JWT. No service role anywhere.
- Phones are shown only as `…3210`, from the RPC. Staff can't see full numbers or `verify_code`.
- The note RPC re-checks the business server-side. Notes are capped at 280 chars.
- No customer data in `localStorage`. Only the sound on/off preference is stored there.

## Acceptance criteria
- With `/board` open on a phone/tablet and armed, scanning T4 on another phone → Verify → send → the board **dings within 3 s** of the WhatsApp reply, showing "Table 4 · {name} · 1st visit".
- "I'm here" from a returning device also dings.
- Turn Wi-Fi off and on → "Reconnecting…" shows and clears, and missed check-ins appear after reconnect.
- Leave the board open 30+ min → still receiving (token refresh works). No console errors.
- Staff see `…0886`, never the full phone. Adding a note shows on the card and on the next scan.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build` · local Realtime test: open `/board` signed in as the Aroma owner, trigger a verify via the scan page + signed webhook test, time the ding.

## Manual test steps
1. Laptop/tablet: sign in → `/dashboard` → **Open Live Board** → tap **Start Live Board** (allow sound).
2. Phone: open `https://scan.locallifyagency.com/r/aroma/t/T4` → Verify → send on WhatsApp.
3. The board dings within 3 s with "Table 4 · Habib Tanwir · 2nd visit".
4. Tap the card → add note "kam teekha" → it appears on the card.
5. Toggle Wi-Fi on the board device → "Reconnecting…" → back to "Live".
