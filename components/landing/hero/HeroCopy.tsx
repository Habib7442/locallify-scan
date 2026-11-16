import { Check, ChevronDown } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import type { HeroContent } from "./types";

// Server component. Entrance is CSS (`.hero-rise`), so the headline — the LCP
// element — paints without waiting for hydration, and is static under
// prefers-reduced-motion.

/** Stagger delay for `.hero-rise` (last item starts at 440ms + 440ms run < 900ms). */
function rise(delayMs: number) {
  return { style: { "--hero-delay": `${delayMs}ms` } as React.CSSProperties };
}

export function HeroCopy({ content }: { content: HeroContent }) {
  const { headline } = content;

  return (
    <div className="text-center lg:text-left">
      <p
        {...rise(0)}
        className="hero-rise inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-medium text-[#d4d4d8] backdrop-blur-sm"
      >
        <span className="hero-dot-pulse size-1.5 rounded-full bg-[#54e0ff]" aria-hidden />
        {content.eyebrow}
      </p>

      <h1 className="mt-6 text-[42px] sm:text-[56px] lg:text-[64px] xl:text-[72px] font-normal leading-[1.04] tracking-[-0.02em] text-white [text-wrap:balance]">
        <span {...rise(70)} className="hero-rise block">
          {headline.line1}
        </span>
        <span {...rise(150)} className="hero-rise block">
          {headline.line2Before}
          <span className="relative inline-block font-semibold italic text-[#54e0ff]">
            {headline.accent}
            <svg
              aria-hidden
              viewBox="0 0 200 20"
              preserveAspectRatio="none"
              className="absolute -bottom-[0.14em] left-[-2%] h-[0.28em] w-[104%] overflow-visible"
            >
              <path
                pathLength={1}
                className="hero-swash-path"
                d="M4 14 C 50 4, 110 2, 196 9"
                fill="none"
                stroke="#54e0ff"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.75"
              />
            </svg>
          </span>
          {headline.line2After}
        </span>
      </h1>

      <p
        {...rise(230)}
        className="hero-rise mx-auto mt-6 max-w-[46ch] text-[16px] sm:text-[18px] font-light leading-relaxed text-[#9a9aa4] lg:mx-0"
      >
        {content.sub}
      </p>

      <div {...rise(310)} className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
        <a
          href={content.primaryCta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] bg-[#54e0ff] px-6 text-[16px] font-semibold tracking-[-0.01em] text-[#0c1a20] shadow-[0_10px_30px_rgba(84,224,255,0.18)] transition-all duration-200 hover:shadow-[0_14px_40px_rgba(84,224,255,0.38)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white"
        >
          <FaWhatsapp className="size-5" aria-hidden />
          {content.primaryCta.label}
        </a>
        <a
          href={content.secondaryCta.href}
          className="inline-flex h-[52px] items-center justify-center gap-1.5 rounded-[14px] border border-white/15 px-6 text-[16px] font-medium text-white transition-colors hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#54e0ff]"
        >
          {content.secondaryCta.label}
          <ChevronDown className="size-4 stroke-[2.5]" aria-hidden />
        </a>
      </div>

      <ul
        {...rise(390)}
        className="hero-rise mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13.5px] text-[#8a8a93] lg:justify-start"
      >
        {content.trust.map((point) => (
          <li key={point} className="inline-flex items-center gap-1.5">
            <Check className="size-4 text-[#54e0ff]" aria-hidden />
            {point}
          </li>
        ))}
      </ul>

      <p
        {...rise(440)}
        className="hero-rise mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-[#c7c7cc]"
      >
        <span className="size-2 rounded-full bg-[#FF7A6B]" aria-hidden />
        {content.proof}
      </p>
    </div>
  );
}
