-- Background-image adjustment controls (brightness/contrast/fade).
-- accent and bg_type already allow null / 'image' respectively — no
-- change needed for those.
alter table public.pages
  add column bg_image_brightness numeric not null default 100
    check (bg_image_brightness between 50 and 150),
  add column bg_image_contrast numeric not null default 100
    check (bg_image_contrast between 50 and 150),
  add column bg_image_overlay numeric not null default 30
    check (bg_image_overlay between 0 and 90);
