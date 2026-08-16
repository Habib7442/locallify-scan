-- Adds trial/subscription status tracking to pages.
-- Run once in the Supabase SQL Editor against the live project.

alter table public.pages
  add column subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'cancelled')),
  add column trial_ends_at timestamptz not null default (now() + interval '7 days');
