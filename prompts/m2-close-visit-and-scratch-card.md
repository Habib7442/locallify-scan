# M2 (part 1) — Close visit, scratch card, redeem, prize settings

## Goal
The core "bring them back" loop (`PRD.md` §7.5, §7.6 staff actions, milestone **M2**):
1. Staff **close a table's visit with the bill amount** on the Live Board.
2. Each eligible diner gets a **scratch card** on their scan page. The **prize is drawn server-side** from the owner's weighted prize list when the visit closes.
3. The diner **scratches to reveal** "☕ Free Cold Coffee — valid till 30 Nov" (touch, mouse, or "Tap to reveal").
4. On their **next visit** the board shows "🎟️ Has: Free Cold Coffee" and staff tap **Redeem**.
5. The owner sets the **prize list + chances, minimum bill, validity days** and sees issued / redeemed / expired counts.

Also included: **name correction** (the user's option C). After verifying, a diner can fix their name; staff/owner can fix it from the board.

Part 2 (`m2-prize-reminder.md`, next): `dobara_prize_saved` / `dobara_prize_reminder` templates, the day-10 reminder job, the expiry sweep.

## Skills read
- `supabase-postgres-best-practices`: new tables with FK indexes + RLS. All money/prize logic in **security definer RPCs** that re-check the caller's business and role. The weighted draw uses Postgres `random()` server-side. Row locks on close/redeem. Partial indexes for active prizes.
- `supabase` (Realtime): add `prizes` and `table_sessions` changes to the board's subscription. The `table_sessions` publication already exists.
- `clerk`: staff = `org:member`, owner = `org:admin`. Prize settings are owner-only.
- `node_modules/next/dist/docs/`: Server Actions for owner settings; Route Handlers for the anonymous reveal/name posts.

## Existing code inspected
- Migrations 0010–0012: `table_sessions` (status, bill_amount, closed_at, closed_by), `session_members`, `customers`, `live_board_feed()`, `verify_member_code()`, `record_visit()`, `private.current_business_id()`/`jwt_org_role()`.
- `lib/scan.ts` (`getDeviceState`), `app/r/[business]/t/[table]/page.tsx` (states new / returning / checked-in), `lib/scan-request.ts` (same-origin, device cookie).
- `app/board/*` (LiveBoard, useLiveFeed, NoteSheet), `app/dashboard/*`.
- `PRD.md` §10 (`reward_settings`, `prizes`), §7.5 rules.

## Decisions / assumptions (⚠️ = please confirm)
1. **Migration 0013:**
   - **`reward_settings`** (one row per cafe, created on first read with defaults):
     - `scratch_enabled true`, `scratch_min_bill 200`, `prize_validity_days 14`, `reminder_enabled true`
     - `scratch_all_members true`
     - `prizes jsonb` defaulting to `[{label:"₹50 off",weight:50},{label:"Free cold drink",weight:30},{label:"Free dessert",weight:15},{label:"Free meal for 2",weight:5}]`
     - squad fields for M3 (`squad_enabled false`, `squad_reward_text`, `squad_min_size 4`), unused for now
   - **`prizes`**:
     - `id`, `business_id`, `customer_id`, `session_id`, `label`
     - `code` (6 chars, unique per cafe, shown at the counter)
     - `status` `unscratched|active|redeemed|expired`
     - `valid_from` (= visit close time), `valid_until` (= close + validity days, end of day IST)
     - `revealed_at`, `redeemed_at`, `redeemed_by` (Clerk id), `redeemed_session_id`, `created_at`
     - `unique (customer_id, session_id)`: one card per visit per customer
     - indexes on FKs + `(business_id, status)` + partial `(customer_id) where status in ('unscratched','active')`
   - **RLS:** staff read own-cafe prizes; owner reads/updates `reward_settings`; no anon access; all prize writes via RPC.
2. ⚠️ **Squad scratch cards** (`AGENTS.md` §15 open decision): resolved as **owner's choice**, default **every verified member gets a card** (`scratch_all_members = true`). When off, only the first verified member of the table gets one.
3. **`close_visit(p_session_id, p_bill_amount)`** (staff or owner):
   - lock the session → must be own cafe and `open/billing`
   - set `closed`, `bill_amount`, `closed_at`, `closed_by = jwt sub`
   - if `scratch_enabled` and bill ≥ `scratch_min_bill` → for each eligible verified customer, **weighted random draw** + insert a prize (`unscratched`)
   - returns how many cards were issued
   - bill 0–1,00,000, two decimals.
4. **"Next visit only" is enforced at redeem time:** `redeem_prize(p_prize_id)` (staff or owner) requires:
   - status `active` or `unscratched` (shown at the counter even if not scratched)
   - now ≤ `valid_until`
   - the customer is **checked in to a different, later session** than the one that issued it

   Then it sets `redeemed`, `redeemed_at`, `redeemed_by`, `redeemed_session_id`. Screenshot reuse is impossible because redemption is a server-side state change confirmed by staff.
5. **Scratch card on the scan page:**
   - After close, the diner's page (their device is linked to the customer) shows "🎁 You won a prize for your next visit" with a **scratch card**. The label is **not in the HTML**.
   - Scratching ≥ 45% (canvas, pointer events = touch + mouse) or tapping **"Tap to reveal"** → `POST /api/prize/reveal` (same-origin + device cookie → only that customer's own prize) → server sets `active`, `revealed_at` → returns label + valid-until + code.
   - `prefers-reduced-motion` → no animation, just the tap button.
   - ~3 KB client component, loaded only in this state. The scan page stays light.
   - Revealed / used / expired prizes show as such ("Used on 12 Nov" / "Expired").
   - The page also lists the diner's **active prizes** in the returning state ("🎟️ Free Cold Coffee · show this at the counter · code K7Q2").
6. **Live Board additions:**
   - `live_board_feed()` is replaced (drop + create, new return columns) to include each customer's **best active prize** (id, label, valid_until, issued session) and the session's `bill_amount`/status.
   - Cards show "🎟️ Has: Free Cold Coffee (till 30 Nov)" + a **Redeem** button, enabled only when redeemable (different session).
   - Table cards get a **Close visit** button → a sheet with the bill amount (numeric keypad, ₹) → confirm → "3 scratch cards sent" toast.
   - Subscription adds `table_sessions` + `prizes` changes (refetch on change).
7. **Name correction (option C):**
   - **Diner:** on the checked-in page, "Not {name}? Change" → small form → `POST /api/scan/name` (device cookie → that customer only, at this cafe; 1–40 chars).
   - **Staff/owner:** tap the name on a board card → `set_customer_name(customer_id, name)` RPC (own cafe).
   - If WhatsApp gave no name, the checked-in page asks "What should we call you?" (optional).
8. **Owner settings** `/dashboard/rewards` (owner only, Server Actions via the RLS client):
   - Scratch cards on/off, minimum bill (₹), validity (days), "every person at the table gets a card" toggle.
   - Prize list editor: 1–8 prizes, label ≤ 40 chars, weight 1–100. Shows each prize's % chance.
   - Counts: issued / redeemed / expired (this month + all time).
   - `/dashboard` gets a "Rewards" link + the counts.
9. Copy goes in `content/board.ts`, `content/owner.ts`, `messages/scan.ts`.

## Files likely to change
- **New** `supabase/migrations/0013_prizes.sql` (+ `schema.sql`, `dobara-types.ts`, `AGENTS.md` §7/§15, `PRD.md` §10).
- `lib/scan.ts` (device state: prize states), `app/r/[business]/t/[table]/page.tsx` (+ **new** `ScratchCard.tsx` client, `NameForm`), **new** `app/api/prize/reveal/route.ts`, `app/api/scan/name/route.ts`.
- `app/board/LiveBoard.tsx`, `useLiveFeed.ts`, **new** `CloseVisitSheet.tsx`, `NameSheet.tsx`.
- **New** `app/dashboard/rewards/page.tsx` + `actions.ts` + `RewardsForm.tsx`. `app/dashboard/page.tsx` (link + counts).

## Security requirements (`AGENTS.md` §5 trust rules)
- **Prize outcomes are decided server-side at close.** Scratching only reveals a stored result. The client never picks or submits a prize.
- **Redemption only by staff/owner** via RPC. No diner-side path can mark anything redeemed.
- The reveal and name endpoints act only on the prize/customer linked to the **signed device cookie** at **that cafe**. Same-origin forms only, rate-limited like the scan POSTs.
- RPCs are security definer, `search_path = ''`, own-business checks, role check (settings owner-only), execute for `authenticated` only (never `anon`). Bill amounts and weights are validated.
- Staff still never see full phones.

## Acceptance criteria (`PRD.md` §7.5 + M2 done-when, part 1)
- Staff close Table 5 with ₹450 → each verified diner there gets a scratch card. Below the minimum (₹150) → no card, and the board says so.
- The diner's page shows the card. Scratch works with a finger and a mouse; "Tap to reveal" works. The prize label wasn't in the page source before revealing.
- Next visit (new session) → the board shows "🎟️ Has: …" → **Redeem** → status redeemed. The diner's page shows "Used on …". Redeem in the same session is refused.
- Expired prizes show "Expired" and can't be redeemed.
- The owner changes the prize list / minimum bill / validity and new cards follow it. The counts are correct.
- A diner can correct their name; staff can correct it from the board.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass. The scan page is still < 300 KB in the new/returning states.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build` · SQL test script `supabase/tests/m2_prizes.sql` (rolled back): close → cards issued with the configured weights, below-min → none, double close refused, same-session redeem refused, cross-cafe redeem refused, staff can't update settings. Local end-to-end via the scan page + signed webhook + a staff session.

## Manual test steps
1. Run `0013_prizes.sql` in Supabase. Run `supabase/tests/m2_prizes.sql`: no errors.
2. `/dashboard/rewards`: set prizes (e.g. 100% "Free Cold Coffee" for the test), min bill ₹200, validity 14 days.
3. Phone: scan T6 → verify. Board: Table 6 → **Close visit** → ₹450.
4. Phone: the page shows the scratch card → scratch → "☕ Free Cold Coffee — valid till …, code ABC123".
5. Next day (or a new session: scan another table) → board card shows "🎟️ Has: Free Cold Coffee" → **Redeem** → the phone shows "Used".
6. Phone: "Not Habib? Change" → set a name → the board shows it.
