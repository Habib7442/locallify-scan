import { Clock, PhoneOff, UserX, Users } from "lucide-react";

const PROBLEMS = [
  {
    icon: UserX,
    title: "They visit once, then disappear",
    desc: "Most diners never come back — and you have no way to reach them again.",
  },
  {
    icon: PhoneOff,
    title: "You don't own their number",
    desc: "Delivery apps keep the customer. Walk-ins leave no trace at all.",
  },
  {
    icon: Users,
    title: "Regulars go unrecognised",
    desc: "Staff change often, so your most loyal customers get treated like strangers.",
  },
  {
    icon: Clock,
    title: "Slow afternoons, empty tables",
    desc: "Weekday lunches and rainy days hurt — with no quick way to bring people in.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="border-y border-white/10 bg-[#1a1a1c] px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.03em] text-white text-balance">
            Most diners visit once.{" "}
            <span className="font-semibold italic text-[#54e0ff]">Then they&apos;re gone.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg font-light text-[#8a8a93] text-balance">
            Points apps and ₹30,000-a-year CRMs are built for chains. A neighbourhood cafe needs
            something staff can use on day one.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROBLEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-[20px] border border-white/10 bg-white/[0.02] p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-white">{title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-[#8a8a93]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
