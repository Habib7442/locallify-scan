"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Clock, ExternalLink, Smartphone } from "lucide-react";
import { HubContent, type HubContentLink } from "@/components/hub/HubContent";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LinksTab, type EditorLink } from "./links-tab";
import { SettingsTab } from "./settings-tab";
import { BrandingTab } from "./branding-tab";
import { QrTab } from "./qr-tab";

const TAB_LABELS = {
  links: { full: "Links", short: "Links" },
  branding: { full: "Branding", short: "Brand" },
  share: { full: "Share & QR", short: "QR" },
  settings: { full: "Settings", short: "Settings" },
} as const;

type PageData = {
  id: string;
  slug: string;
  display_name: string | null;
  tagline: string | null;
  logo_path: string | null;
  accent: string | null;
  bg_type: string;
  bg_value: string | null;
  bg_image_brightness: number;
  bg_image_contrast: number;
  bg_image_overlay: number;
  theme: string;
  heading_font: string;
  link_font: string;
  heading_color: string | null;
  tagline_color: string | null;
  link_bg_color: string | null;
  link_text_color: string | null;
  active: boolean;
  subscription_status: string;
  trial_ends_at: string;
};

export function DashboardEditor({
  page,
  initialLinks,
}: {
  page: PageData;
  initialLinks: EditorLink[];
}) {
  const [tab, setTab] = useState<"links" | "branding" | "share" | "settings">("links");
  const [links, setLinks] = useState<EditorLink[]>(initialLinks);
  const [slug, setSlug] = useState(page.slug);
  const [active, setActive] = useState(page.active);
  const [logoPath, setLogoPath] = useState(page.logo_path);
  const [displayName, setDisplayName] = useState(page.display_name ?? "");
  const [tagline, setTagline] = useState(page.tagline ?? "");
  const [theme, setTheme] = useState(page.theme);
  const [accent, setAccent] = useState<string | null>(page.accent);
  const [headingFont, setHeadingFont] = useState(page.heading_font);
  const [linkFont, setLinkFont] = useState(page.link_font);
  const [bgType, setBgType] = useState(page.bg_type);
  const [bgValue, setBgValue] = useState(page.bg_value);
  const [bgImageBrightness, setBgImageBrightness] = useState(page.bg_image_brightness);
  const [bgImageContrast, setBgImageContrast] = useState(page.bg_image_contrast);
  const [bgImageOverlay, setBgImageOverlay] = useState(page.bg_image_overlay);
  const [headingColor, setHeadingColor] = useState(page.heading_color);
  const [taglineColor, setTaglineColor] = useState(page.tagline_color);
  const [linkBgColor, setLinkBgColor] = useState(page.link_bg_color);
  const [linkTextColor, setLinkTextColor] = useState(page.link_text_color);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [now] = useState(() => Date.now());

  const previewLinks: HubContentLink[] = links
    .filter((l) => l.active)
    .sort((a, b) => a.position - b.position)
    .map((l) => ({ id: l.id, type: l.type, label: l.label, sub: l.sub, destination: l.destination }));

  const trialDaysLeft =
    page.subscription_status === "trialing"
      ? Math.ceil((new Date(page.trial_ends_at).getTime() - now) / (1000 * 60 * 60 * 24))
      : null;

  const trialMessage =
    trialDaysLeft === null
      ? null
      : trialDaysLeft > 1
        ? `Free trial — ${trialDaysLeft} days left`
        : trialDaysLeft === 1
          ? "Free trial — 1 day left"
          : trialDaysLeft === 0
            ? "Free trial ends today"
            : "Your free trial has ended";

  const phonePreview = (
    <div className="relative rounded-[36px] border-4 border-[#33373b] bg-[#0f0f11] p-1.5 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-[#33373b] z-10" />
      <div className="rounded-[28px] overflow-hidden h-[600px] overflow-y-auto scrollbar-hide">
        <HubContent
          page={{
            slug,
            display_name: displayName,
            tagline,
            logo_path: logoPath,
            accent,
            bg_type: bgType,
            bg_value: bgValue,
            bg_image_brightness: bgImageBrightness,
            bg_image_contrast: bgImageContrast,
            bg_image_overlay: bgImageOverlay,
            theme,
            heading_font: headingFont,
            link_font: linkFont,
            heading_color: headingColor,
            tagline_color: taglineColor,
            link_bg_color: linkBgColor,
            link_text_color: linkTextColor,
          }}
          links={previewLinks}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#18181a] text-white font-sans relative">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(900px,100vw)] h-[400px] -z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(84,224,255,0.08), transparent 70%)",
        }}
      />
      <header className="relative border-b border-[#33373b] bg-[#18181a]/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/logo-icon.png" alt="" fill sizes="32px" className="object-contain" />
            </div>
            <span className="text-white text-[15px] font-medium tracking-[-0.39px] hidden sm:inline">
              Locallify Scan
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/pricing"
              className="text-sm text-[#7a7a83] hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      {trialMessage && (
        <div className="relative border-b border-[#54e0ff]/20 bg-[#54e0ff]/5">
          <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#54e0ff]">
              <Clock className="size-3.5" />
              {trialMessage}
            </span>
            <Link
              href="/pricing"
              className="text-[13px] font-medium text-white hover:underline shrink-0"
            >
              View plans
            </Link>
          </div>
        </div>
      )}

      <main className="relative pt-10 sm:pt-16 pb-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.02em] text-white mb-1">
                Dashboard
              </h1>
              <Link
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#54e0ff] hover:underline"
              >
                scan.locallifyagency.com/{slug}
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setShowPreviewMobile(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-[10px] border border-[#33373b] px-3 py-2 text-sm text-[#a1a1aa] cursor-pointer"
            >
              <Smartphone className="size-4" />
              Show preview
            </button>
          </div>

          <div className="flex gap-1 mb-8 p-1 rounded-[12px] bg-white/[0.03] border border-[#33373b] w-full sm:w-fit overflow-x-auto">
            {(["links", "branding", "share", "settings"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3 sm:px-5 py-2 text-sm font-medium rounded-[9px] transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  tab === t
                    ? "bg-[#54e0ff] text-[#18181a]"
                    : "text-[#7a7a83] hover:text-white"
                }`}
              >
                <span className="sm:hidden">{TAB_LABELS[t].short}</span>
                <span className="hidden sm:inline">{TAB_LABELS[t].full}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            <div>
              {tab === "links" && <LinksTab links={links} onLinksChange={setLinks} />}
              {tab === "branding" && (
                <BrandingTab
                  logoPath={logoPath}
                  onLogoPathChange={setLogoPath}
                  displayName={displayName || slug}
                  theme={theme}
                  accent={accent}
                  headingFont={headingFont}
                  linkFont={linkFont}
                  bgType={bgType}
                  bgValue={bgValue}
                  bgImageBrightness={bgImageBrightness}
                  bgImageContrast={bgImageContrast}
                  bgImageOverlay={bgImageOverlay}
                  headingColor={headingColor}
                  taglineColor={taglineColor}
                  linkBgColor={linkBgColor}
                  linkTextColor={linkTextColor}
                  onBrandingChange={(patch) => {
                    if (patch.theme !== undefined) setTheme(patch.theme);
                    if (patch.accent !== undefined) setAccent(patch.accent);
                    if (patch.headingFont !== undefined) setHeadingFont(patch.headingFont);
                    if (patch.linkFont !== undefined) setLinkFont(patch.linkFont);
                    if (patch.bgType !== undefined) setBgType(patch.bgType);
                    if (patch.bgValue !== undefined) setBgValue(patch.bgValue);
                    if (patch.bgImageBrightness !== undefined) setBgImageBrightness(patch.bgImageBrightness);
                    if (patch.bgImageContrast !== undefined) setBgImageContrast(patch.bgImageContrast);
                    if (patch.bgImageOverlay !== undefined) setBgImageOverlay(patch.bgImageOverlay);
                    if (patch.headingColor !== undefined) setHeadingColor(patch.headingColor);
                    if (patch.taglineColor !== undefined) setTaglineColor(patch.taglineColor);
                    if (patch.linkBgColor !== undefined) setLinkBgColor(patch.linkBgColor);
                    if (patch.linkTextColor !== undefined) setLinkTextColor(patch.linkTextColor);
                  }}
                />
              )}
              {tab === "share" && <QrTab slug={slug} logoPath={logoPath} accent={accent} />}
              {tab === "settings" && (
                <SettingsTab
                  savedSlug={slug}
                  active={active}
                  displayName={displayName}
                  tagline={tagline}
                  onSlugSaved={setSlug}
                  onActiveChange={setActive}
                  onProfileChange={(patch) => {
                    if (patch.displayName !== undefined) setDisplayName(patch.displayName);
                    if (patch.tagline !== undefined) setTagline(patch.tagline);
                  }}
                />
              )}
            </div>

            <div className="hidden lg:block">
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7a7a83] mb-3">
                  Live preview
                </p>
                <div className="mx-auto w-full max-w-[320px]">{phonePreview}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showPreviewMobile} onOpenChange={setShowPreviewMobile}>
        <DialogContent className="bg-[#18181a] border border-[#33373b] p-5 max-w-[360px] lg:hidden" showCloseButton>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7a7a83] mb-3">
            Live preview
          </p>
          <div className="mx-auto w-full max-w-[320px]">{phonePreview}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
