import {
  CampaignMockup,
  LiveBoardMockup,
  ScratchCardMockup,
  SquadMockup,
} from "@/components/landing/mockups";

const FEATURES = [
  {
    tag: "Table Squad",
    title: "Everyone at the table scans",
    desc: "When the whole table verifies on WhatsApp, the table unlocks a reward you choose — free dessert, 10% off. Friends nudge each other to scan, so you capture every number, not just one.",
    mockup: <SquadMockup />,
  },
  {
    tag: "Next-Visit Prize",
    title: "A prize they can only use next time",
    desc: "After the bill, each diner scratches a card. The prize is saved to their WhatsApp and works only on their next visit, within 14 days — with a reminder on day 10.",
    mockup: <ScratchCardMockup />,
  },
  {
    tag: "Pehchaan",
    title: "Staff greet regulars by name",
    desc: "A phone or tablet at the counter dings when a known customer scans: their name, visit count, preferences and any prize waiting. New staff treat them like old friends.",
    mockup: <LiveBoardMockup className="w-full max-w-[300px]" />,
  },
  {
    tag: "Fill My Tables",
    title: "Empty tables? One tap.",
    desc: "On a slow afternoon, send a time-limited offer to your regulars on WhatsApp. You see exactly how many people it reaches and what it costs before you send.",
    mockup: <CampaignMockup />,
  },
];

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden bg-[#18181a] px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white text-balance">
            Four simple ways to bring them{" "}
            <span className="font-semibold italic text-[#54e0ff]">back</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg font-light text-[#8a8a93] text-balance">
            No points to explain. No app to download. Just a QR on the table and WhatsApp.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <article
              key={feature.tag}
              className="hero-card flex flex-col overflow-hidden rounded-[24px] p-6 sm:p-8"
            >
              <span className="self-start rounded-full border border-[#54e0ff]/30 bg-[#54e0ff]/10 px-3 py-1 text-[12px] font-semibold text-[#54e0ff]">
                {feature.tag}
              </span>
              <h3 className="mt-4 text-[22px] sm:text-[26px] font-semibold tracking-[-0.02em] text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#8a8a93]">{feature.desc}</p>
              <div className="mt-8 flex flex-1 items-end justify-center rounded-[20px] bg-[#141416] p-6 sm:p-8">
                {feature.mockup}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
