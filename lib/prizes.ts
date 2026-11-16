import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Owner-facing prize stats (RLS: staff/owner of the active cafe).

export type Counts = { issued: number; redeemed: number; expired: number };

export async function getPrizeCounts(businessId: string): Promise<{ month: Counts; all: Counts }> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("prizes").select("status, valid_until, created_at").eq("business_id", businessId);
  const now = Date.now();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const empty = (): Counts => ({ issued: 0, redeemed: 0, expired: 0 });
  const month = empty();
  const all = empty();
  for (const p of (data ?? []) as { status: string; valid_until: string; created_at: string }[]) {
    const expired = p.status === "expired" || ((p.status === "active" || p.status === "unscratched") && new Date(p.valid_until).getTime() < now);
    for (const bucket of new Date(p.created_at) >= monthStart ? [month, all] : [all]) {
      bucket.issued += 1;
      if (p.status === "redeemed") bucket.redeemed += 1;
      else if (expired) bucket.expired += 1;
    }
  }
  return { month, all };
}
