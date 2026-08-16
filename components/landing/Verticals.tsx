import { Coffee, Stethoscope, ShoppingBag, Scissors, Hotel } from "lucide-react";

export function Verticals() {
  const verticals = [
    { name: "Restaurant & Cafe", feature: "Hours-aware order button", icon: Coffee },
    { name: "Clinic & Doctor", feature: "WhatsApp appointment form", icon: Stethoscope },
    { name: "Retail & Shop", feature: "Today's offer banner", icon: ShoppingBag },
    { name: "Salon & Spa", feature: "Before/after photo gallery", icon: Scissors },
    { name: "Hotel & Stay", feature: "Pre-filled room enquiry", icon: Hotel },
  ];

  return (
    <section id="verticals" className="py-24 px-4 bg-[#1a1a1c] border-t border-white/10">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance">
          Built for your type of business
        </h2>
        <p className="text-[#7a7a83] max-w-2xl mx-auto mb-16 text-sm sm:text-base">
          Start with the right links already set up — change anything after.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {verticals.map((v) => (
            <div
              key={v.name}
              className="hero-card p-5 rounded-2xl text-left flex flex-col justify-between"
            >
              <v.icon className="size-6 text-[#54e0ff] mb-3" strokeWidth={1.75} />
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{v.name}</h4>
                <p className="text-xs text-[#7a7a83] font-medium">{v.feature}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
