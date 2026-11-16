import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Do my customers need to download an app?",
    a: "No. They scan the QR on the table with their phone camera and tap one button to send a WhatsApp message. No app, no sign-up, no password.",
  },
  {
    q: "Does Dobara replace my billing software?",
    a: "No. Keep Petpooja, DotPe or whatever you use today. When a table pays, your staff simply type the bill amount on the counter screen to close the visit.",
  },
  {
    q: "What if a customer doesn't verify on WhatsApp?",
    a: "The page still works for them — they just won't unlock rewards until they verify. Verifying takes one tap and one message.",
  },
  {
    q: "Who owns the customer data?",
    a: "You do. Each cafe's customer list belongs to that cafe only. It is never shared with other cafes and never sold. Customers can ask for their data to be deleted at any time.",
  },
  {
    q: "How much do the WhatsApp messages cost me?",
    a: "Every plan includes a monthly message allowance. Before you send any offer, Dobara shows how many people it reaches and the approximate cost — nothing goes out by surprise.",
  },
  {
    q: "Can customers stop the messages?",
    a: "Yes. Opting in is their choice (the box is unticked by default), they can reply STOP at any time, and each customer gets at most 4 offers a month.",
  },
  {
    q: "Which languages does it support?",
    a: "English, Hindi and Bengali. You pick the default for your cafe, and customers can switch.",
  },
  {
    q: "How do we get started?",
    a: "Message us on WhatsApp. We visit your cafe, print the table cards, set up the counter screen on a phone or tablet, and train your staff in about 20 minutes.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-white/10 bg-[#1a1a1c] px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white text-balance">
          Questions owners <span className="font-semibold italic text-[#54e0ff]">ask us</span>
        </h2>

        <div className="mt-12 flex flex-col gap-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-[16px] border border-white/10 bg-white/[0.02] open:border-[#54e0ff]/30 open:bg-[#54e0ff]/[0.03]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[16px] px-5 py-4 text-[16px] font-medium text-white focus-visible:outline-2 focus-visible:outline-[#54e0ff] [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown
                  aria-hidden
                  className="size-5 shrink-0 text-[#7a7a83] motion-safe:transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-[#a1a1aa]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
