import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildMetadata } from "@/lib/seo";
import { DashboardEditor } from "./dashboard-editor";

export const metadata = buildMetadata({
  title: "Dashboard — Locallify Scan",
  description: "Manage your Locallify Scan hub.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select(
      "id, slug, display_name, tagline, logo_path, accent, bg_type, bg_value, bg_image_brightness, bg_image_contrast, bg_image_overlay, theme, heading_font, link_font, heading_color, tagline_color, link_bg_color, link_text_color, active, subscription_status, trial_ends_at"
    )
    .single();

  if (pageError || !page) {
    return (
      <div className="min-h-screen bg-[#18181a] text-white flex items-center justify-center px-4">
        <p className="text-[#a1a1aa]">
          We couldn&apos;t load your hub. Try refreshing, or contact{" "}
          <a href="mailto:hello@locallifyagency.com" className="text-[#54e0ff] hover:underline">
            hello@locallifyagency.com
          </a>
          .
        </p>
      </div>
    );
  }

  const { data: links } = await supabase
    .from("links")
    .select("id, type, label, sub, destination, active, position")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  return <DashboardEditor page={page} initialLinks={links ?? []} />;
}
