# M0 — WhatsApp webhook stub

## Goal
Build `/api/whatsapp/webhook` so Meta can verify it and deliver messages, and so we can prove the round trip. **M0 is done when a test message sent to the Dobara test number gets an automatic reply** (`PRD.md` §17 M0). This is the foundation the M1 verify flow (`PRD.md` §7.3) builds on.

## Skills read
- `supabase` + `supabase-postgres-best-practices`: only if decision 2 (the events table) is approved.
- `node_modules/next/dist/docs/`: Route Handlers (reading the raw body with `request.text()`, `runtime`, `dynamic`).
- Meta WhatsApp Cloud API docs: webhook verification (`hub.mode` / `hub.verify_token` / `hub.challenge`), the `X-Hub-Signature-256` HMAC, the messages payload shape, and `POST /{phone-number-id}/messages`.

## Existing code inspected
- `app/api/webhooks/clerk/route.ts`: pattern to follow (verify first → 400 on failure → do work → small responses).
- `lib/supabase/admin.ts`: service-role client, `server-only`. The webhook is a documented service-role path (`AGENTS.md` §5/§13).
- `proxy.ts`: Clerk middleware matches `/api/*` but protects only `/dashboard` and `/onboarding`, so the webhook stays public. No change needed.
- `.env.local`: all four `WHATSAPP_*` values are set; the Phone Number ID is Meta's test number.
- Meta's OAuth dialog uses Graph API **v27.0**.

## Decisions / assumptions (⚠️ = please confirm)
1. **Env names** confirmed as proposed in `AGENTS.md` §14: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`. Add an optional `WHATSAPP_GRAPH_VERSION`, defaulting to `v27.0`. Update §14 to mark them "configured".
2. ⚠️ **Idempotency storage.** `AGENTS.md` requires deduping on `wa_message_id`, which needs a table. The full `message_log` needs `business_id`, which isn't decided yet, so it can't be created now. **Proposal:** migration `0009_whatsapp_webhook_events.sql` creates a small raw-inbox table that doesn't depend on `business_id`:
   - `whatsapp_webhook_events(id bigint identity pk, wa_message_id text unique not null, kind text check in ('message','status'), from_phone text null, payload jsonb not null, received_at timestamptz default now())`
   - RLS **enabled with no policies**, so only the service role can touch it and nobody else can read it. Index on `received_at`.
   - Insert with `on conflict (wa_message_id) do nothing`. If no row was inserted, it's a retry: skip it.
   - In M1 it stays useful as the raw audit/replay log; `message_log` comes in with the business schema.
   - **Alternative:** no table in M0, log to the console only, and accept that a retried message may get a second reply during testing.
3. **The stub's reply.** For an inbound **text** message only, send a free-form service message (we're inside the 24-hour window the customer just opened): `Dobara test ✅ We got your message: "<first 100 chars>"`. No reply to statuses, reactions or media; those are just recorded. No templates.
4. **Masked logging.** Log only the last 4 digits of phone numbers, never message bodies (privacy, `AGENTS.md` §11).
5. Always return **200** quickly once the signature is valid, even if the reply send fails (log the error), so Meta doesn't retry endlessly. Return **401** on a bad or missing signature, **403** on a bad verify token.
6. Not in scope: STOP/opt-out handling, verify-code matching, `message_log` cost tracking and templates. Those land in M1/M4 with the business schema.

## Files likely to change
- **New** `app/api/whatsapp/webhook/route.ts`: GET (verify) + POST (signature → parse → dedupe → reply). Thin, using helpers below.
- **New** `lib/whatsapp/config.ts` (`server-only`): reads and validates env, exports `GRAPH_BASE`.
- **New** `lib/whatsapp/signature.ts` (`server-only`): `verifyMetaSignature(rawBody, header, appSecret)` using `crypto.createHmac('sha256')` + `timingSafeEqual`, with a length check first.
- **New** `lib/whatsapp/types.ts`: narrow typed shapes for the webhook payload we read (entry → changes → value → messages/statuses), plus a type guard. No `any`.
- **New** `lib/whatsapp/send.ts` (`server-only`): `sendText(toE164, body)` → POST `https://graph.facebook.com/{version}/{phoneNumberId}/messages`, with a 10 s timeout and a typed result.
- **New** (if decision 2 is approved) `supabase/migrations/0009_whatsapp_webhook_events.sql`, plus the same table in `supabase/schema.sql`, and an update to `AGENTS.md` §7.
- `AGENTS.md` §14: mark the env vars configured, add `WHATSAPP_GRAPH_VERSION`.

## Implementation requirements
- `export const runtime = "nodejs"` (needs `crypto`) and `export const dynamic = "force-dynamic"`.
- **GET:** if `hub.mode === "subscribe"` and `hub.verify_token` equals the env value (constant-time compare), return `hub.challenge` as `text/plain` 200. Otherwise 403.
- **POST:** `const raw = await req.text()` **before any parsing**. Verify `X-Hub-Signature-256` (`sha256=<hex>`) against `WHATSAPP_APP_SECRET`; if it fails, return 401 without parsing. Then `JSON.parse` in try/catch (bad JSON → 400). Accept only `object === "whatsapp_business_account"`.
- For each `messages[]`: dedupe on `id`. For new text messages, reply via `sendText` to `from`. For each `statuses[]`: dedupe on `${id}:${status}` (a single message gets several statuses), record only.
- Process the payload in a loop that handles multiple entries and changes. A failure on one item must not block the others.
- Keep the route handler under ~60 lines, with the logic in `lib/whatsapp/*`.

## Security requirements
- The app secret, access token and verify token are only read in `server-only` modules, never in client code or `NEXT_PUBLIC_*` vars.
- Verify the signature on the raw body before trusting anything in it (`AGENTS.md` §13). Use a constant-time comparison.
- The service role is used only inside this webhook (documented exception).
- No message bodies or full phone numbers in logs.
- The events table: RLS on, no policies, so anonymous and authenticated users can't read or write it.

## Acceptance criteria
- `GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=<correct>&hub.challenge=123` → `123`. A wrong token → 403.
- A POST with a bad or missing signature → 401, and nothing is stored or sent.
- A real WhatsApp text to the test number → an automatic reply within a few seconds (**M0 done-when**).
- Meta redelivering the same message → no second reply.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`. Plus local curl tests for GET verify, and a POST signed with the app secret computed by a small node one-liner (and an unsigned one).

## Manual test steps
1. Apply the migration if approved (Supabase SQL editor or `supabase db push`).
2. Add the four `WHATSAPP_*` vars in **Vercel → Settings → Environment Variables** (Production), then deploy.
3. In Meta: **WhatsApp → Configuration → Webhook → Edit**. Callback `https://scan.locallifyagency.com/api/whatsapp/webhook`, verify token = `WHATSAPP_VERIFY_TOKEN` → **Verify and save**. Then **Webhook fields → subscribe `messages`**.
4. From your phone (already added as a test recipient), send "Hi" to **+1 555 173 2813**.
5. Expect the reply `Dobara test ✅ We got your message: "Hi"`.
6. Check Vercel logs: one inbound message logged with a masked phone. If decision 2 is approved, the `whatsapp_webhook_events` table has the row.
7. Note: the temporary access token expires in about 24 hours. If replies stop, generate a new one (or do step 13, the permanent System User token).
