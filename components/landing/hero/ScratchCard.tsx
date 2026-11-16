import { useId } from "react";
import { motion } from "framer-motion";

// Silver foil masked away by diagonal "scratch" strokes drawn one by one.
const STROKES = [
  "M-6 12 L34 -6",
  "M-6 32 L62 -6",
  "M-6 54 L96 -4",
  "M6 66 L106 8",
  "M38 66 L106 28",
  "M70 66 L106 46",
];

type Props = {
  title: string;
  detail: string;
  hint: string;
  run: number;
  reduced: boolean;
};

export function ScratchCard({ title, detail, hint, run, reduced }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const maskId = `scratch-mask-${uid}`;
  const foilId = `scratch-foil-${uid}`;

  return (
    <div className="relative h-[92px] overflow-hidden rounded-[14px] bg-gradient-to-br from-[#fde68a] to-[#fbbf24] text-[#78350f]">
      <div className="flex h-full flex-col items-center justify-center px-2 text-center">
        <p className="text-[14px] font-bold leading-tight">{title}</p>
        <p className="mt-1 text-[10px] font-medium opacity-80">{detail}</p>
      </div>

      {!reduced && (
        <svg key={run} viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d4d4d8" />
              <stop offset="45%" stopColor="#f4f4f5" />
              <stop offset="55%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#d4d4d8" />
            </linearGradient>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="60">
              <rect width="100" height="60" fill="white" />
              {STROKES.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="black"
                  strokeWidth="22"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5 + i * 0.26, duration: 0.3, ease: "easeInOut" }}
                />
              ))}
            </mask>
          </defs>
          <rect width="100" height="60" fill={`url(#${foilId})`} mask={`url(#${maskId})`} />
          <motion.text
            x="50"
            y="34"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="#52525b"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.55, duration: 0.2 }}
          >
            {hint}
          </motion.text>
        </svg>
      )}
    </div>
  );
}
