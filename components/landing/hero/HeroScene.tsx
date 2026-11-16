"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MotionConfig, useInView } from "framer-motion";
import { CafeTable } from "./CafeTable";
import { PhoneMock, type PhoneScreen } from "./PhoneMock";
import { StaffTablet } from "./StaffTablet";
import { StepCaptions, StepDots } from "./StepDots";
import type { SceneContent, Step } from "./types";

// Loop timing: Scan 0–2s · Squad 2–4.5s · Pehchaan 4.5–7s · Inaam 7–10s, then 1.5s pause.
const STEP_MS: Record<Step, number> = { 0: 2000, 1: 2500, 2: 2500, 3: 3000 + 1500 };
const SEAT_FILL_START_MS = 250;
const SEAT_FILL_GAP_MS = 400;
const MANUAL_PAUSE_MS = 8000;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** SSR-safe (server snapshot = false), no hydration mismatch. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

export function HeroScene({ content }: { content: SceneContent }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const reduced = usePrefersReducedMotion();

  // `run` increments on every step change so per-step animations restart.
  const [{ step, run }, setPlay] = useState<{ step: Step; run: number }>({ step: 0, run: 0 });
  const [seatFill, setSeatFill] = useState<{ run: number; count: number }>({ run: -1, count: 0 });
  const [manualPause, setManualPause] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: Step) => {
    setPlay((p) => ({ step: next, run: p.run + 1 }));
  }, []);

  // Autoplay: advance after the current step's duration (only while visible).
  useEffect(() => {
    if (reduced || !inView || manualPause) return;
    const t = setTimeout(() => goTo(((step + 1) % 4) as Step), STEP_MS[step]);
    return () => clearTimeout(t);
  }, [step, run, inView, reduced, manualPause, goTo]);

  // Squad step: seats light up one by one.
  useEffect(() => {
    if (reduced || step !== 1) return;
    const timers = [1, 2, 3, 4].map((count, i) =>
      setTimeout(() => setSeatFill({ run, count }), SEAT_FILL_START_MS + i * SEAT_FILL_GAP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [step, run, reduced]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const handleSelect = useCallback(
    (next: Step) => {
      goTo(next);
      setManualPause(true);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => setManualPause(false), MANUAL_PAUSE_MS);
    },
    [goTo],
  );

  // Reduced motion → static final composition with all four steps done.
  const shownStep: Step = reduced ? 3 : step;
  const filledSeats = reduced || step >= 2 ? 4 : step === 0 ? 0 : seatFill.run === run ? seatFill.count : 0;
  const screen: PhoneScreen = shownStep === 0 ? "verify" : shownStep === 3 ? "prize" : "squad";
  const showDessert = reduced || (step === 1 && filledSeats === 4);
  const showAlert = reduced || step >= 2;

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} role="group" aria-label={content.ariaLabel} className="flex flex-col items-center">
        <StepCaptions labels={content.steps} active={shownStep} allDone={reduced} />

        {/* Fixed-size wrapper per breakpoint + scaled 560×540 stage → zero layout shift */}
        <div
          aria-hidden
          className="relative mt-5 h-[302px] w-[314px] min-[380px]:h-[335px] min-[380px]:w-[347px] sm:h-[432px] sm:w-[448px] lg:h-[475px] lg:w-[493px] xl:h-[540px] xl:w-[560px]"
        >
          <div className="absolute left-0 top-0 h-[540px] w-[560px] origin-top-left scale-[0.56] min-[380px]:scale-[0.62] sm:scale-[0.8] lg:scale-[0.88] xl:scale-100">
            <CafeTable
              tableCode={content.tableCode}
              seats={content.seats}
              dessertCard={content.dessertCard}
              filledSeats={filledSeats}
              scanning={shownStep === 0}
              showDessert={showDessert}
              run={run}
              reduced={reduced}
            />

            <div className="absolute left-[342px] top-[8px] z-20 rotate-[-6deg]">
              <div className="animate-hero-float">
                <PhoneMock content={content} screen={screen} filledSeats={filledSeats} run={run} reduced={reduced} />
              </div>
            </div>

            <div className="absolute bottom-[6px] left-[6px] z-30 rotate-[4deg]">
              <div className="animate-hero-float [animation-delay:-3s]">
                <StaffTablet content={content.tablet} showAlert={showAlert} run={run} reduced={reduced} />
              </div>
            </div>
          </div>
        </div>

        {!reduced && <StepDots labels={content.steps} active={step} onSelect={handleSelect} />}
      </div>
    </MotionConfig>
  );
}
