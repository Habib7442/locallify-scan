import { HandHeart, MessageCircleOff, QrCode, ReceiptText, ShieldCheck, Smartphone } from "lucide-react";

const REASONS = [
  {
    icon: ReceiptText,
    title: "Keeps your billing as it is",
    desc: "Use Petpooja, DotPe or a cash register — Dobara works alongside it. Nothing to replace, nothing to integrate.",
  },
  {
    icon: Smartphone,
    title: "No app for your customers",
    desc: "Diners only need their camera and WhatsApp. No download, no sign-up, no password.",
  },
  {
    icon: ShieldCheck,
    title: "The customer list is yours",
    desc: "Delivery apps keep the number. With Dobara, every verified diner belongs to your cafe — never shared with other cafes, never sold.",
  },
  {
    icon: HandHeart,
    title: "Set up in person",
    desc: "We print your table cards, set up the counter screen on a phone or tablet, and train your staff in about 20 minutes.",
  },
  {
    icon: QrCode,
    title: "Table codes that never expire",
    desc: "Your QR codes live on Locallify's own domain. Rename or switch off a table any time without reprinting.",
  },
  {
    icon: MessageCircleOff,
    title: "WhatsApp, without the spam",
    desc: "Diners opt in themselves, can reply STOP anytime, and get at most 4 offers a month — protecting your name.",
  },
];

export function WhyUs() {
  return (
    <section id="why-dobara" className="bg-[#18181a] px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white text-balance">
            Built for how Indian restaurants{" "}
            <span className="font-semibold italic text-[#54e0ff]">actually run</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-[20px] border border-white/10 bg-white/[0.02] p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[#54e0ff]/10 text-[#54e0ff]">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-[17px] font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#8a8a93]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
