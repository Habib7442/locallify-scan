"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type QRCodeStylingType from "qr-code-styling";
import type { CornerDotType, CornerSquareType, DotType } from "qr-code-styling";
import { Check, Copy, ShoppingBag } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { getPublicAssetUrl } from "@/lib/storage";
import { OrderPrintedQrModal } from "@/components/checkout/OrderPrintedQrModal";

const INK = "#0a0a0b";

type QrStyleKey = "classic" | "dots" | "sharp" | "accent";

const QR_STYLES: Record<
  QrStyleKey,
  { label: string; dotsType: DotType; cornerSquareType: CornerSquareType; cornerDotType: CornerDotType }
> = {
  classic: { label: "Classic", dotsType: "extra-rounded", cornerSquareType: "extra-rounded", cornerDotType: "dot" },
  dots: { label: "Dots", dotsType: "dots", cornerSquareType: "dot", cornerDotType: "dot" },
  accent: { label: "Accent pop", dotsType: "classy-rounded", cornerSquareType: "extra-rounded", cornerDotType: "dot" },
  sharp: { label: "Sharp", dotsType: "square", cornerSquareType: "square", cornerDotType: "square" },
};

export function QrTab({
  slug,
  logoPath,
  accent,
  pageId,
}: {
  slug: string;
  logoPath: string | null;
  accent: string | null;
  pageId?: string;
}) {
  const hubUrl = `${SITE_URL}/${slug}`;
  const displayUrl = hubUrl.replace(/^https?:\/\//, "");

  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStylingType | null>(null);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [style, setStyle] = useState<QrStyleKey>("classic");
  const [copied, setCopied] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const logoUrl = logoPath ? getPublicAssetUrl(logoPath) : null;

  useEffect(() => {
    let cancelled = false;

    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return;
      qrRef.current = new QRCodeStyling({
        type: "svg",
        width: 1024,
        height: 1024,
        data: hubUrl,
        margin: 16,
        backgroundOptions: { color: "#ffffff" },
        qrOptions: { errorCorrectionLevel: "H" },
      });
      qrRef.current.append(containerRef.current);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!qrRef.current) return;
    const preset = QR_STYLES[style];
    qrRef.current.update({
      data: hubUrl,
      image: includeLogo && logoUrl ? logoUrl : undefined,
      imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 8, crossOrigin: "anonymous" },
      dotsOptions: { type: preset.dotsType, color: INK },
      cornersSquareOptions: { type: preset.cornerSquareType, color: INK },
      cornersDotOptions: {
        type: preset.cornerDotType,
        color: style === "accent" ? (accent ?? INK) : INK,
      },
    });
  }, [hubUrl, includeLogo, logoUrl, style, accent]);

  function handleCopy() {
    navigator.clipboard.writeText(hubUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload(extension: "png" | "svg") {
    qrRef.current?.download({ name: `${slug}-qr`, extension });
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <label className="block text-sm font-medium text-white mb-4">Your QR code</label>

        <div className="flex flex-col items-center gap-4 sm:items-start sm:flex-row sm:gap-6">
          <div
            ref={containerRef}
            className="w-56 h-56 shrink-0 overflow-hidden rounded-[16px] border border-[#33373b] bg-white p-4 [&>svg]:w-full [&>svg]:h-full"
          />

          <div className="flex flex-col gap-4 min-w-0">
            <div>
              <label className="block text-xs text-[#7a7a83] mb-1.5">Your hub link</label>
              <div className="flex items-center gap-2 rounded-[10px] border border-[#33373b] bg-white/[0.02] px-3 py-2.5">
                <span className="flex-1 min-w-0 truncate text-[14px] text-[#a1a1aa]">
                  {displayUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#54e0ff] hover:underline cursor-pointer shrink-0"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#7a7a83] mb-1.5">Style</label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(QR_STYLES) as QrStyleKey[]).map((key) => {
                  const preset = QR_STYLES[key];
                  const dotRadius =
                    preset.dotsType === "square"
                      ? "rounded-none"
                      : preset.dotsType === "dots"
                        ? "rounded-full"
                        : "rounded-[3px]";
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStyle(key)}
                      className={`flex flex-col items-center gap-1.5 rounded-[10px] border px-2 py-2.5 transition-colors cursor-pointer ${
                        style === key
                          ? "border-[#54e0ff] bg-[#54e0ff]/10"
                          : "border-[#33373b] hover:border-[#4a4e53]"
                      }`}
                    >
                      <span className="grid grid-cols-2 gap-0.5 rounded-[4px] bg-white p-1">
                        <span className={`size-2 ${dotRadius}`} style={{ backgroundColor: INK }} />
                        <span
                          className={`size-2 ${dotRadius}`}
                          style={{ backgroundColor: key === "accent" ? (accent ?? INK) : INK }}
                        />
                        <span
                          className={`size-2 ${dotRadius}`}
                          style={{ backgroundColor: key === "accent" ? (accent ?? INK) : INK }}
                        />
                        <span className={`size-2 ${dotRadius}`} style={{ backgroundColor: INK }} />
                      </span>
                      <span className="text-[11px] text-[#a1a1aa]">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {logoUrl && (
              <label className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="size-4 rounded accent-[#54e0ff] cursor-pointer"
                />
                Include my logo in the center
              </label>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownload("png")}
                className="rounded-[10px] px-4 py-2.5 text-sm font-medium bg-white text-[#18181a] hover:bg-gray-100 cursor-pointer"
              >
                Download PNG
              </button>
              <button
                type="button"
                onClick={() => handleDownload("svg")}
                className="rounded-[10px] px-4 py-2.5 text-sm font-medium border border-[#33373b] text-white hover:border-[#54e0ff] cursor-pointer"
              >
                Download SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#33373b] pt-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 rounded-[22px] border border-[#54e0ff]/30 bg-gradient-to-r from-[#54e0ff]/[0.08] to-transparent p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 min-w-0 w-full lg:w-auto">
            {/* Acrylic Stand Image Preview */}
            <div
              className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[16px] overflow-hidden border border-white/20 shrink-0 shadow-xl group cursor-pointer"
              onClick={() => setIsOrderModalOpen(true)}
            >
              <Image
                src="/qr_acrylic_stand.png"
                alt="Acrylic QR Code Standee"
                fill
                sizes="128px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Order Physical Printed QR</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#54e0ff]/20 text-[#54e0ff] text-[10px] font-mono uppercase tracking-wider font-semibold whitespace-nowrap shrink-0">
                  Direct Shipping
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7a7a83] max-w-md font-light leading-relaxed">
                Get this QR code printed on a premium clear acrylic desktop stand or outdoor vinyl sticker. <strong className="text-emerald-400 font-normal">FREE local delivery in Silchar</strong> • Express courier shipping across India.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#54e0ff] hover:bg-[#29adff] px-5 py-3 text-sm font-bold text-[#18181a] shadow-[0_0_20px_rgba(84,224,255,0.25)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shrink-0"
          >
            <ShoppingBag className="size-4" />
            <span className="whitespace-nowrap">Order Printed Stand — ₹499</span>
          </button>
        </div>
      </div>

      <OrderPrintedQrModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        pageId={pageId}
        slug={slug}
      />
    </div>
  );
}
