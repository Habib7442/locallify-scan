import { AnimatePresence, motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa6";
import { ScratchCard } from "./ScratchCard";
import type { SceneContent } from "./types";

export type PhoneScreen = "verify" | "squad" | "prize";

type Props = {
  content: SceneContent;
  screen: PhoneScreen;
  filledSeats: number;
  run: number;
  reduced: boolean;
};

export function PhoneMock({ content, screen, filledSeats, run, reduced }: Props) {
  const p = content.phone;
  const pop = reduced ? false : { opacity: 0, scale: 0.6 };

  return (
    <div className="h-[392px] w-[192px] rounded-[30px] border border-white/15 bg-[#0b0b0e] p-[7px] shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
      <div className="relative h-full overflow-hidden rounded-[24px] bg-gradient-to-b from-[#2d1b13] via-[#1b1411] to-[#121212] px-3 pt-8">
        <div className="absolute left-1/2 top-2 h-[14px] w-[60px] -translate-x-1/2 rounded-full bg-black" />

        <div className="flex flex-col items-center text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ea580c] text-[13px] font-semibold text-white ring-2 ring-white/15">
            BH
          </span>
          <p className="mt-1.5 text-[13px] font-semibold text-white">{content.cafeName}</p>
          <p className="text-[10px] text-white/55">{content.tableName}</p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
            className="mt-4"
          >
            {screen === "verify" && (
              <div className="text-center">
                <p className="text-[16px] font-semibold text-white">{p.welcome}</p>
                <div className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-2 text-[11px] font-semibold leading-tight text-[#052e16]">
                  <FaWhatsapp className="size-4 shrink-0" />
                  {p.unlock}
                </div>
                <motion.div
                  key={`verified-${run}`}
                  initial={pop}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 420, damping: 16 }}
                  className="mx-auto mt-3 inline-flex rounded-full bg-[#22c55e]/15 px-3 py-1 text-[12px] font-semibold text-[#4ade80] ring-1 ring-[#22c55e]/40"
                >
                  {p.verified}
                </motion.div>
              </div>
            )}

            {screen === "squad" && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] font-medium text-white">{p.squadTitle}</p>
                  <p className="text-[16px] font-bold text-[#54e0ff]">{filledSeats}/4</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#54e0ff] to-[#29adff]"
                    initial={false}
                    animate={{ width: `${filledSeats * 25}%` }}
                    transition={{ duration: 0.35 }}
                  />
                </div>
                <div className="mt-3 flex justify-center gap-1.5">
                  {content.seats.map((s, i) => (
                    <span
                      key={s}
                      className={`flex size-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                        i < filledSeats
                          ? "bg-[#54e0ff] text-[#0c1a20]"
                          : "border border-dashed border-white/25 text-white/30"
                      }`}
                    >
                      {i < filledSeats ? s : "?"}
                    </span>
                  ))}
                </div>
                {filledSeats === 4 && (
                  <motion.p
                    key={`done-${run}`}
                    initial={pop}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 text-center text-[12px] font-semibold text-[#fda4af]"
                  >
                    {p.squadDone}
                  </motion.p>
                )}
              </div>
            )}

            {screen === "prize" && (
              <div>
                <p className="mb-2 text-center text-[12px] font-medium text-white/80">{p.prizeIntro}</p>
                <ScratchCard title={p.prizeTitle} detail={p.prizeDetail} hint={p.scratchHint} run={run} reduced={reduced} />
                <motion.p
                  key={`saved-${run}`}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : 2.3 }}
                  className="mt-2.5 text-center text-[11px] font-semibold text-[#4ade80]"
                >
                  {p.prizeSaved}
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="absolute inset-x-0 bottom-3 text-center text-[8.5px] tracking-wide text-white/35">{p.footer}</p>
      </div>
    </div>
  );
}
