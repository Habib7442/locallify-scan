# Prompt: Background image upload (with brightness/contrast/fade) + "None" accent

## Goal

Two Branding-tab additions, requested together:

1. **Background image upload.** Today the Branding tab only offers a solid
   colour picker for the background, even though `pages.bg_type` has
   supported `'image'` since the very first migration and `PRD.md` §5.2
   explicitly specs it: *"choose solid colour or an uploaded image (stored
   in Storage; sensible overlay/scrim applied so text stays readable)."*
   This ships that, plus **user-adjustable brightness, contrast, and
   fade/overlay** controls (a superset of PRD's "sensible default" scrim —
   the user asked for real control, not just a fixed default).
2. **"None" as an accent option.** `pages.accent` is already nullable in
   the schema, but the app never lets it *be* null end-to-end — the editor
   always coerces it to a fallback colour. This adds an explicit "None"
   swatch and makes null a real, intentional choice.

## Skills read

- `supabase` — Storage checklist re-confirmed: upsert needs INSERT+SELECT+
  UPDATE (not relevant here, we're doing unique-filename inserts, same as
  logo upload, not upsert); no new bucket or policies needed — `page-assets`
  is already a general-purpose bucket scoped by
  `(storage.foldername(name))[1] = auth.jwt()->>'sub'`, so a background
  image at `{owner_clerk_id}/bg-{timestamp}.{ext}` is already covered by
  the existing four policies from migration `0003`.
- `supabase-postgres-best-practices` — new columns get explicit typed
  `numeric` + `check` range constraints rather than a jsonb settings blob,
  since these are three simple bounded scalars, not an open-ended shape.

## Existing code inspected

- `supabase/schema.sql` — `bg_type text not null default 'solid' check
  (bg_type in ('solid', 'image'))` already allows `'image'`; `accent text`
  is already nullable (no `not null`). Neither needs a constraint change —
  only three new numeric columns are needed for the image adjustments.
- `components/hub/HubContent.tsx` — confirmed the `'image'` branch of
  `bg_type` was **never implemented**: `customBackground` only checks
  `page.bg_type === "solid"`, so an `'image'` row today would silently
  fall back to the theme's background with no way to show it. Also
  confirmed every use of accent: `focusColor = page.accent || "#54e0ff"`
  drives (a) the avatar/logo ring and (b) the `--tw-ring-color` used by
  `focus-visible:ring-2` on link cards — both currently force a colour
  even when the user might want neither.
- `app/dashboard/branding-tab.tsx` — full file reviewed. Background
  section is solid-colour-only (native `<input type="color">`). Accent
  section is 8 fixed swatches with no "unset" option. Logo upload
  (`handleFileSelect`/`handleRemoveLogo`) is the exact pattern to mirror
  for the new background-image upload: browser Supabase client
  (`useSupabaseBrowserClient`), unique filename
  (`{userId}/bg-{Date.now()}.{ext}`), `updateLogoPath`-style Server Action
  call after upload succeeds, best-effort delete of the previous file.
- `app/dashboard/actions.ts`'s `updateBranding` — currently hardcodes
  `bg_type: "solid"` on every save and types `accent: string` (non-null).
  Both need to change.
- `app/dashboard/dashboard-editor.tsx` — `accent` state is initialized
  `useState(page.accent ?? "#54e0ff")`, which is exactly the "never
  really null" bug this fixes. `bgValue` state exists but there's no
  `bgType` state at all — the live-preview `HubContent` call hardcodes
  `bg_type: "solid"` unconditionally.
- `components/landing/LivePreview.tsx` and `app/[slug]/data.ts` — both
  already `select` `bg_type`/`bg_value`/`accent`, so only the three new
  numeric columns need adding to those `select` strings (no structural
  change there).
- `lib/storage.ts` — `getPublicAssetUrl(path)` is generic (any path in
  `page-assets`), reused as-is for the background image.

## Decisions / assumptions

- **No new Storage bucket or policies** — reuse `page-assets`, same as
  logos. Same 2MB / png-jpeg-webp limits (consistent with the existing
  bucket config; not raising the limit since nothing about a background
  photo requires more headroom than a logo does for this product).
- **`bg_value` keeps doing double duty**: a hex string when
  `bg_type = 'solid'`, a Storage path when `bg_type = 'image'` — this
  matches how `PRD.md` §6 already documents the column
  (`bg_type (solid/image), bg_value`), not a new pattern.
- **Three new columns**, not a jsonb blob:
  `bg_image_brightness numeric not null default 100 check (between 50
  and 150)`, `bg_image_contrast numeric not null default 100 check
  (between 50 and 150)`, `bg_image_overlay numeric not null default 30
  check (between 0 and 90)`. Percent-based (`brightness`/`contrast` map
  directly to CSS `filter` functions; `overlay` is a black-scrim opacity
  percent, defaulting to 30 so a freshly-uploaded image is readable
  before the user touches any slider — satisfies PRD's "sensible
  overlay... applied" baseline even pre-adjustment).
- **Rendering approach**: the image is painted as a plain CSS
  `background-image` layer (not `next/image`) so `filter:
  brightness()/contrast()` can be applied directly to that layer without
  touching the readable content above it; a separate `rgba(0,0,0,
  overlay/100)` scrim layer sits above the image, below the content —
  three stacked layers via `position: absolute` inside a `relative`
  root, replacing the current single inline `style={{ background }}` on
  `HubContent`'s outer div only when `bg_type === 'image'` (solid-colour
  path is untouched).
