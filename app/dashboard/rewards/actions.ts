"use server";

import { revalidatePath } from "next/cache";
import { getCurrentBusiness, getOrgContext } from "@/lib/business";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rewards as copy } from "@/content/owner";

export type RewardsState = { ok: boolean; error?: string };

const MAX_PRIZES = 8;

/** Owner saves scratch-card settings + prize list (RLS: owner of the active cafe only). */
export async function saveRewards(_prev: RewardsState, formData: FormData): Promise<RewardsState> {
  const ctx = await getOrgContext();
  if (ctx.kind !== "member" || ctx.role !== "owner") return { ok: false, error: copy.errors.notOwner };
  const business = await getCurrentBusiness(ctx.orgId);
  if (!business) return { ok: false, error: copy.errors.notOwner };

  const minBill = Number(formData.get("min_bill"));
  const validity = Number(formData.get("validity_days"));
  if (!Number.isFinite(minBill) || minBill < 0 || minBill > 100000) return { ok: false, error: copy.errors.minBill };
  if (!Number.isInteger(validity) || validity < 1 || validity > 90) return { ok: false, error: copy.errors.validity };

  const labels = formData.getAll("prize_label").map((v) => String(v).trim());
  const weights = formData.getAll("prize_weight").map((v) => Number(v));
  const prizes = labels
    .map((label, i) => ({ label: label.slice(0, 40), weight: Math.round(weights[i] ?? 0) }))
    .filter((p) => p.label.length > 0);
  if (prizes.length < 1 || prizes.length > MAX_PRIZES) return { ok: false, error: copy.errors.prizeCount };
  if (prizes.some((p) => !Number.isInteger(p.weight) || p.weight < 1 || p.weight > 100)) {
    return { ok: false, error: copy.errors.weight };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("reward_settings").upsert(
    {
      business_id: business.id,
      scratch_enabled: formData.get("scratch_enabled") === "on",
      scratch_all_members: formData.get("all_members") === "on",
      scratch_min_bill: Math.round(minBill * 100) / 100,
      prize_validity_days: validity,
      prizes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" },
  );
  if (error) {
    console.error("saveRewards failed", error.message);
    return { ok: false, error: copy.errors.generic };
  }
  revalidatePath("/dashboard/rewards");
  revalidatePath("/dashboard");
  return { ok: true };
}
