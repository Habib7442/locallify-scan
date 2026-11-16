import { Handshake, Languages, Lock, Receipt, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { why } from "@/content/landing";
import { Container, Section, SectionHeading } from "./primitives";

const ICONS: Record<(typeof why.items)[number]["icon"], LucideIcon> = {
  smartphone: Smartphone,
  receipt: Receipt,
  lock: Lock,
  handshake: Handshake,
  languages: Languages,
  shield: ShieldCheck,
};

export function WhyDobara() {
  return (
    <Section tone="alt" labelledBy="why-title">
      <Container>
        <SectionHeading id="why-title" eyebrow={why.eyebrow} title={why.title} subtitle={why.subtitle} />
        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {why.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-white/10 bg-white/[0.03]">
                  <Icon className="size-5 text-[#54e0ff]" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[18px] leading-[1.25] tracking-[-0.03em] text-white">{item.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.5] font-light text-[#9a9aa3] md:text-base">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
