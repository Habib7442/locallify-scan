import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocallifyAgencyId, provisionSignedInUser } from "@/lib/provisioning";
import type { TableRow } from "@/lib/supabase/dobara-types";

// The cafe ("business") is the `pages` row linked to the active Clerk
// Organization (migration 0010). Owner = org:admin, Staff = org:member.

export type Business = {
  id: string;
  slug: string;
  display_name: string | null;
  clerk_org_id: string;
  onboarded_at: string | null;
};

export type OrgContext =
  | { kind: "signed-out" }
  | { kind: "no-org"; userId: string }
  | { kind: "member"; userId: string; orgId: string; role: "owner" | "staff" };

export async function getOrgContext(): Promise<OrgContext> {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) return { kind: "signed-out" };
  if (!orgId) return { kind: "no-org", userId };
  return { kind: "member", userId, orgId, role: orgRole === "org:admin" ? "owner" : "staff" };
}

// ---------------------------------------------------------------- slugs

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
const RESERVED_SLUGS = new Set([
  "r", "api", "admin", "board", "dashboard", "onboarding", "sign-in", "sign-up",
  "login", "logout", "terms", "privacy-policy", "refund-policy", "contact-us", "dobara", "locallify",
]);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) return "invalid";
  if (RESERVED_SLUGS.has(slug)) return "reserved";
  return null;
}

async function uniqueSlug(seed: string): Promise<string> {
  const supabase = createAdminClient();
  let base = slugify(seed);
  if (validateSlug(base)) base = `cafe-${base || "new"}`.slice(0, 40).replace(/-+$/g, "");
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base.slice(0, 36)}-${i + 1}`;
    const { data } = await supabase.from("pages").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base.slice(0, 30)}-${Date.now().toString(36)}`;
}

// ---------------------------------------------------- business provisioning

const BUSINESS_COLUMNS = "id, slug, display_name, clerk_org_id, onboarded_at";

/**
 * Makes sure the active org's cafe has a `pages` row, and returns it.
 * Service role, narrow exception (AGENTS.md §5): identity comes only from
 * auth() — userId, orgId, and org:admin role — never from request input.
 * Idempotent; safe to call on every /onboarding render.
 */
export async function ensureBusinessForActiveOrg(): Promise<Business | null> {
  const ctx = await getOrgContext();
  if (ctx.kind !== "member" || ctx.role !== "owner") return null;

  const supabase = createAdminClient();

  const existing = await supabase.from("pages").select(BUSINESS_COLUMNS).eq("clerk_org_id", ctx.orgId).maybeSingle();
  if (existing.data) return existing.data as Business;

  // Profile must exist (FK from pages.owner_clerk_id).
  const prof = await provisionSignedInUser();
  if (!prof.ok) return null;

  const clerk = await clerkClient();
  const org = await clerk.organizations.getOrganization({ organizationId: ctx.orgId });
  const name = org.name.trim().slice(0, 60) || "My Cafe";

  // Re-use an unlinked page this user already owns (old link-in-bio row).
  const own = await supabase
    .from("pages")
    .select(BUSINESS_COLUMNS)
    .eq("owner_clerk_id", ctx.userId)
    .is("clerk_org_id", null)
    .maybeSingle();
  if (own.data) {
    const { data, error } = await supabase
      .from("pages")
      .update({ clerk_org_id: ctx.orgId, display_name: name })
      .eq("id", (own.data as Business).id)
      .select(BUSINESS_COLUMNS)
      .single();
    if (error) console.error("ensureBusiness: link failed", error);
    return (data as Business) ?? null;
  }

  const agencyId = await getLocallifyAgencyId();
  if (!agencyId) return null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = await uniqueSlug(name);
    const { data, error } = await supabase
      .from("pages")
      .insert({
        agency_id: agencyId,
        owner_clerk_id: ctx.userId,
        clerk_org_id: ctx.orgId,
        slug,
        display_name: name,
        active: true,
      })
      .select(BUSINESS_COLUMNS)
      .single();
    if (!error) return data as Business;
    if (error.code !== "23505") {
      console.error("ensureBusiness: insert failed", error);
      return null;
    }
    // Unique violation: concurrent call created it, or slug race — re-check.
    const again = await supabase.from("pages").select(BUSINESS_COLUMNS).eq("clerk_org_id", ctx.orgId).maybeSingle();
    if (again.data) return again.data as Business;
  }
  return null;
}

// ------------------------------------------------------- RLS-scoped reads

/** The active org's cafe, read with the user's JWT (explicit org filter). */
export async function getCurrentBusiness(orgId: string): Promise<Business | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("pages").select(BUSINESS_COLUMNS).eq("clerk_org_id", orgId).maybeSingle();
  if (error) console.error("getCurrentBusiness failed", error);
  return (data as Business) ?? null;
}

export async function listTables(businessId: string): Promise<TableRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tables")
    .select("id, business_id, code, label, is_active, created_at")
    .eq("business_id", businessId);
  if (error) console.error("listTables failed", error);
  const rows = (data as TableRow[]) ?? [];
  return rows.sort((a, b) => tableOrder(a.code) - tableOrder(b.code) || a.code.localeCompare(b.code));
}

function tableOrder(code: string): number {
  const m = /^T(\d+)$/.exec(code);
  return m ? Number(m[1]) : 10_000;
}

/** True once any table QR of this cafe has been scanned — the web address is then locked. */
export async function isSlugLocked(businessId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient();
  const { count, error } = await supabase
    .from("scans")
    .select("id", { count: "exact", head: true })
    .eq("page_id", businessId)
    .not("table_id", "is", null);
  if (error) console.error("isSlugLocked failed", error);
  return (count ?? 0) > 0;
}
