"use client";

import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";
import { Download, Printer } from "lucide-react";
import { btn, focusRing } from "@/components/landing/primitives";

type Card = { code: string; url: string };

const QR_SIZE = 600; // px for PNG download; SVG scales for print

function qrOptions(data: string) {
  return {
    width: QR_SIZE,
    height: QR_SIZE,
    data,
    margin: 0,
    qrOptions: { errorCorrectionLevel: "Q" as const },
    dotsOptions: { color: "#18181a", type: "rounded" as const },
    cornersSquareOptions: { color: "#18181a", type: "extra-rounded" as const },
    cornersDotOptions: { color: "#18181a" },
    backgroundOptions: { color: "#ffffff" },
  };
}

function QrCard({ card, cafeName, shortHost }: { card: Card; cafeName: string; shortHost: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Loaded only on this owner page — never on the customer scan page.
    import("qr-code-styling").then(({ default: QR }) => {
      if (cancelled || !boxRef.current) return;
      const qr = new QR({ ...qrOptions(card.url), type: "svg" });
      boxRef.current.innerHTML = "";
      qr.append(boxRef.current);
      const svg = boxRef.current.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${QR_SIZE} ${QR_SIZE}`);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", `QR code for table ${card.code}`);
      }
      qrRef.current = qr;
    });
    return () => {
      cancelled = true;
    };
  }, [card.url, card.code]);

  async function downloadPng() {
    const { default: QR } = await import("qr-code-styling");
    const qr = new QR({ ...qrOptions(card.url), type: "canvas" });
    await qr.download({ name: `qr-${card.code}`, extension: "png" });
  }

  return (
    <div className="qr-card flex flex-col items-center justify-between rounded-2xl border border-black/10 bg-white p-6 text-center text-[#18181a] print:rounded-none print:border-dashed">
      <div>
        <p className="text-[15px] font-medium tracking-[-0.02em]">{cafeName}</p>
        <p className="mt-1 text-[44px] leading-none font-semibold tracking-[-0.04em]">{card.code}</p>
      </div>
      <div ref={boxRef} className="my-4 aspect-square w-[62%] [&>svg]:h-full [&>svg]:w-full" />
      <div>
        <p className="text-[15px] font-semibold">Scan to get rewards</p>
        <p className="mt-1 text-[11px] text-black/60">
          {shortHost} · Dobara by Locallify
        </p>
      </div>
      <button
        type="button"
        onClick={downloadPng}
        className={`mt-4 inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-black/15 px-3 text-[14px] print:hidden ${focusRing}`}
      >
        <Download className="size-4" aria-hidden /> PNG
      </button>
    </div>
  );
}

export function PrintCards({ cafeName, cards, shortHost }: { cafeName: string; cards: Card[]; shortHost: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-[15px] text-[#9a9aa3]">{cards.length} cards · 4 per A4 page</p>
        <button type="button" onClick={() => window.print()} disabled={!ready} className={`${btn.primary} ${btn.sizeMd} shadow-none`}>
          <Printer className="size-5" aria-hidden /> Print / Save as PDF
        </button>
      </div>
      <div className="qr-sheet grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <QrCard key={c.code} card={c} cafeName={cafeName} shortHost={shortHost} />
        ))}
      </div>
    </div>
  );
}