- **Switching Color ↔ Image in the UI is non-destructive but two-step**:
  toggling to "Image" just reveals the upload control — `bg_type` doesn't
  actually flip to `'image'` until an upload succeeds (mirrors logo
  upload: the DB only changes on confirmed success). Toggling back to
  "Color" immediately sets `bg_type: 'solid'` and clears `bg_value` to
  `null` (falls back to the theme default) rather than trying to
  remember a previous hex — simplest, least-surprising behaviour, and the
  user can always immediately re-pick a colour.
- **"None" accent, concretely**: `page.accent` becomes genuinely
  nullable end-to-end (dashboard state, `BrandingTab` props,
  `updateBranding` input, DB write). When null: the avatar/logo shows a
  plain neutral `border border-white/10` instead of a colour ring (no
  ring at all, not a fallback colour); focus-visible rings on link cards
  fall back to a fixed neutral `rgba(255,255,255,0.5)` instead of a brand
  colour — still satisfies the "visible focus" accessibility requirement
  in `AGENTS.md` §11, just not accent-tinted. The "None" swatch is
  rendered as a 9th circle with a diagonal slash (a plain neutral
  outlined circle, `Ban`-style icon from `lucide-react`), matching the
  existing swatch button pattern.
- **Initials-fallback avatar still needs *a* colour** (can't render
  transparent text-on-transparent legibly) — when no logo and no accent,
  it falls back to a fixed neutral `#33373b` (the app's existing border
  grey), not a brand colour.

## Files likely to change

- `supabase/migrations/0008_bg_image_and_accent.sql` — new. Adds the
  three `bg_image_*` columns. (Nothing needed for `accent`/`bg_type` —
  already nullable / already allow `'image'`.)
- `supabase/schema.sql` — modify. Add the three columns to the fresh-
  install source of truth.
- `components/hub/HubContent.tsx` — modify. `HubContentPage` type gains
  `bg_image_brightness?`, `bg_image_contrast?`, `bg_image_overlay?`
  (all `number | null`); root render branches on `bg_type === "image"`
  to render the three-layer background instead of the inline `style`
  background; `focusColor`/ring logic updated for nullable accent (both
  the avatar ring and the link-card focus ring).
- `app/dashboard/branding-tab.tsx` — modify. Background section becomes
  a Color/Image toggle; Image mode gets an upload control (mirroring the
  logo upload block) plus three range sliders (Brightness, Contrast,
  Fade/Overlay) with live numeric readouts; Accent section gains a
  9th "None" swatch; prop types widen (`accent: string | null`, new
  `bgType`/`bgImageBrightness`/`bgImageContrast`/`bgImageOverlay` props
  and patch fields).
- `app/dashboard/dashboard-editor.tsx` — modify. New lifted state:
  `bgType`, `bgImageBrightness`, `bgImageContrast`, `bgImageOverlay`;
  `accent` state becomes `useState<string | null>(page.accent)` (drop
  the `?? "#54e0ff"` coercion); `PageData` type gains the new fields;
  live-preview `HubContent` page prop passes them through instead of the
  hardcoded `bg_type: "solid"`.
- `app/dashboard/actions.ts` — modify. `updateBranding` input type widens
  (`accent: string | null`, adds `bgType`/`bgImageBrightness`/
  `bgImageContrast`/`bgImageOverlay`), writes all of them instead of
  hardcoding `bg_type: "solid"`.
- `app/[slug]/data.ts`, `app/dashboard/page.tsx` — modify. Add the three
  new columns to their existing `pages` `select` strings (no other
  changes — both already select `bg_type`/`bg_value`/`accent`).

## Implementation requirements

**`supabase/migrations/0008_bg_image_and_accent.sql`**
```sql
alter table public.pages
  add column bg_image_brightness numeric not null default 100
    check (bg_image_brightness between 50 and 150),
  add column bg_image_contrast numeric not null default 100
    check (bg_image_contrast between 50 and 150),
  add column bg_image_overlay numeric not null default 30
    check (bg_image_overlay between 0 and 90);
```

**`branding-tab.tsx` background section**
- Two-button toggle: "Color" / "Image" (local UI state, initialized from
  `bgType`).
