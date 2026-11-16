import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// STOP + DELETE on the shared Dobara number (AGENTS.md §9, §11).
// The shared number can't tell which cafe a STOP/DELETE is about, so both
// apply to every cafe this phone is a customer of.

const STOP_WORDS = new Set(["stop", "band karo", "bandkaro", "unsubscribe", "बंद करो", "बंद"]);
const DELETE_WINDOW_MS = 10 * 60 * 1000;

export type Intent = "stop" | "delete" | "delete-yes" | null;

export function detectIntent(text: string): Intent {
  const t = text.trim().toLowerCase().replace(/[.!]+$/g, "").replace(/\s+/g, " ");
  if (STOP_WORDS.has(t)) return "stop";
  if (t === "delete") return "delete";
  if (t === "delete yes") return "delete-yes";
  return null;
}

/** Opt out of offers from every cafe. Returns how many customer rows changed. */
export async function optOutEverywhere(phoneE164: string): Promise<number> {
  const { data, error } = await createAdminClient()
    .from("customers")
    .update({ opted_in: false, opted_out_at: new Date().toISOString() })
    .eq("phone_e164", phoneE164)
    .select("id");
  if (error) {
    console.error("opt-out failed", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/** True if this phone sent "DELETE" in the last 10 minutes (raw inbox, no extra table). */
export async function hasRecentDeleteRequest(waFrom: string, excludeMessageId: string): Promise<boolean> {
  const since = new Date(Date.now() - DELETE_WINDOW_MS).toISOString();
  const { data, error } = await createAdminClient()
    .from("whatsapp_webhook_events")
    .select("wa_message_id, payload")
    .eq("kind", "message")
    .eq("from_phone", waFrom)
    .gte("received_at", since)
    .neq("wa_message_id", excludeMessageId)
    .order("received_at", { ascending: false })
    .limit(10);
  if (error) {
    console.error("delete lookup failed", error.message);
    return false;
  }
  return (data ?? []).some((row) => {
    const body = (row.payload as { text?: { body?: unknown } } | null)?.text?.body;
    return typeof body === "string" && detectIntent(body) === "delete";
  });
}

/** Erase this phone's personal data from every cafe. Returns rows deleted. */
export async function deleteEverywhere(phoneE164: string, waFrom: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("customers").delete().eq("phone_e164", phoneE164).select("id");
  if (error) {
    console.error("delete customers failed", error.message);
    return 0;
  }
  // Raw inbox: drop the phone number and message bodies for this sender.
  const { error: inboxError } = await supabase
    .from("whatsapp_webhook_events")
    .update({ from_phone: null, payload: { redacted: true } })
    .eq("from_phone", waFrom);
  if (inboxError) console.error("redact inbox failed", inboxError.message);
  return data?.length ?? 0;
}
