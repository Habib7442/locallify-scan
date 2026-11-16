import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";
import { safeEqual, verifyMetaSignature } from "@/lib/whatsapp/signature";
import { isWaWebhookPayload } from "@/lib/whatsapp/types";
import { handleWebhookPayload } from "@/lib/whatsapp/handle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Meta's one-time webhook verification handshake.
export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token") ?? "";
  const challenge = params.get("hub.challenge") ?? "";

  const { verifyToken } = getWhatsAppConfig();
  if (mode === "subscribe" && safeEqual(token, verifyToken)) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// POST: messages + delivery statuses. Signature is checked on the raw body
// before anything is parsed or trusted (AGENTS.md §13).
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const { appSecret } = getWhatsAppConfig();
  if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"), appSecret)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad JSON", { status: 400 });
  }
  if (!isWaWebhookPayload(body)) {
    return new NextResponse("Ignored", { status: 200 });
  }

  try {
    await handleWebhookPayload(body);
  } catch (err) {
    // Still 200: the event is authentic; retrying won't help and Meta would
    // keep redelivering. Failures are logged for follow-up.
    console.error("WhatsApp webhook handling failed", { error: err instanceof Error ? err.message : String(err) });
  }
  return new NextResponse("OK", { status: 200 });
}
