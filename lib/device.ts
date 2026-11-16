import "server-only";

// Signed, httpOnly device cookie that identifies a diner's phone (AGENTS.md §5).
// Value: "<id>.<signature>", id = 16 random bytes (base64url), signature =
// HMAC-SHA256(id, DEVICE_COOKIE_SECRET) (base64url). Web Crypto, so it works
// in proxy.ts and in route handlers alike.

export const DEVICE_COOKIE = "dobara_device";
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

const encoder = new TextEncoder();
let keyPromise: Promise<CryptoKey> | null = null;

function getKey(): Promise<CryptoKey> {
  const secret = process.env.DEVICE_COOKIE_SECRET;
  if (!secret || secret.length < 32) throw new Error("DEVICE_COOKIE_SECRET missing or too short");
  keyPromise ??= crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
  return keyPromise;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array<ArrayBuffer> | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const out = new Uint8Array(new ArrayBuffer(bin.length));
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

const ID_RE = /^[A-Za-z0-9_-]{22}$/;

/** Creates a new signed cookie value. */
export async function newDeviceCookie(): Promise<{ deviceId: string; value: string }> {
  const deviceId = toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const sig = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(deviceId));
  return { deviceId, value: `${deviceId}.${toBase64Url(sig)}` };
}

/** Returns the device id if the cookie value is authentic, else null. Constant-time (crypto.subtle.verify). */
export async function verifyDeviceCookie(value: string | undefined | null): Promise<string | null> {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot <= 0) return null;
  const deviceId = value.slice(0, dot);
  if (!ID_RE.test(deviceId)) return null;
  const sig = fromBase64Url(value.slice(dot + 1));
  if (!sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await getKey(), sig, encoder.encode(deviceId));
  return ok ? deviceId : null;
}

/** sha256(ip + secret), first 32 hex chars — for rate limiting; raw IP never stored. */
export async function hashIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  const secret = process.env.DEVICE_COOKIE_SECRET ?? "";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${ip}|${secret}`));
  return toBase64Url(digest).slice(0, 32);
}

export const deviceCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DEVICE_COOKIE_MAX_AGE,
};
