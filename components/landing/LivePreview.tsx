import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { HubContent, initials } from "@/components/hub/HubContent";
import { getHubPage, getHubLinks } from "@/app/[slug]/data";
import { getPublicAssetUrl } from "@/lib/storage";

const DEMO_SLUG = "habib";

export async function LivePreview() {
  const page = await getHubPage(DEMO_SLUG);
  const links = page ? await getHubLinks(page.id) : [];

  if (!page) return null;

  const name = page.display_name || page.slug;
  const photoUrl = getPublicAssetUrl(page.logo_path);
  const accent = page.accent || "#54e0ff";

  return (
    <section id="live-preview" className="pt-10 sm:pt-14 pb-20 sm:pb-28 px-4 bg-[#18181a]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 text-balance text-center">
            See it in action
          </h2>
          <p className="text-[#7a7a83] max-w-xl text-center text-sm sm:text-base">
            A live look at what a customer sees, and how you manage it.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-3xl w-full items-stretch">
            {/* Photo card */}
            <div className="relative rounded-[28px] overflow-hidden shadow-[0px_20px_50px_rgba(0,0,0,0.35)] min-h-[420px] sm:min-h-[560px]">
              {photoUrl ? (
                <Image src={photoUrl} alt={name} fill unoptimized className="object-cover" />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center text-8xl font-semibold text-[#18181a]"
                  style={{ backgroundColor: accent }}
                >
                  {initials(name)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <span className="inline-flex items-center gap-1.5 mb-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#18181a]">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
                  </span>
                  Live hub
                </span>
                <h3 className="text-white text-2xl font-bold leading-tight text-balance">{name}</h3>
                {page.tagline && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">{page.tagline}</p>
                )}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[320px]">
                <div className="relative rounded-[36px] border-4 border-[#33373b] bg-[#0f0f11] p-1.5 shadow-[0px_20px_50px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-[#33373b] z-10" />
                  <div className="rounded-[28px] overflow-hidden h-[600px] overflow-y-auto scrollbar-hide">
                    <HubContent
                      page={{
                        slug: page.slug,
                        display_name: page.display_name,
                        tagline: page.tagline,
                        logo_path: page.logo_path,
                        accent: page.accent,
                        bg_type: page.bg_type,
                        bg_value: page.bg_value,
                        bg_image_brightness: page.bg_image_brightness,
                        bg_image_contrast: page.bg_image_contrast,
                        bg_image_overlay: page.bg_image_overlay,
                        theme: page.theme,
                        heading_font: page.heading_font,
                        link_font: page.link_font,
                        heading_color: page.heading_color,
                        tagline_color: page.tagline_color,
                        link_bg_color: page.link_bg_color,
                        link_text_color: page.link_text_color,
                      }}
                      links={links}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link
            href={`/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-[#54e0ff] hover:underline"
          >
            Visit this hub live
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
