import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Constant-time string comparison that doesn't leak length via early exit. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Verifies Meta's `X-Hub-Signature-256: sha256=<hex>` header against the raw
 * request body. Must run before the body is parsed or trusted.
 */
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const received = header.slice("sha256=".length);
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return safeEqual(received, expected);
}
