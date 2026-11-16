import { AnimatePresence, motion } from "framer-motion";
import type { SceneContent } from "./types";

type Props = {
  content: SceneContent["tablet"];
  showAlert: boolean;
  run: number;
  reduced: boolean;
};

export function StaffTablet({ content, showAlert, run, reduced }: Props) {
  return (
    <div className="w-[262px] rounded-[18px] border border-white/12 bg-[#1b1c23]/95 p-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-white">{content.label}</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#4ade80]">
          <span className="size-1.5 rounded-full bg-[#4ade80]" />
          {content.live}
        </span>
      </div>
      <p className="mt-1 text-[10.5px] text-[#8a8a93]">{content.openTables}</p>

      <AnimatePresence mode="wait" initial={false}>
        {showAlert ? (
          <motion.div
            key={`alert-${run}`}
            initial={reduced ? false : { opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-[#FF7A6B]/35 bg-[#FF7A6B]/[0.08] p-2.5"
          >
            <span className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A6B] to-[#FF5FA2] text-[12px] font-semibold text-white">
              {content.alertTitle.match(/—\s*(\p{L})/u)?.[1] ?? "•"}
              {!reduced &&
                [0, 1].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-[#fbbf24]"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 2.1, opacity: 0 }}
                    transition={{ duration: 1.1, delay: 0.15 + i * 0.45, ease: "easeOut" }}
                  />
                ))}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">{content.alertTitle}</p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-[#d4d4d8] max-sm:hidden">{content.alertLine}</p>
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2.5 rounded-xl border border-dashed border-white/10 px-2.5 py-3 text-center text-[11px] text-[#7a7a83]"
          >
            {content.idle}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
