import "server-only";
import { maskPhone } from "./config";
import { recordEventOnce } from "./events";
import { sendText } from "./send";
import { logMessage, updateMessageStatus } from "./log";
import { deleteEverywhere, detectIntent, hasRecentDeleteRequest, optOutEverywhere } from "./consent";
import { extractCode, findLiveCheckIn, toE164, verifyCode } from "./verify";
import { collectEvents, type WaInbound, type WaStatus, type WaWebhookPayload } from "./types";
import { wa } from "@/messages/whatsapp";

// M1: inbound routing on the shared Dobara number.
//   STOP words → opt out everywhere · DELETE / DELETE YES → erase data
//   verify code → match cafe + table + member (atomic) · anything else → help.
// Runs only after the webhook signature check (route.ts).

type ReplyContext = { businessId?: string | null; customerId?: string | null };

async function reply(to: string, body: string, ctx: ReplyContext = {}) {
  const result = await sendText(to, body);
  if (result.ok) {
    await logMessage({ direction: "out", waMessageId: result.messageId, businessId: ctx.businessId, customerId: ctx.customerId });
  }
}

async function handleText(message: WaInbound) {
  const text = message.text?.body ?? "";
  const phone = toE164(message.from);

  const intent = detectIntent(text);
  if (intent === "stop") {
    await logMessage({ direction: "in", waMessageId: message.id, templateName: "stop" });
    if (phone) await optOutEverywhere(phone);
    await reply(message.from, wa.stopped);
    return;
  }
  if (intent === "delete") {
    await logMessage({ direction: "in", waMessageId: message.id, templateName: "delete_requested" });
    await reply(message.from, wa.deleteConfirm);
    return;
  }
  if (intent === "delete-yes") {
    const confirmed = await hasRecentDeleteRequest(message.from, message.id);
    if (!confirmed) {
      await reply(message.from, wa.deleteConfirm);
      return;
    }
    const removed = phone ? await deleteEverywhere(phone, message.from) : 0;
    await reply(message.from, removed > 0 ? wa.deleted : wa.deleteNothing);
    return;
  }

  const code = extractCode(text);
  if (!code || !phone) {
    await logMessage({ direction: "in", waMessageId: message.id });
    await reply(message.from, wa.help);
    return;
  }

  const outcome = await verifyCode(code, phone, message.profileName);
  await logMessage({ direction: "in", waMessageId: message.id, businessId: outcome.businessId, customerId: outcome.customerId });
  console.info("WhatsApp verify", { from: maskPhone(message.from), status: outcome.status });

  const ctx = { businessId: outcome.businessId, customerId: outcome.customerId };
  const cafe = outcome.cafeName ?? "Dobara";
  switch (outcome.status) {
    case "verified":
      await reply(message.from, wa.verified(cafe, outcome.customerName, outcome.tableCode ?? ""), ctx);
      return;
    case "already":
      await reply(message.from, wa.already(cafe, outcome.tableCode ?? ""), ctx);
      return;
    case "expired":
      await reply(message.from, wa.expired, ctx);
      return;
    default: {
      // Code already used (re-sent message): say so if they're checked in now.
      const live = await findLiveCheckIn(phone);
      await reply(message.from, live ? wa.already(live.cafeName, live.tableCode) : wa.help);
    }
  }
}

async function handleMessage(message: WaInbound) {
  const isNew = await recordEventOnce({ dedupeId: message.id, kind: "message", fromPhone: message.from, payload: message });
  console.info("WhatsApp inbound", { from: maskPhone(message.from), type: message.type, duplicate: !isNew });
  if (!isNew) return; // Meta redelivery — already handled.
  if (message.type !== "text") {
    await logMessage({ direction: "in", waMessageId: message.id });
    return;
  }
  await handleText(message);
}

async function handleStatus(status: WaStatus) {
  const isNew = await recordEventOnce({
    dedupeId: `${status.id}:${status.status}`,
    kind: "status",
    fromPhone: status.recipient_id ?? null,
    payload: status,
  });
  if (isNew) await updateMessageStatus(status.id, status.status);
}

/** Processes every message/status; one failure doesn't stop the rest. */
export async function handleWebhookPayload(payload: WaWebhookPayload): Promise<void> {
  const { messages, statuses } = collectEvents(payload);
  const results = await Promise.allSettled([...messages.map(handleMessage), ...statuses.map(handleStatus)]);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("WhatsApp webhook item failed", { error: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    }
  }
}
