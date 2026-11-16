# Implementation Prompt — Razorpay Standard Checkout & GST Integration

## Goal
Integrate Razorpay Standard Web Checkout into Locallify Scan for both printed QR physical orders and subscription plan checkouts, including 18% GST calculation (299 + GST = ₹352.82 total).

## Skills Read
- `.agents/skills/clerk` — user identity scoping
- `.agents/skills/supabase` — `orders` schema & RLS policies
- `.agents/skills/supabase-postgres-best-practices` — Postgres transaction & integrity patterns

## Existing Code Inspected
- `app/dashboard/qr-tab.tsx` (Share & QR tab editor)
- `app/dashboard/actions.ts` (Dashboard server actions)
- `lib/supabase/server.ts` & `lib/supabase/admin.ts`
- `.env.local` & `package.json`

## Key Decisions & Requirements
1. **Credentials & Environment**:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TRUE9sVVDMQyGW` (client + server)
   - `RAZORPAY_KEY_SECRET=pSzTMd8ozSHQCUtNd51Y0GtS` (server-only)
2. **GST Calculation Rule**:
   - Base Price + 18% GST.
   - Example: ₹299 + 18% GST (₹53.82) = ₹352.82 total (35,282 paise).
   - Example: ₹499 + 18% GST (₹89.82) = ₹588.82 total (58,882 paise).
   - Display clear breakdown: `Base: ₹299` + `GST (18%): ₹53.82` = `Total: ₹352.82`.
3. **Backend Endpoints**:
   - `POST /api/create-order`: Authenticated via Clerk. Calls Razorpay API (`v1/orders`) to generate `order_id`. Returns `{ order_id, amount, currency, gstAmount, baseAmount }`.
   - `POST /api/verify-payment`: Verifies HMAC-SHA256 signature (`order_id + "|" + payment_id`) using `RAZORPAY_KEY_SECRET`. Upon verified match, creates an `orders` record in Supabase database with status `pending` (for printed QR orders) or updates `subscription_status`.
4. **Frontend Integration**:
   - Loads Razorpay Script dynamically (`https://checkout.razorpay.com/v1/checkout.js`).
   - Replaces `🔒 Coming soon` on `app/dashboard/qr-tab.tsx` with active **Order Printed Stand** flow with shipping address capture and product selection (Acrylic Stand vs Vinyl Sticker).
   - Integrates plan subscription checkout in `app/dashboard/dashboard-editor.tsx` and `components/landing/Pricing.tsx`.

## Files to Create / Modify
- `[NEW]` `app/api/create-order/route.ts`
- `[NEW]` `app/api/verify-payment/route.ts`
- `[NEW]` `components/checkout/OrderPrintedQrModal.tsx`
- `[MODIFY]` `.env.local`
- `[MODIFY]` `app/dashboard/qr-tab.tsx`

## Security Requirements
- `RAZORPAY_KEY_SECRET` remains strictly server-side.
- Payment signatures verified via HMAC-SHA256 before advancing database records.
- Authenticated with Clerk user session.

## Acceptance Criteria
- Order creation returns valid Razorpay `order_id`.
- Razorpay popup opens smoothly.
- Payment verification succeeds and creates order record in `orders` table.
- Both TypeScript check (`npx tsc --noEmit`) and ESLint (`npm run lint`) pass with 0 errors.

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
