import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { DEVICE_COOKIE, hashIp, verifyDeviceCookie } from "@/lib/device";
import { scanMessages } from "@/messages/scan";

// Shared plumbing for the scan-page POST handlers (/api/scan/*).

export type ScanPost = {
  slug: string;
  tableCode: string;
  wantsOffers: boolean;
  deviceId: string | null;
  ipHash: string | null;
  backUrl: string;
};

/** Same-origin form posts only (CSRF guard for the anonymous scan forms). */
export function isSameOrigin(req: NextRequest): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip");
}

export async function readScanPost(req: NextRequest): Promise<ScanPost | null> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return null;
  }
  const slug = String(form.get("business") ?? "").toLowerCase();
  const tableCode = String(form.get("table") ?? "").toUpperCase();
  if (!/^[a-z0-9-]{3,40}$/.test(slug) || !/^[A-Z0-9]{1,6}$/.test(tableCode)) return null;

  return {
    slug,
    tableCode,
    wantsOffers: form.get("offers") === "1",
    deviceId: await verifyDeviceCookie(req.cookies.get(DEVICE_COOKIE)?.value),
    ipHash: await hashIp(clientIp(req)),
    backUrl: `/r/${slug}/t/${tableCode}`,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Tiny standalone HTML page for errors (no app shell, no JS). */
export function scanMessagePage(kind: "error" | "slow", backUrl: string | null, status: number): NextResponse {
  const t = scanMessages();
  const title = kind === "slow" ? t.slowTitle : t.errorTitle;
  const line = kind === "slow" ? t.slowLine : t.errorLine;
  const back = backUrl ? `<p><a href="${escapeHtml(backUrl)}">${escapeHtml(t.back)}</a></p>` : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(
    title,
  )}</title><style>body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;background:#18181a;color:#fff;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}h1{font-size:22px;margin:0 0 8px}p{color:#9a9aa3;margin:0 0 16px}a{display:inline-block;min-height:48px;line-height:48px;padding:0 24px;border-radius:14px;background:#fff;color:#18181a;font-weight:600;text-decoration:none}</style></head><body><main><h1>${escapeHtml(
    title,
  )}</h1><p>${escapeHtml(line)}</p>${back}</main></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export function waLink(text: string): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
