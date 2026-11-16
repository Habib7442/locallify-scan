# Legal pages for Dobara — Privacy, Terms, Refund, Contact

## Goal
Bring back the four pages the landing footer links to (`/privacy-policy`, `/terms`, `/refund-policy`, `/contact-us`), rewritten for **Dobara** instead of the old link-in-bio product. Also a hard prerequisite for **M0**: Meta needs a live privacy policy + terms URL for the WhatsApp Business app and business verification (`PRD.md` §12 "Prerequisites"). Privacy content follows `PRD.md` §13 and `AGENTS.md` §9/§11.

## Skills read
None needed (static pages, no Clerk/Supabase work). `node_modules/next/dist/docs/` for route groups/metadata if anything is unclear.

## Existing code inspected
- `07d37bb:app/(legal)/*` — 5 pages (privacy, terms, refund, shipping, contact). All written for "Locallify Scan" link-in-bio: hub owners/visitors, Razorpay printed-QR orders, trial subscription. Import the deleted `Navbar` and old `Footer`. `LAST_UPDATED = new Date()` (changes every build — wrong for a legal page). Old contact WhatsApp `+91 6000163450` differs from `lib/site.ts` (`+91 9707370886`).
- `components/landing/Header.tsx` — nav links are bare anchors (`#features`), logo links to `#top`; these break on other routes.
- `components/landing/Footer.tsx`, `primitives.tsx` (Container, focusRing, colours), `lib/seo.ts` `buildMetadata`, `lib/site.ts` (CONTACT_EMAIL, CONTACT_WHATSAPP, whatsappLink).
- `app/sitemap.ts` — only `""`.
- `PRD.md` §12, §13, §19 (pricing/pilot), §3 non-goals.

## Decisions / assumptions (please confirm the ⚠️ ones)
1. **Operator identity:** "Dobara is a product of Locallify Agency (proprietor: Samrat Nath), Silchar, Assam, India" — the legal/trade names from the GST certificate in `PRD.md` §12. Meta verification matches the website to the legal name, so stating it helps.
2. ⚠️ **Grievance contact (DPDP):** name Samrat Nath as the grievance contact, reachable at `hello@locallifyagency.com` / WhatsApp. Reply within 7 days, resolve within 30. Change if someone else should be named.
3. ⚠️ **Data location:** the Mumbai region is still an open decision (`AGENTS.md` §15). The text will say "stored with Supabase (cloud database)" and **not** claim India-only storage until the move is confirmed. I'll add a TODO comment to update it after the move.
4. **Roles:** the cafe decides why data is used (it owns its customer list); Locallify processes it on the cafe's behalf (`PRD.md` §13). In DPDP terms: the cafe is the data fiduciary and Locallify the processor. Written in plain words, with those terms in brackets.
5. **Shipping policy page:** not restored. Printed-QR orders are parked and the footer doesn't link it. Restore it later if Razorpay website review needs it.
6. **Refund policy** matches the landing pricing: monthly plans billed in advance, cancel anytime, access continues to the end of the paid month, no partial-month refunds. One-time setup fee is non-refundable once setup is done; refunded in full if cancelled before the setup visit. Yearly plans: refund for unused full months minus the 2 free months' discount. Free pilot: nothing charged. Payment method not specified (plan billing is manual during the pilot).
7. "Last updated: 16 November 2026" as a fixed constant.
8. **Header fix:** nav links become `/#features` etc. and the logo links to `/`, so the header works on every page. On the home page this is still a same-page scroll.
9. Contact page uses `lib/site.ts` constants (+91 97073 70886, hello@locallifyagency.com). The old +91 6000163450 is dropped.
10. Plain words throughout, consistent with the landing page. Footer note: "This page is not legal advice. Review with a lawyer before scaling" goes in this prompt only, **not** on the page.

## Files likely to change
- **New** `app/(legal)/layout.tsx` — Header + `<main>` + Footer, dark bg.
- **New** `components/legal/LegalPage.tsx` — title, "Last updated", optional intro, and a `LegalSection` (h2 + body) with readable prose styles (16px, `#9a9aa3` body, white emphasis, cyan links, max-w 72ch).
- **New** `app/(legal)/privacy-policy/page.tsx`, `terms/page.tsx`, `refund-policy/page.tsx`, `contact-us/page.tsx` — each with `buildMetadata`.
- `components/landing/Header.tsx` and `content/landing.ts` (nav hrefs) — decision 8.
- `app/sitemap.ts` — add the 4 routes.

## Page content outline
**Privacy Policy**: Who we are · Two kinds of people (cafe owners/staff; diners who scan) · What we collect from diners (name, WhatsApp number, optional birthday, visits, bill amount, staff notes kept to food preferences; a device cookie that remembers your phone for 180 days; scan logs) — "nothing else" · From owners/staff (name, email, phone, business details via Clerk) · How we use it (rewards, recognition, offers **from that cafe only**) · WhatsApp messages (sent from the shared "Dobara by Locallify" number; offers only if you tick the box, which is unticked by default; max 4 offers a month; reply STOP / "band karo" / unsubscribe to stop at once) · Never shared across cafes, never sold · Who processes it (Meta WhatsApp, Supabase, Clerk, Vercel) · Roles (decision 4) · How long we keep it (while the cafe uses Dobara; deleted within 30 days of a request or of the cafe leaving) · Your rights (access, correction, deletion: send "DELETE" on WhatsApp or ask the cafe; done within 30 days; withdraw consent anytime) · Cookies · Children (not for under-18s to sign up; diners under 18 shouldn't opt in to offers) · Security · Grievance contact · Changes.
**Terms**: The service (what Dobara does, works alongside billing, not a POS) · Who can use it (businesses in India) · Accounts and staff · Owner responsibilities (honour prizes and offers you set, tell customers about Dobara, keep notes respectful, follow WhatsApp rules) · Messages and limits (plan allowance, caps, STOP) · Fees (plans per the pricing page, setup fee, extra messages) · Your data / our data (the cafe owns its customer list; export on Growth) · Acceptable use · Availability (no guarantee of uninterrupted service; WhatsApp is a third party) · Limitation of liability (capped at fees paid in the last 3 months) · Ending service · Governing law (India; courts at Silchar, Assam) · Changes · Contact.
**Refund Policy**: decision 6, plus how to request it (email/WhatsApp, reply within 7 days).
**Contact**: WhatsApp, email, location (Silchar, Assam), operator line, "For data deletion requests…" pointer.

## Security requirements
Static pages; no forms, no data. External links use `rel="noopener noreferrer"`.

## Acceptance criteria
- The four routes render with the new Header and Footer; footer links resolve (no "being rebuilt" page).
- Header nav works from a legal page (goes to the home section) and on the home page (smooth scroll).
- One `h1` per page; sections use `h2`; text ≥ 15px; AA contrast.
- Privacy text covers everything in `PRD.md` §13 and states nothing that isn't true today (no India-only storage claim).
- The sitemap lists the 4 routes.
- `npx tsc --noEmit`, `npm run lint` and `npm run build` pass.

## Checks to run
`npx tsc --noEmit` · `npm run lint` · `npm run build`

## Manual test steps
1. `npm run dev` → http://localhost:3000. Click each footer link: Privacy Policy, Terms, Refund Policy and Contact all open.
2. On `/terms`, click "Pricing" in the header → lands on the home page pricing section.
3. On `/`, click "FAQ" → smooth scroll, no page reload.
4. Check `/privacy-policy` at 390px: readable, no sideways scroll.
5. Open http://localhost:3000/sitemap.xml → 5 URLs.
6. Before submitting to Meta: have the privacy text reviewed (not legal advice).
