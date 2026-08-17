import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { typeMeta } from "@/lib/link-types";
import { getPublicAssetUrl } from "@/lib/storage";
import { fontClassName } from "@/lib/fonts";
import { themeRecipe } from "@/lib/themes";

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

  // A theme's own text/card colours are tuned for that theme's background —
  // not guaranteed to read against an arbitrary uploaded photo. When the
  // background is an image, fall back to fixed high-contrast defaults
  // instead of the theme recipe, unless the user set an explicit override.
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

  return (
    <div
      className="relative min-h-full w-full flex flex-col items-center px-4 py-16 font-sans overflow-hidden"
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
              filter: `brightness(${bgBrightness}%) contrast(${bgContrast}%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${bgOverlay / 100})` }}
          />
        </>
      )}
      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
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
        {!page.tagline && <div className="mb-8" />}

        <div className="w-full flex flex-col gap-3">
          {links.length === 0 && (
            <p className="text-sm" style={{ color: page.tagline_color || defaultTaglineColor }}>
              No links added yet.
            </p>
          )}
          {links.map((link) => {
            const href = linkHref(link.type, link.destination);
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
                {href && <ExternalLink className="size-4 opacity-70 shrink-0" />}
              </>
            );

            const className = `w-full flex items-center justify-between gap-3 ${recipe.radiusClassName} px-5 py-4 border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent motion-reduce:transition-none ${
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
    </div>
  );
}
