import { NextResponse, type NextRequest } from "next/server";
import { resolveCafeTable, setOwnName } from "@/lib/scan";
import { isSameOrigin, scanMessagePage } from "@/lib/scan-request";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/device";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diner corrects their own name (option C): only the customer linked to this
// signed device at this cafe. Plain form post → back to the scan page.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return scanMessagePage("error", null, 403);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return scanMessagePage("error", null, 400);
  }
  const slug = String(form.get("business") ?? "").toLowerCase();
  const tableCode = String(form.get("table") ?? "").toUpperCase();
  const name = String(form.get("name") ?? "");
  if (!/^[a-z0-9-]{3,40}$/.test(slug) || !/^[A-Z0-9]{1,6}$/.test(tableCode)) return scanMessagePage("error", null, 400);
  const backUrl = `/r/${slug}/t/${tableCode}`;

  const deviceId = await verifyDeviceCookie(req.cookies.get(DEVICE_COOKIE)?.value);
  const found = await resolveCafeTable(slug, tableCode);
  if (!deviceId || !found) return NextResponse.redirect(new URL(backUrl, req.url), 303);

  await setOwnName({ cafeId: found.cafe.id, deviceId, name });
  return NextResponse.redirect(new URL(backUrl, req.url), 303);
}
