import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited, joinSessionAndIssueCode, resolveCafeTable } from "@/lib/scan";
import { isSameOrigin, readScanPost, scanMessagePage, waLink } from "@/lib/scan-request";
import { scanMessages } from "@/messages/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// "Verify on WhatsApp": join/open the table session, issue a 15-min code,
// then 303 to WhatsApp with the code prefilled (PRD §7.3).
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return scanMessagePage("error", null, 403);
  const post = await readScanPost(req);
  if (!post) return scanMessagePage("error", null, 400);
  // No valid device cookie (e.g. cookies cleared): reload the scan page, which issues one.
  if (!post.deviceId) return NextResponse.redirect(new URL(post.backUrl, req.url), 303);

  const found = await resolveCafeTable(post.slug, post.tableCode);
  if (!found) return scanMessagePage("error", null, 404);

  if (await isRateLimited(post.deviceId, post.ipHash)) return scanMessagePage("slow", post.backUrl, 429);

  const result = await joinSessionAndIssueCode({
    cafeId: found.cafe.id,
    table: found.table,
    deviceId: post.deviceId,
    ipHash: post.ipHash,
    wantsOffers: post.wantsOffers,
  });

  if (result.kind === "already-verified") return NextResponse.redirect(new URL(post.backUrl, req.url), 303);
  if (result.kind !== "code") return scanMessagePage("error", post.backUrl, 500);

  const text = scanMessages().waMessage(found.cafe.display_name ?? "Cafe", result.code);
  return NextResponse.redirect(waLink(text), 303);
}
