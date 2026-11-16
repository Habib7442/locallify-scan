"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { heroPreview as copy } from "@/content/landing";
import { cn } from "@/lib/utils";
import { focusRing } from "./primitives";

const INTERVAL_MS = 3500;

/** Shared app layout: top bar, centred content, full-width bottom button. */
function AppShell({ button, children }: { button: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col px-4 pt-11 pb-5 lg:px-5 lg:pt-12 lg:pb-6">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
        <span className="gradient-border shrink-0 rounded-full">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#1e1e20] text-[13px] font-semibold text-white">
            {copy.shell.logo}
          </span>
        </span>
        <p className="text-[14px] font-medium tracking-[-0.02em] text-white">{copy.shell.place}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 py-4">{children}</div>
      <span className="flex h-12 shrink-0 items-center justify-center rounded-[12px] bg-white text-[15px] font-medium text-[#18181a]">
        {button}
      </span>
    </div>
  );
}

const innerCard = "rounded-2xl border border-white/10 bg-white/[0.04]";

function WelcomeScreen() {
  const w = copy.welcome;
  return (
    <AppShell button={w.button}>
      <div>
        <p className="text-[22px] leading-tight tracking-[-0.04em] text-white lg:text-[24px]">{w.title}</p>
        <p className="mt-1 text-[14px] font-light text-[#9a9aa3]">{w.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {w.stats.map((stat) => (
          <div key={stat.label} className={`${innerCard} px-3.5 py-3`}>
            <p className="text-[22px] leading-none font-light tracking-[-0.05em] text-white">{stat.value}</p>
            <p className="mt-1 text-[13px] font-light text-[#9a9aa3]">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className={`${innerCard} p-4`}>
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-white">{w.squadTitle}</p>
          <p className="gradient-text-accent text-[15px] font-semibold">{w.squadCount}</p>
        </div>
        <div className="mt-3 flex gap-2.5" aria-hidden>
          {w.squadInitials.map((initial) => (
            <span
              key={initial}
              className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-[15px] font-semibold text-[#18181a] lg:size-11"
            >
              {initial}
            </span>
          ))}
          <span className="size-10 rounded-full border border-dashed border-[#7a7a83] lg:size-11" />
        </div>
        <p className="mt-3 text-[13px] leading-snug font-light text-[#9a9aa3]">{w.squadHint}</p>
      </div>
    </AppShell>
  );
}

function PrizeScreen() {
  const p = copy.prize;
  return (
    <AppShell button={p.button}>
      <p className="text-center text-[14px] font-medium text-[#9a9aa3]">{p.header}</p>
      <div className="gradient-border rounded-2xl">
        <div className="relative overflow-hidden rounded-[15px] bg-[#1e1e20] px-4 py-8 text-center">
          {/* Scratched-foil hint along the top edge. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-3 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.10)_0_6px,transparent_6px_12px)]"
          />
          <p className="text-[24px] leading-tight tracking-[-0.04em] text-white lg:text-[26px]">{p.prize}</p>
          <p className="mt-2 text-[15px] font-light text-[#54e0ff]">{p.validity}</p>
        </div>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-[14px] text-[#9a9aa3]">
        {p.saved}
        <Check className="size-4 text-green-400" aria-hidden />
      </p>
    </AppShell>
  );
}

function ThanksScreen() {
  const t = copy.thanks;
  return (
    <AppShell button={t.button}>
      <div className="text-center">
        <p className="text-[24px] leading-tight tracking-[-0.04em] text-white">{t.title}</p>
        <p className="mt-1 text-[14px] font-light text-[#9a9aa3]">{t.subtitle}</p>
      </div>
      <dl className={`${innerCard} divide-y divide-white/10 px-4`}>
        {t.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3">
            <dt className="text-[14px] font-light text-[#9a9aa3]">{row.label}</dt>
            <dd className="text-[15px] text-white">{row.value}</dd>
          </div>
        ))}
      </dl>
    </AppShell>
  );
}

const SCREENS = [WelcomeScreen, PrizeScreen, ThanksScreen];

export function HeroPreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % SCREENS.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion]);

  return (
    <figure
      aria-label={copy.label}
      className="flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative">
        {/* Soft cyan glow behind the phone. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-15%] top-[10%] bottom-[10%] rounded-full bg-[#54E0FF] opacity-[0.12] blur-[80px]"
        />

        <div className="animate-hero-float relative h-[610px] w-[286px] rounded-[42px] border border-white/12 bg-[#18181a] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)] lg:h-[640px] lg:w-[334px] lg:rounded-[48px]">
          <div className="relative h-full w-full overflow-hidden rounded-[34px] border border-white/5 bg-[#1e1e20] lg:rounded-[40px]">
            <div aria-hidden className="absolute top-2.5 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#18181a]" />
            {SCREENS.map((Screen, i) => (
              <div
                key={i}
                aria-hidden={i !== active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500 ease-out",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              >
                <Screen />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-1" role="group" aria-label="Choose screen">
        {copy.screenNames.map((name, i) => (
          <button
            key={name}
            type="button"
            onClick={() => setActive(i)}
            aria-label={name}
            aria-current={i === active}
            className={`flex size-6 items-center justify-center rounded-full ${focusRing}`}
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-5 bg-brand-gradient" : "w-1.5 bg-[#33373b]",
              )}
            />
          </button>
        ))}
      </div>
    </figure>
  );
}
