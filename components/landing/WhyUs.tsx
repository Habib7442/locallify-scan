import { ShieldCheck, Check } from "lucide-react";

export function WhyUs() {
  return (
    <section id="why-us" className="py-20 px-4 bg-[#1a1a1c] border-y border-white/10">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 text-balance">
          This actually happened to a client
        </h2>

        <p className="text-base sm:text-xl text-[#7a7a83] leading-relaxed max-w-3xl mx-auto mb-10 text-balance">
          They printed a QR code from a third-party tool. When the free trial
          behind it quietly ended, the vendor demanded{" "}
          <span className="font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
            ₹2,000
          </span>{" "}
          to keep an already-printed code working.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-red-500/[0.04] border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
              <span className="size-2 rounded-full bg-red-500" />
              Third-Party Vendors
            </div>
            <ul className="space-y-2 text-xs text-[#c7c7cc]">
              <li className="flex items-start gap-2">
                <span className="text-red-500">✕</span> Code points to vendor subdomains
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✕</span> Code deactivates if billing lapses
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✕</span> Forced reprinting costs & customer loss
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-[#54e0ff]/[0.04] border border-[#54e0ff]/20">
            <div className="flex items-center gap-2 text-[#54e0ff] font-bold text-sm mb-2">
              <ShieldCheck className="size-4" />
              Locallify Agency Model
            </div>
            <ul className="space-y-2 text-xs text-[#c7c7cc]">
              <li className="flex items-start gap-2">
                <Check className="size-4 text-[#54e0ff] shrink-0" /> Redirect lives on Locallify&apos;s own domain
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-4 text-[#54e0ff] shrink-0" /> Destination stays editable anytime
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-4 text-[#54e0ff] shrink-0" /> Printed code works forever with zero lock-in
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
