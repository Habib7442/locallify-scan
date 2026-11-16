# Product

<!-- impeccable:product-schema 1 -->

## Platform

web — mobile-first, with a customer scan page and a staff Live Board that can be installed as a PWA on Android.

## Users

- **Customer (diner):** scans the QR code on their table at a cafe or restaurant. They never log in; a WhatsApp-verified phone number and a device cookie identify them. They unlock rewards (Table Squad, Next-Visit Prize) and come back. Expect a budget Android phone on 4G, and a reader of English, Hindi or Bengali.
- **Staff (waiter / cashier):** watches the Live Board on a phone or a cheap counter tablet, greets regulars by name, closes visits with the bill amount, redeems prizes, and marks squad rewards as served. They are often new, so every action has to be obvious.
- **Owner (cafe owner / manager):** sets rewards, views customers, sends "Fill My Tables" offers on slow days, and manages tables, staff and branding. Usually not technical; the product must make sense in one demo.
- **Locallify admin (Habib / Samrat):** onboards cafes in person, assigns plans and message allowances, and monitors WhatsApp message usage and cost.

## Product Purpose

Dobara (दोबारा, "again") turns one-time cafe and restaurant customers into regulars. It uses a per-table QR code, WhatsApp, and four features: **Table Squad**, **Next-Visit Prize**, **Pehchaan** (staff recognise regulars) and **Fill My Tables**. It sits alongside whatever billing system the restaurant already uses.

Pitch to owners: *"Your billing software takes the order. Dobara makes sure the customer comes back."*

## Positioning

- **Against POS / QR-ordering tools (Petpooja, DotPe):** Dobara doesn't replace billing. Its only job is bringing customers back.
- **Against loyalty CRMs (Reelo etc.):** Dobara is simpler and cheaper, uses scratch cards and squads instead of points, and Locallify sets it up in person.
- **Against QR menu tools:** those don't capture customers, give rewards, or help staff recognise regulars.
- **Against delivery apps:** Dobara gives the customer list back to the restaurant.

Table QR codes live on Locallify's own domain (`scan.locallifyagency.com`), so a printed card never expires and can't be held hostage by a vendor.

## Operating Context

- The first market is Silchar: small and mid-size cafes, family restaurants, and dessert or tea spots.
- Locallify onboards each cafe in person: prints the table cards, installs the Live Board, and trains staff for 20 minutes.
- Messaging runs on one shared Dobara WhatsApp number in v1, and every message names the cafe.
- The pilot is 3 cafes, free for 30 days. Success means at least 2 of the 3 agree to pay.

## Capabilities and Constraints

- **Scope:** v1 is milestones M0–M5 (`PRD.md` §17), and M1 comes first: scan → verify → Live Board ding in under 3 s.
- **Non-goals:** no POS, billing, KOT, inventory or GST invoicing; no food ordering; no customer app; no points loyalty; no per-cafe WhatsApp numbers in v1.
- **WhatsApp limits:** marketing messages cost money and can damage the number's quality rating, so campaigns are capped and opt-out is instant.
- **Performance:** the scan page must be interactive in under 2 s on 4G and weigh under 300 KB.
- **Proposed pricing:** Starter ₹1,499/mo, Growth ₹2,499/mo, extra messages about ₹1.2 each, and a one-time setup fee of ₹2,000–5,000 (`PRD.md` §16). This is a proposal, not final.

## Brand Commitments

- **Locallify Scan** is the QR platform: permanent codes hosted on Locallify's own domain.
- **Dobara** is the product sold to restaurants. It always carries **"by Locallify"** in small text, for example in the wordmark lockup, the WhatsApp display name "Dobara by Locallify", table cards, and the footers of the scan page and Live Board.

The Locallify logo exists at `public/logo_transparent.png`, and the icon-only version at `public/logo-icon.png`. No Dobara-specific logo exists yet.

The customer-facing tone is warm, casual and Hinglish-friendly ("Scan karo, aaj ka inaam dekho 🎁").

## Evidence on Hand

There are no pilot results, testimonials or case studies yet. Future work must not invent any. One prior proof point is usable for the domain-ownership promise: a real Locallify client was hit with a renewal demand of about ₹2,000 after a free trial expired on an already-printed third-party QR code. Use it anonymised and never name the client.

## Product Principles

1. **Never replace the restaurant's billing.** Dobara works alongside it with zero POS changes.
2. **Make it simple enough for one demo.** Defaults should work out of the box, and Locallify sets everything up.
3. **The customer data belongs to the cafe.** It is never shared across cafes and never sold.
4. **Prevent abuse by design.** Prizes are drawn on the server, tied to a phone number, and only redeemed after staff confirm.
5. **Respect the customer's WhatsApp.** Opt-in is explicit, STOP is easy, frequency is capped, and nobody gets spammed.

## Accessibility & Inclusion

- **Languages:** English, Hindi and Bengali, with all strings in translation files.
- **Interaction:** large tap targets, readable contrast, nothing conveyed by colour alone, and reduced motion respected (the scratch card has a "Tap to reveal" fallback).
- **Devices:** must work on budget Android phones in Chrome.
