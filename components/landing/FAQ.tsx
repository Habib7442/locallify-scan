"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faq } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHeading, focusRing } from "./primitives";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone="alt" labelledBy="faq-title">
      <Container>
        <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} subtitle={faq.subtitle} />
        <div className="mx-auto max-w-[800px] divide-y divide-white/10 border-y border-white/10">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `faq-q-${i}`;
            const panelId = `faq-a-${i}`;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className={`flex w-full items-center justify-between gap-4 rounded-md py-5 text-left text-[17px] tracking-[-0.03em] text-white md:text-[19px] ${focusRing}`}
                  >
                    {item.q}
                    <ChevronDown
                      aria-hidden
                      className={cn("size-5 shrink-0 text-[#9a9aa3] transition-transform duration-200", isOpen && "rotate-180 text-[#54e0ff]")}
                    />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen}>
                  <p className="max-w-[65ch] pb-6 text-[15px] leading-[1.6] font-light text-[#9a9aa3] md:text-base">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
