# M1 — WhatsApp verify (code matching, customers, STOP/DELETE)

## Goal
When a diner sends the prefilled message (`Hi Aroma Cafe & Restaurant 👋 (code: T4-7KQ2)`) to the Dobara number, the signature-verified webhook:
- **matches the code** to the cafe + table + session member;
- **creates or updates the customer** (phone, WhatsApp profile name, consent);
- marks the member **verified** (this is what rings the Live Board next);
- replies **"Aroma Cafe & Restaurant: Welcome, Priya! ✓ …"**.

It also handles **STOP** (opt-out) and **DELETE** (erase data), and logs every message in `message_log`. This serves `PRD.md` §7.3, §12 (opt-out), §13 (deletion) and `AGENTS.md` §5 (trust rules), §9. Milestone **M1**. Built and tested on the Meta **test number**; switching to the real number later is config only.

## Skills read
- `supabase-postgres-best-practices`: do the match + customer upsert + member update **atomically** in one Postgres function with row locks (`for update`), so two retries or two phones can't double-verify. Security definer, `search_path = ''`, execute for `service_role` only.
- WhatsApp Cloud API docs: inbound payload `entry[].changes[].value.contacts[].profile.name` + `wa_id`; `messages[].text.body`; statuses (`sent/delivered/read/failed`); free-form **service** replies allowed within 24 h of the user's message.
- `node_modules/next/dist/docs/`: no Next changes besides a tiny script on the scan page.

## Existing code inspected
- `lib/whatsapp/handle.ts`: M0 echo reply ("Dobara test ✅ …") to every new text. `events.ts` dedupes on `wa_message_id`. `send.ts` → `sendText`. `types.ts`: no `contacts` yet.
- Migration 0010/0011: `session_members.verify_code` (unique, live codes only), `verify_expires_at`, `verified_at`, `wants_offers`. `customers` unique `(business_id, phone_e164)`, `opted_in/opted_in_at/opted_out_at`, `visit_count`, `last_visit_at`. `message_log.wa_message_id` unique.
- `lib/scan.ts`: `markHere` (returning device). It should also count the visit.
- Scan page: shows "checked in" on reload. The diner returns from WhatsApp to a stale page.

## Decisions / assumptions (⚠️ = please confirm)
1. **Code parsing:** case-insensitive `\b([A-Z0-9]{1,6}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4})\b` anywhere in the text (people sometimes edit the message). The first match is used.
2. **Atomic verify** in migration **0012**: `public.verify_member_code(p_code, p_phone_e164, p_profile_name)` → returns `status` (`verified | already | expired | not_found`) + cafe name, table code, customer name. Steps:
   - lock the member row by `verify_code` → check expiry and that the session is `open/billing`
   - upsert `customers (business_id, phone)`: set `name` from the WhatsApp profile name **only if empty**, trimmed, ≤ 80 chars
   - if `wants_offers` → `opted_in = true, opted_in_at = now(), opted_out_at = null` (a fresh, explicit tick counts as new consent)
   - set member `customer_id, verified_at = now(), verify_code = null, verify_expires_at = null`
   - **count the visit once per session**: `visit_count + 1, last_visit_at = now()` only if this customer wasn't already verified in this session
   - same phone already in the session from another device → that member is cleared (code nulled) and returns `already`.

   Granted to `service_role` only; revoked from `anon`/`authenticated`.
3. **`markHere`** (returning device "I'm here") also counts the visit through a small `public.record_visit(p_customer_id, p_session_id)` that's idempotent per session (same migration).
4. **Replies** (free-form service messages, inside the 24 h window, always naming the cafe, `AGENTS.md` §9). Copy lives in `messages/whatsapp.ts`:
   - `verified`: "{Cafe}: Welcome, {Name}! ✓ You're checked in at Table 4. Go back to the page to see your rewards."
   - `already`: "{Cafe}: You're already checked in at Table 4 ✓"
   - `expired`: "That code has expired. Please scan the QR on your table again."
   - `not_found` / no code / other text: "Hi! 👋 To get rewards, scan the QR code on your table and tap Verify on WhatsApp."
   - The M0 echo reply is removed.
