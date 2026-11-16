import type { ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { auth as copy } from "@/content/owner";
import { Accent, Glow, focusRing } from "@/components/landing/primitives";

/** Branded split layout for sign-in / sign-up / create-cafe. */
export function AuthShell({ title, line, children }: { title: string; line: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#18181a] text-white">
      <Glow />
      <div className="relative mx-auto grid min-h-screen max-w-[1100px] items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start">
          <Link href="/" className={`flex items-baseline gap-1.5 rounded-md ${focusRing}`}>
            <span className="text-[19px] font-medium tracking-[-0.04em]">{copy.brand}</span>
            <span className="text-[13px] font-light text-[#8b8b94]">{copy.byline}</span>
          </Link>
          <h1 className="mt-8 text-[32px] leading-[1.15] font-normal tracking-[-0.05em] md:text-[44px]">
            {title.split(" ").slice(0, -1).join(" ")} <Accent>{title.split(" ").slice(-1)}</Accent>
          </h1>
          <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.5] font-light text-[#9a9aa3] md:text-[18px]">{line}</p>
          <ul className="mt-6 hidden flex-col gap-2 sm:flex">
            {copy.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-[15px] font-light text-[#9a9aa3]">
                <Check className="size-4 text-green-400" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center lg:justify-end">{children}</div>
      </div>
    </div>
  );
}
