import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { typeMeta } from "@/lib/link-types";
import { getPublicAssetUrl } from "@/lib/storage";

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

  return (
    <div
      className="min-h-full w-full flex flex-col items-center px-4 py-16 font-sans"
      style={{ backgroundColor: page.bg_type === "solid" ? page.bg_value ?? "#18181a" : "#18181a" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {logoUrl ? (
          <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border border-white/10">
            <Image src={logoUrl} alt={name} fill sizes="80px" unoptimized className="object-cover" />
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold text-[#18181a] mb-4"
            style={{ backgroundColor: page.accent || "#54e0ff" }}
          >
            {initials(name)}
          </div>
        )}

        <h1 className="text-2xl font-semibold text-white mb-1">{name}</h1>
        {page.tagline && <p className="text-[#a1a1aa] text-sm mb-8">{page.tagline}</p>}
        {!page.tagline && <div className="mb-8" />}

        <div className="w-full flex flex-col gap-3">
          {links.length === 0 && <p className="text-[#7a7a83] text-sm">No links added yet.</p>}
          {links.map((link) => {
            const href = linkHref(link.type, link.destination);
            const meta = typeMeta(link.type);
            const TypeIcon = meta.icon;
            const content = (
              <>
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className="inline-flex items-center justify-center size-8 rounded-full shrink-0"
                    style={{ backgroundColor: `${meta.color}1a` }}
                  >
                    <TypeIcon className="size-4" style={{ color: meta.color }} />
                  </span>
                  <span className="flex flex-col items-start text-left min-w-0">
                    <span className="font-medium truncate w-full">{link.label}</span>
                    {link.sub && <span className="text-xs opacity-70 truncate w-full">{link.sub}</span>}
                  </span>
                </span>
                {href && <ExternalLink className="size-4 opacity-70 shrink-0" />}
              </>
            );

            const className =
              "w-full flex items-center justify-between gap-3 rounded-[12px] px-5 py-4 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-2 focus-visible:outline-[#54e0ff] motion-reduce:transition-none";

            return href ? (
              <a key={link.id} href={href} className={className} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={link.id} className={`${className} opacity-60 cursor-default`}>
                {content}
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-[11px] text-[#54545a]">Powered by Locallify Scan</p>
      </div>
    </div>
  );
}
