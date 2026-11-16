import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ensureBusinessForActiveOrg, getOrgContext, isSlugLocked, listTables } from "@/lib/business";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { OnboardingSteps } from "./OnboardingSteps";
import { onboarding as copy } from "@/content/owner";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Set up your cafe — Dobara", robots: { index: false } };

export default async function OnboardingPage() {
  const ctx = await getOrgContext();
  if (ctx.kind === "signed-out") redirect("/sign-in");
  if (ctx.kind === "no-org") redirect("/onboarding/create-cafe");
  if (ctx.role === "staff") redirect("/board");

  const business = await ensureBusinessForActiveOrg();
  if (!business) {
    return (
      <OwnerShell>
        <p className="text-[16px] text-[#9a9aa3]">{copy.errors.generic}</p>
      </OwnerShell>
    );
  }
  if (business.onboarded_at) redirect("/dashboard");

  const [locked, tables] = await Promise.all([isSlugLocked(business.id), listTables(business.id)]);
  const host = new URL(SITE_URL).host;

  return (
    <OwnerShell cafeName={business.display_name}>
      <OnboardingSteps
        name={business.display_name ?? ""}
        slug={business.slug}
        slugLocked={locked}
        host={host}
        existingTables={tables.length}
      />
    </OwnerShell>
  );
}
