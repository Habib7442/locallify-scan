import "server-only";
import { maskPhone } from "./config";
import { recordEventOnce } from "./events";
import { sendText } from "./send";
import { collectEvents, type WaInboundMessage, type WaWebhookPayload } from "./types";

// M0 stub behaviour: record every event once; reply to new text messages so
// we can prove the round trip. Verify codes, STOP and message_log come in M1/M4.

function testReply(message: WaInboundMessage): string {
  const text = (message.text?.body ?? "").slice(0, 100);
  return `Dobara test ✅ We got your message: "${text}"`;
}

async function handleMessage(message: WaInboundMessage) {
  const isNew = await recordEventOnce({
    dedupeId: message.id,
    kind: "message",
    fromPhone: message.from,
    payload: message,
  });
  console.info("WhatsApp inbound", { from: maskPhone(message.from), type: message.type, duplicate: !isNew });
  if (!isNew || message.type !== "text") return;
  await sendText(message.from, testReply(message));
}

/** Processes every message/status; one failure doesn't stop the rest. */
export async function handleWebhookPayload(payload: WaWebhookPayload): Promise<void> {
  const { messages, statuses } = collectEvents(payload);

  const jobs: Promise<unknown>[] = [
    ...messages.map((m) => handleMessage(m)),
    ...statuses.map((s) =>
      recordEventOnce({ dedupeId: `${s.id}:${s.status}`, kind: "status", fromPhone: s.recipient_id ?? null, payload: s }),
    ),
  ];

  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("WhatsApp webhook item failed", { error: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    }
  }
}
