import Image from "next/image";
import Link from "next/link";
import { SignUpButton, Show } from "@clerk/nextjs";
import { Check } from "lucide-react";

export function Footer() {
  return (
    <>
      {/* FINAL CTA */}
      <section className="py-24 px-4 bg-[#18181a] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] -z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(84,224,255,0.12), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="relative h-9 w-9 shrink-0">
              <Image src="/logo-icon.png" alt="" fill sizes="36px" className="object-contain" />
            </div>
            <span className="text-white text-lg font-medium tracking-[-0.3px]">
              Locallify Scan
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] mb-6 text-balance">
            Ready to build your{" "}
            <span className="font-semibold italic gradient-text-accent">permanent QR code</span>?
          </h2>
          <p className="text-[#7a7a83] font-light max-w-xl mx-auto text-base sm:text-lg mb-10">
            Start your 7-day free trial and build your hub. Order a physical print only when
            you&apos;re ready.
          </p>

          <Show when="signed-out">
            <SignUpButton forceRedirectUrl="/onboarding">
              <button className="inline-flex items-center gap-2 rounded-[15px] px-8 py-4 text-base font-medium tracking-[-0.02em] text-[#18181a] bg-white hover:bg-gray-100 shadow-[0px_12px_32px_rgba(0,0,0,0.40)] transition-all hover:-translate-y-0.5 cursor-pointer">
                Start Your Free Trial
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[15px] px-8 py-4 text-base font-medium tracking-[-0.02em] text-[#18181a] bg-white hover:bg-gray-100 shadow-[0px_12px_32px_rgba(0,0,0,0.40)] transition-all hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          </Show>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#7a7a83]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-[#54e0ff]" />
              7-day free trial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-[#54e0ff]" />
              No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-4 text-[#54e0ff]" />
              Printed QR optional
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 bg-[#1a1a1c] text-[#7a7a83] text-xs border-t border-white/10">
        <div className="mx-auto max-w-7xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-6 w-6 shrink-0">
                <Image src="/logo-icon.png" alt="" fill sizes="24px" className="object-contain" />
              </div>
              <span className="text-white font-medium tracking-[-0.2px]">Locallify Scan</span>
              <span className="text-[#54545a]">© {new Date().getFullYear()}</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/privacy-policy" className="text-[#7a7a83] hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#7a7a83] hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link href="/shipping-policy" className="text-[#7a7a83] hover:text-white transition-colors">
                Shipping Policy
              </Link>
              <Link href="/refund-policy" className="text-[#7a7a83] hover:text-white transition-colors">
                Cancellation &amp; Refunds
              </Link>
              <Link href="/contact-us" className="text-[#7a7a83] hover:text-white transition-colors">
                Contact Us
              </Link>
            </nav>

            <p className="text-[#54545a]">Powered by Locallify</p>
          </div>
        </div>
      </footer>
    </>
  );
}
