# Dobara — Product Requirements Document (PRD)

**Product:** Dobara (दोबारा — "again"), the restaurant & cafe product Locallify sells, built on the **Locallify Scan** QR platform
**Brand structure:** **Locallify Scan** = the QR platform (permanent codes on Locallify's domain). **Dobara** = the product sold to restaurants, always shown with "by Locallify" in small text.
**Owner:** Habib Tanwir, Locallify Agency
**Version:** v1.0 (draft)
**Date:** 16 Nov 2026
**Status:** Ready for build planning

---

## 1. One-line summary

Dobara turns one-time cafe and restaurant customers into regulars using a table QR code, WhatsApp, and four simple features: **Table Squad**, **Next-Visit Prize**, **Pehchaan (staff recognise regulars)**, and **Fill My Tables**. It works alongside whatever billing system the restaurant already uses, so nothing has to be replaced.

**Pitch to owners (plain words):**
> "Your billing software takes the order. Dobara makes sure the customer comes back."

---

## 2. Problem

Small and mid-size cafes and restaurants in towns like Silchar:

1. **Get customers once, then lose them.** Most diners never return, and the owner has no way to contact them again.
2. **Don't own their customer data.** Delivery apps keep the customer's number; walk-in customers leave no trace at all.
3. **Can't recognise regulars.** Staff change often, so loyal customers aren't greeted or treated specially.
4. **Have empty tables on slow days** (weekday afternoons, rainy days) and no quick way to bring people in.
5. **Find existing loyalty tools too complex or too expensive** (points systems, ₹30k/year CRMs built for chains).

---

## 3. Goals and non-goals

### Goals (v1)
- Capture the WhatsApp numbers of **every person at a table**, not just one.
- Give customers a **reason to come back within 14 days**.
- Let staff **recognise returning customers by name** in real time.
- Let owners **fill empty tables with one tap**.
- Work with **zero changes** to the restaurant's billing or POS.
- Be **simple enough** that a non-technical owner understands it in one demo.

### Non-goals (v1)
- No POS, billing, KOT, inventory or GST invoicing.
- No food ordering from the QR (may come later).
- No customer mobile app; customers only use a web page and WhatsApp.
- No sending from each restaurant's own WhatsApp number (v2).
- No points-based loyalty program.

---

## 4. Success metrics

| Metric | Target (pilot, 30 days) |
|---|---|
| % of tables where at least one person scans | ≥ 40% |
| Average people captured per scanning table | ≥ 2.5 |
| WhatsApp opt-in rate among scanners | ≥ 70% |
| Next-visit prizes redeemed within validity | ≥ 20% |
| Repeat visits from captured customers within 30 days | ≥ 15% |
| "Fill My Tables" campaigns that bring ≥ 3 tables | ≥ 50% of campaigns |
| Pilot cafes converting to paid | ≥ 2 of 3 |

**North-star metric:** number of **repeat visits** generated per cafe per month.

---

## 5. Users and roles

| Role | Who | Logs in with | Main job in Dobara |
|---|---|---|---|
| **Customer** | Diner at the table | No login (WhatsApp number + device cookie) | Scan, unlock rewards, come back |
| **Staff** | Waiter / cashier | Clerk (staff role) | Watch Live Board, greet regulars, close visits, verify prizes |
| **Owner** | Cafe owner / manager | Clerk (owner role) | Set rewards, view customers, send "Fill My Tables" offers |
| **Locallify admin** | Habib / Samrat | Clerk (super-admin) | Onboard cafes, manage plans, monitor message usage |

---

## 6. Positioning vs. alternatives

| Alternative | What they do | Why Dobara is different |
|---|---|---|
| Petpooja / DotPe QR ordering | Menu, ordering, billing | Dobara doesn't replace billing; it focuses only on bringing customers back |
| Reelo and similar loyalty CRMs | Points, campaigns, built for chains | Dobara is simpler, cheaper, fun (scratch cards, squads), and set up in person |
| Generic QR menu tools | Show a PDF/menu | No customer capture, no rewards, no recognition |
| Delivery apps | Own the customer | Dobara gives the customer list **back to the restaurant** |

---

## 7. Features (v1)

### 7.1 Per-table QR codes
**What:** Each table gets its own QR code on the restaurant's Dobara page, hosted on the Locallify domain (never expires, can't be held hostage, reuses Locallify Scan's redirect layer).

**User stories**
- As an owner, I can create tables (T1, T2…) and download a printable QR card for each.
- As a customer, when I scan, the page knows which table I'm at.

**Acceptance criteria**
- QR encodes a short URL like `scan.locallifyagency.com/r/{business_slug}/t/{table_code}`.
- Printable card (A6) with cafe logo, table number and the line "Scan karo, aaj ka inaam dekho 🎁".
- Owner can deactivate or rename a table without reprinting the QR.
- Every scan is logged (reuses existing scan analytics).

---

### 7.2 Customer scan page
**What:** A fast, branded mobile page the customer sees after scanning.

**States**
1. **New visitor:** cafe logo and name, "Unlock your reward on WhatsApp" button, consent checkbox, Table Squad progress.
2. **Returning visitor (cookie found):** "Welcome back, Arjun 👋", pending prizes, squad progress, one-tap "I'm here" check-in.
3. **After billing:** scratch card appears (see 7.5).

**Acceptance criteria**
- Loads in under 2 seconds on a 4G phone; page weight under 300 KB.
- Uses the cafe's logo, colours and background (reuses Locallify Scan branding settings).
- Available in **English, Hindi and Bengali** (owner chooses the default; customer can switch).
- Consent text is visible and unticked by default: "Mujhe is cafe se WhatsApp par offers milein — kabhi bhi STOP likh kar band kar sakte hain."
- No app download, no password, no Clerk login for customers.

---

### 7.3 WhatsApp verification (click-to-chat)
**What:** The customer verifies their number by **sending a message first**, which is free to start, proves the number is real, and opens a 24-hour window for cheaper replies.

**Flow**
1. Customer taps "Unlock on WhatsApp".
2. WhatsApp opens with a pre-filled message, e.g. `Hi Brew House 👋 (code: T4-7KQ2)`.
3. Customer taps send.
4. Our webhook receives the message, matches the code to the **business + table + scan session**, and links the phone number.
5. Bot replies within the 24-hour window: "Welcome Arjun! Aapka table squad 2/4 ho gaya 🎉".
6. Scan page updates live (Supabase Realtime) to show "Verified ✓".
7. On first visit only, bot asks for name (and optional birthday) in chat or on the page.

**Acceptance criteria**
- Codes are single-use and expire after 15 minutes.
- The same phone can't count twice in one table session.
- If the customer doesn't send, the page still works but shows "Verify to unlock reward".
- Device cookie (signed, httpOnly, 180 days) remembers the verified customer for next visit.

---

### 7.4 Table Squad
**What:** When everyone at the table scans and verifies, the table unlocks a reward.

**User stories**
- As a customer, I see "2 of 4 scanned — 2 more for free dessert 🍰".
- As an owner, I set the reward (e.g. free dessert, 10% off) and the group size rules.

**Rules**
- A **table session** starts with the first scan and ends when staff close the visit, or after 3 hours.
- Squad size is set by the first scanner ("How many of you?" 2/3/4/5/6+) or by staff on the Live Board.
- Reward unlocks when all members have verified (or a minimum set by the owner, e.g. "4+ people").
- One squad reward per table session.
- Staff see "Squad complete — serve free dessert" on the Live Board and tap "Served".

**Acceptance criteria**
- Progress updates live for everyone at the table.
- Owner can turn Table Squad on/off and edit the reward text and minimum size.

---

### 7.5 Billing close + Next-Visit Prize (scratch card)
**What:** After paying, the customer scratches a digital card. The prize is valid **only on the next visit**, within a set number of days (default 14).

**Flow**
1. Staff open the table on the Live Board, type the **bill amount**, tap "Close visit".
2. Customer's scan page shows a scratch card (and a WhatsApp message says the prize is saved).
3. Customer scratches and sees the prize, e.g. "☕ Free Cold Coffee — valid till 30 Nov".
4. Reminder on day 10 if not used: "Aapka free cold coffee 4 din mein expire hoga ☕".
5. On the next visit, the customer shows the prize code; staff tap "Redeem" on the Live Board.

**Rules**
- Owner sets a prize list with probabilities (e.g. 50% ₹50 off, 30% free drink, 15% free dessert, 5% free meal for 2).
- Minimum bill amount to get a scratch card (owner setting, default ₹200).
- One scratch card per visit per customer (squad members each get one if the owner enables it).
- Prizes are tied to the phone number and can't be transferred.
- Redemption requires staff confirmation on the Live Board (prevents screenshot reuse).

**Acceptance criteria**
- Scratch interaction works with touch and mouse; fallback "Tap to reveal".
- Expired prizes show as expired; used prizes show as used.
- Owner sees issued / redeemed / expired counts.

---

### 7.6 Pehchaan — Staff Live Board
**What:** A real-time screen for staff (on a phone or a cheap Android tablet at the counter) that dings when a known customer scans.

**Live card example**
```
🔔 Table 4 — Arjun
   6th visit · Notes: kam teekha, window seat
   Birthday: 22 Nov 🎂
   🎟️ Has: Free Cold Coffee (valid till 30 Nov)
   [Add note] [Close visit] [Redeem prize]
```

**Requirements**
- Web app (PWA) installable to the home screen; works on Android Chrome.
- New-scan alert with **sound + vibration**; repeat-customer alerts highlighted.
- List of open tables with status: scanning / squad x of y / waiting for bill / closed.
- Staff actions: add note, set squad size, close visit with bill amount, redeem prize, mark squad reward served.
- Uses Supabase Realtime subscriptions filtered by `business_id`.

**Acceptance criteria**
- Alert appears within 3 seconds of the customer verifying.
- Works if the tablet screen stays on for a full day (no memory leaks; auto-reconnect).
- Staff cannot see owner-only settings or export customer lists.

---

### 7.7 Fill My Tables
**What:** On a slow day, the owner taps one button to send a time-limited offer to regulars.

**Flow**
1. Owner opens "Tables bharo", picks an offer (preset or custom), e.g. "Next 2 hours — 20% off".
2. Picks audience: all opted-in customers / visited in last 60 days / regulars (3+ visits) / usually visit at this time of day.
3. Sees the estimated cost before sending: "312 people · approx ₹290".
4. Confirms; messages go out via an approved **marketing** template.
5. Customers who come show the message; staff tap "Redeem campaign offer" (or the customer scans and the page auto-detects the active offer).
6. Owner sees results: sent / delivered / read / redeemed.

**Rules**
- Max 1 campaign per day per business, and max 4 per customer per month (avoids spam and protects the WhatsApp quality rating).
- Only opted-in customers; opted-out customers are always excluded.
- Each campaign uses the business's monthly message allowance.

**Acceptance criteria**
- Cost estimate shown before sending.
- Campaign can't be sent if it exceeds the allowance (owner is prompted to buy more).

---

### 7.8 Owner panel
- **Home:** today's scans, verified customers, repeat visits, prizes redeemed, messages used this month.
- **Customers:** list with name, number (partially masked for staff), visits, last visit, notes, opt-in status; search and filter.
- **Rewards settings:** squad reward, scratch-card prize list and odds, validity days, minimum bill.
- **Tables:** create, rename, deactivate, download QR cards.
- **Staff:** invite staff (Clerk), remove staff.
- **Campaigns:** Fill My Tables history and results.
- **Branding:** reuses Locallify Scan branding (logo, colours, background, language).
- **Plan & usage:** current plan, message allowance and usage.

### 7.9 Locallify admin
- Create and manage businesses, assign plans, set message allowances.
- View message usage and cost per business (from `message_log`).
- Impersonate-for-support (read-only) with audit log.

---

## 8. Key user flows

### Flow A — First visit (group of 4)
1. Priya scans Table 4's QR → scan page → taps "Unlock on WhatsApp" → sends pre-filled message.
2. Bot: "Welcome! Aapka naam?" → "Priya" → page shows "Squad 1/4".
3. Her three friends scan and verify → "Squad 4/4 — free dessert unlocked 🍰".
4. Live Board: "Table 4 — squad complete, serve dessert" → staff tap "Served".
5. Bill paid → staff type ₹1,240 → "Close visit".
6. Each friend gets a scratch card → Priya wins "Free Cold Coffee, valid 14 days".

### Flow B — Return visit
1. Priya scans any table 9 days later → page shows "Welcome back Priya 👋 — you have a free cold coffee".
2. Live Board dings: "Table 2 — Priya, 2nd visit, has Free Cold Coffee".
3. Staff greet her by name, serve the coffee, tap "Redeem".

### Flow C — Slow afternoon
1. Owner sees an empty cafe at 3 pm → taps "Tables bharo" → "20% off till 5 pm" → regulars nearby → confirms (₹180 estimate).
2. 6 tables arrive; each redemption is tracked; owner sees "6 tables · ₹4,800 sales".

---

## 9. Business rules (summary)

| Rule | Default | Owner can change |
|---|---|---|
| Table session timeout | 3 hours | No |
| Verification code expiry | 15 minutes | No |
| Squad minimum to unlock | All declared members | Yes |
| Scratch card minimum bill | ₹200 | Yes |
| Prize validity | 14 days | Yes (7–30) |
| Prize reminder | Day 10 | Yes (on/off) |
| Campaigns per business per day | 1 | No |
| Marketing messages per customer per month | 4 | Lower only |
| One scratch card per customer per visit | Yes | No |
| Prize redemption needs staff confirmation | Yes | No |

---

## 10. Data model (additions to Locallify Scan)

> Adapt names to the existing Locallify Scan schema. Every table includes `business_id` and is protected by Supabase **row-level security** so one business can never read another's data.

```sql
-- Tables in the restaurant
tables (
  id uuid pk, business_id uuid fk, code text unique per business,  -- "T4"
  label text, qr_slug text unique, is_active bool, created_at timestamptz
)

-- Customers (diners) — one row per phone number per business
customers (
  id uuid pk, business_id uuid fk, phone_e164 text, name text,
  birthday date null, language text, opted_in bool, opted_in_at timestamptz,
  opted_out_at timestamptz null, notes text, visit_count int default 0,
  last_visit_at timestamptz, created_at timestamptz,
  unique (business_id, phone_e164)
)

-- A table session (one group at one table)
table_sessions (
  id uuid pk, business_id uuid fk, table_id uuid fk,
  declared_size int null, status text check (status in ('open','billing','closed','expired')),
  bill_amount numeric null, opened_at timestamptz, closed_at timestamptz null,
  closed_by uuid null  -- staff user id
)

-- Each person's scan within a session
session_members (
  id uuid pk, session_id uuid fk, business_id uuid fk, customer_id uuid fk null,
  device_id text, verify_code text, verify_expires_at timestamptz,
  verified_at timestamptz null, created_at timestamptz,
  unique (session_id, customer_id)
)

-- Squad reward per session
squad_rewards (
  id uuid pk, business_id uuid fk, session_id uuid fk unique,
  reward_text text, unlocked_at timestamptz null, served_at timestamptz null
)

-- Owner's reward configuration
reward_settings (
  business_id uuid pk, squad_enabled bool, squad_reward_text text, squad_min_size int,
  scratch_enabled bool, scratch_min_bill numeric, prize_validity_days int,
  reminder_enabled bool, prizes jsonb  -- [{label, weight}]
)

-- Next-visit prizes (scratch cards)
prizes (
  id uuid pk, business_id uuid fk, customer_id uuid fk, session_id uuid fk,
  label text, code text, status text check (status in ('unscratched','active','redeemed','expired')),
  valid_from timestamptz, valid_until timestamptz, redeemed_at timestamptz null,
  redeemed_by uuid null
)

-- Fill My Tables campaigns
campaigns (
  id uuid pk, business_id uuid fk, offer_text text, audience jsonb,
  valid_until timestamptz, est_cost numeric, sent_count int, delivered_count int,
  read_count int, redeemed_count int, created_by uuid, created_at timestamptz
)

-- Every WhatsApp message (in and out)
message_log (
  id uuid pk, business_id uuid fk, customer_id uuid null, direction text,  -- 'in' | 'out'
  category text,  -- 'service' | 'utility' | 'marketing' | 'authentication'
  template_name text null, wa_message_id text, status text,  -- sent/delivered/read/failed
  cost_inr numeric null, created_at timestamptz
)

-- Plan and allowance per business
business_plans (
  business_id uuid pk, plan text, monthly_message_allowance int,
  extra_message_price numeric, period_start date
)
```

**Indexes:** `customers(business_id, phone_e164)`, `table_sessions(business_id, status)`, `prizes(customer_id, status)`, `message_log(business_id, created_at)`.

---

## 11. Architecture

| Layer | Choice |
|---|---|
| Web app | **Next.js (App Router)**, existing Locallify Scan codebase |
| Auth (owner/staff/admin) | **Clerk**, with roles via organization membership: owner, staff |
| Customer identity | WhatsApp-verified phone + signed device cookie (no Clerk) |
| Database | **Supabase Postgres** (Mumbai region), row-level security per `business_id` |
| Real-time | **Supabase Realtime** for Live Board and scan-page live updates |
| Storage | Supabase Storage (logos, backgrounds, QR card PDFs) |
| Messaging | **WhatsApp Cloud API** (Meta), one shared Dobara number in v1 |
| Background jobs | Scheduled jobs (Vercel Cron or Supabase pg_cron) for prize reminders, session expiry, expiring prizes |
| Live Board alerts | PWA with sound; Web Push for background alerts (Android) |
| Hosting | Vercel (app) + Supabase |

### Main API routes
| Route | Purpose |
|---|---|
| `GET /r/[business]/t/[table]` | Table QR landing → creates/joins table session → scan page |
| `POST /api/scan/session` | Join session, issue verify code |
| `POST /api/whatsapp/webhook` | Receive messages and status updates from Meta (verify signature) |
| `GET /api/whatsapp/webhook` | Meta webhook verification |
| `POST /api/session/[id]/size` | Set declared squad size |
| `POST /api/session/[id]/close` | Staff closes visit with bill amount → issues scratch cards |
| `POST /api/prize/[id]/scratch` | Customer reveals prize |
| `POST /api/prize/[id]/redeem` | Staff redeems prize |
| `POST /api/campaigns` | Owner creates and sends Fill My Tables campaign |
| `GET /api/campaigns/estimate` | Audience size + cost estimate |
| `POST /api/customers/[id]/notes` | Staff adds a note |

**Security**
- Verify Meta webhook signatures (`X-Hub-Signature-256`).
- Rate-limit scan and verify endpoints per IP and device.
- Mask customer phone numbers for staff (show last 4 digits).
- Owners can export customer lists; staff cannot.
- Audit log for admin access and exports.

---

## 12. WhatsApp setup and messaging

### Number model
- **v1:** one shared WhatsApp number under the Locallify Meta Business Portfolio, display name "Dobara by Locallify". Each message names the cafe: "Brew House: …".
- **v2:** each cafe's own number via Meta Tech Provider + Embedded Signup.

### Prerequisites
- Meta Business Portfolio for Locallify Agency, **business verification** (GST certificate: legal name Samrat Nath, trade name Locallify Agency).
- Website `locallifyagency.com` with privacy policy, terms and a Dobara product page; domain verified.
- Meta developer app with the WhatsApp product, webhook (HTTPS), new SIM number with two-step PIN.
- Payment method in WhatsApp Manager.
- Start messaging limit: 250 unique people/day before verification; higher after.

### Templates (submit for approval)
| Name | Category (expected) | Example |
|---|---|---|
| `dobara_prize_saved` | Utility | "{{cafe}}: aapka inaam save ho gaya — {{prize}}, valid till {{date}}." |
| `dobara_prize_reminder` | Marketing | "{{cafe}}: aapka {{prize}} {{days}} din mein expire hoga ☕ Aa jao!" |
| `dobara_birthday` | Marketing | "{{cafe}} ki taraf se Happy Birthday {{name}} 🎂 Is hafte free dessert!" |
| `dobara_fill_tables` | Marketing | "{{cafe}}: {{offer}} — sirf {{until}} tak. Reply STOP to unsubscribe." |
| `dobara_welcome_back` | Marketing | "{{cafe}} miss kar raha hai aapko, {{name}}! {{offer}}" |

> Meta decides the final category. Assume most Dobara outbound messages are **marketing** (~₹0.86–1.09 each in India).

### Cost-saving design
- Customers message first (click-to-chat), which opens a 24-hour service window. Replies inside it (welcome, squad progress, scratch-card link) use **service messages**, which are free within Meta's monthly allowance per number and low-cost after.
- Reminders and campaigns are capped (section 9).

### Consent and opt-out
- Explicit opt-in on the scan page (unticked by default), with time stamp stored.
- Every marketing message ends with "Reply STOP to unsubscribe".
- Incoming "STOP" / "band karo" / "unsubscribe" sets `opted_out_at` immediately; no further marketing messages.
- Watch the number's quality rating weekly; pause campaigns if it drops.

---

## 13. Privacy and data protection

- **Data collected:** name, WhatsApp number, optional birthday, visit history, bill amount, staff notes. Nothing else.
- **Purpose:** rewards, recognition and offers from that specific cafe only. Never shared across cafes or sold.
- **Storage:** Supabase in the Mumbai region.
- **Rights:** customers can ask to delete their data ("DELETE" message or request to the cafe); deletion within 30 days.
- **Roles:** the cafe owns its customer relationship; Locallify processes data on the cafe's behalf. Put this in the client agreement.
- **Notice:** short privacy notice on the scan page, full policy on the website.
- India's DPDP rules apply in phases; review with a lawyer before scaling. *(Not legal advice.)*
- **Staff notes:** guidance in the UI to keep notes to preferences ("kam teekha"), never sensitive personal details.

---

## 14. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Scan page interactive < 2 s on 4G; Live Board alert < 3 s after verification |
| Mobile-first | Works on budget Android phones and Chrome; no app install for customers |
| Languages | English, Hindi, Bengali (UI strings in translation files) |
| Reliability | Live Board auto-reconnects; webhook retries are idempotent (dedupe by `wa_message_id`) |
| Accessibility | Large tap targets, readable contrast, no information by colour alone |
| Offline | Live Board shows "Reconnecting…" banner; actions queue and retry |
| Observability | Error tracking (e.g. Sentry), logs for webhook failures, daily message-cost summary |
| Scale (v1) | 50 businesses, 20k customers, 200k messages/month |

---

## 15. Analytics events

`qr_scanned`, `session_joined`, `verify_clicked`, `verified`, `squad_size_set`, `squad_completed`, `squad_reward_served`, `visit_closed`, `scratch_issued`, `scratch_revealed`, `prize_redeemed`, `prize_expired`, `campaign_sent`, `campaign_redeemed`, `opt_out`, `live_board_alert_shown`.

Owner dashboard metrics: scans, verified customers, new vs returning, repeat-visit rate, prizes issued / redeemed, campaign ROI (redemptions × average bill), messages used.

---

## 16. Pricing (proposed)

| Plan | Price / month | Includes |
|---|---|---|
| **Starter** | ₹1,499 | 1 outlet, up to 10 tables, Table Squad, Next-Visit Prize, Live Board, 500 WhatsApp messages |
| **Growth** | ₹2,499 | Everything + Fill My Tables, birthday offers, 1,500 messages, customer export |
| **Extra messages** | ~₹1.2 / message | Billed monthly |
| **Setup (one-time)** | ₹2,000–5,000 | QR card printing, staff training, tablet setup help |

Annual plan: 2 months free. Pilot: free for 2 months for the first 3 cafes in exchange for feedback and a testimonial.

---

## 17. Milestones and build order

| # | Milestone | Scope | Done when |
|---|---|---|---|
| **M0** | Meta & accounts | Business portfolio, verification, number, display name, templates, webhook endpoint stub | Test message received and replied via webhook |
| **M1** | Scan → verify → ding | Per-table QR, table sessions, scan page, click-to-chat verify, customers table, Live Board with real-time alert | A verified scan rings the Live Board in < 3 s |
| **M2** | Close visit + scratch card | Bill entry, scratch card, prize codes, redeem flow, `dobara_prize_saved`, day-10 reminder job | Full return-visit loop works end to end |
| **M3** | Table Squad | Declared size, progress UI, unlock + served flow, owner settings | 4 test phones unlock a dessert |
| **M4** | Fill My Tables + owner panel | Audience builder, cost estimate, campaign send + tracking, owner home stats, opt-out handling, allowances | Campaign sends, opt-outs respected, usage tracked |
| **M5** | Pilot polish | Hindi/Bengali strings, QR print cards, onboarding checklist, error tracking, admin panel | 3 pilot cafes live |

**Estimated time:** 6–8 weeks part-time (M1 is the most important; ship it first and test in one real cafe).

---

## 18. Pilot plan

- **Who:** 3 cafes in Silchar (different sizes: small cafe, family restaurant, dessert/tea spot).
- **Setup:** print table cards, install Live Board on a phone/tablet, 20-minute staff training.
- **Duration:** 30 days, free.
- **Check-ins:** weekly visit; read Live Board usage and redemption numbers together with the owner.
- **Success:** metrics in section 4; at least 2 of 3 agree to pay.

---

## 19. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Customers don't bother to scan | Visible reward on the table card; Table Squad peer pressure; staff prompt "scan karo, inaam milega" |
| Staff forget to close visits | Live Board reminders for open tables; auto-expire after 3 h (no scratch card) |
| WhatsApp marketing costs eat margin | Allowances per plan, caps per customer, cost estimate before campaigns, service-window design |
| Number blocked or quality drops (spam reports) | Clear opt-in, easy STOP, frequency caps, monitor quality rating |
| Prize abuse (screenshots, fake squads) | Phone-bound prizes, staff-confirmed redemption, one phone per session, session timeouts |
| Meta verification delays | Start M0 first; build M1 using Meta test number meanwhile |
| Owners find it complex | Default settings that work out of the box; Locallify sets everything up in person |
| Data privacy concerns | Minimal data, clear notice, deletion on request, India-region storage |

---

## 20. Open questions

1. ~~Final product naming~~ — **Resolved (16 Nov 2026):** Locallify Scan stays the QR platform; **Dobara** is the product sold to restaurants, with "by Locallify" in small text.
2. Should squad members each get their own scratch card, or only the bill payer? (Default: owner choice.)
3. Do we need a printed "prize code" fallback for customers without WhatsApp?
4. Live Board hardware: recommend a specific budget tablet model?
5. Billing for message overage: prepaid credits or post-paid invoice?
6. Bengali default for Silchar cafes, or ask each owner?

---

## 21. Future (v2+)

- Google review request after a good visit (and private feedback for bad ones).
- Dish Passport (try 10 signature dishes → badge + free meal).
- Family memory book (birthdays/anniversaries of family members).
- Each cafe's own WhatsApp number (Tech Provider + Embedded Signup).
- Optional POS integrations (Petpooja) to auto-close visits with bill amounts.
- Weekly WhatsApp report to the owner ("This week: 46 repeat visits, ₹38,200 from regulars").
- Dobara presets for salons, bakeries and gyms (reuse the same engine).
