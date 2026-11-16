import { Bell, Check, Send, Sparkles } from "lucide-react";
import { features } from "@/content/landing";
import { Container, Section, SectionHeading, cardClass } from "./primitives";

type Item = (typeof features.items)[number];

function SquadVisual({ v }: { v: { count: string; reward: string; initials: readonly string[] } }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3" aria-hidden>
        {v.initials.map((initial) => (
          <span
            key={initial}
            className="relative flex size-14 items-center justify-center rounded-full bg-brand-gradient text-[20px] font-semibold text-[#18181a] md:size-16 md:text-[22px]"
          >
            {initial}
            <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-[#54e0ff] ring-2 ring-[#1e1e20]">
              <Check className="size-3 text-[#18181a]" strokeWidth={3} />
            </span>
          </span>
        ))}
      </div>
      <span className="rounded-full bg-brand-gradient px-4 py-1.5 text-[15px] font-medium text-[#18181a] md:text-[16px]">
        {v.count} · {v.reward}
      </span>
    </div>
  );
}

function PrizeVisual({ v }: { v: { prize: string; hint: string } }) {
  return (
    <div className="gradient-border w-full max-w-[360px] rounded-2xl">
      <div className="flex items-center gap-4 rounded-[15px] bg-[#1e1e20] px-5 py-5 md:px-6 md:py-6">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/5">
          <Sparkles className="size-6 text-[#54e0ff]" aria-hidden />
        </span>
        <div>
          <p className="text-[19px] tracking-[-0.03em] text-white md:text-[22px]">{v.prize}</p>
          <p className="mt-0.5 text-[15px] font-light text-[#9a9aa3]">{v.hint}</p>
        </div>
      </div>
    </div>
  );
}

function PehchaanVisual({ v }: { v: { title: string; meta: string } }) {
  return (
    <div className="flex w-full max-w-[360px] items-center gap-4 rounded-2xl border border-[#54e0ff]/30 bg-[#28282b] px-5 py-5 shadow-[0_10px_40px_rgba(84,224,255,0.1)] md:px-6 md:py-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/5">
        <Bell className="size-6 text-[#54e0ff]" aria-hidden />
      </span>
      <div>
        <p className="text-[19px] tracking-[-0.03em] text-white md:text-[22px]">{v.title}</p>
        <p className="mt-0.5 text-[15px] font-light text-[#9a9aa3]">{v.meta}</p>
      </div>
    </div>
  );
}

function FillVisual({ v }: { v: { title: string; people: string; cost: string; button: string } }) {
  return (
    <div className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-[#28282b] px-5 py-5 md:px-6 md:py-6">
      <p className="text-[19px] tracking-[-0.03em] text-white md:text-[22px]">{v.title}</p>
      <p className="mt-1 text-[15px] font-light text-[#9a9aa3]">
        {v.people} · <span className="font-normal text-white">{v.cost}</span>
      </p>
      <span className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white text-[15px] font-medium text-[#18181a]">
        <Send className="size-4" aria-hidden />
        {v.button}
      </span>
    </div>
  );
}

function Visual({ item }: { item: Item }) {
  switch (item.key) {
    case "squad":
      return <SquadVisual v={item.visual} />;
    case "prize":
      return <PrizeVisual v={item.visual} />;
    case "pehchaan":
      return <PehchaanVisual v={item.visual} />;
    case "fill":
      return <FillVisual v={item.visual} />;
  }
}

export function Features() {
  return (
    <Section id="features" labelledBy="features-title">
      <Container>
        <SectionHeading id="features-title" eyebrow={features.eyebrow} title={features.title} subtitle={features.subtitle} />
        <ul className="grid gap-5 lg:grid-cols-2">
          {features.items.map((item) => (
            <li key={item.key} className={`${cardClass} flex flex-col p-6 md:p-7`}>
              <span className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[13px] font-medium text-[#54e0ff]">
                {item.label}
              </span>
              <h3 className="mt-4 text-[22px] leading-[1.2] tracking-[-0.04em] text-white md:text-[26px]">
                {item.title}
              </h3>
              <p className="mt-2 max-w-[48ch] text-[15px] leading-[1.5] font-light text-[#9a9aa3]">
                {item.body}
              </p>
              <div className="mt-6 flex min-h-[150px] flex-1 items-center justify-center rounded-xl bg-white/[0.015] p-4 md:min-h-[170px]" aria-hidden>
                <Visual item={item} />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
