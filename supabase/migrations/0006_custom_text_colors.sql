-- Optional per-page overrides for heading/tagline text color, needed once
-- a user picks a custom background color that might clash with a theme's
-- fixed text colors (e.g. white heading text on a white custom background).
-- null = use the active theme's default color.
alter table public.pages
  add column heading_color text,
  add column tagline_color text;
