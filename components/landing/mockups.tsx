// Decorative, illustrative UI mockups for the Dobara landing page. Names and
// values come from the PRD examples — they are not real customers or results.
// Every mockup is aria-hidden; the surrounding copy carries the meaning.

import { Bell, Check, Gift, NotebookPen, ReceiptText, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Decorative QR pattern (not scannable)                              */
/* ------------------------------------------------------------------ */

const QR_SIZE = 21;

function isFinder(x: number, y: number) {
  const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  return inBox(0, 0) || inBox(QR_SIZE - 7, 0) || inBox(0, QR_SIZE - 7);
}

function finderOn(x: number, y: number) {
  const lx = x >= QR_SIZE - 7 ? x - (QR_SIZE - 7) : x;
  const ly = y >= QR_SIZE - 7 ? y - (QR_SIZE - 7) : y;
  const edge = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return edge || core;
}

// Deterministic pseudo-random modules so server and client render identically.
const QR_MODULES: Array<[number, number]> = (() => {
  const cells: Array<[number, number]> = [];
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (isFinder(x, y)) {
        if (finderOn(x, y)) cells.push([x, y]);
      } else if (((x * 7 + y * 13 + x * y * 3) % 5) < 2) {
        cells.push([x, y]);
      }
    }
  }
  return cells;
})();

export function FakeQr({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} className={className} aria-hidden shapeRendering="crispEdges">
      {QR_MODULES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function CafeAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ea580c] font-semibold text-white",
        className,
      )}
    >
      BH
    </span>
  );
}

