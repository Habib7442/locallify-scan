import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited, markHere, resolveCafeTable } from "@/lib/scan";
import { isSameOrigin, readScanPost, scanMessagePage } from "@/lib/scan-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "I'm here": a returning, previously WhatsApp-verified device checks in
// with one tap (PRD §7.2). Unknown devices are sent back to verify.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return scanMessagePage("error", null, 403);
  const post = await readScanPost(req);
  if (!post) return scanMessagePage("error", null, 400);
  if (!post.deviceId) return NextResponse.redirect(new URL(post.backUrl, req.url), 303);

  const found = await resolveCafeTable(post.slug, post.tableCode);
  if (!found) return scanMessagePage("error", null, 404);

  if (await isRateLimited(post.deviceId, post.ipHash)) return scanMessagePage("slow", post.backUrl, 429);

  const result = await markHere({ cafeId: found.cafe.id, table: found.table, deviceId: post.deviceId, ipHash: post.ipHash });
  if (result.kind === "error") return scanMessagePage("error", post.backUrl, 500);
  return NextResponse.redirect(new URL(post.backUrl, req.url), 303);
}
