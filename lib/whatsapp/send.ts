import "server-only";
import { getWhatsAppConfig, maskPhone } from "./config";

export type SendResult = { ok: true; messageId: string | null } | { ok: false; error: string };

/**
 * Sends a free-form text. Only valid inside the 24-hour service window the
 * customer opened by messaging us; outside it, templates are required.
 */
export async function sendText(to: string, body: string): Promise<SendResult> {
  const { accessToken, phoneNumberId, graphBase } = getWhatsAppConfig();
  try {
    const res = await fetch(`${graphBase}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const message =
        typeof json === "object" && json !== null && "error" in json
          ? JSON.stringify((json as { error: unknown }).error)
          : `HTTP ${res.status}`;
      console.error("WhatsApp send failed", { to: maskPhone(to), status: res.status, error: message });
      return { ok: false, error: message };
    }
    const id =
      typeof json === "object" && json !== null && "messages" in json
        ? ((json as { messages?: { id?: string }[] }).messages?.[0]?.id ?? null)
        : null;
    return { ok: true, messageId: id };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("WhatsApp send threw", { to: maskPhone(to), error });
    return { ok: false, error };
  }
}