function MockShell({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-[20px] border border-white/10 bg-[#1e1e20] shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table QR card (printed A6)                                          */
/* ------------------------------------------------------------------ */

export function TableCardMockup({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-[190px] rounded-[18px] bg-[#fbf7f0] p-4 text-[#1c1917] shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CafeAvatar className="size-7 text-[10px]" />
          <span className="text-[12px] font-semibold tracking-tight">Brew House</span>
        </div>
        <span className="rounded-md bg-[#1c1917] px-2 py-0.5 text-[11px] font-bold text-white">T4</span>
      </div>
      <div className="mt-3 rounded-xl bg-white p-2.5">
        <FakeQr className="w-full text-[#1c1917]" />
      </div>
      <p className="mt-3 text-center text-[12px] font-semibold leading-snug">
        Scan karo, aaj ka inaam dekho 🎁
      </p>
      <p className="mt-1.5 text-center text-[8.5px] tracking-wide text-[#78716c]">Dobara · by Locallify</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Customer scan page inside a phone                                   */
/* ------------------------------------------------------------------ */

export function PhoneScanMockup({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative w-[250px] rounded-[38px] border border-white/15 bg-[#0d0d0f] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <div className="absolute left-1/2 top-3.5 z-10 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-b from-[#2a1a10] via-[#1a1310] to-[#121212] px-4 pb-5 pt-10">
        <div className="flex flex-col items-center text-center">
          <CafeAvatar className="size-12 text-[15px] ring-2 ring-white/20" />
          <p className="mt-2 text-[15px] font-semibold text-white">Brew House</p>
          <p className="text-[10px] text-white/55">Table 4</p>
        </div>

        <p className="mt-4 text-center text-[17px] font-semibold tracking-tight text-white">
          Welcome back, Priya 👋
        </p>

        <div className="mt-3 rounded-2xl border border-[#54e0ff]/30 bg-[#54e0ff]/10 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#54e0ff]">Your prize</p>
          <p className="mt-1 text-[13px] font-semibold text-white">☕ Free Cold Coffee</p>
          <p className="text-[10px] text-white/60">Valid till 30 Nov · show staff to redeem</p>
        </div>

        <div className="mt-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-white">Table Squad</p>
            <p className="text-[11px] font-semibold text-[#54e0ff]">3 / 4</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#54e0ff] to-[#29adff]" />
          </div>
          <p className="mt-1.5 text-[10px] text-white/60">1 more for free dessert 🍰</p>
        </div>

        <div className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white text-[13px] font-semibold text-[#18181a]">
          <Check className="size-4 stroke-[3]" /> I&apos;m here
        </div>
        <p className="mt-3 text-center text-[8.5px] tracking-wide text-white/35">Dobara · by Locallify</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pehchaan — Live Board card                                          */
/* ------------------------------------------------------------------ */

export function LiveBoardMockup({ className }: { className?: string }) {
  return (
    <MockShell className={cn("w-[290px] p-4", className)}>
      <div className="flex items-center gap-2">
        <span className="relative inline-flex size-8 items-center justify-center rounded-full bg-[#f59e0b]/15 text-[#fbbf24]">
          <Bell className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#ef4444] ring-2 ring-[#1e1e20]" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-white">Table 4 — Arjun</p>
          <p className="text-[10.5px] text-[#a1a1aa]">6th visit · just scanned</p>
        </div>
        <span className="ml-auto rounded-full bg-[#54e0ff]/10 px-2 py-0.5 text-[9.5px] font-semibold text-[#54e0ff]">
          Regular
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-[11.5px] text-[#d4d4d8]">
        <li>📝 kam teekha, window seat</li>
        <li>🎂 Birthday: 22 Nov</li>
        <li>🎟️ Has: Free Cold Coffee (till 30 Nov)</li>
      </ul>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10.5px] font-medium">
        <span className="flex items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[#d4d4d8]">
          <NotebookPen className="size-3" /> Note
        </span>
        <span className="flex items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-[#d4d4d8]">
          <ReceiptText className="size-3" /> Close
        </span>
        <span className="flex items-center justify-center gap-1 rounded-lg bg-[#54e0ff] py-1.5 text-[#18181a]">
          <Gift className="size-3" /> Redeem
        </span>
      </div>
    </MockShell>
  );
}

/* ------------------------------------------------------------------ */
/* Table Squad progress                                                */
/* ------------------------------------------------------------------ */

export function SquadMockup({ className }: { className?: string }) {
  const people = ["P", "R", "A"];
  return (
    <MockShell className={cn("w-full max-w-[300px] p-4", className)}>
      <div className="flex items-center gap-2 text-[12px] font-medium text-white">
        <Users className="size-4 text-[#54e0ff]" /> Table 4 · Squad
      </div>
      <div className="mt-3 flex items-center gap-2">
        {people.map((p) => (
          <span
            key={p}
            className="relative inline-flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#54e0ff] to-[#29adff] text-[13px] font-semibold text-[#18181a]"
          >
            {p}
            <span className="absolute -bottom-0.5 -right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-[#22c55e] ring-2 ring-[#1e1e20]">
              <Check className="size-2.5 stroke-[4] text-white" />
            </span>
          </span>
        ))}
        <span className="inline-flex size-10 items-center justify-center rounded-full border-2 border-dashed border-white/25 text-[13px] text-white/40">
          ?
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#54e0ff] to-[#29adff]" />
      </div>
      <p className="mt-2 text-[12px] text-[#d4d4d8]">
        <span className="font-semibold text-white">3 of 4 scanned</span> — 1 more for free dessert 🍰
      </p>
    </MockShell>
  );
}

/* ------------------------------------------------------------------ */
/* Next-Visit Prize — scratch card                                     */
/* ------------------------------------------------------------------ */

export function ScratchCardMockup({ className }: { className?: string }) {
  return (
    <MockShell className={cn("w-full max-w-[300px] p-4", className)}>
      <p className="text-[12px] font-medium text-white">Thanks for visiting Brew House!</p>
      <div className="relative mt-3 h-[120px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#78350f]">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-[26px] leading-none">☕</p>
          <p className="mt-1.5 text-[15px] font-bold">Free Cold Coffee</p>
          <p className="text-[10.5px] opacity-80">Valid on your next visit · till 30 Nov</p>
        </div>
        {/* Unscratched foil */}
        <div
          className="absolute inset-0 flex items-end justify-end bg-[repeating-linear-gradient(135deg,#a1a1aa_0px,#d4d4d8_6px,#a1a1aa_12px)] p-3"
          style={{ clipPath: "polygon(58% 0, 100% 0, 100% 100%, 30% 100%, 44% 62%, 40% 34%)" }}
        >
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white">Scratch</span>
        </div>
      </div>
      <p className="mt-2.5 text-[11px] text-[#a1a1aa]">Saved to your WhatsApp ✓</p>
    </MockShell>
  );
}

/* ------------------------------------------------------------------ */
/* Fill My Tables — campaign composer                                  */
/* ------------------------------------------------------------------ */

export function CampaignMockup({ className }: { className?: string }) {
  return (
    <MockShell className={cn("w-full max-w-[300px] p-4", className)}>
      <p className="text-[12px] font-medium text-white">Tables bharo</p>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <p className="text-[10px] uppercase tracking-wider text-[#7a7a83]">Offer</p>
        <p className="mt-0.5 text-[13px] font-semibold text-white">20% off — next 2 hours</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10.5px]">
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[#a1a1aa]">All opted-in</span>
        <span className="rounded-full border border-[#54e0ff]/40 bg-[#54e0ff]/10 px-2 py-0.5 font-medium text-[#54e0ff]">
          Regulars (3+ visits)
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[#a1a1aa]">Last 60 days</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11.5px] text-[#d4d4d8]">
          <span className="font-semibold text-white">312 people</span> · approx ₹290
        </p>
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#54e0ff] px-2.5 py-1.5 text-[11px] font-semibold text-[#18181a]">
          <Send className="size-3" /> Send
        </span>
      </div>
    </MockShell>
  );
}
