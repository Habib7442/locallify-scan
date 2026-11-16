import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { provisionSignedInUser } from "@/lib/provisioning";
import { buildMetadata } from "@/lib/seo";
import { OnboardingForm } from "./onboarding-form";

export const metadata = buildMetadata({
  title: "Set up your hub — Locallify Scan",
  description: "Claim your link and set up your Locallify Scan hub.",
  path: "/onboarding",
  noIndex: true,
});

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServerSupabaseClient();

  // Scoped to the caller's own page (see app/dashboard/page.tsx).
  const loadOwnPage = () =>
    supabase
      .from("pages")
      .select("slug, display_name, tagline, vertical, onboarded_at")
      .eq("owner_clerk_id", userId)
      .maybeSingle();

  const [ownPage, { data: verticals }] = await Promise.all([
    loadOwnPage(),
    supabase.from("vertical_templates").select("vertical, signature_feature"),
  ]);
  let { data: page, error: pageError } = ownPage;

  // Missed signup webhook → create the user's rows now, then reload.
  if (!page && !pageError && (await provisionSignedInUser()).ok) {
    ({ data: page, error: pageError } = await loadOwnPage());
  }

  if (page?.onboarded_at) {
    redirect("/dashboard");
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <main className="pt-16 sm:pt-24 pb-24 px-4">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
            Set up your hub
          </h1>
          <p className="text-[#a1a1aa] text-[15px] mb-10">
            Claim your link, tell us a bit about your business, and optionally pick a
            starting point.
          </p>

          <OnboardingForm page={page} verticals={verticals ?? []} />
        </div>
      </main>
    </div>
  );
}
