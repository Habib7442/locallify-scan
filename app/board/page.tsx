import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentBusiness, getOrgContext } from "@/lib/business";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { board as copy } from "@/content/owner";

export const metadata: Metadata = { title: "Live Board — Dobara", robots: { index: false } };

// Placeholder until the Live Board prompt (M1). Owners and staff both land here.
export default async function BoardPage() {
  const ctx = await getOrgContext();
  if (ctx.kind === "signed-out") redirect("/sign-in");
  if (ctx.kind === "no-org") redirect("/onboarding/create-cafe");

  const business = await getCurrentBusiness(ctx.orgId);

  return (
    <OwnerShell cafeName={business?.display_name}>
      <h1 className="text-[30px] leading-[1.15] tracking-[-0.05em] md:text-[38px]">{copy.title}</h1>
      <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.5] font-light text-[#9a9aa3]">
        {business ? copy.line : copy.notMember}
      </p>
    </OwnerShell>
  );
}
