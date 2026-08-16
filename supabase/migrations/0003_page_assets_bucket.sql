-- Public Storage bucket for logos (and later backgrounds/gallery),
-- scoped per-user via storage policies matching the RLS pattern used
-- everywhere else in this project.
-- Run once in the Supabase SQL Editor against the live project.

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
