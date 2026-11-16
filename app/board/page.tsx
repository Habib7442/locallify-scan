import { redirect } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { getCurrentBusiness, getOrgContext } from "@/lib/business";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { board as copy } from "@/content/board";
import { BoardClient } from "./BoardClient";

export const metadata: Metadata = {
  title: "Live Board — Dobara",
  robots: { index: false },
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { themeColor: "#18181a" };

// Live Board (Pehchaan, PRD §7.6): owners and staff of the active cafe.
export default async function BoardPage() {
  const ctx = await getOrgContext();
  if (ctx.kind === "signed-out") redirect("/sign-in");
  if (ctx.kind === "no-org") redirect("/onboarding/create-cafe");

  const business = await getCurrentBusiness(ctx.orgId);
  if (!business) {
    return (
      <OwnerShell>
        <p className="text-[16px] text-[#9a9aa3]">{copy.notMember}</p>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell cafeName={business.display_name}>
      <BoardClient businessId={business.id} cafeName={business.display_name ?? ""} />
    </OwnerShell>
  );
}
