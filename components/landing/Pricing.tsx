import { Check } from "lucide-react";
import { pricing } from "@/content/landing";
import { PILOT_WHATSAPP_URL, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading, btn } from "./primitives";

type Plan = (typeof pricing.plans)[number];

function PlanCard({ plan }: { plan: Plan }) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl p-7 md:p-9",
        plan.recommended ? "rounded-[15px] bg-[#1e1e20]" : "border border-white/10 bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[24px] tracking-[-0.04em] text-white">{plan.name}</h3>
        {plan.recommended ? (
          <span className="rounded-full bg-brand-gradient px-3 py-1 text-[13px] font-medium text-[#18181a]">
            {pricing.recommended}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[15px] font-light text-[#9a9aa3] md:text-base">{plan.blurb}</p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-[44px] leading-none font-light tracking-[-0.06em] text-white md:text-[52px]">{plan.price}</span>
        <span className="text-[15px] font-light text-[#9a9aa3]">{pricing.perMonth}</span>
      </p>
      <ul className="mt-7 flex flex-1 flex-col gap-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-[15px] font-light text-white/90">
            <Check className="mt-0.5 size-4 shrink-0 text-green-400" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <a
        href={whatsappLink(plan.message)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("mt-8 w-full", btn.sizeMd, plan.recommended ? btn.highlight : btn.secondary)}
      >
        {plan.cta}
      </a>
    </div>
  );

  return plan.recommended ? <li className="gradient-border rounded-2xl">{body}</li> : <li>{body}</li>;
}

export function Pricing() {
  return (
    <Section id="pricing" labelledBy="pricing-title">
      <Container>
        <SectionHeading id="pricing-title" eyebrow={pricing.eyebrow} title={pricing.title} subtitle={pricing.subtitle} />

        <div className="glassmorphic mx-auto mb-8 flex max-w-[880px] flex-col items-start gap-4 rounded-2xl !border-[#54e0ff]/30 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <p className="text-[15px] leading-[1.5] text-white md:text-base">{pricing.pilot.text}</p>
          <a
            href={PILOT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn.primary} h-11 shrink-0 px-5 text-[15px] shadow-none`}
          >
            {pricing.pilot.cta}
          </a>
        </div>

        <ul className="mx-auto grid max-w-[880px] gap-5 md:grid-cols-2">
          {pricing.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-[880px] text-center text-[13px] font-light text-[#8b8b94]">{pricing.footnote}</p>
      </Container>
    </Section>
  );
}
