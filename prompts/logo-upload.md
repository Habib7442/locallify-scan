# Prompt: Logo/avatar upload (Supabase Storage)

## Goal

Let a user upload their own logo/photo, replacing the initials fallback
on their hub. This is the first slice of the Branding tab deferred from
the dashboard-editor prompt — background image and accent colour follow
in later prompts, once this establishes the Storage pattern (bucket,
policies, upload flow) they'll reuse.

## Skills read

- `supabase` — Storage security checklist: **upsert requires INSERT +
  SELECT + UPDATE**, not just INSERT (silent failure otherwise); public
  buckets serve reads via a CDN URL without needing an RLS `SELECT`
  policy for `anon`, but the owning user still needs `SELECT` via the
  Storage API to manage their own files.
- `supabase-postgres-best-practices` — not directly applicable (no new
  table), but the same "index/scope everything to the caller's identity"
  principle applies to storage object paths.

## Existing code inspected

- `AGENTS.md` §7: `pages.logo_path` — "referenced by storage path," not a
  full URL. Rendering code (`HubContent.tsx`) needs to turn a stored path
  into a public URL.
- `components/hub/HubContent.tsx` — already has the initials-fallback
  logic (`page.logo_path ? <Image src={page.logo_path} ... /> : <initials
  circle>`), but currently treats `logo_path` as if it were already a
  full URL — needs updating once it's a bare storage path.
- `lib/supabase/server.ts` — server-side RLS-scoped client
  (`auth()`-based, Node-only). **Storage uploads happen from the
  browser**, so this can't be reused as-is — need a new browser-side
  client using Clerk's `useSession()` hook for the access token (the
  standard Clerk × Supabase third-party-auth browser pattern), separate
  from the existing server-only helper.
- No `lib/supabase/client.ts` (browser client) exists yet — new file.
- Recalling the `hero_image.webp` caching bug from earlier this session
  (same filename overwritten → stale cache served): the fix here is
  structural, not a workaround — every upload gets a **unique filename**
  (timestamped), so there's never a same-URL-different-content
  collision, and no query-string cache-busting is needed.

## Decisions / assumptions

- **Bucket**: `page-assets`, public (read), created once — reused by
  future background/gallery uploads too, not logo-specific, so this
  doesn't need recreating later. Path convention:
  `{owner_clerk_id}/logo-{timestamp}.{ext}` — the owner-prefixed folder
  is what the storage policies scope writes to.
- **Public bucket, not signed URLs**: logos are meant to be publicly
  visible (they render on the public hub page) — no reason to gate reads,
  matches the existing public-hub-read philosophy already established for
  `pages`/`links`.
