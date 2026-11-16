import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCurrentBusiness, getOrgContext } from "@/lib/business";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OwnerShell, panelClass } from "@/components/owner/OwnerShell";
import { focusRing } from "@/components/landing/primitives";
import { rewards as copy } from "@/content/owner";
import type { PrizeOption } from "@/lib/supabase/dobara-types";
import { RewardsForm } from "./RewardsForm";
import { getPrizeCounts } from "@/lib/prizes";

export const metadata: Metadata = { title: "Rewards — Dobara", robots: { index: false } };

export default async function RewardsPage() {
  const ctx = await getOrgContext();
  if (ctx.kind === "signed-out") redirect("/sign-in");
  if (ctx.kind === "no-org") redirect("/onboarding/create-cafe");
  if (ctx.role === "staff") redirect("/board");
  const business = await getCurrentBusiness(ctx.orgId);
  if (!business) redirect("/onboarding");

  const supabase = createServerSupabaseClient();
  const [{ data: settings }, counts] = await Promise.all([
    supabase.from("reward_settings").select("*").eq("business_id", business.id).maybeSingle(),
    getPrizeCounts(business.id),
  ]);
  const s = settings as {
    scratch_enabled: boolean;
    scratch_all_members: boolean;
    scratch_min_bill: number;
    prize_validity_days: number;
    prizes: PrizeOption[];
  } | null;

  return (
    <OwnerShell cafeName={business.display_name}>
      <Link href="/dashboard" className={`inline-flex h-10 items-center gap-1.5 rounded-[10px] text-[15px] text-[#9a9aa3] hover:text-white ${focusRing}`}>
        <ArrowLeft className="size-4" aria-hidden /> {copy.back}
      </Link>
      <h1 className="mt-2 text-[30px] leading-[1.15] tracking-[-0.05em] md:text-[38px]">{copy.title}</h1>
      <p className="mt-2 max-w-[56ch] text-[16px] text-[#9a9aa3]">{copy.line}</p>

      <div className={`${panelClass} mt-6 grid grid-cols-3 gap-3 text-center`}>
        {(["issued", "redeemed", "expired"] as const).map((k) => (
          <div key={k}>
            <p className="text-[30px] font-light tracking-[-0.05em]">{counts.month[k]}</p>
            <p className="text-[14px] text-[#9a9aa3]">{copy.counts[k]}</p>
            <p className="text-[13px] text-[#8b8b94]">{copy.allTime(counts.all[k])}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <RewardsForm
          scratchEnabled={s?.scratch_enabled ?? true}
          allMembers={s?.scratch_all_members ?? true}
          minBill={Number(s?.scratch_min_bill ?? 200)}
          validityDays={s?.prize_validity_days ?? 14}
          prizes={
            s?.prizes ?? [
              { label: "₹50 off", weight: 50 },
              { label: "Free cold drink", weight: 30 },
              { label: "Free dessert", weight: 15 },
              { label: "Free meal for 2", weight: 5 },
            ]
          }
        />
      </div>
    </OwnerShell>
  );
}
