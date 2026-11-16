const STEPS = [
  {
    step: "01",
    title: "Scan the table QR",
    desc: "The diner points their camera at the card on the table. Your branded page opens — no app, no password.",
  },
  {
    step: "02",
    title: "Verify on WhatsApp",
    desc: "One tap opens WhatsApp with a message ready to send. That proves the number is real — and it's theirs.",
  },
  {
    step: "03",
    title: "Win a next-visit prize",
    desc: "When staff close the bill, the diner scratches a card. The prize waits for them, saved on WhatsApp.",
  },
  {
    step: "04",
    title: "Come back, get greeted",
    desc: "Next time they scan, the counter dings with their name. Staff say hello and redeem the prize.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-white/10 bg-[#1a1a1c] px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white text-balance">
            How a visit <span className="font-semibold italic text-[#54e0ff]">works</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg font-light text-[#8a8a93] text-balance">
            From the diner&apos;s side, it takes under a minute. Your billing stays exactly as it is —
            staff only type the bill amount to close the visit.
          </p>
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <li key={item.step} className="hero-card flex flex-col rounded-[20px] p-7">
              <span className="text-4xl font-black gradient-text-accent">{item.step}</span>
              <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#8a8a93]">{item.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