5. ⚠️ **STOP on a shared number:** "STOP", "band karo", "unsubscribe" (exact phrase, trimmed, case-insensitive, also Hindi "बंद करो") sets `opted_out_at = now(), opted_in = false` for **all cafes** this phone is a customer of. The shared number can't tell which cafe the person means, so the safe reading of consent is all of them. Reply: "You won't get any more offers from Dobara cafes. Your rewards still work."
6. ⚠️ **DELETE:** an exact "DELETE" message → reply "Reply DELETE YES within 10 minutes to erase your data from all Dobara cafes." Then "DELETE YES" → **delete the customer rows for that phone in all cafes** (members' `customer_id` cascades; `message_log.customer_id` set null). Reply "Your data has been deleted." Immediate is well inside the 30-day promise. The two-step confirm avoids accidental deletion. Pending confirmations are stored as a `message_log` row (`template_name = 'delete_requested'`); no new table.
7. **message_log:** every inbound message (`direction in`, `category service`, `business_id` once matched) and every outbound reply (`direction out`, `category service`, `cost_inr 0`, `wa_message_id` from the send response). Statuses update `message_log.status` by `wa_message_id`. Phone numbers are never logged to the console in full.
8. **Back on the scan page:** a tiny inline script (≈ 300 bytes, no framework code) reloads the page when the diner returns from WhatsApp (`visibilitychange` → visible) while the page shows the "new" or "returning" state. That way "You're checked in ✓" appears by itself. No polling, no anon table access (`AGENTS.md` §5).
9. **Test-number limitation:** the test number only sends to phones on its recipient list. Your phone is already on it, so testing works. Real diners need the real number.

## Files likely to change
- **New** `supabase/migrations/0012_whatsapp_verify.sql` (`verify_member_code`, `record_visit`, grants) + `schema.sql`.
- `lib/whatsapp/types.ts` (contacts), `lib/whatsapp/handle.ts` (routing: STOP / DELETE / code / help), **new** `lib/whatsapp/verify.ts`, `lib/whatsapp/consent.ts` (stop + delete), `lib/whatsapp/log.ts` (message_log), `lib/whatsapp/send.ts` (return the message id; log outbound).
- **New** `messages/whatsapp.ts`.
- `lib/scan.ts` (`markHere` → `record_visit`), `app/r/[business]/t/[table]/page.tsx` (inline reload script).
- `AGENTS.md` §7 (functions), §9 (STOP applies to all cafes on the shared number; DELETE two-step).

## Security requirements
- Codes are consumed **only** by the signature-verified webhook (already verified before parsing), single-use (nulled on use), and respect the 15-min expiry (`AGENTS.md` §5).
- One phone counts once per session (unique constraint + the function's check).
- The verify function is service-role only. The webhook is the documented service-role path.
- Opt-in only via the explicit tick + verified phone. Opt-out is immediate.
- DELETE removes personal data across cafes and leaves no orphaned phone numbers (the raw `whatsapp_webhook_events.from_phone` for that phone is nulled too).
- No new personal data beyond `PRD.md` §13. The WhatsApp profile name is the "name".

## Acceptance criteria (`PRD.md` §7.3, §12, §13)
- Scan T4 → Verify → send the prefilled message → within a few seconds the reply "Aroma Cafe & Restaurant: Welcome, {name}! ✓ …" arrives. Back on the page it shows "You're checked in ✓".
- Supabase: `customers` has your phone (E.164) + WhatsApp name, `visit_count = 1`, `opted_in` matching the tick. `session_members` is verified with the code nulled.
- Sending the same message again → "already checked in", and `visit_count` stays 1.
- A code older than 15 min → the "expired" reply.
- Meta redelivering the webhook → no second reply (existing dedupe).
- "STOP" → `opted_out_at` set and the confirmation reply. "DELETE" then "DELETE YES" → customer rows gone + confirmation.
- Scanning again on the same phone (new session later) → "Welcome back, {name} 👋" → "I'm here" → `visit_count = 2`.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build` · signed-payload curl tests against the local server for: valid code, repeat, expired, unknown, STOP, DELETE → DELETE YES (test phone numbers, rows cleaned up afterwards).

## Manual test steps
1. Run `0012_whatsapp_verify.sql` in the Supabase SQL editor.
2. After deploy: on your phone open `https://scan.locallifyagency.com/r/aroma/t/T4` → tick offers → **Verify on WhatsApp** → **send**.
3. Expect the welcome reply. Switch back to the browser → "You're checked in ✓".
4. Send the same message again → "already checked in".
5. Send **STOP** → confirmation. Optionally send **DELETE**, then **DELETE YES**.
