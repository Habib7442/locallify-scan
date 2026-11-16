import { DEMO_WHATSAPP_URL } from "@/lib/site";
import { HeroBackground } from "@/components/landing/hero/HeroBackground";
import { HeroCopy } from "@/components/landing/hero/HeroCopy";
import { HeroScene } from "@/components/landing/hero/HeroScene";
import type { HeroContent } from "@/components/landing/hero/types";

// ------------------------------------------------------------------
// All hero text lives here — edit freely. (The demo WhatsApp number is
// CONTACT_WHATSAPP in lib/site.ts.)
// ------------------------------------------------------------------
export const HERO_CONTENT: HeroContent = {
  eyebrow: "For cafes & restaurants · Silchar",
  headline: {
    line1: "Customer aaya?",
    line2Before: "Ab ",
    accent: "dobara",
    line2After: " aayega.",
  },
  sub: "Dobara turns first-time diners into regulars — with a QR on every table, WhatsApp, and rewards that only work on the next visit. Your billing system stays exactly as it is.",
  primaryCta: { label: "Book a free demo on WhatsApp", href: DEMO_WHATSAPP_URL },
  secondaryCta: { label: "See how it works", href: "#how-it-works" },
  trust: ["No app for customers", "Works with your billing", "We set it up in person"],
  proof: "Free pilot for our first 3 cafes",
  scene: {
    ariaLabel:
      "Animation: a cafe table where customers scan, unlock a free dessert, staff recognise a regular, and a customer wins a next-visit prize.",
    steps: ["Scan", "Squad", "Pehchaan", "Inaam"],
    cafeName: "Brew House",
    tableName: "Table 4",
    tableCode: "T4",
    seats: ["P", "R", "A", "S"],
    dessertCard: "🍰 Free dessert unlocked!",
    phone: {
      welcome: "Welcome! 👋",
      unlock: "Unlock your reward on WhatsApp",
      verified: "Verified ✓",
      squadTitle: "Table Squad",
      squadDone: "Squad complete 🎉",
      prizeIntro: "Thanks for visiting!",
      prizeTitle: "☕ Free Cold Coffee",
      prizeDetail: "Next visit · valid 14 days",
      prizeSaved: "Saved on your WhatsApp ✓",
      scratchHint: "Scratch",
      footer: "Dobara · by Locallify",
    },
    tablet: {
      label: "Counter screen",
      live: "Live",
      openTables: "Open tables: T2 · T4 · T7",
      idle: "Waiting for scans…",
      alertTitle: "🔔 Table 4 — Arjun",
      alertLine: "6th visit · kam teekha · Birthday 22 Nov 🎂",
    },
  },
};

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden">
      <HeroBackground />
      <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-12 px-4 pb-20 pt-28 sm:px-8 sm:pt-40 lg:grid-cols-[45fr_55fr] lg:gap-12 lg:pb-24 lg:pt-[150px]">
        <HeroCopy content={HERO_CONTENT} />
        <HeroScene content={HERO_CONTENT.scene} />
      </div>
    </section>
  );
}
