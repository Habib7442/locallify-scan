import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  seed: string,
) {
  const base = slugify(seed) || "hub";
  let slug = base;
  let suffix = 0;

  while (true) {
    const { data } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new NextResponse("Verification failed", { status: 400 });
  }

  const supabase = createAdminClient();

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address ?? null;
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || null;

    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .select("id")
      .eq("name", "Locallify")
      .single();

    if (agencyError || !agency) {
      console.error("Clerk webhook: seeded Locallify agency not found", agencyError);
      return new NextResponse("Agency not configured", { status: 500 });
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { clerk_user_id: id, agency_id: agency.id, role: "user", name, email },
        { onConflict: "clerk_user_id" },
      );

    if (profileError) {
      console.error("Clerk webhook: failed to upsert profile", profileError);
      return new NextResponse("Failed to create profile", { status: 500 });
    }

    const { data: existingPage } = await supabase
      .from("pages")
      .select("id")
      .eq("owner_clerk_id", id)
      .maybeSingle();

    if (!existingPage) {
      const slug = await generateUniqueSlug(supabase, name || email || id);
      const { error: pageError } = await supabase.from("pages").insert({
        agency_id: agency.id,
        owner_clerk_id: id,
        slug,
        display_name: name || "My Hub",
        theme: "dark",
        bg_type: "solid",
        bg_value: "#18181a",
        active: true,
        subscription_status: "trialing",
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (pageError) {
        console.error("Clerk webhook: failed to create page", pageError);
        return new NextResponse("Failed to create page", { status: 500 });
      }
    }
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address ?? null;
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim() || null;

    const { error } = await supabase
      .from("profiles")
      .update({ name, email })
      .eq("clerk_user_id", id);

    if (error) {
      console.error("Clerk webhook: failed to update profile", error);
      return new NextResponse("Failed to update profile", { status: 500 });
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      const { error } = await supabase.from("profiles").delete().eq("clerk_user_id", id);
      if (error) {
        if (error.code === "23503") {
          // Profile still owns a page/order. By design (AGENTS.md §13) we
          // don't cascade-delete a user's hub/order history on account
          // deletion, so the profile row is left in place rather than
          // treating this as a failure — retrying wouldn't change the
          // outcome since the FK constraint would fail again.
          console.warn(
            "Clerk webhook: left profile in place on user.deleted (still referenced by pages/orders)",
            { clerk_user_id: id },
          );
        } else {
          console.error("Clerk webhook: failed to delete profile", error);
          return new NextResponse("Failed to delete profile", { status: 500 });
        }
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}
