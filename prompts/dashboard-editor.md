# Prompt: Dashboard editor (Links + Settings, with live preview)

## Goal

Build the real "admin panel" from `PRD.md` §5.2: a page where a user
manages their hub's links and core settings, with a live phone preview
beside the editor that updates as they type — the piece the onboarding
page's "the full editor is coming soon" message has been pointing at.

**Scoped to Links tab + Settings tab this pass.** Branding (logo upload,
background image, accent colour, theme) is a **separate follow-up
prompt**, deliberately split out — it needs a new Supabase Storage bucket
+ storage policies (new security surface, same treatment the DB schema
and RLS got their own dedicated prompt for earlier), and conflating new
CRUD UI with new Storage infrastructure in one review is worse than doing
them separately. Analytics (V2 per `AGENTS.md` §1) and Share & QR
(blocked on the still-undecided QR library and Razorpay integration,
`AGENTS.md` §15) are both out of scope here too.

## Skills read

- `supabase` — RLS-scoped writes via `createServerSupabaseClient()`
  (already built), Server Action patterns.
- `node_modules/next/dist/docs/` — nothing new beyond what onboarding
  already established (Server Actions, `useTransition`).

## Existing code inspected

- `app/[slug]/page.tsx` + `app/[slug]/data.ts` — the public hub's
  rendering logic (initials/logo fallback, link-href resolution by type,
  empty state) needs to become a **shared presentational component**
  reused by both the real public page and this editor's live preview, so
  the two never visually drift apart. Currently the rendering JSX lives
  inline in the page component — extracting it is part of this prompt.
- `app/onboarding/onboarding-form.tsx` / `actions.ts` — established
  patterns this reuses directly: debounced slug-availability check,
  `useTransition` + Server Actions, the "View your live hub" link. The
  onboarding page currently ends in a static "coming soon" message; once
  `/dashboard` exists, that becomes a real link forward instead.
- `supabase/schema.sql` — `links` table: `id, page_id, type, label, sub,
  destination, position, active`. RLS (`links_insert_own`,
  `links_update_own`, `links_delete_own`) already scopes all of this to
  the owning user via the `pages` `EXISTS` check — no schema/RLS changes
  needed for Links CRUD.
- `PRD.md` §5.2 Links tab: **"reorder (up/down)"** — explicitly not
  drag-and-drop, so no new dependency needed for reordering; two buttons
  per row that swap `position` with the adjacent row.
