import Image from "next/image";
import {
  ShieldCheck,
  Smartphone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Star,
  QrCode,
  Sliders,
  GripVertical,
  Clock,
  Palette,
  Lock,
  CheckCircle2,
} from "lucide-react";

export function HeroCanvas() {
  return (
    <div
      id="live-preview"
      className="w-full max-w-5xl rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm p-4 sm:p-8 shadow-[0px_16px_40px_rgba(0,0,0,0.35)] relative"
    >
      {/* Top Canvas Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 text-xs font-medium text-[#7a7a83]">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#ef4444]" />
          <span className="size-3 rounded-full bg-[#f59e0b]" />
          <span className="size-3 rounded-full bg-[#10b981]" />
          <span className="ml-2 font-mono text-[11px] text-[#7a7a83] bg-white/5 px-3 py-1 rounded-full border border-white/10">
            locallify.link/grand-cafe (example)
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[#54e0ff] bg-[#54e0ff]/10 px-3 py-1 rounded-full border border-[#54e0ff]/20">
          <ShieldCheck className="size-3.5" />
          <span>Live Admin Preview &amp; Phone Mirror</span>
        </div>
      </div>

      {/* Grid of UI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
        {/* CARD 1: Phone / Hub Live Mobile Preview (Left column - 5 cols) */}
        <div className="md:col-span-5 hero-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7a7a83]">
              <Smartphone className="size-4 text-[#54e0ff]" />
              <span>Customer View</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open Now
            </span>
          </div>

          {/* Mobile Hub Mockup Content */}
          <div className="bg-[#0f0f11] rounded-xl p-5 text-white flex flex-col items-center text-center shadow-inner relative overflow-hidden border border-white/5">
            <div className="size-14 rounded-full bg-white/10 p-2 backdrop-blur-md mb-3 border border-white/20 flex items-center justify-center">
              <Image
                src="/logo_transparent.png"
                alt="Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <h3 className="font-bold text-base text-white mb-0.5">Grand Cafe & Bakery</h3>
            <p className="text-xs text-[#7a7a83] mb-4">Fresh Artisanal Coffee & Pastries</p>

            <div className="w-full flex flex-col gap-2.5 text-xs">
              <button className="w-full py-2.5 px-4 rounded-lg bg-[#25d366] text-slate-950 font-bold flex items-center justify-between hover:brightness-105 transition-all">
                <span className="flex items-center gap-2">
                  <MessageCircle className="size-4 fill-slate-950" />
                  Order on WhatsApp
                </span>
                <ExternalLink className="size-3 opacity-70" />
              </button>

              <button className="w-full py-2.5 px-4 rounded-lg bg-white/10 backdrop-blur-md text-white font-medium flex items-center justify-between border border-white/15 hover:bg-white/15 transition-all">
                <span className="flex items-center gap-2">
                  <Star className="size-3.5 text-amber-400 fill-amber-400" />
                  Google Reviews (4.9★)
                </span>
                <ChevronRight className="size-3 opacity-70" />
              </button>

              <button className="w-full py-2.5 px-4 rounded-lg bg-white/10 backdrop-blur-md text-white font-medium flex items-center justify-between border border-white/15 hover:bg-white/15 transition-all">
                <span className="flex items-center gap-2">
                  <QrCode className="size-3.5 text-[#54e0ff]" />
                  View Today&apos;s Digital Menu
                </span>
                <ChevronRight className="size-3 opacity-70" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#7a7a83] pt-1">
            <span>Hub example — your business name here</span>
            <span className="font-semibold text-[#54e0ff]">Non-blocking logs</span>
          </div>
        </div>

        {/* RIGHT SIDE CARDS (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          {/* CARD 2: Link & Action Manager */}
          <div className="hero-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7a7a83] flex items-center gap-2">
                <Sliders className="size-4 text-[#54e0ff]" />
                Link Manager & Reorder
              </span>
              <span className="text-xs font-medium text-[#54e0ff] bg-[#54e0ff]/10 px-2.5 py-0.5 rounded-full">
                Drag & Drop
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                <div className="flex items-center gap-3">
                  <GripVertical className="size-4 text-[#7a7a83] cursor-grab" />
                  <div>
                    <p className="font-semibold text-white">Order on WhatsApp</p>
                    <p className="text-[11px] text-[#7a7a83]">Pre-filled order inquiry</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                <div className="flex items-center gap-3">
                  <GripVertical className="size-4 text-[#7a7a83] cursor-grab" />
                  <div>
                    <p className="font-semibold text-white">Google Review Link</p>
                    <p className="text-[11px] text-[#7a7a83]">Direct 5-star review prompt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3 & CARD 4 SPLIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* CARD 3: Hours-Aware Action */}
            <div className="hero-card rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7a7a83] mb-3">
                <Clock className="size-4 text-[#54e0ff]" />
                <span>Hours-Aware Action</span>
              </div>

              <div className="bg-[#54e0ff]/[0.06] p-3 rounded-xl border border-[#54e0ff]/15 mb-3 text-xs">
                <p className="font-semibold text-white mb-1">Signature Feature</p>
                <p className="text-[#7a7a83] text-[11px]">
                  Flips to &quot;Message to pre-book for tomorrow&quot; when closed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-center">
                <div className="p-2 rounded-lg bg-white text-[#18181a] font-semibold">09:30 AM</div>
                <div className="p-2 rounded-lg bg-white/10 text-[#7a7a83]">10:30 AM</div>
              </div>
            </div>

            {/* CARD 4: Branding & Background Color Picker */}
            <div className="hero-card rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7a7a83] mb-3">
                <Palette className="size-4 text-[#54e0ff]" />
                <span>Appearance</span>
              </div>

              <div className="text-xs mb-2">
                <span className="text-[#7a7a83] block mb-1.5 text-[11px]">Background Color</span>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-[#18181a] ring-2 ring-[#54e0ff] cursor-pointer" />
                  <div className="size-6 rounded-full bg-indigo-900 cursor-pointer" />
                  <div className="size-6 rounded-full bg-amber-600 cursor-pointer" />
                  <div className="size-6 rounded-full bg-emerald-800 cursor-pointer" />
                  <span className="text-[11px] font-mono text-[#7a7a83] ml-1">#18181A</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#7a7a83]">
                <span>Solid or Image Scrim</span>
                <span className="font-semibold text-[#54e0ff]">Custom Accent</span>
              </div>
            </div>
          </div>

          {/* CARD 5: Agency Domain Trust Stamp */}
          <div className="hero-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-[#54e0ff] to-[#29adff] text-[#18181a] flex items-center justify-center shrink-0">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Locallify Domain Guarantee</p>
                <p className="text-[11px] text-[#7a7a83]">
                  Your code lives on our domain — printed once, active forever.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shrink-0">
              <CheckCircle2 className="size-3.5" />
              Never Expires
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