- **Unique filename per upload** (timestamp suffix) instead of a fixed
  `logo.png` + upsert — sidesteps the caching class of bug entirely
  rather than re-solving it with cache-busting query params again. Old
  files are deleted after a successful upload (via the RLS-scoped client,
  which can delete its own folder's objects) to avoid orphaned storage
  accumulating — not critical for correctness, just tidiness.
- **Validation**: client-side (before upload) and bucket-level (Supabase
  config) — image MIME types only (`image/png`, `image/jpeg`,
  `image/webp`), max 2MB. Bucket-level limits are the real enforcement
  (client-side is just fast UX feedback, never trust it alone).
- **New "Branding" tab** in the dashboard (alongside Links/Settings) —
  starts with just the logo upload control; background image/accent
  colour/theme land here in later prompts rather than needing a new tab
  each time.
- **DB update**: after a successful Storage upload, a Server Action
  updates `pages.logo_path` to the new storage path (RLS-scoped, same
  pattern as every other dashboard write this session).

## Files likely to change

- `lib/supabase/client.ts` — new. Browser-side Supabase client using
  Clerk's `useSession()` for the access token.
- `lib/storage.ts` — new. `getPublicAssetUrl(path)` helper (builds the
  public Storage URL from a stored path), shared by `HubContent.tsx` and
  the dashboard preview.
- `supabase/migrations/0003_page_assets_bucket.sql` — new. Bucket
  creation + storage policies (buckets/policies are created via SQL
  too, run the same way as the other migrations this session).
- `components/hub/HubContent.tsx` — modify. Use `getPublicAssetUrl` when
  rendering `logo_path`.
- `app/dashboard/dashboard-editor.tsx` — modify. Add "Branding" to the
  tab list.
- `app/dashboard/branding-tab.tsx` — new. Upload control, current-logo
  preview, remove-logo option.
- `app/dashboard/actions.ts` — modify. Add `updateLogoPath` (and
  `removeLogo`) Server Actions.

## Implementation requirements

**`supabase/migrations/0003_page_assets_bucket.sql`**
```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('page-assets', 'page-assets', true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create policy "page_assets_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'page-assets'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "page_assets_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'page-assets'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "page_assets_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'page-assets'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );

create policy "page_assets_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'page-assets'
    and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub')
  );
```

**`lib/supabase/client.ts`**
```tsx
"use client";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";
import { useMemo } from "react";

export function useSupabaseBrowserClient() {
  const { session } = useSession();
  return useMemo(
    () =>
      createClient(supabaseUrl, supabasePublishableKey, {
        accessToken: async () => session?.getToken() ?? null,
      }),
    [session]
  );
}
```

**`lib/storage.ts`**
```ts
export function getPublicAssetUrl(path: string | null): string | null {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/page-assets/${path}`;
}
```

**`branding-tab.tsx`**
- File input (styled, not raw `<input type=file>` look), current logo
  preview (or initials fallback matching `HubContent`'s own logic — reuse
  it rather than duplicating).
- On file select: client-side validate type/size, upload via
  `useSupabaseBrowserClient()` to `page-assets/{userId}/logo-{Date.now()}.{ext}`,
  then call `updateLogoPath` Server Action with the new path, then delete
  the previous object (best-effort, non-blocking to the UI).
- Loading state during upload, error state on failure (file too large,
  wrong type, network error).
- "Remove logo" clears `logo_path` (falls back to initials) — doesn't
  need to delete the Storage object immediately, can be lazy/best-effort.

**`app/dashboard/actions.ts` additions**
- `updateLogoPath(path: string | null)`: RLS-scoped update to the
  caller's own `pages.logo_path`, same ownership pattern as every other
  action in this file.

## Security requirements

- Storage policies scope every write (`INSERT`/`UPDATE`/`DELETE`) to the
  caller's own `{owner_clerk_id}` folder — verified via the same
  `auth.jwt() ->> 'sub'` pattern used everywhere else, not a new pattern.
- Bucket-level `file_size_limit` and `allowed_mime_types` are the real
  enforcement (defense in depth) — client-side checks are UX only.
- No service-role usage anywhere in the upload flow — this is a
  client-triggered, authenticated path, exactly what RLS/Storage policies
  exist for.
- Public bucket read access is intentional (logos are public-hub content
  by design), not a gap.

## Acceptance criteria

- Uploading a logo updates the live preview and the real public hub page
  after save.
- Uploading a second logo doesn't require a hard refresh or cache-bust
  trick to show the new image (unique filename per upload makes this a
  non-issue).
- A non-image file or a file over 2MB is rejected client-side with a
  clear message, and would also be rejected server-side if the client
  check were bypassed (bucket config enforces this independently).
- "Remove logo" reverts to the initials fallback everywhere.
- Attempting to write to another user's storage folder (verified via a
  direct API call with a different path, using the RLS-scoped client)
  fails.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Exact manual test steps

1. Run `supabase/migrations/0003_page_assets_bucket.sql` in the Supabase
   SQL Editor. Confirm the `page-assets` bucket appears under Storage,
   public, with the size/MIME restrictions set.
2. `npm run dev`, sign in, visit `/dashboard` → Branding tab.
3. Upload a small PNG/JPEG — confirm it appears in the live preview
   immediately, and on the real `/[slug]` page after reload.
4. Upload a second image — confirm the old one is replaced everywhere,
   with no stale-cache artifact (this was a real bug earlier this
   session with a different image, so verify carefully).
5. Try uploading a 5MB file — confirm it's rejected client-side with a
   clear error.
6. Try uploading a `.pdf` — confirm it's rejected.
7. Click "Remove logo" — confirm it reverts to the initials avatar
   everywhere.
