import Image from "next/image";
import { MessageCircle, Star, QrCode, Radio, Camera, MapPin } from "lucide-react";

export function HeroCollage() {
  return (
    <div
      className="relative w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto h-[360px] sm:h-[420px] lg:h-[460px]"
      aria-hidden
    >
      {/* Main profile card — the anchor */}
      <div
        className="hero-card absolute w-[210px] sm:w-[240px] rounded-[22px] p-5 rotate-[-6deg] shadow-[0px_24px_60px_rgba(0,0,0,0.5)] z-20"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-6deg)" }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="relative size-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Image src="/logo-icon.png" alt="" width={20} height={20} className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">Grand Cafe & Bakery</p>
            <p className="text-[#7a7a83] text-xs truncate">Fresh coffee & pastries</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-full py-2.5 px-3 rounded-[10px] bg-[#25d366] text-[11px] font-bold text-slate-950 flex items-center gap-1.5">
            <MessageCircle className="size-3.5" /> Order on WhatsApp
          </div>
          <div className="w-full py-2.5 px-3 rounded-[10px] bg-white/10 border border-white/10 text-[11px] font-medium text-white flex items-center gap-1.5">
            <Star className="size-3.5 text-amber-400 fill-amber-400" /> Google Reviews
          </div>
        </div>
      </div>

      {/* QR card — overlaps the profile card's top-right corner */}
      <div
        className="hero-card absolute w-[100px] sm:w-[116px] rounded-2xl p-3 rotate-[9deg] shadow-[0px_16px_40px_rgba(0,0,0,0.45)] z-30 flex flex-col items-center gap-1.5"
        style={{ top: "4%", left: "66%" }}
      >
        <QrCode className="size-10 sm:size-11 text-[#54e0ff]" strokeWidth={1.4} />
        <span className="text-[10px] font-semibold text-white tracking-wide">Scan me</span>
      </div>

      {/* Activity card — overlaps the profile card's bottom-left corner */}
      <div
        className="hero-card absolute w-[142px] rounded-2xl p-3.5 rotate-[-5deg] shadow-[0px_16px_40px_rgba(0,0,0,0.45)] z-30"
        style={{ bottom: "6%", left: "2%" }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full size-1.5 bg-emerald-400" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">Live</span>
        </div>
        <p className="text-white text-lg font-bold leading-none mb-0.5">247</p>
        <p className="text-[#7a7a83] text-[11px]">scans this week</p>
      </div>

      {/* Floating icon bubbles, tucked against the cluster */}
      <div
        className="glassmorphic absolute size-11 rounded-full flex items-center justify-center rotate-[-8deg] z-10"
        style={{ top: "10%", left: "6%" }}
      >
        <Camera className="size-5 text-white" strokeWidth={1.75} />
      </div>
      <div
        className="glassmorphic absolute size-11 rounded-full flex items-center justify-center rotate-[6deg] z-30"
        style={{ bottom: "2%", right: "4%" }}
      >
        <MapPin className="size-5 text-white" strokeWidth={1.75} />
      </div>
      <div
        className="glassmorphic absolute hidden sm:flex size-9 rounded-full items-center justify-center rotate-[4deg] z-10"
        style={{ top: "34%", right: "-2%" }}
      >
        <Radio className="size-4 text-[#54e0ff]" strokeWidth={1.75} />
      </div>
    </div>
  );
}
