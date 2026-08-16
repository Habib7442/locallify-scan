-- Tracks whether a user has completed the /onboarding first-run flow,
-- so repeat visits can redirect straight to /dashboard instead of
-- re-showing the setup form.
-- Run once in the Supabase SQL Editor against the live project.

alter table public.pages
  add column onboarded_at timestamptz;
