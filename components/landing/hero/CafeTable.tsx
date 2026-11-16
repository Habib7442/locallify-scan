import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { FakeQr } from "@/components/landing/mockups";

// Top-down cafe table in scene coordinates (scene is 560×540).
const CENTER = { x: 205, y: 232 };
const TABLE_D = 230;
const SEAT_D = 56;
const SEAT_OFFSET = 103; // diagonal seats: TL, TR, BR, BL
const SEATS = [
  { x: CENTER.x - SEAT_OFFSET, y: CENTER.y - SEAT_OFFSET },
  { x: CENTER.x + SEAT_OFFSET, y: CENTER.y - SEAT_OFFSET },
  { x: CENTER.x + SEAT_OFFSET, y: CENTER.y + SEAT_OFFSET },
  { x: CENTER.x - SEAT_OFFSET, y: CENTER.y + SEAT_OFFSET },
];

const CONFETTI_COLORS = ["#FF7A6B", "#54e0ff", "#FF5FA2", "#fde68a"];
const CONFETTI = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2 + 0.3;
  const dist = 70 + (i % 3) * 18;
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: (i % 2 ? 1 : -1) * (90 + i * 20),
  };
});

type Props = {
  tableCode: string;
  seats: [string, string, string, string];
  dessertCard: string;
  filledSeats: number;
  scanning: boolean;
  showDessert: boolean;
  run: number;
  reduced: boolean;
};

export function CafeTable({ tableCode, seats, dessertCard, filledSeats, scanning, showDessert, run, reduced }: Props) {
  return (
    <>
      {/* Seats */}
      {SEATS.map((pos, i) => {
        const filled = i < filledSeats;
        return (
          <div
            key={i}
            className="absolute"
            style={{ left: pos.x - SEAT_D / 2, top: pos.y - SEAT_D / 2, width: SEAT_D, height: SEAT_D }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {filled ? (
                <motion.div
                  key="filled"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="relative flex size-full items-center justify-center rounded-full bg-gradient-to-br from-[#54e0ff] to-[#29adff] text-[17px] font-semibold text-[#0c1a20] shadow-[0_0_24px_rgba(84,224,255,0.45)]"
                >
                  {seats[i]}
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-[20px] items-center justify-center rounded-full bg-[#22c55e] ring-[3px] ring-[#111219]">
                    <Check className="size-3 stroke-[4] text-white" />
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="size-full rounded-full border-2 border-dashed border-white/25 bg-white/[0.02]"
                />
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Table top */}
      <div
        className="absolute rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.06)]"
        style={{
          left: CENTER.x - TABLE_D / 2,
          top: CENTER.y - TABLE_D / 2,
          width: TABLE_D,
          height: TABLE_D,
          background:
            "repeating-radial-gradient(circle at 46% 42%, rgba(255,255,255,0.025) 0 2px, transparent 2px 11px), radial-gradient(circle at 42% 36%, #4b3326 0%, #2f2019 55%, #1d1410 100%)",
        }}
      />

      {/* Table tent with QR */}
      <div
        className="absolute w-[70px] rounded-[10px] bg-[#f4f1ec] p-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
        style={{ left: CENTER.x - 35, top: CENTER.y - 92 }}
      >
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[7px] font-semibold text-[#57534e]">Scan me</span>
          <span className="rounded-[4px] bg-[#1c1917] px-1 text-[8px] font-bold leading-[12px] text-white">{tableCode}</span>
        </div>
        <div className="relative mt-1 overflow-hidden rounded-[5px] bg-white p-1">
          <FakeQr className="w-full text-[#1c1917]" />
          {scanning && !reduced && (
            <span
              key={`scan-${run}`}
              className="hero-scan-line absolute inset-x-0 top-1 h-[2px] bg-[#54e0ff] shadow-[0_0_10px_2px_rgba(84,224,255,0.75)]"
            />
          )}
        </div>
      </div>

      {/* Coffee cup (top-down) */}
      <svg className="absolute" style={{ left: CENTER.x - 78, top: CENTER.y + 4 }} width="62" height="62" viewBox="0 0 62 62">
        <circle cx="29" cy="31" r="27" fill="#e7e5e4" opacity="0.92" />
        <circle cx="29" cy="31" r="17" fill="#fafaf9" />
        <circle cx="29" cy="31" r="13" fill="#6b3f22" />
        <circle cx="25" cy="27" r="4" fill="#a16207" opacity="0.5" />
        <rect x="45" y="27" width="13" height="8" rx="4" fill="#fafaf9" />
      </svg>

      {/* Dessert plate (top-down) */}
      <svg className="absolute" style={{ left: CENTER.x + 14, top: CENTER.y + 10 }} width="66" height="66" viewBox="0 0 66 66">
        <circle cx="33" cy="33" r="30" fill="#f5f5f4" opacity="0.92" />
        <circle cx="33" cy="33" r="22" fill="none" stroke="#d6d3d1" strokeWidth="1.5" />
        <path d="M20 40 L46 26 L44 44 Z" fill="#7c2d12" />
        <path d="M20 40 L46 26 L46 31 L21 44 Z" fill="#fda4af" />
        <circle cx="41" cy="32" r="3" fill="#e11d48" />
      </svg>

      {/* Squad complete: confetti-lite + card */}
      <AnimatePresence>
        {showDessert && (
          <motion.div
            key={`dessert-${run}`}
            initial={reduced ? false : { opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#FF7A6B]/50 bg-[#2a1712]/95 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_12px_30px_rgba(255,122,107,0.35)]"
            style={{ left: CENTER.x, top: CENTER.y - 12 }}
          >
            {dessertCard}
          </motion.div>
        )}
      </AnimatePresence>
      {showDessert && !reduced && (
        <div key={`confetti-${run}`} className="absolute" style={{ left: CENTER.x, top: CENTER.y + 6 }}>
          {CONFETTI.map((p, i) => (
            <motion.span
              key={i}
              className="absolute block size-[7px] rounded-[2px]"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rotate }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </>
  );
}
