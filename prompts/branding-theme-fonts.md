# Prompt: Branding — theme presets, accent color, heading/link fonts

## Goal

Extend the Branding tab (currently just logo upload) with the rest of
`PRD.md` §5.2's branding controls, expanded per explicit direction this
session: instead of a plain light/dark toggle, a curated set of six
distinct visual themes (each a full color/style recipe, not just an
inverted palette), plus accent colour, plus — a new addition beyond the
original PRD, also explicitly requested — separate fonts for headings vs.
link labels on the public hub.

## Skills read

- `node_modules/next/dist/docs/` — `next/font/google` conventions for
  this Next.js version, confirming the static-import constraint below.
- `supabase-postgres-best-practices` — changing an existing `check`
  constraint safely (drop + backfill existing rows + re-add), not just
  adding a new one.

## Existing code inspected

- `supabase/schema.sql`: `pages.theme` is currently `check (theme in
  ('light','dark'))`, default `'dark'` — needs widening to the six new
  preset keys, with existing rows backfilled rather than left invalid.
  `pages.accent` already exists, currently only used for the initials-
  avatar background in `HubContent.tsx`.
- `components/hub/HubContent.tsx`: hardcodes the dark/`midnight` palette
  directly in Tailwind classes — needs to branch on six palettes instead
  of one.
- **Real constraint (unchanged from the original scoping)**:
  `next/font/google` fonts must be statically imported at build time — a
  free-text "type any Google Font" field isn't achievable without losing
  self-hosting/optimization. Curate a fixed set, let users pick from it.

## Decisions / assumptions

**Six curated themes** (key → recipe). Each defines background, heading
color, tagline color, link-card style, footer text color, and button
corner radius — a full look, not a single color swap:

| Key | Name | Background | Heading | Link cards | Corners |
|---|---|---|---|---|---|
| `midnight` (default) | Midnight | `#18181a` solid | `#ffffff` | `bg-white/[0.04] border-white/10` | `12px` |
| `blanc` | Blanc | `#ffffff` solid | `#0a0a0b` | `bg-black/[0.03] border-black/10` | `12px` |
| `sunset` | Sunset | gradient `#ff6b6b → #f06595 → #cc5de8 → #845ef7` | `#ffffff` (text-shadow for legibility) | glassmorphic `bg-white/15 backdrop-blur-md border-white/25` | `16px` |
| `neon` | Neon | `#0a0a0f` near-black | gradient-text `#ff2fd0 → #00f0ff` | `bg-white/[0.03]` + neon glow border/shadow | `10px` |
| `pastel` | Pastel | gradient `#ffd6e8 → #e0c3fc → #c3f0ff` | `#5b4b6f` (soft plum, legible on pastel) | frosted `bg-white/60 backdrop-blur-sm border-white/80` | `full` (pill) |
| `mono` | Mono | `#000000` solid | `#ffffff` bold | transparent, `border-2 border-white`, inverts on hover | `0px` (sharp) |

- **Accent stays orthogonal to theme**: it only controls the initials-
  avatar background and focus-outline color (existing behavior),
  regardless of which theme is picked — theme sets the overall mood,
  accent is the personal color pop on top of it. Curated swatch picker
  (unchanged from the original plan), not a raw hex input.
- **Migration must backfill existing rows**, not just widen the
  constraint: `dark` → `midnight`, `light` → `blanc`, since the old
  values won't satisfy the new constraint.
- **New font columns**: `pages.heading_font`, `pages.link_font`, both
  `text not null default 'hanken'`, `check (... in (<curated 8 keys>))`.
  Curated set: Hanken Grotesk (default), Inter, Poppins, Montserrat,
  Space Grotesk, Work Sans, Roboto, Playfair Display (the one serif,
  for an editorial feel) — same list for both pickers, chosen
  independently.
- **Where fonts apply**: heading font → the hub's display name (`<h1>`
  only); link font → every link's label/sub text. Tagline stays on the
  site default regardless, to avoid three competing typefaces on one
  small screen.

## Files likely to change

- `supabase/migrations/0004_branding_themes_and_fonts.sql` — new.
- `supabase/schema.sql` — modify. Widen the `theme` check constraint,
  update its default, add `heading_font`/`link_font` columns.
