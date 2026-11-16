import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Add routes here as the new UI is rebuilt.
const STATIC_ROUTES = ["", "/privacy-policy", "/terms", "/refund-policy", "/contact-us"];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
