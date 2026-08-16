# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **User (anyone who signs up):** free, self-serve signup — builds and edits their own link-in-bio profile ("hub"): links, branding, background, logo; views their own analytics; downloads their QR free; can order a physical printed QR of their profile (paid).
- **Agency admin (Habib / Locallify):** sees all users/pages for support, manages the printed-QR order queue (mark pending → printed → shipped), can open any page in a support/override capacity.
- **Customer:** scans a printed QR, taps a button on the hub. No account, no login.
- **Prospective user (landing-page visitor):** anyone evaluating whether to sign up. Primary audience for the marketing/landing surface — arrives cold, needs to be persuaded and act (sign up), not just informed. Broader audience than "local business owner" now that signup is open to anyone.

## Product Purpose

A Linktree-style link-in-bio platform: anyone signs up free and builds a profile page full of links that a QR code points to. The core promise, and the paid feature that funds the product: a user can order a **physical printed QR code** of their profile, and that QR always points to Locallify's own domain — so it can never expire or be held hostage by a third-party vendor the way typical "multi-link QR" tools can be.

## Positioning

The mechanism a competitor selling "multi-link QR" tools (or a general link-in-bio tool without a print offering) cannot truthfully copy: the QR encodes a URL on Locallify's own domain, not a vendor's, and the physical printed copy is a real product Locallify fulfills and stands behind — not just a downloadable image. The destination behind the code stays editable forever without reprinting, and it can never be deactivated by a billing lapse, because there's no vendor sitting between the printed code and the user.

## Operating Context

Signup is fully open and self-serve — no gatekeeping, no agency approval step. A user's digital QR is free and instant; a **physical printed copy is a separate, paid order** that Habib fulfills manually (prints and ships it himself in v1 — no print-on-demand integration yet). Most users will never pick a business vertical; verticals are an optional preset for business-type profiles, not a requirement.

## Capabilities and Constraints

- MVP scope (PRD §11): Clerk auth with **open self-serve signup**; auto-created page on signup via webhook; user editor (link add/edit/reorder/toggle, logo upload, background, accent colour, theme, with live phone preview); public hub reading from the database with non-blocking scan/tap logging; free QR download (PNG + SVG); **Order Printed QR** (payment + shipping address + order record); agency dashboard as an order-fulfillment queue rather than a client-provisioning tool; one vertical template (restaurant or clinic) as an optional preset.
- Explicitly undecided (PRD §13): payment provider for Order Printed QR (Razorpay vs. Stripe vs. other); price of a printed QR order and shipping scope (domestic vs. international); which vertical ships first; final redirect domain; whether an agency-managed paid service tier still exists alongside self-serve.
- No automated print-fulfillment in v1 by design (PRD §2 non-goals) — every printed-QR order is fulfilled by hand until volume justifies automating it.
- The public `/sign-up` route already in the codebase is now correctly aligned with product intent (previously flagged as a conflict under the old agency-provisioned model — that constraint no longer applies).

## Brand Commitments

Name: **Locallify Scan** — confirmed product name (supersedes "Locallify Links," the PRD's original placeholder). A real logo exists at `public/logo_transparent.png`, with a cropped icon-only asset at `public/logo-icon.png`.

## Evidence on Hand

One real, usable proof point: a real Locallify client was hit with a roughly ₹2,000 renewal demand after a free trial expired on an already-printed third-party QR code (PRD §1). Usable anonymized — do not name the real client. No product screenshots, testimonials, case studies, pricing, or payment-provider details exist yet; future work must not fabricate any of these.

## Product Principles

1. The redirect always lives on Locallify's own domain, never a third-party vendor's — this is the trust position everything else is built around.
2. Signup is free and open to anyone; the paid product is the physical printed QR, not access to the platform itself.
3. RLS enforces that a user can never see or touch another user's page — the agency admin's cross-user access exists for support and order fulfillment, not routine editing.
4. Vertical templates are optional presets, never a requirement — most users will skip them entirely.
5. Manual fulfillment (Habib prints and ships each order by hand) is the deliberate v1 choice, not a stopgap to apologize for — automate only once volume justifies it.

## Accessibility & Inclusion

The public hub must be mobile-first, fast, and accessible: visible focus states and reduced-motion respected (PRD §5.3). No further specific accessibility standard has been confirmed.
