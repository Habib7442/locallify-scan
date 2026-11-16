import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { focusRing } from "@/components/landing/primitives";

/** App chrome for signed-in owner/staff pages: slim top bar + centred column. */
export function OwnerShell({ cafeName, children }: { cafeName?: string | null; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#18181a] text-white">
      <header className="sticky top-0 z-30 border-b border-[#33373b]/60 bg-[#18181a]/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[720px] items-center justify-between gap-3 px-4">
          <Link href="/dashboard" className={`flex min-w-0 items-baseline gap-1.5 rounded-md ${focusRing}`}>
            <span className="text-[17px] font-medium tracking-[-0.04em]">Dobara</span>
            {cafeName ? (
              <span className="truncate text-[14px] font-light text-[#9a9aa3]">· {cafeName}</span>
            ) : (
              <span className="text-[13px] font-light text-[#8b8b94]">by Locallify</span>
            )}
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[720px] px-4 pt-8 pb-16 md:pt-12">{children}</main>
    </div>
  );
}

export const inputClass = `h-12 w-full rounded-[12px] border border-[#33373b] bg-[#1e1e20] px-4 text-[16px] text-white placeholder:text-[#8b8b94] transition-colors hover:border-white/20 disabled:opacity-60 ${focusRing}`;

export const labelClass = "text-[14px] font-medium text-white/90";

export const panelClass = "rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6";