- `PRD.md` §5.2 Settings: slug (editable, "changing it should warn that
  an already-printed physical QR would need reordering to match"),
  theme, delete/deactivate account. Theme is being deferred to the
  Branding prompt (it's genuinely a branding concern); Settings here
  covers slug + a **deactivate** toggle only — see decisions below on why
  full account deletion is out of scope.
- `AGENTS.md` §10 — the fixed link-type vocabulary (WhatsApp, Google
  review, Website, Call, Instagram, Directions/Maps, Menu, Book/
  Appointment, Custom) this tab's "type" selector must offer.

## Decisions / assumptions

- **Route**: `app/dashboard/page.tsx` → `/dashboard`, protected (added to
  `proxy.ts` alongside `/onboarding`).
- **State management**: plain React state in one parent Client Component
  (`DashboardEditor`), passed down to the Links list and the preview pane
  — no Zustand/TanStack Query. This is a single page with tabs, not
  multiple routes needing shared state, so lifting state to one parent
  is simpler and sufficient (per earlier discussion this session).
- **Live preview**: extracted `components/hub/HubContent.tsx` (pure
  presentational, takes page + links as props) is imported by both
  `app/[slug]/page.tsx` (server, real data) and the dashboard's preview
  pane (client, in-progress unsaved form state) — same visual rendering
  logic, no drift possible between "what you see while editing" and
  "what's actually live."
- **Links CRUD**: each link row is add/edit/delete/toggle-active inline
  (no modal) to keep this pass simpler; edits save individually via
  Server Action on blur/toggle, not one giant "Save all" button — matches
  "add, edit, delete... toggle" reading as independent actions in the
  PRD, and avoids a large multi-field form-state merge bug surface.
- **Reorder**: up/down buttons per PRD's explicit wording, swapping
  `position` with the adjacent active row via a Server Action.
- **Settings — deactivate, not delete**: "deactivate account" is scoped
  to a toggle that sets `pages.active = false` (soft — takes the public
  hub offline immediately, reversible, no data loss). **Full account
  deletion is out of scope for this prompt** — that should go through
  Clerk's own account-management flow (which already triggers our
  `user.deleted` webhook), not a custom destructive path we build and
  maintain ourselves. Building safe cascading deletion (what happens to
  `orders`, printed-QR history, etc.) deserves its own focused decision
  later, not a rushed addition here.
- **Slug change warning**: per PRD, changing the slug in Settings shows
  an inline warning ("If you've already had a QR code printed, it will
  need to be reprinted to match your new link") before save — informational
  only, no hard block, since Order Printed QR isn't built yet to check
  against anyway.
- **Onboarding update**: once `/dashboard` exists, change
  `onboarding-form.tsx`'s post-save state to link to `/dashboard`
  (in addition to keeping "View your live hub" pointing at `/${slug}`),
  since that's now the real next step rather than a dead end.

## Files likely to change

- `components/hub/HubContent.tsx` — new. Extracted shared rendering.
- `app/[slug]/page.tsx` — modify. Use `HubContent` instead of inline JSX.
- `app/dashboard/page.tsx` — new. Server Component: loads page + links,
  passes to the client editor.
- `app/dashboard/dashboard-editor.tsx` — new. Client Component: tabs
  (Links / Settings), holds lifted state, renders `HubContent` as the
  live preview pane.
- `app/dashboard/links-tab.tsx` — new. Link list, add/edit/delete/
  toggle/reorder UI.
- `app/dashboard/settings-tab.tsx` — new. Slug editor + deactivate
  toggle.
- `app/dashboard/actions.ts` — new. Server Actions: `createLink`,
  `updateLink`, `deleteLink`, `toggleLinkActive`, `reorderLink`,
  `updateSlug` (reuses onboarding's slug validation logic),
  `setPageActive`.
- `app/onboarding/onboarding-form.tsx` — modify. Add a link to
  `/dashboard` in the post-save state.
- `proxy.ts` — modify. Add `/dashboard(.*)` to the protected matcher.

## Implementation requirements

**`components/hub/HubContent.tsx`**
- Props: `{ page: {display_name, tagline, logo_path, accent, bg_type,
  bg_value}, links: Link[] }`. Pure rendering, no data fetching, no
  `after()`/scan-logging (that stays in the real page route only).

**Links tab**
- List of links ordered by `position`, each row: type badge/select,
  label input, sub input (optional), destination input, active toggle,
  up/down reorder buttons (disabled at the ends), delete button.
- "Add link" control: type selector (from the fixed vocabulary) + label
  + destination, appended at the end (`position` = current max + 1).
- Each field change triggers its own Server Action call (debounced for
  text inputs, immediate for toggle/delete/reorder), and updates the
  local lifted state optimistically so the preview reflects it instantly
  without waiting on the round-trip.

**Settings tab**
- Slug input (same debounced-availability pattern as onboarding, reusing
  `checkSlugAvailable` from `app/onboarding/actions.ts`), inline warning
  about reprinting when the value differs from the saved slug, Save
  button.
- "Hub is live" / "Hub is deactivated" toggle, calling `setPageActive`.
  Deactivating shows a confirmation ("Your hub will stop being publicly
  accessible immediately") before committing — this is a real, if
  reversible, consequence for anyone who's already shared the link.

**Live preview pane**
- Desktop: fixed/sticky column beside the tabs, phone-frame wrapper
  around `HubContent` fed the current lifted state (not the saved DB
  state) so edits are visible before saving.
- Mobile: preview collapses to a toggle/tab rather than competing for
  space with the editor (phone screens can't show both side by side).

## Security requirements

- All Links/Settings writes go through `createServerSupabaseClient()`
  (RLS-scoped) — never the admin client. This is an authenticated,
  client-triggerable path, exactly what RLS is for.
- Server Actions re-validate slug format/availability server-side, same
  as onboarding — never trust client-side checks alone.
- `setPageActive` and slug updates only ever touch the caller's own row —
  RLS's `pages_update_own` policy is the actual enforcement; no manual
  ownership check needed beyond what RLS already guarantees, but the
  query is still written scoped to the caller's `owner_clerk_id` for
  clarity.

## Acceptance criteria

- `/dashboard` requires sign-in (redirects to sign-in when signed out,
  same as `/onboarding`).
- Adding a link appears immediately in both the Links list and the live
  preview; saving it persists to `links` and appears on the real public
  hub page on reload.
- Toggling a link inactive removes it from the live preview and from the
  real public hub, without deleting the row.
- Reordering via up/down buttons changes the order on both the preview
  and the real public hub.
- Deleting a link removes it everywhere after confirmation.
- Changing the slug in Settings shows the reprint warning, validates
  availability, and on save the old slug 404s while the new one works.
- Deactivating the hub makes `/[slug]` 404 immediately; reactivating
  restores it.
- The onboarding page's success state now links to `/dashboard`.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. Sign out, visit `/dashboard` — confirm redirect to sign-in.
2. Sign in, visit `/dashboard` — confirm Links tab loads (empty or
   existing links) with the live preview beside it.
3. Add a link (e.g. Website, "My Site", `https://example.com`) — confirm
   it appears in the preview immediately, then confirm it's in the
   database and on the real `/[your-slug]` page after reload.
4. Toggle it inactive — confirm it disappears from the preview and the
   real hub page, but still exists in the `links` table with
   `active: false`.
5. Add two more links, use the up/down buttons to reorder — confirm the
   order updates on the real hub page.
6. Delete one link — confirm it's gone everywhere.
7. Go to Settings, change the slug — confirm the reprint warning shows,
   save, confirm the old slug now 404s and the new one works.
8. Toggle "deactivate" — confirm `/[slug]` 404s immediately; toggle back
   on — confirm it's live again.
9. Visit `/onboarding` — confirm the post-save state now includes a link
   to `/dashboard`.