- Color mode: existing colour picker, unchanged.
- Image mode:
  - If no image yet: upload control (same file-input-ref + hidden input
    pattern as the logo block), 2MB / png-jpeg-webp validated
    client-side, uploads to
    `page-assets/{userId}/bg-{Date.now()}.{ext}`, then calls
    `updateBranding` (or a dedicated lighter action, implementer's call)
    with `bgType: "image"`, `bgValue: newPath`, and the three adjustment
    fields at their current slider values.
  - If an image is set: small preview thumbnail (`getPublicAssetUrl(bgValue)`
    when `bgType === "image"`), "Change"/"Remove" buttons (Remove sets
    `bgType: "solid"`, `bgValue: null`, best-effort deletes the old
    Storage object, same as logo removal).
  - Three `<input type="range">` sliders: Brightness (50–150, step 5),
    Contrast (50–150, step 5), Fade (0–90, step 5), each showing its
    current value and calling `onBrandingChange` on every drag (live
    preview updates immediately, matching every other control in this
    tab) — persisted only on "Save branding" like the rest.

**`branding-tab.tsx` accent section**
- Append a 9th button after the 8 `ACCENT_SWATCHES`: neutral circle
  (`border border-[#33373b]`) with a centred `Ban` icon (`lucide-react`),
  `onClick={() => onBrandingChange({ accent: null })}`, selected-state
  ring shown when `accent === null`.

**`HubContent.tsx` background rendering**
```tsx
const isImageBg = page.bg_type === "image" && Boolean(page.bg_value);
const bgImageUrl = isImageBg ? getPublicAssetUrl(page.bg_value) : null;
const brightness = page.bg_image_brightness ?? 100;
const contrast = page.bg_image_contrast ?? 100;
const overlay = page.bg_image_overlay ?? 30;
```
Root div becomes `relative overflow-hidden`; when `bgImageUrl`, render
two absolutely-positioned `inset-0` layers before the content (image
layer with `backgroundImage`, `backgroundSize: cover`,
`backgroundPosition: center`, `filter: brightness(${brightness}%)
contrast(${contrast}%)`; scrim layer `backgroundColor: rgba(0,0,0,
${overlay / 100})`), content wrapper gets `relative` so it stacks above
both. When not an image background, keep the current inline
`style={{ background: customBackground ?? recipe.background }}`
behaviour exactly as-is.

**`HubContent.tsx` accent/ring logic**
- `const focusColor = page.accent;` (no `|| "#54e0ff"` fallback).
- Avatar/logo: when `focusColor`, keep the existing coloured
  `ring-2`/`--tw-ring-color` treatment; when null, render
  `border border-white/10` instead (no ring classes at all).
- Initials-fallback background: `backgroundColor: focusColor ?? "#33373b"`.
- Link-card `--tw-ring-color`: `focusColor ?? "rgba(255,255,255,0.5)"`.

## Security requirements

- No new RLS/Storage policies — this exercises the exact same
  `page-assets` bucket policies already in production for logos
  (owner-folder-scoped INSERT/SELECT/UPDATE/DELETE).
- Client-side 2MB/type validation is UX only; the bucket's
  `file_size_limit`/`allowed_mime_types` (set in migration `0003`) are
  the real enforcement, same as logo upload.
- `updateBranding` remains a single RLS-scoped Server Action write
  (`.eq("owner_clerk_id", userId)`), no service-role usage anywhere in
  this flow.

## Acceptance criteria

- Uploading a background image shows it live in the preview immediately,
  with the default 30% dark overlay already applied (text stays
  readable without the user touching a slider).
- Dragging Brightness/Contrast/Fade updates the live preview in
  real time; "Save branding" persists the values; reloading the
  dashboard shows the same image + same slider values.
- Switching from Image back to Color mode reverts the hub to a solid
  background (theme default unless a new colour is picked), and the old
  uploaded image is removed from Storage (best-effort).
- The real public hub page (`/[slug]`) renders the background image
  identically to the dashboard preview (same filter/overlay values).
- Selecting "None" accent removes the coloured ring from the avatar/logo
  everywhere (dashboard preview, real hub page, landing-page demo card),
  leaving a plain neutral border; keyboard-focusing a link card still
  shows *some* visible focus outline (neutral, not accent-coloured).
- Saving with "None" selected round-trips correctly — reloading the
  dashboard still shows "None" as selected, not silently falling back to
  a default colour.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. Run `supabase/migrations/0008_bg_image_and_accent.sql` in the
   Supabase SQL Editor.
2. `npm run dev`, sign in, `/dashboard` → Branding.
3. Switch Background to "Image", upload a photo — confirm it appears in
   the live preview with a visible dark scrim over it (default 30%) so
   the name/tagline stay legible.
4. Drag Brightness down/up, Contrast down/up, Fade down/up one at a
   time — confirm each visibly changes the preview independently.
5. Click "Save branding", reload the page — confirm the image and all
   three slider values persisted.
6. Open the real hub at `/<your-slug>` in a new tab — confirm it matches
   the dashboard preview exactly (same image, same brightness/contrast/
   overlay).
7. Switch Background back to "Color" — confirm the hub reverts to a
   solid background immediately, and pick a new colour to confirm that
   still works as before.
8. Go to Accent color, click "None" — confirm the coloured ring around
   the avatar disappears in the live preview (dashboard and real hub).
9. Save, reload — confirm "None" is still selected (not reverted to a
   default colour).
10. Tab to a link card with your keyboard — confirm a visible (neutral)
    focus outline still appears even with accent set to "None".
