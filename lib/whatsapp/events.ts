import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Raw webhook inbox (migration 0009). Service role only — this runs inside
// the signature-verified webhook, which has no user JWT (AGENTS.md §13).

type NewEvent = {
  dedupeId: string;
  kind: "message" | "status";
  fromPhone: string | null;
  payload: unknown;
};

/**
 * Records an event once. Returns true if it's new, false if Meta already
 * delivered it (so the caller must not act on it again).
 */
export async function recordEventOnce(event: NewEvent): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whatsapp_webhook_events")
    .upsert(
      {
        wa_message_id: event.dedupeId,
        kind: event.kind,
        from_phone: event.fromPhone,
        payload: event.payload,
      },
      { onConflict: "wa_message_id", ignoreDuplicates: true },
    )
    .select("id");

  if (error) throw new Error(`recordEventOnce failed: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
