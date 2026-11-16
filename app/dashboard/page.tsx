import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { provisionSignedInUser } from "@/lib/provisioning";
import { buildMetadata } from "@/lib/seo";
import { DashboardEditor } from "./dashboard-editor";

export const metadata = buildMetadata({
  title: "Dashboard — Locallify Scan",
  description: "Manage your Locallify Scan hub.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  // Always scope to the caller's own page: RLS lets an agency_admin read
  // every page, so an unfiltered single-row read would break for admins.
  const loadOwnPage = () =>
    supabase
      .from("pages")
      .select(
        "id, slug, display_name, tagline, logo_path, accent, bg_type, bg_value, bg_image_brightness, bg_image_contrast, bg_image_overlay, theme, heading_font, link_font, heading_color, tagline_color, link_bg_color, link_text_color, active, subscription_status, trial_ends_at"
      )
      .eq("owner_clerk_id", userId)
      .maybeSingle();

  let { data: page, error: pageError } = await loadOwnPage();

  // Missed signup webhook → create the user's rows now, then reload.
  if (!page && !pageError && (await provisionSignedInUser()).ok) {
    ({ data: page, error: pageError } = await loadOwnPage());
  }

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

  const [{ data: links }, { data: orders }] = await Promise.all([
    supabase
      .from("links")
      .select("id, type, label, sub, destination, active, position")
      .eq("page_id", page.id)
      .order("position", { ascending: true }),
    supabase
      .from("orders")
      .select("id, page_id, owner_clerk_id, status, shipping_address, price, currency, payment_reference, created_at, shipped_at")
      .eq("page_id", page.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardEditor
      page={page}
      initialLinks={links ?? []}
      initialOrders={orders ?? []}
    />
  );
}
