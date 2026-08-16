import "server-only";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!;

/**
 * RLS-scoped Supabase client for the signed-in Clerk user making the current
 * request. Clerk is registered as a third-party auth provider in Supabase,
 * so the session token doubles as the Supabase access token — no JWT
 * template needed. Every query through this client is subject to RLS.
 */
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    accessToken: async () => (await auth()).getToken(),
  });
}
