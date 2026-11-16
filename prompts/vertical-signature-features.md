# Implementation Prompt — Business Plan Vertical Signature Features

## Goal
Implement the 5 vertical signature features (Restaurant Hours-aware button, Clinic WhatsApp Appointment Request, Retail Offer Banner, Salon Image Gallery, and Hotel Room Enquiry) into both the user editor dashboard and the public hub page.

## Skills Read
- `.agents/skills/supabase` — storage and database schema updates for vertical settings
- `.agents/skills/supabase-postgres-best-practices` — JSON column schema design

## Existing Code Inspected
- `components/hub/HubContent.tsx`
- `app/dashboard/dashboard-editor.tsx`
- `app/dashboard/links-tab.tsx`
- `app/dashboard/branding-tab.tsx`

## Key Decisions & Requirements

1. **Vertical Signature Features Data Model**:
   - Extend `pages` table in Supabase or use a JSON field `vertical_config` to store signature feature configurations:
     - **Restaurant**: `open_time` (e.g., "10:00"), `close_time` (e.g., "22:00"), `online_order_url`, `after_hours_msg`.
     - **Clinic**: `whatsapp_phone`, `doctor_title`, `specialty`.
     - **Retail**: `offer_banner_active` (boolean), `offer_text`, `offer_code`, `offer_bg_color`.
     - **Salon**: `gallery_images` (array of image URLs / Supabase Storage paths).
     - **Hotel**: `hotel_whatsapp_phone`, `room_types` (array).

2. **Dashboard Editor Controls (`app/dashboard/vertical-tab.tsx` or `branding-tab.tsx`)**:
   - Provide business owners with an interactive editor to configure their vertical signature feature.
   - Live phone preview immediately reflects changes!

3. **Public Hub Rendering (`components/hub/HubContent.tsx`)**:
   - **Restaurant**: Computes current local time vs `open_time`/`close_time`. If open, displays high-converting `"Order Online Now 🟢"` button. If closed, displays `"Pre-book for Tomorrow 🔴"` with time schedule.
   - **Clinic**: Displays `"Book Appointment 🩺"` button. Clicking opens an interactive appointment modal with Name, Date, Time, and Reason fields, which sends a formatted WhatsApp message to the doctor.
   - **Retail**: Displays an eye-catching animated `"Today's Special Offer"` banner at the top of the hub.
   - **Salon**: Displays a swipeable/grid Image Gallery showing before/after work.
   - **Hotel**: Displays `"Enquire Room Availability 🏨"` modal with Check-in/Check-out date selector sending a pre-filled enquiry to WhatsApp.

## Files to Create / Modify
- `[NEW]` `components/hub/VerticalFeatures.tsx`
- `[NEW]` `app/dashboard/vertical-tab.tsx`
- `[MODIFY]` `components/hub/HubContent.tsx`
- `[MODIFY]` `app/dashboard/dashboard-editor.tsx`
- `[MODIFY]` `app/dashboard/page.tsx`

## Security Requirements
- All vertical write mutations scoped by Clerk user ID in database actions / RLS.

## Acceptance Criteria
- Owners can toggle and customize vertical signature features in dashboard.
- Public hub dynamically renders the active signature feature.
- Clinic appointment and Hotel room enquiry open WhatsApp with pre-filled messages.
- Restaurant button automatically changes label based on business hours.
- Both `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

## Verification Plan
- Run `npx tsc --noEmit`
- Run `npm run lint`
