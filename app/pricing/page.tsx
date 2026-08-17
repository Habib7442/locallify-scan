import Link from "next/link";
import { Check } from "lucide-react";
import { SignUpButton, Show } from "@clerk/nextjs";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pricing — Locallify Scan",
  description: "Simple, transparent pricing for your permanent QR hub.",
  path: "/pricing",
  keywords: ["Locallify Scan pricing", "QR code subscription", "link in bio pricing"],
});

type Tier = {
  name: string;
  price: number;
  recommended?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: 299,
    features: [
      "Unlimited links, all link types",
      "Branding, background & theme customization",
      "Free QR download (PNG + SVG)",
    ],
  },
  {
    name: "Pro",
    price: 599,
    recommended: true,
    features: [
      "Everything in Starter",
      "Full scan & tap analytics",
      "Remove \"Powered by Locallify\" branding",
    ],
  },
  {
    name: "Business",
    price: 999,
    features: [
      "Everything in Pro",
      "Vertical signature features",
      "Hours-aware button, appointment form, gallery, offer banner, room enquiry",
    ],
  },
];

function TierCTA() {
  return (
    <>
      <Show when="signed-out">
        <SignUpButton forceRedirectUrl="/onboarding">
          <button className="w-full rounded-[12px] px-6 py-3 text-[15px] font-medium bg-white text-[#18181a] hover:bg-gray-100 transition-all cursor-pointer">
            Start free trial
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link
          href="/onboarding"
          className="block w-full text-center rounded-[12px] px-6 py-3 text-[15px] font-medium bg-white text-[#18181a] hover:bg-gray-100 transition-all"
        >
          Go to your hub
        </Link>
      </Show>
      <p className="mt-3 text-center text-[12px] text-[#7a7a83]">No credit card required</p>
    </>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main className="pt-40 sm:pt-52 pb-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white mb-4 text-balance">
              Simple,{" "}
              <span className="font-semibold italic gradient-text-accent">transparent</span>{" "}
              pricing
            </h1>
            <p className="text-[#7a7a83] font-light text-base sm:text-lg max-w-xl mx-auto">
              Every plan starts with a 7-day free trial. No credit card required to try it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 flex flex-col ${
                  tier.recommended
                    ? "border-2 border-[#54e0ff] bg-[#54e0ff]/[0.04] shadow-[0px_0px_40px_rgba(84,224,255,0.15)] sm:-translate-y-2"
                    : "border border-[#33373b] bg-white/[0.02]"
                }`}
              >
                {tier.recommended && (
                  <span className="self-start mb-4 inline-flex items-center rounded-full bg-[#54e0ff]/10 border border-[#54e0ff]/30 text-[#54e0ff] text-[11px] font-semibold px-3 py-1">
                    Recommended
                  </span>
                )}
                <h2 className="text-xl font-semibold text-white mb-1">{tier.name}</h2>
                <p className="mb-6">
                  <span className="text-3xl font-semibold text-white">₹{tier.price}</span>
                  <span className="text-[#7a7a83] text-sm">/mo</span>
                </p>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[14px] text-[#a1a1aa]">
                      <Check className="size-4 text-[#54e0ff] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <TierCTA />
              </div>
            ))}
          </div>

          <p className="text-center text-[#7a7a83] text-sm mt-12">
            Ordering a physical printed QR is a separate one-time purchase, available on every
            plan.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
