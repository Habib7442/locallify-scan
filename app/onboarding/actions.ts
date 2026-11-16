"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentBusiness, getOrgContext, isSlugLocked, validateSlug } from "@/lib/business";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { onboarding as copy } from "@/content/owner";
import { ensureTables, parseTableCount } from "@/lib/tables";

export type ActionState = { ok: boolean; error?: string; field?: "name" | "slug" | "count" };

/** Owner-only guard. Identity from auth() only; RLS re-checks every write. */
async function requireOwnerBusiness() {
  const ctx = await getOrgContext();
  if (ctx.kind !== "member" || ctx.role !== "owner") return null;
  return getCurrentBusiness(ctx.orgId);
}

export async function saveCafeDetails(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const business = await requireOwnerBusiness();
  if (!business) return { ok: false, error: copy.errors.notOwner };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) return { ok: false, error: copy.errors.name, field: "name" };

  const update: { display_name: string; slug?: string } = { display_name: name };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (slug && slug !== business.slug) {
    if (await isSlugLocked(business.id)) return { ok: false, error: copy.cafe.slugLocked, field: "slug" };
    const problem = validateSlug(slug);
    if (problem === "invalid") return { ok: false, error: copy.errors.slugInvalid, field: "slug" };
    if (problem === "reserved") return { ok: false, error: copy.errors.slugReserved, field: "slug" };
    update.slug = slug;
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("pages").update(update).eq("id", business.id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: copy.errors.slugTaken, field: "slug" };
    console.error("saveCafeDetails failed", error);
    return { ok: false, error: copy.errors.generic };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createTablesAndFinish(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const business = await requireOwnerBusiness();
  if (!business) return { ok: false, error: copy.errors.notOwner };

  const count = parseTableCount(formData.get("count"));
  if (count === null) return { ok: false, error: copy.errors.count, field: "count" };

  const result = await ensureTables(business.id, count);
  if (!result.ok) return { ok: false, error: copy.errors.generic };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("pages")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", business.id);
  if (error) {
    console.error("finish onboarding failed", error);
    return { ok: false, error: copy.errors.generic };
  }
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
