import { howItWorks } from "@/content/landing";
import { Container, Section, SectionHeading } from "./primitives";

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="alt" labelledBy="how-title">
      <Container>
        <SectionHeading id="how-title" eyebrow={howItWorks.eyebrow} title={howItWorks.title} subtitle={howItWorks.subtitle} />
        <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Thin connecting line behind the number badges (desktop only). */}
          <span aria-hidden className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px bg-[#33373b] lg:block" />
          {howItWorks.steps.map((step) => (
            <li key={step.n} className="relative flex flex-col items-center text-center">
              <span className="relative flex size-14 items-center justify-center rounded-full border border-[#33373b] bg-[#1e1e20] text-[17px] font-light tracking-[-0.04em] text-[#54e0ff]">
                {step.n}
              </span>
              <h3 className="mt-5 text-[19px] leading-[1.25] tracking-[-0.03em] text-white">{step.title}</h3>
              <p className="mt-2 max-w-[30ch] text-[15px] leading-[1.5] font-light text-[#9a9aa3] md:text-base">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
