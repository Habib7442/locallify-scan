"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Smartphone } from "lucide-react";
import { HubContent, type HubContentLink } from "@/components/hub/HubContent";
import { LinksTab, type EditorLink } from "./links-tab";
import { SettingsTab } from "./settings-tab";
import { BrandingTab } from "./branding-tab";

type PageData = {
  id: string;
  slug: string;
  display_name: string | null;
  tagline: string | null;
  logo_path: string | null;
  accent: string | null;
  bg_type: string;
  bg_value: string | null;
  active: boolean;
};

export function DashboardEditor({
  page,
  initialLinks,
}: {
  page: PageData;
  initialLinks: EditorLink[];
}) {
  const [tab, setTab] = useState<"links" | "branding" | "settings">("links");
  const [links, setLinks] = useState<EditorLink[]>(initialLinks);
  const [slug, setSlug] = useState(page.slug);
  const [active, setActive] = useState(page.active);
  const [logoPath, setLogoPath] = useState(page.logo_path);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  const previewLinks: HubContentLink[] = links
    .filter((l) => l.active)
    .sort((a, b) => a.position - b.position)
    .map((l) => ({ id: l.id, type: l.type, label: l.label, sub: l.sub, destination: l.destination }));

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans relative">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] -z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(84,224,255,0.08), transparent 70%)",
        }}
      />
      <main className="relative pt-16 sm:pt-24 pb-24 px-4">
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
              onClick={() => setShowPreviewMobile((v) => !v)}
              className="sm:hidden inline-flex items-center gap-2 rounded-[10px] border border-[#33373b] px-3 py-2 text-sm text-[#a1a1aa] cursor-pointer"
            >
              <Smartphone className="size-4" />
              {showPreviewMobile ? "Hide preview" : "Show preview"}
            </button>
          </div>

          <div className="flex gap-1 mb-8 p-1 rounded-[12px] bg-white/[0.03] border border-[#33373b] w-fit">
            {(["links", "branding", "settings"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-5 py-2 text-sm font-medium capitalize rounded-[9px] transition-all cursor-pointer ${
                  tab === t
                    ? "bg-[#54e0ff] text-[#18181a]"
                    : "text-[#7a7a83] hover:text-white"
                }`}
              >
                {t}
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
                  displayName={page.display_name || slug}
                />
              )}
              {tab === "settings" && (
                <SettingsTab savedSlug={slug} active={active} onSlugSaved={setSlug} onActiveChange={setActive} />
              )}
            </div>

            <div className={`${showPreviewMobile ? "block" : "hidden"} lg:block`}>
              <div className="lg:sticky lg:top-24">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7a7a83] mb-3">
                  Live preview
                </p>
                <div className="mx-auto w-full max-w-[320px]">
                  <div className="relative rounded-[36px] border-4 border-[#33373b] bg-[#0f0f11] p-1.5 shadow-[0px_20px_50px_rgba(0,0,0,0.45)]">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-[#33373b] z-10" />
                    <div className="rounded-[28px] overflow-hidden h-[600px] overflow-y-auto scrollbar-hide">
                      <HubContent
                        page={{
                          slug,
                          display_name: page.display_name,
                          tagline: page.tagline,
                          logo_path: logoPath,
                          accent: page.accent,
                          bg_type: page.bg_type,
                          bg_value: page.bg_value,
                        }}
                        links={previewLinks}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
