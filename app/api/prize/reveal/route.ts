import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/device";
import { revealPrize } from "@/lib/scan";
import { isSameOrigin } from "@/lib/scan-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Scratch / "Tap to reveal": reveals the stored outcome of this device's own
// prize (never picks one). Same-origin, signed device cookie only.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const deviceId = await verifyDeviceCookie(req.cookies.get(DEVICE_COOKIE)?.value);
  if (!deviceId) return NextResponse.json({ error: "no device" }, { status: 401 });

  let prizeId = "";
  try {
    prizeId = String((await req.formData()).get("prize") ?? "");
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!UUID_RE.test(prizeId)) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const prize = await revealPrize({ prizeId, deviceId });
  if (!prize || !prize.label || !prize.code) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(
    { label: prize.label, code: prize.code, validUntil: prize.validUntil, state: prize.state },
    { headers: { "Cache-Control": "no-store" } },
  );
}
