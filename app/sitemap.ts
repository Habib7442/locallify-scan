import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

const STATIC_ROUTES = [
  "",
  "/pricing",
  "/privacy-policy",
  "/terms",
  "/shipping-policy",
  "/refund-policy",
  "/contact-us",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("active", true);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const hubEntries: MetadataRoute.Sitemap = (pages ?? []).map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
  }));

  return [...staticEntries, ...hubEntries];
}
