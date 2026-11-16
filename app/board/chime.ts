// Two-tone arrival chime with the Web Audio API (no audio file to load).
// Browsers only allow audio after a user gesture — call armChime() from a tap.

let ctx: AudioContext | null = null;

export function armChime(): void {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, start: number, duration: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playChime(): void {
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const t = ctx.currentTime;
  tone(880, t, 0.25);
  tone(1320, t + 0.18, 0.4);
  try {
    navigator.vibrate?.(200);
  } catch {
    // Vibration not supported (desktop) — ignore.
  }
}

/** True once audio is allowed (after a tap in this page load). */
export function isChimeReady(): boolean {
  return ctx?.state === "running";
}
