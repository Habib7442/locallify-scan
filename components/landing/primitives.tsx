import type { ReactNode } from "react";
import type { AccentHeading } from "@/content/landing";
import { cn } from "@/lib/utils";

// Shared building blocks for the landing page sections.

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#54e0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18181a]";

const btnBase = `inline-flex items-center justify-center gap-2 font-medium tracking-[-0.02em] transition-colors duration-200 ${focusRing}`;

export const btn = {
  primary: `${btnBase} rounded-[12px] bg-white text-[#18181a] hover:bg-gray-100 shadow-[0_12px_32px_rgba(0,0,0,0.4)]`,
  secondary: `${btnBase} rounded-[12px] border border-white/20 bg-white/5 text-white hover:bg-white/10`,
  highlight: `${btnBase} rounded-[15px] bg-brand-gradient text-[#18181a] shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:brightness-110`,
  sizeMd: "h-12 px-5 text-[15px]",
  sizeLg: "h-14 px-7 text-base md:text-lg",
};

export const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#54e0ff]/30 hover:bg-white/[0.05] hover:shadow-[0_10px_40px_rgba(84,224,255,0.1)]";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>{children}</div>;
}

export function Section({
  id,
  tone = "base",
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: "base" | "alt";
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "relative scroll-mt-24 py-16 md:py-20",
        tone === "base" ? "bg-[#18181a]" : "border-t border-[#33373b]/60 bg-[#1d1d20]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <span className="gradient-text-accent pr-[0.08em] font-semibold italic">{children}</span>;
}

export function AccentTitle({ title }: { title: AccentHeading }) {
  return (
    <>
      {title.before}
      <Accent>{title.accent}</Accent>
      {title.after}
    </>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "glassmorphic inline-flex items-center rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] text-[#54e0ff]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const h2Class =
  "text-[32px] font-normal leading-[1.15] tracking-[-0.05em] text-white md:text-[48px] md:tracking-[-0.06em]";

export const subtitleClass =
  "text-[15px] font-light leading-[1.5] text-[#9a9aa3] md:text-[19px]";

export function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
}: {
  id: string;
  eyebrow?: string;
  title: AccentHeading;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto mb-14 flex max-w-[920px] flex-col items-center text-center">
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h2 id={id} className={h2Class}>
        <AccentTitle title={title} />
      </h2>
      {subtitle ? <p className={cn(subtitleClass, "mt-4 max-w-[60ch]")}>{subtitle}</p> : null}
    </div>
  );
}

export function Glow({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden", className)}>
      <div className="absolute -top-40 left-[8%] h-[360px] w-[520px] rounded-full bg-[#A4DCFF] opacity-[0.10] mix-blend-plus-lighter blur-[120px]" />
      <div className="absolute -top-24 right-[6%] h-[320px] w-[460px] rounded-full bg-[#54E0FF] opacity-[0.12] mix-blend-plus-lighter blur-[120px]" />
      <div className="absolute top-20 left-1/2 h-[240px] w-[380px] -translate-x-1/2 rounded-full bg-white opacity-[0.05] mix-blend-plus-lighter blur-[100px]" />
    </div>
  );
}
