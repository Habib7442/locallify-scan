import { Check, MessageCircle, Sparkles } from "lucide-react";
import { DEMO_WHATSAPP_URL, PILOT_WHATSAPP_URL } from "@/lib/site";

type Plan = {
  name: string;
  price: string;
  blurb: string;
  recommended?: boolean;
  features: string[];
};

// PRD.md §16 (proposed pricing).
const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "₹1,499",
    blurb: "Everything you need to start bringing diners back.",
    features: [
      "1 outlet, up to 10 tables",
      "Table Squad",
      "Next-Visit Prize scratch cards",
      "Pehchaan counter screen for staff",
      "500 WhatsApp messages / month",
    ],
  },
  {
    name: "Growth",
    price: "₹2,499",
    blurb: "For cafes ready to fill slow hours on demand.",
    recommended: true,
    features: [
      "Everything in Starter",
      "Fill My Tables offers",
      "Birthday offers",
      "1,500 WhatsApp messages / month",
      "Export your customer list",
    ],
  },
];

const ADD_ONS = [
  "Extra WhatsApp messages ~₹1.2 each, billed monthly",
  "One-time setup ₹2,000–5,000: table card printing, staff training, tablet setup help",
  "Pay yearly and get 2 months free",
];

export function Pricing({ asPage = false }: { asPage?: boolean }) {
  const Heading = asPage ? "h1" : "h2";

  return (
    <section
      id="pricing"
      className={`relative overflow-hidden bg-[#18181a] px-4 ${asPage ? "pt-36 sm:pt-48 pb-20" : "border-t border-white/10 py-20 sm:py-28"}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[900px] -translate-x-1/2 bg-gradient-to-b from-[#54E0FF]/5 via-transparent to-transparent blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <Heading className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white text-balance">
            Simple, <span className="font-semibold italic text-[#54E0FF]">monthly</span> pricing
          </Heading>
          <p className="mt-4 text-base sm:text-lg font-light text-[#8a8a93] text-balance">
            One flat plan per outlet. WhatsApp messages included — and you always see the cost before
            any offer goes out.
          </p>
        </div>

        {/* Pilot banner */}
        <div className="mt-12 flex flex-col items-start gap-5 rounded-[24px] border border-[#54e0ff]/30 bg-gradient-to-r from-[#54e0ff]/[0.10] to-[#29adff]/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex gap-4">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#54e0ff] text-[#18181a]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[18px] sm:text-[20px] font-semibold text-white">
                Free pilot for our first 3 cafes in Silchar
              </p>
              <p className="mt-1 text-[14px] text-[#a1a1aa]">
                We set everything up and train your staff. You pay nothing during the pilot — just tell us
                honestly what works.
              </p>
            </div>
          </div>
          <a
            href={PILOT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-[12px] bg-white px-5 py-3 text-[15px] font-medium text-[#18181a] transition-colors hover:bg-gray-100"
          >
            <MessageCircle className="size-4" />
            Join the pilot
          </a>
        </div>

        {/* Plans */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[24px] p-6 sm:p-8 ${
                plan.recommended
                  ? "border-2 border-[#54e0ff] bg-[#1e1e20] shadow-[0_0_35px_rgba(84,224,255,0.15)]"
                  : "border border-[#33373b] bg-[#1e1e20]/80"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#54e0ff] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#18181a]">
                  Recommended
                </span>
              )}
              <h3 className="text-xl font-medium text-white">{plan.name}</h3>
              <p className="mt-1 text-[14px] text-[#8a8a93]">{plan.blurb}</p>
              <p className="mb-6 mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                <span className="text-sm text-[#7a7a83]">/ month</span>
              </p>
              <ul className="mb-8 flex-1 space-y-3.5 text-[14px] text-[#c7c7cc]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#54e0ff]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={DEMO_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full rounded-[12px] px-4 py-3 text-center text-[15px] font-medium transition-colors ${
                  plan.recommended
                    ? "bg-white text-[#18181a] hover:bg-gray-100"
                    : "border border-[#33373b] text-white hover:bg-white/5"
                }`}
              >
                Book a free demo
              </a>
            </div>
          ))}
        </div>

        <ul className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 text-center text-[13px] text-[#7a7a83]">
          {ADD_ONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
