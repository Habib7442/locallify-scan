import type { ReactNode } from "react";
import { Container, focusRing } from "@/components/landing/primitives";

// Shared layout + prose styles for the legal pages.

export const LEGAL_LAST_UPDATED = "16 November 2026";

export const legalLink = `rounded-sm text-[#54e0ff] underline-offset-4 hover:underline ${focusRing}`;

export function LegalPage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <Container className="max-w-[820px]">
        <h1 className="text-[34px] leading-[1.15] font-normal tracking-[-0.05em] text-white md:text-[48px] md:tracking-[-0.06em]">
          {title}
        </h1>
        <p className="mt-3 text-[14px] font-light text-[#8b8b94]">Last updated: {LEGAL_LAST_UPDATED}</p>
        {intro ? (
          <div className="mt-8 max-w-[72ch] text-[16px] leading-[1.65] font-light text-[#9a9aa3] md:text-[17px]">{intro}</div>
        ) : null}
        <div className="mt-12 space-y-12">{children}</div>
      </Container>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[22px] leading-[1.25] font-normal tracking-[-0.04em] text-white md:text-[26px]">{title}</h2>
      <div className="mt-4 max-w-[72ch] space-y-4 text-[16px] leading-[1.65] font-light text-[#9a9aa3] [&_li]:pl-1 [&_strong]:font-normal [&_strong]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
