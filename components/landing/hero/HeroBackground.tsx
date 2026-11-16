// "Cafe at night": ink base, out-of-focus string-light glows drifting slowly,
// fine grain, and an edge vignette. Pure CSS — glows stop under reduced motion.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#111219]">
      {/* Warm string-light glows */}
      <div className="hero-glow hero-glow-a absolute left-[38%] top-[6%] size-[460px] rounded-full bg-[#FF7A6B] opacity-[0.16] blur-[90px]" />
      <div className="hero-glow hero-glow-b absolute right-[-6%] top-[30%] size-[520px] rounded-full bg-[#54e0ff] opacity-[0.12] blur-[100px]" />
      <div className="hero-glow hero-glow-c absolute left-[58%] bottom-[2%] size-[300px] rounded-full bg-[#FF5FA2] opacity-[0.12] blur-[80px]" />
      <div className="hero-glow hero-glow-a absolute left-[-8%] top-[42%] size-[380px] rounded-full bg-[#FF7A6B] opacity-[0.08] blur-[90px] [animation-delay:-9s]" />

      {/* Fine grain */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />

      {/* Vignette + fade into the next section */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#18181a]" />
    </div>
  );
}
