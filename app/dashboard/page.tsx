import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MonitorSmartphone } from "lucide-react";
import { getCurrentBusiness, getOrgContext, listTables } from "@/lib/business";
import { OwnerShell, panelClass } from "@/components/owner/OwnerShell";
import { dashboard as copy } from "@/content/owner";
import { SITE_URL } from "@/lib/site";
import { AddTablesForm, CopyButton } from "./DashboardClient";

export const metadata: Metadata = { title: "Your cafe — Dobara", robots: { index: false } };

export default async function DashboardPage() {
  const ctx = await getOrgContext();
  if (ctx.kind === "signed-out") redirect("/sign-in");
  if (ctx.kind === "no-org") redirect("/onboarding/create-cafe");
  if (ctx.role === "staff") redirect("/board");

  const business = await getCurrentBusiness(ctx.orgId);
  if (!business || !business.onboarded_at) redirect("/onboarding");

  const tables = await listTables(business.id);
  const base = `${SITE_URL}/r/${business.slug}`;

  return (
    <OwnerShell cafeName={business.display_name}>
      <h1 className="text-[30px] leading-[1.15] tracking-[-0.05em] md:text-[38px]">{business.display_name}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[15px] text-[#9a9aa3]">
        <span>{copy.addressLabel}:</span>
        <span className="break-all text-white">{base.replace(/^https?:\/\//, "")}</span>
      </div>

      <div className={`${panelClass} mt-6 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <MonitorSmartphone className="size-5 text-[#54e0ff]" aria-hidden />
          <span className="text-[16px]">{copy.board}</span>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[13px] text-[#9a9aa3]">{copy.boardSoon}</span>
      </div>

      <section aria-labelledby="tables-title" className="mt-10">
        <h2 id="tables-title" className="text-[22px] tracking-[-0.04em]">
          {copy.tablesTitle} <span className="text-[#9a9aa3]">({tables.length})</span>
        </h2>
        <p className="mt-1 text-[15px] font-light text-[#9a9aa3]">{copy.tablesLine}</p>

        {tables.length === 0 ? (
          <p className="mt-6 text-[15px] text-[#9a9aa3]">{copy.noTables}</p>
        ) : (
          <ul className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10">
            {tables.map((t) => {
              const url = `${base}/t/${t.code}`;
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-white/5 text-[15px] font-medium">
                    {t.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] text-[#9a9aa3]" title={url}>
                    {url.replace(/^https?:\/\//, "")}
                  </span>
                  <CopyButton value={url} label={t.code} />
                </li>
              );
            })}
          </ul>
        )}

        <div className={`${panelClass} mt-6`}>
          <h3 className="mb-4 text-[17px] tracking-[-0.03em]">{copy.addTitle}</h3>
          <AddTablesForm current={tables.length} />
        </div>
      </section>
    </OwnerShell>
  );
}
