import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DashboardEditor } from "./dashboard-editor";

export const metadata: Metadata = {
  title: "Dashboard — Locallify Scan",
};

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id, slug, display_name, tagline, logo_path, accent, bg_type, bg_value, active")
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
