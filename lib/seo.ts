import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og_image.png`,
  width: 1729,
  height: 910,
  alt: SITE_NAME,
};

// Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION once you have a code from
// https://search.google.com/search-console — leave unset until then;
// buildMetadata()/the root layout only add the verification tag when present.
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

// Site-wide defaults, prepended to every page's own keywords below.
const DEFAULT_KEYWORDS = [
  "Dobara by Locallify",
  "Locallify",
  "QR code for restaurants",
  "restaurant customer loyalty",
  "WhatsApp for restaurants",
];

export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords: [...new Set([...keywords, ...DEFAULT_KEYWORDS])],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
