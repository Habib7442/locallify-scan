import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// message_log writes (AGENTS.md §9: log every inbound + outbound message with
// its cost). Webhook path → service role. Failures are logged, never thrown.

type LogEntry = {
  direction: "in" | "out";
  waMessageId: string | null;
  businessId?: string | null;
  customerId?: string | null;
  templateName?: string | null;
  status?: string | null;
};

export async function logMessage(entry: LogEntry): Promise<void> {
  const { error } = await createAdminClient()
    .from("message_log")
    .upsert(
      {
        direction: entry.direction,
        category: "service",
        wa_message_id: entry.waMessageId,
        business_id: entry.businessId ?? null,
        customer_id: entry.customerId ?? null,
        template_name: entry.templateName ?? null,
        status: entry.status ?? (entry.direction === "in" ? "received" : "sent"),
        cost_inr: 0,
      },
      { onConflict: "wa_message_id", ignoreDuplicates: true },
    );
  if (error) console.error("message_log insert failed", error.message);
}

/** Delivery status for an outbound message we logged. */
export async function updateMessageStatus(waMessageId: string, status: string): Promise<void> {
  const { error } = await createAdminClient()
    .from("message_log")
    .update({ status })
    .eq("wa_message_id", waMessageId)
    .eq("direction", "out");
  if (error) console.error("message_log status update failed", error.message);
}
