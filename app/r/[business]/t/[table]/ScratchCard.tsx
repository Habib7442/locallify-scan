"use client";

import { useEffect, useRef, useState } from "react";

// Scratch-to-reveal card. The prize label is NOT in the page: scratching
// (or "Tap to reveal") asks the server to reveal this device's own prize
// (AGENTS.md §5 — outcome decided server-side at close, client only reveals).

type Revealed = { label: string; code: string; validUntil: string };

type Labels = {
  scratchHint: string;
  tapToReveal: string;
  revealing: string;
  validTill: string; // "valid till"
  prizeCode: string; // "Code"
  showAtCounter: string;
  failed: string;
};

type Props = {
  prizeId: string;
  accent: string;
  accentText: string;
  labels: Labels;
};

const REVEAL_AT = 0.45; // fraction scratched

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}

export function ScratchCard({ prizeId, accent, accentText, labels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const busyRef = useRef(false);

  async function reveal() {
    if (busyRef.current || revealed) return;
    busyRef.current = true;
    setBusy(true);
    setError(false);
    try {
      const body = new FormData();
      body.set("prize", prizeId);
      const res = await fetch("/api/prize/reveal", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Revealed;
      setRevealed(data);
    } catch {
      setError(true);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  // Paint the scratch layer and track how much has been scratched.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#9a9aa3";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#18181a";
    ctx.font = "600 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels.scratchHint, width / 2, height / 2 + 5);
    ctx.globalCompositeOperation = "destination-out";

    let drawing = false;
    let strokes = 0;

    const scratchedFraction = () => {
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clear = 0;
      for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
      return clear / (data.length / 64);
    };

    const point = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 22, 0, Math.PI * 2);
      ctx.fill();
      strokes++;
      if (strokes % 12 === 0 && scratchedFraction() >= REVEAL_AT) void reveal();
    };
    const down = (e: PointerEvent) => {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      point(e);
    };
    const move = (e: PointerEvent) => {
      if (drawing) point(e);
    };
    const up = () => {
      drawing = false;
      if (scratchedFraction() >= REVEAL_AT) void reveal();
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // reveal is stable enough for this one-shot card; re-binding isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, labels.scratchHint]);

  return (
    <div>
      <div className="relative h-36 overflow-hidden rounded-2xl" style={{ backgroundColor: accent, color: accentText }}>
        <div className="flex h-full flex-col items-center justify-center px-4 text-center" aria-live="polite">
          {revealed ? (
            <>
              <p className="text-[24px] leading-tight font-semibold">{revealed.label}</p>
              <p className="mt-1 text-[15px] opacity-90">
                {labels.validTill} {formatDate(revealed.validUntil)} · {labels.prizeCode} {revealed.code}
              </p>
            </>
          ) : (
            <p className="text-[16px] opacity-90">{busy ? labels.revealing : "🎁"}</p>
          )}
        </div>
        {!revealed ? (
          <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full touch-none motion-reduce:hidden" />
        ) : null}
      </div>
      {revealed ? (
        <p className="mt-3 text-center text-[15px]">{labels.showAtCounter}</p>
      ) : (
        <button
          type="button"
          onClick={() => void reveal()}
          disabled={busy}
          className="mt-3 min-h-12 w-full rounded-[14px] border border-current/30 text-[16px] font-medium focus-visible:ring-4 focus-visible:ring-[#54e0ff] focus-visible:outline-none"
        >
          {busy ? labels.revealing : labels.tapToReveal}
        </button>
      )}
      {error ? (
        <p role="alert" className="mt-2 text-center text-[14px]">
          {labels.failed}
        </p>
      ) : null}
    </div>
  );
}
