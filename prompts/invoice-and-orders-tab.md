# Implementation Prompt — Multi-Item Quantity Checkout, Tax Invoice Download & Dashboard Orders Tab

## Goal
Implement multi-item selection with quantity controls (`+` / `-`), auto-calculate prices, 18% GST, and shipping. Provide customers with an instant printable/downloadable Tax Invoice modal upon payment, and add an "Orders" history tab to the user dashboard (`/dashboard`) allowing users to view past orders, track fulfillment status, and download past invoices.

## Skills Read
- `.agents/skills/clerk` — authenticated Clerk user scoping
- `.agents/skills/supabase` — `orders` schema query & RLS policy enforcement
- `.agents/skills/supabase-postgres-best-practices` — index and data retrieval optimization

## Existing Code Inspected
- `app/dashboard/page.tsx`
- `app/dashboard/dashboard-editor.tsx`
- `components/checkout/OrderPrintedQrModal.tsx`
- `app/api/create-order/route.ts`
- `app/api/verify-payment/route.ts`

## Key Decisions & Requirements
1. **Multi-Item & Quantity Selection (`OrderPrintedQrModal.tsx`)**:
   - Quantity controls (`-` `1` `+`) for **Acrylic Desktop Stand (₹499)** and **Waterproof Vinyl Sticker (₹299)**.
   - At least 1 item total required to proceed to payment.
   - Calculates combined Base Price, Shipping Fee (FREE for Silchar, ₹50 flat for other cities), 18% GST, and Total Amount.

2. **Interactive Tax Invoice Modal Component (`components/checkout/InvoiceModal.tsx`)**:
   - Renders a clean, official Tax Invoice with Locallify Scan branding.
   - Invoice Details: Invoice No. (`INV-YYYYMMDD-XXXX`), Date, Payment Reference (`pay_...`), Order ID.
   - Seller: Locallify Scan / Locallify Agency (Silchar, Assam).
   - Customer & Shipping Address details.
   - Line Items: Itemized list of products with quantities & unit prices, Base Subtotal, Shipping Fee, 18% GST breakdown, Total Paid.
   - Action Button: **"Download / Print Invoice"** (`window.print()`).

3. **Immediate Success Flow**:
   - Upon successful payment verification in `OrderPrintedQrModal.tsx`, automatically display the **Invoice Modal** with a button to view/print the invoice or close.

4. **Dashboard "Orders" Tab (`app/dashboard/orders-tab.tsx`)**:
   - Add an `"orders"` tab to `dashboard-editor.tsx` (`TAB_LABELS`).
   - Fetch user orders in `app/dashboard/page.tsx`:
     `.from("orders").select("*").eq("owner_clerk_id", userId).order("created_at", { ascending: false })`
   - Render order cards with Status Badges (`Pending`, `Printed`, `Shipped`), Order Date, Item details, Amount, and a **"View Invoice"** button.

## Files to Create / Modify
- `[NEW]` `components/checkout/InvoiceModal.tsx`
- `[NEW]` `app/dashboard/orders-tab.tsx`
- `[MODIFY]` `components/checkout/OrderPrintedQrModal.tsx`
- `[MODIFY]` `app/api/create-order/route.ts`
- `[MODIFY]` `app/api/verify-payment/route.ts`
- `[MODIFY]` `app/dashboard/dashboard-editor.tsx`
- `[MODIFY]` `app/dashboard/page.tsx`

## Security Requirements
- Order & Invoice queries scoped to authenticated Clerk `userId`.
- Payment signatures verified via HMAC-SHA256.

## Acceptance Criteria
- Users can select quantities for Acrylic Stands and Vinyl Stickers.
- Successful payment displays confirmation + instant Invoice view/print button.
- Dashboard navbar displays "Orders" tab with all user orders.
- Users can view & download invoices for any past order.
- Both `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

## Verification Plan
- Run `npx tsc --noEmit`
- Run `npm run lint`
