"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug";

const KNOWN_VERTICALS = ["restaurant", "clinic"] as const;
type Vertical = (typeof KNOWN_VERTICALS)[number];

export async function checkSlugAvailable(
  slug: string
): Promise<{ available: boolean; reason?: string }> {
  const { userId } = await auth();
  if (!userId) return { available: false, reason: "Not signed in." };

  const formatError = validateSlug(slug);
  if (formatError) return { available: false, reason: formatError };

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pages")
    .select("owner_clerk_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return { available: false, reason: "Could not check availability." };
  if (data && data.owner_clerk_id !== userId) {
    return { available: false, reason: "That slug is already taken." };
  }
  return { available: true };
}

export async function saveOnboarding(input: {
  slug: string;
  displayName: string;
  tagline: string;
  vertical: Vertical | null;
}): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const formatError = validateSlug(input.slug);
  if (formatError) return { success: false, error: formatError };

  if (input.vertical && !KNOWN_VERTICALS.includes(input.vertical)) {
    return { success: false, error: "Unknown vertical." };
  }

  const supabase = createServerSupabaseClient();

  const { data: collision } = await supabase
    .from("pages")
    .select("owner_clerk_id")
    .eq("slug", input.slug)
    .maybeSingle();

  if (collision && collision.owner_clerk_id !== userId) {
    return { success: false, error: "That slug is already taken." };
  }

  const { error: updateError } = await supabase
    .from("pages")
    .update({
      slug: input.slug,
      display_name: input.displayName || null,
      tagline: input.tagline || null,
      vertical: input.vertical,
      onboarded_at: new Date().toISOString(),
    })
    .eq("owner_clerk_id", userId);

  if (updateError) {
    return { success: false, error: "Could not save your changes." };
  }

  if (input.vertical) {
    const pageId = await getOwnPageId(supabase, userId);

    if (pageId) {
      const { count: existingLinksCount } = await supabase
        .from("links")
        .select("id", { count: "exact", head: true })
        .eq("page_id", pageId);

      if (!existingLinksCount) {
        const { data: template } = await supabase
          .from("vertical_templates")
          .select("default_links")
          .eq("vertical", input.vertical)
          .single();

        const defaultLinks = template?.default_links as
          | { type: string; label: string }[]
          | undefined;

        if (defaultLinks?.length) {
          const rows = defaultLinks.map((link, index) => ({
            page_id: pageId,
            type: link.type,
            label: link.label,
            destination: "",
            position: index,
            active: true,
          }));
          await supabase.from("links").insert(rows);
        }
      }
    }
  }

  revalidatePath("/onboarding");
  return { success: true };
}

async function getOwnPageId(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("pages")
    .select("id")
    .eq("owner_clerk_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}
