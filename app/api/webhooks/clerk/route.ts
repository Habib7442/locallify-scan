import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionUser } from "@/lib/provisioning";

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

    const result = await provisionUser({ id, email, name });
    if (!result.ok) {
      return new NextResponse(result.error, { status: 500 });
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
