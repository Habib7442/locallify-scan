import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { HubContent } from "@/components/hub/HubContent";
import { getHubPage, getHubLinks } from "./data";

type Props = {
  params: Promise<{ slug: string }>;
};

function detectDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getHubPage(slug);

  if (!page) {
    return { title: "Hub not found" };
  }

  const name = page.display_name || page.slug;
  const description =
    page.tagline || `${name}'s links and contact info — powered by ${SITE_NAME}.`;

  return {
    title: name,
    description,
    alternates: { canonical: `${SITE_URL}/${page.slug}` },
    openGraph: {
      title: name,
      description,
      url: `${SITE_URL}/${page.slug}`,
      siteName: SITE_NAME,
    },
  };
}

export default async function HubPage({ params }: Props) {
  const { slug } = await params;
  const page = await getHubPage(slug);

  if (!page) {
    notFound();
  }

  const links = await getHubLinks(page.id);
  const name = page.display_name || page.slug;

  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const referrer = requestHeaders.get("referer") ?? null;

  after(async () => {
    try {
      const supabase = createAdminClient();
      await supabase.from("scans").insert({
        page_id: page.id,
        link_id: null,
        device: detectDevice(userAgent),
        referrer,
      });
    } catch (err) {
      console.error("Hub view scan log failed", err);
    }
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description: page.tagline || undefined,
    url: `${SITE_URL}/${page.slug}`,
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HubContent page={page} links={links} />
    </div>
  );
}
