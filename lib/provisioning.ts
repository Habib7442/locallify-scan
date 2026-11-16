import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Creates the `profiles` + `pages` rows for a Clerk user. Used by the Clerk
// `user.created` webhook and, as a fallback, by /dashboard and /onboarding
// when a signed-in user's rows are missing (missed webhook). Uses the
// service role because users have no RLS INSERT path on these tables —
// callers must only ever pass a verified Clerk user ID (webhook payload or
// `auth().userId`), never client input. See AGENTS.md §5.

type AdminClient = ReturnType<typeof createAdminClient>;

export type ProvisionInput = {
  id: string;
  email: string | null;
  name: string | null;
};

export type ProvisionResult = { ok: true } | { ok: false; error: string };

const MAX_PAGE_INSERT_ATTEMPTS = 3;
const TRIAL_DAYS = 7;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(supabase: AdminClient, seed: string) {
  const base = slugify(seed) || "hub";
  let slug = base;
  let suffix = 0;

  while (true) {
    const { data } = await supabase.from("pages").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

async function ownerHasPage(supabase: AdminClient, ownerId: string) {
  const { data } = await supabase
    .from("pages")
    .select("id")
    .eq("owner_clerk_id", ownerId)
    .maybeSingle();
  return Boolean(data);
}

export async function provisionUser({ id, email, name }: ProvisionInput): Promise<ProvisionResult> {
  const supabase = createAdminClient();

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .select("id")
    .eq("name", "Locallify")
    .single();

  if (agencyError || !agency) {
    console.error("provisionUser: seeded Locallify agency not found", agencyError);
    return { ok: false, error: "Agency not configured" };
  }

  // ignoreDuplicates keeps an existing profile untouched — in particular a
  // manually promoted agency_admin role is never reset to "user".
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { clerk_user_id: id, agency_id: agency.id, role: "user", name, email },
      { onConflict: "clerk_user_id", ignoreDuplicates: true },
    );

  if (profileError) {
    console.error("provisionUser: failed to upsert profile", profileError);
    return { ok: false, error: "Failed to create profile" };
  }

  for (let attempt = 0; attempt < MAX_PAGE_INSERT_ATTEMPTS; attempt++) {
    if (await ownerHasPage(supabase, id)) return { ok: true };

    const slug = await generateUniqueSlug(supabase, name || email || id);
    const { error: pageError } = await supabase.from("pages").insert({
      agency_id: agency.id,
      owner_clerk_id: id,
      slug,
      display_name: name || "My Hub",
      theme: "midnight",
      bg_type: "solid",
      bg_value: null,
      active: true,
      subscription_status: "trialing",
      trial_ends_at: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (!pageError) return { ok: true };

    // 23505 = unique violation: a concurrent call created this owner's page,
    // or grabbed the same slug. Loop re-checks ownership / picks a new slug.
    if (pageError.code !== "23505") {
      console.error("provisionUser: failed to create page", pageError);
      return { ok: false, error: "Failed to create page" };
    }
  }

  if (await ownerHasPage(supabase, id)) return { ok: true };
  return { ok: false, error: "Failed to create page" };
}

/**
 * Fallback for a signed-in user whose rows are missing. Identity comes only
 * from the current Clerk session — never from request input.
 */
export async function provisionSignedInUser(): Promise<ProvisionResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;
  return provisionUser({ id: user.id, email, name });
}
