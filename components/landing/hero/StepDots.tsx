import type { Step } from "./types";

type Props = {
  labels: [string, string, string, string];
  active: Step;
  onSelect: (step: Step) => void;
};

/** Clickable step indicator under the scene (the only interactive part of it). */
export function StepDots({ labels, active, onSelect }: Props) {
  return (
    <div className="mt-5 flex items-center justify-center gap-1">
      {labels.map((label, i) => {
        const isActive = i === active;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(i as Step)}
            aria-label={`Show step ${i + 1}: ${label}`}
            aria-current={isActive ? "step" : undefined}
            className="group flex h-8 items-center justify-center px-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#54e0ff] rounded-full cursor-pointer"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                isActive ? "w-7 bg-[#54e0ff]" : "w-2 bg-white/25 group-hover:bg-white/50"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Caption chips above the scene — decorative; the dots carry the semantics. */
export function StepCaptions({ labels, active, allDone }: { labels: [string, string, string, string]; active: Step; allDone: boolean }) {
  return (
    <div aria-hidden className="flex flex-wrap items-center justify-center gap-1.5">
      {labels.map((label, i) => {
        const isActive = !allDone && i === active;
        const isDone = allDone || i < active;
        return (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors duration-300 ${
              isActive
                ? "bg-[#54e0ff] text-[#0c1a20] shadow-[0_0_18px_rgba(84,224,255,0.35)]"
                : isDone
                  ? "border border-[#54e0ff]/30 text-[#54e0ff]"
                  : "border border-white/10 text-[#7a7a83]"
            }`}
          >
            {i + 1} · {label}
          </span>
        );
      })}
    </div>
  );
}
