-- Widens pages.theme from a light/dark toggle to six curated visual
-- themes, and adds separate heading/link font selection.
-- Run once in the Supabase SQL Editor against the live project.

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
