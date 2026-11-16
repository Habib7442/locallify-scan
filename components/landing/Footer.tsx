import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import { DobaraWordmark } from "@/components/brand/DobaraWordmark";
import { CONTACT_EMAIL, DEMO_WHATSAPP_URL } from "@/lib/site";

const CTA_POINTS = ["Free pilot for our first 3 cafes", "Set up in person", "Works with your billing"];

const LEGAL_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/refund-policy", label: "Cancellation & Refunds" },
  { href: "/contact-us", label: "Contact Us" },
];

export function Footer() {
  return (
    <>
      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#18181a] px-4 py-24 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[900px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(84,224,255,0.12), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-balance">
            Give every diner a reason to come{" "}
            <span className="font-semibold italic gradient-text-accent">dobara.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg font-light text-[#8a8a93]">
            Message us and we&apos;ll show you Dobara working on a real table, at your own cafe.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href={DEMO_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[15px] bg-white px-8 py-4 text-base font-medium tracking-[-0.02em] text-[#18181a] shadow-[0px_12px_32px_rgba(0,0,0,0.40)] transition-all hover:bg-gray-100 motion-safe:hover:-translate-y-0.5"
            >
              <MessageCircle className="size-5" />
              Book a free demo on WhatsApp
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-[#7a7a83] transition-colors hover:text-white">
              or email {CONTACT_EMAIL}
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#7a7a83]">
            {CTA_POINTS.map((point) => (
              <li key={point} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-[#54e0ff]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#1a1a1c] px-4 py-10 text-xs text-[#7a7a83]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex items-center gap-3">
            <DobaraWordmark size="sm" />
            <span className="text-[#54545a]">© {new Date().getFullYear()}</span>
          </div>

          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-[#7a7a83] transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-[#54545a]">Built on Locallify Scan</p>
        </div>
      </footer>
    </>
  );
}
