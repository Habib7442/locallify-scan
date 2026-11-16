import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const MAX_TABLES = 60;

export function parseTableCount(raw: FormDataEntryValue | null): number | null {
  const n = Number(String(raw ?? "").trim());
  return Number.isInteger(n) && n >= 1 && n <= MAX_TABLES ? n : null;
}

/**
 * Creates T1…Tn for any codes that don't exist yet (re-runnable). Runs with
 * the owner's Clerk JWT — RLS (tables_insert_owner) enforces ownership.
 * Callers must pass a businessId resolved from auth(), never client input.
 */
export async function ensureTables(businessId: string, count: number): Promise<{ ok: boolean; added: number }> {
  const supabase = createServerSupabaseClient();
  const { data: existing, error: readError } = await supabase.from("tables").select("code").eq("business_id", businessId);
  if (readError) {
    console.error("ensureTables read failed", readError);
    return { ok: false, added: 0 };
  }

  const have = new Set((existing ?? []).map((r: { code: string }) => r.code));
  const rows = Array.from({ length: count }, (_, i) => `T${i + 1}`)
    .filter((code) => !have.has(code))
    .map((code) => ({ business_id: businessId, code }));
  if (rows.length === 0) return { ok: true, added: 0 };

  const { error } = await supabase.from("tables").insert(rows);
  if (error) {
    console.error("ensureTables insert failed", error);
    return { ok: false, added: 0 };
  }
  return { ok: true, added: rows.length };
}
