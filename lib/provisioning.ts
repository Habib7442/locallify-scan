import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Creates the `profiles` row for a Clerk user. Used by the Clerk
// `user.created` webhook and as a fallback for a signed-in user whose row is
// missing (missed webhook). Uses the service role because users have no RLS
// INSERT path on profiles — callers must only ever pass a verified Clerk user
// ID (webhook payload or `auth().userId`), never client input. AGENTS.md §5.
//
// Dobara: the cafe's `pages` row (the business) is NOT created here — it is
// created when the owner's Clerk Organization exists, by
// ensureBusinessForActiveOrg() in lib/business.ts. That way invited staff
// never get a stray business row.

export type ProvisionInput = {
  id: string;
  email: string | null;
  name: string | null;
};

export type ProvisionResult = { ok: true } | { ok: false; error: string };

export async function getLocallifyAgencyId(): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("agencies").select("id").eq("name", "Locallify").single();
  if (error || !data) {
    console.error("Locallify agency not found", error);
    return null;
  }
  return data.id as string;
}

export async function provisionUser({ id, email, name }: ProvisionInput): Promise<ProvisionResult> {
  const agencyId = await getLocallifyAgencyId();
  if (!agencyId) return { ok: false, error: "Agency not configured" };

  // ignoreDuplicates keeps an existing profile untouched — in particular a
  // manually promoted agency_admin role is never reset to "user".
  const { error } = await createAdminClient()
    .from("profiles")
    .upsert(
      { clerk_user_id: id, agency_id: agencyId, role: "user", name, email },
      { onConflict: "clerk_user_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("provisionUser: failed to upsert profile", error);
    return { ok: false, error: "Failed to create profile" };
  }
  return { ok: true };
}

/**
 * Fallback for a signed-in user whose profile row is missing. Identity comes
 * only from the current Clerk session — never from request input.
 */
export async function provisionSignedInUser(): Promise<ProvisionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;
  return provisionUser({ id: user.id, email, name });
}
