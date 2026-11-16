"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug";

type ActionResult = { success: boolean; error?: string };

async function getOwnPage(supabase: ReturnType<typeof createServerSupabaseClient>, userId: string) {
  const { data } = await supabase
    .from("pages")
    .select("id, slug")
    .eq("owner_clerk_id", userId)
    .maybeSingle();
  return data;
}

export async function createLink(input: {
  type: string;
  label: string;
  sub: string;
  destination: string;
}): Promise<ActionResult & { id?: string }> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };
  if (!input.label.trim()) return { success: false, error: "Label is required." };

  const supabase = createServerSupabaseClient();
  const page = await getOwnPage(supabase, userId);
  if (!page) return { success: false, error: "No hub found." };

  const { count } = await supabase
    .from("links")
    .select("id", { count: "exact", head: true })
    .eq("page_id", page.id);

  const { data, error } = await supabase
    .from("links")
    .insert({
      page_id: page.id,
      type: input.type,
      label: input.label.trim(),
      sub: input.sub.trim() || null,
      destination: input.destination.trim(),
      position: count ?? 0,
      active: true,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: "Could not create link." };
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function updateLink(
  id: string,
  input: { type?: string; label?: string; sub?: string | null; destination?: string }
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };
  if (input.label !== undefined && !input.label.trim()) {
    return { success: false, error: "Label is required." };
  }

  const supabase = createServerSupabaseClient();
  const patch: Record<string, string | null> = {};
  if (input.type !== undefined) patch.type = input.type;
  if (input.label !== undefined) patch.label = input.label.trim();
  if (input.sub !== undefined) patch.sub = input.sub ? input.sub.trim() || null : null;
  if (input.destination !== undefined) patch.destination = input.destination.trim();

  const { error } = await supabase.from("links").update(patch).eq("id", id);
  if (error) return { success: false, error: "Could not update link." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleLinkActive(id: string, active: boolean): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("links").update({ active }).eq("id", id);
  if (error) return { success: false, error: "Could not update link." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) return { success: false, error: "Could not delete link." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function reorderLink(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const supabase = createServerSupabaseClient();
  const page = await getOwnPage(supabase, userId);
  if (!page) return { success: false, error: "No hub found." };

  const { data: links, error: listError } = await supabase
    .from("links")
    .select("id, position")
    .eq("page_id", page.id)
    .order("position", { ascending: true });

  if (listError || !links) return { success: false, error: "Could not load links." };

  const index = links.findIndex((l) => l.id === id);
  if (index === -1) return { success: false, error: "Link not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= links.length) return { success: true };

  const a = links[index];
  const b = links[swapIndex];

  const [{ error: err1 }, { error: err2 }] = await Promise.all([
    supabase.from("links").update({ position: b.position }).eq("id", a.id),
    supabase.from("links").update({ position: a.position }).eq("id", b.id),
  ]);

  if (err1 || err2) return { success: false, error: "Could not reorder." };
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateSlug(slug: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const formatError = validateSlug(slug);
  if (formatError) return { success: false, error: formatError };

  const supabase = createServerSupabaseClient();
  const { data: collision } = await supabase
    .from("pages")
    .select("owner_clerk_id")
    .eq("slug", slug)
    .maybeSingle();

  if (collision && collision.owner_clerk_id !== userId) {
    return { success: false, error: "That slug is already taken." };
  }

  const { error } = await supabase.from("pages").update({ slug }).eq("owner_clerk_id", userId);
  if (error) return { success: false, error: "Could not update slug." };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateLogoPath(path: string | null): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("pages")
    .update({ logo_path: path })
    .eq("owner_clerk_id", userId);

  if (error) return { success: false, error: "Could not update logo." };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateBranding(input: {
  theme: string;
  accent: string | null;
  headingFont: string;
  linkFont: string;
  bgType: string;
  bgValue: string | null;
  bgImageBrightness: number;
  bgImageContrast: number;
  bgImageOverlay: number;
  headingColor: string | null;
  taglineColor: string | null;
  linkBgColor: string | null;
  linkTextColor: string | null;
}): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("pages")
    .update({
      theme: input.theme,
      accent: input.accent,
      heading_font: input.headingFont,
      link_font: input.linkFont,
      bg_type: input.bgType,
      bg_value: input.bgValue,
      bg_image_brightness: input.bgImageBrightness,
      bg_image_contrast: input.bgImageContrast,
      bg_image_overlay: input.bgImageOverlay,
      heading_color: input.headingColor,
      tagline_color: input.taglineColor,
      link_bg_color: input.linkBgColor,
      link_text_color: input.linkTextColor,
    })
    .eq("owner_clerk_id", userId);

  if (error) return { success: false, error: "Could not save branding." };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfile(input: {
  displayName: string;
  tagline: string;
}): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };
  if (!input.displayName.trim()) return { success: false, error: "Name is required." };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("pages")
    .update({
      display_name: input.displayName.trim(),
      tagline: input.tagline.trim() || null,
    })
    .eq("owner_clerk_id", userId);

  if (error) return { success: false, error: "Could not save profile." };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function setPageActive(active: boolean): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not signed in." };

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("pages").update({ active }).eq("owner_clerk_id", userId);
  if (error) return { success: false, error: "Could not update." };

  revalidatePath("/dashboard");
  return { success: true };
}
