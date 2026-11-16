// Narrow shapes for the parts of the WhatsApp webhook payload we read.
// Anything else in the payload is kept as-is in the raw events table.

export type WaInboundMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};

export type WaStatus = {
  id: string;
  status: string;
  recipient_id?: string;
  timestamp?: string;
};

export type WaChangeValue = {
  messaging_product?: string;
  metadata?: { display_phone_number?: string; phone_number_id?: string };
  messages?: WaInboundMessage[];
  statuses?: WaStatus[];
};

export type WaWebhookPayload = {
  object: string;
  entry?: { id: string; changes?: { field: string; value: WaChangeValue }[] }[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isWaWebhookPayload(value: unknown): value is WaWebhookPayload {
  return isObject(value) && value.object === "whatsapp_business_account";
}

/** Flattens entries → changes into the message/status lists we act on. */
export function collectEvents(payload: WaWebhookPayload) {
  const messages: WaInboundMessage[] = [];
  const statuses: WaStatus[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages" || !isObject(change.value)) continue;
      for (const m of change.value.messages ?? []) {
        if (isObject(m) && typeof m.id === "string" && typeof m.from === "string") messages.push(m);
      }
      for (const s of change.value.statuses ?? []) {
        if (isObject(s) && typeof s.id === "string" && typeof s.status === "string") statuses.push(s);
      }
    }
  }
  return { messages, statuses };
}
