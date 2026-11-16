"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Calendar, X, MessageSquare } from "lucide-react";
import { typeMeta } from "@/lib/link-types";
import { getPublicAssetUrl } from "@/lib/storage";
import { fontClassName } from "@/lib/fonts";
import { themeRecipe } from "@/lib/themes";
import { VerticalFeatures } from "@/components/hub/VerticalFeatures";

export type HubContentLink = {
  id: string;
  type: string;
  label: string;
  sub: string | null;
  destination: string;
};

export type HubContentPage = {
  slug: string;
  display_name: string | null;
  tagline: string | null;
  logo_path: string | null;
  accent: string | null;
  bg_type: string;
  bg_value: string | null;
  bg_image_brightness?: number | null;
  bg_image_contrast?: number | null;
  bg_image_overlay?: number | null;
  theme?: string | null;
  heading_font?: string | null;
  link_font?: string | null;
  heading_color?: string | null;
  tagline_color?: string | null;
  link_bg_color?: string | null;
  link_text_color?: string | null;
  vertical?: string | null;
};

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function linkHref(type: string, destination: string): string | null {
  if (!destination) return null;
  if (type === "whatsapp") {
    if (destination.startsWith("http")) return destination;
    return `https://wa.me/${destination.replace(/[^0-9]/g, "")}`;
  }
  if (type === "call") {
    if (destination.startsWith("tel:")) return destination;
    return `tel:${destination}`;
  }
  return destination;
}