- `lib/fonts.ts` — new. Curated font imports + lookup helper.
- `lib/themes.ts` — new. Theme recipe lookup (the table above, as data),
  shared by `HubContent.tsx` and the Branding tab's theme-picker cards.
- `components/hub/HubContent.tsx` — modify. Branch rendering on the
  six theme recipes; apply heading/link font classes.
- `app/dashboard/branding-tab.tsx` — modify. Theme picker (six visual
  swatch cards, not a toggle), accent swatches, heading/link font pickers
  (custom listbox, not native `<select>` — most browsers won't render
  `<option>` in a custom font).
- `app/dashboard/dashboard-editor.tsx` — modify. Lift the new fields into
  state, same pattern as `logoPath`, passed to both `BrandingTab` and the
  live-preview `HubContent` call.
- `app/dashboard/actions.ts` — modify. Add `updateBranding` Server Action
  (theme + accent + heading_font + link_font together, one Save button).

## Implementation requirements

**`supabase/migrations/0004_branding_themes_and_fonts.sql`**
```sql
alter table public.pages drop constraint if exists pages_theme_check;

update public.pages set theme = 'midnight' where theme = 'dark';
update public.pages set theme = 'blanc' where theme = 'light';

alter table public.pages
  alter column theme set default 'midnight',
  add constraint pages_theme_check
    check (theme in ('midnight','blanc','sunset','neon','pastel','mono'));

alter table public.pages
  add column heading_font text not null default 'hanken'
    check (heading_font in ('hanken','inter','poppins','montserrat','space_grotesk','work_sans','roboto','playfair')),
  add column link_font text not null default 'hanken'
    check (link_font in ('hanken','inter','poppins','montserrat','space_grotesk','work_sans','roboto','playfair'));
```

**`lib/fonts.ts`** — as originally scoped: statically import all 8 fonts,
export a `fontClassName(key)` helper defaulting to Hanken Grotesk for any
unrecognized/null value.

**`lib/themes.ts`**
```ts
export const THEMES = {
  midnight: { name: "Midnight", background: "#18181a", /* ...full recipe */ },
  blanc: { name: "Blanc", ... },
  sunset: { name: "Sunset", ... },
  neon: { name: "Neon", ... },
  pastel: { name: "Pastel", ... },
  mono: { name: "Mono", ... },
} as const;

export function themeRecipe(key: string | null | undefined) {
  return THEMES[key as keyof typeof THEMES] ?? THEMES.midnight;
}
```

**`HubContent.tsx`**: replace the current hardcoded dark styling with
`const recipe = themeRecipe(page.theme)`, applying its background
(solid or gradient), heading/tagline/link-card/footer colors, and corner
radius. Heading gets `className={fontClassName(page.heading_font)}`;
each link label/sub gets `className={fontClassName(page.link_font)}`.

**Branding tab**: theme picker is a grid of 6 small preview swatch cards
(mini gradient/color chip + name), not a two-button toggle — selecting
one highlights it. Accent swatches, heading/link font listboxes, and a
single "Save branding" action, same as originally scoped.

## Security requirements

Unchanged from the original scoping: RLS-scoped client only, values
constrained by DB `check` constraints, accent remains a CSS-only value
(React's `style` prop is inherently escaped, not an injection surface).

## Acceptance criteria

- All six themes render distinctly and legibly (no low-contrast text) on
  both the live preview and the real public hub page after save.
- Existing pages with the old `dark`/`light` values are migrated to
  `midnight`/`blanc` automatically, not left broken.
- Heading font and link font can be set independently and both show up
  correctly in the right places.
- Accent color still controls the initials avatar regardless of theme.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. Run `supabase/migrations/0004_branding_themes_and_fonts.sql` in the
   Supabase SQL Editor. Confirm existing pages' `theme` values became
   `midnight` (not left as `dark`).
2. `/dashboard` → Branding tab → try all six themes in the live preview,
   confirm each looks intentional and text stays legible.
3. Pick "Playfair Display" for heading font and "Space Grotesk" for link
   font, confirm both render distinctly in the preview.
4. Save, visit the real `/[slug]` page, confirm it matches the preview
   exactly.
5. Change accent color, confirm the avatar updates regardless of which
   theme is active.
