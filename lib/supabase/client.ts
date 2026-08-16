"use client";

import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!;

/**
 * RLS-scoped Supabase client for browser-side use (e.g. Storage uploads,
 * which must happen client-side rather than through a Server Action).
 * Mirrors lib/supabase/server.ts's accessToken pattern but sources the
 * token from Clerk's client-side useAuth() instead of the server auth().
 */
export function useSupabaseBrowserClient() {
  const { getToken } = useAuth();

  return useMemo(
    () =>
      createClient(supabaseUrl, supabasePublishableKey, {
        accessToken: async () => (await getToken()) ?? null,
      }),
    [getToken]
  );
}
