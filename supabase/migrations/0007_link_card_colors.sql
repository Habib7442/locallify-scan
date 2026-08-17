-- Optional per-page overrides for link card background/text (and icon)
-- color — same reasoning as heading_color/tagline_color: a custom page
-- background can clash with the active theme's fixed link-card styling.
-- null = use the active theme's default.
alter table public.pages
  add column link_bg_color text,
  add column link_text_color text;