export function HubContent({ page, links }: { page: HubContentPage; links: HubContentLink[] }) {
  const name = page.display_name || page.slug;
  const logoUrl = getPublicAssetUrl(page.logo_path);
  const recipe = themeRecipe(page.theme);
  const headingFontClass = fontClassName(page.heading_font);
  const linkFontClass = fontClassName(page.link_font);
  const focusColor = page.accent;
  const ringColor = focusColor ?? "rgba(255,255,255,0.5)";

  const customBackground = page.bg_type === "solid" && page.bg_value ? page.bg_value : null;
  const isImageBg = page.bg_type === "image" && Boolean(page.bg_value);
  const bgImageUrl = isImageBg ? getPublicAssetUrl(page.bg_value) : null;
  const bgBrightness = page.bg_image_brightness ?? 100;
  const bgContrast = page.bg_image_contrast ?? 100;
  const bgOverlay = page.bg_image_overlay ?? 30;
  const hasLinkColorOverride = Boolean(page.link_bg_color || page.link_text_color);

  // State for appointment booking modal
  const [bookingLink, setBookingLink] = useState<HubContentLink | null>(null);
  const [clientName, setClientName] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");

  const defaultHeadingColor = isImageBg ? "#ffffff" : recipe.headingColor;
  const defaultTaglineColor = isImageBg ? "rgba(255,255,255,0.85)" : recipe.taglineColor;
  const defaultIconColor = isImageBg ? "#ffffff" : recipe.iconColor;
  const defaultFooterColor = isImageBg ? "rgba(255,255,255,0.85)" : recipe.footerColor;
  const defaultLinkCardClassName = isImageBg
    ? "bg-black/35 backdrop-blur-md border-white/15 text-white hover:bg-black/45"
    : recipe.linkCardClassName;
  const defaultLinkCardStyle = isImageBg ? undefined : recipe.linkCardStyle;
  const headingTextShadow = isImageBg ? "0 2px 10px rgba(0,0,0,0.55)" : recipe.headingTextShadow;

  const linkIconColor = page.link_text_color || defaultIconColor;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLink) return;

    const phoneRaw = bookingLink.destination.replace(/[^0-9]/g, "");
    const message = `Hi! I would like to book an appointment with ${name}.\n\n👤 Name: ${clientName || "Not specified"}\n📅 Preferred Time: ${preferredTime || "Flexible"}${notes ? `\n📝 Notes: ${notes}` : ""}`;

    const waUrl = `https://wa.me/${phoneRaw}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    setBookingLink(null);
    setClientName("");
    setPreferredTime("");
    setNotes("");
  };

  return (
    <div
      className="relative min-h-screen w-full flex-1 flex flex-col items-center justify-between px-4 py-12 sm:py-16 font-sans overflow-x-hidden"
      style={bgImageUrl ? undefined : { background: customBackground ?? recipe.background }}
    >
      {bgImageUrl && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: `brightness(${bgBrightness}%) contrast(${bgContrast}%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${bgOverlay / 100})` }}
          />
        </>
      )}
      <div className="relative w-full max-w-sm flex flex-col items-center text-center my-auto">
        {logoUrl ? (
          <div
            className={`relative w-20 h-20 rounded-full overflow-hidden mb-4 ring-offset-2 ring-offset-transparent ${
              focusColor ? "ring-2" : "border border-white/10"
            }`}
            style={{ ["--tw-ring-color" as string]: ringColor }}
          >
            <Image
              src={logoUrl}
              alt={name}
              fill
              sizes="80px"
              unoptimized
              priority
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-[#18181a] mb-4"
            style={{ backgroundColor: focusColor ?? "#33373b" }}
          >
            {initials(name)}
          </div>
        )}

        <h1
          className={`text-2xl font-semibold mb-1 ${headingFontClass} ${
            !page.heading_color && !isImageBg && recipe.headingGradient
              ? "bg-clip-text text-transparent"
              : ""
          }`}
          style={{
            color:
              page.heading_color || (!isImageBg && recipe.headingGradient ? undefined : defaultHeadingColor),
            backgroundImage: !page.heading_color && !isImageBg ? recipe.headingGradient : undefined,
            textShadow: headingTextShadow,
          }}
        >
          {name}
        </h1>
        {page.tagline && (
          <p className="text-sm mb-8" style={{ color: page.tagline_color || defaultTaglineColor }}>
            {page.tagline}
          </p>
        )}
        {!page.tagline && <div className="mb-6" />}

        {/* Business Plan Vertical Signature Feature */}
        <VerticalFeatures
          vertical={page.vertical ?? null}
          accentColor={focusColor || "#54e0ff"}
        />

        <div className="w-full flex flex-col gap-3">
          {links.length === 0 && (
            <p className="text-sm" style={{ color: page.tagline_color || defaultTaglineColor }}>
              No links added yet.
            </p>
          )}
          {links.map((link) => {
            const isBookingWhatsApp =
              link.type === "book" &&
              (!link.destination.startsWith("http") || link.destination.includes("wa.me"));
            const href = isBookingWhatsApp ? null : linkHref(link.type, link.destination);
            const meta = typeMeta(link.type);
            const TypeIcon = meta.icon;

            const content = (
              <>
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className="inline-flex items-center justify-center size-8 rounded-full shrink-0"
                    style={{ backgroundColor: `${meta.color}33` }}
                  >
                    <TypeIcon className="size-4" style={{ color: linkIconColor }} />
                  </span>
                  <span className={`flex flex-col items-start text-left min-w-0 ${linkFontClass}`}>
                    <span className="font-medium truncate w-full">{link.label}</span>
                    {link.sub && <span className="text-xs opacity-70 truncate w-full">{link.sub}</span>}
                  </span>
                </span>
                {(href || isBookingWhatsApp) && <ExternalLink className="size-4 opacity-70 shrink-0" />}
              </>
            );

            const className = `w-full flex items-center justify-between gap-3 ${recipe.radiusClassName} px-5 py-4 border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent motion-reduce:transition-none cursor-pointer ${
              hasLinkColorOverride ? "hover:brightness-90" : defaultLinkCardClassName
            }`;

            const linkStyle = {
              ...defaultLinkCardStyle,
              ["--tw-ring-color" as string]: ringColor,
              ...(page.link_bg_color
                ? { backgroundColor: page.link_bg_color, borderColor: `${linkIconColor}33` }
                : {}),
              ...(page.link_text_color ? { color: page.link_text_color } : {}),
            };

            if (isBookingWhatsApp) {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setBookingLink(link)}
                  className={className}
                  style={linkStyle}
                >
                  {content}
                </button>
              );
            }

            return href ? (
              <a
                key={link.id}
                href={href}
                className={className}
                style={linkStyle}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            ) : (
              <div key={link.id} className={`${className} opacity-60 cursor-default`} style={linkStyle}>
                {content}
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-[11px] font-bold" style={{ color: defaultFooterColor }}>
          Powered by Locallify Scan
        </p>
      </div>

      {/* Appointment Request Modal */}
      {bookingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-[24px] bg-[#1e1e20] border border-white/15 p-6 shadow-2xl text-left">
            <button
              type="button"
              onClick={() => setBookingLink(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-[#54e0ff]/10 border border-[#54e0ff]/20 flex items-center justify-center text-[#54e0ff]">
                <Calendar className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Request Appointment</h3>
                <p className="text-xs text-[#7a7a83]">Send request directly to {name}</p>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-sm text-white focus:border-[#54e0ff] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Preferred Date & Time</label>
                <input
                  type="text"
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g. Tomorrow at 4:00 PM"
                  className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-sm text-white focus:border-[#54e0ff] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Service / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Consultation / Teeth Cleaning"
                  className="w-full rounded-[10px] bg-[#18181a] border border-[#33373b] px-3 py-2 text-sm text-white focus:border-[#54e0ff] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-[12px] bg-[#25d366] hover:bg-[#20bd5a] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <MessageSquare className="size-4 fill-white" />
                <span>Confirm & Send on WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
