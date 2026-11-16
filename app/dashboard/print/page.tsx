import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCurrentBusiness, getOrgContext, listTables } from "@/lib/business";
import { SITE_URL } from "@/lib/site";
import { focusRing } from "@/components/landing/primitives";
import { PrintCards } from "./PrintCards";

export const metadata: Metadata = { title: "Print QR cards — Dobara", robots: { index: false } };

export default async function PrintPage() {
  const ctx = await getOrgContext();
  if (ctx.kind === "signed-out") redirect("/sign-in");
  if (ctx.kind === "no-org") redirect("/onboarding/create-cafe");
  if (ctx.role === "staff") redirect("/board");

  const business = await getCurrentBusiness(ctx.orgId);
  if (!business) redirect("/onboarding");
  const tables = (await listTables(business.id)).filter((t) => t.is_active);

  const host = new URL(SITE_URL).host;
  const cards = tables.map((t) => ({ code: t.code, url: `${SITE_URL}/r/${business.slug}/t/${t.code}` }));

  return (
    <div className="min-h-screen bg-[#18181a] text-white print:bg-white">
      <style>{`
        @page { size: A4; margin: 8mm; }
        @media print {
          html, body { background: #fff !important; }
          .qr-sheet { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0 !important; }
          .qr-card { height: 138mm; break-inside: avoid; page-break-inside: avoid; }
          .qr-card:nth-child(4n) { break-after: page; }
        }
      `}</style>
      <div className="mx-auto max-w-[900px] px-4 py-8 print:max-w-none print:p-0">
        <div className="mb-6 flex items-center gap-3 print:hidden">
          <Link href="/dashboard" className={`inline-flex h-10 items-center gap-1.5 rounded-[10px] px-2 text-[15px] text-[#9a9aa3] hover:text-white ${focusRing}`}>
            <ArrowLeft className="size-4" aria-hidden /> Back
          </Link>
          <h1 className="text-[24px] tracking-[-0.04em]">QR cards · {business.display_name}</h1>
        </div>
        <PrintCards cafeName={business.display_name ?? ""} cards={cards} shortHost={host} />
      </div>
    </div>
  );
}
