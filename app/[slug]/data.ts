import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getHubPage = cache(async (slug: string) => {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("pages")
    .select(
      "id, slug, display_name, tagline, logo_path, theme, accent, bg_type, bg_value, bg_image_brightness, bg_image_contrast, bg_image_overlay, heading_font, link_font, heading_color, tagline_color, link_bg_color, link_text_color, vertical, active"
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
});

export const getHubLinks = cache(async (pageId: string) => {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("links")
    .select("id, type, label, sub, destination, position")
    .eq("page_id", pageId)
    .eq("active", true)
    .order("position", { ascending: true });
  return data ?? [];
});
