import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { deviceKind } from "@/lib/bots";

// Anonymous scan-page server path (AGENTS.md §5/§13): diners have no JWT, so
// this module uses the service role with tight, explicit queries — every
// query is filtered by the business/table resolved from the URL slug + code.

export const SESSION_TTL_MS = 3 * 60 * 60 * 1000; // 3 h
export const CODE_TTL_MS = 15 * 60 * 1000; // 15 min
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_NEW_MEMBERS_PER_DEVICE = 5;
const MAX_NEW_MEMBERS_PER_IP = 20;
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export type ScanCafe = {
  id: string;
  slug: string;
  display_name: string | null;
  theme: string;
  accent: string | null;
  logo_path: string | null;
  bg_type: "solid" | "image";
  bg_value: string | null;
  bg_image_overlay: number;
  heading_color: string | null;
  tagline_color: string | null;
  tagline: string | null;
};

export type ScanTable = { id: string; code: string; label: string | null };

const CAFE_COLUMNS =
  "id, slug, display_name, theme, accent, logo_path, bg_type, bg_value, bg_image_overlay, heading_color, tagline_color, tagline";

function db() {
  return createAdminClient();
}

/** Resolves an active Dobara cafe + active table from the QR URL (deduped per request). */
export const resolveCafeTable = cache(async function resolveCafeTable(
  slug: string,
  code: string,
): Promise<{ cafe: ScanCafe; table: ScanTable } | null> {
  if (!/^[a-z0-9-]{3,40}$/.test(slug) || !/^[A-Za-z0-9]{1,6}$/.test(code)) return null;
  const supabase = db();
  const { data: cafe } = await supabase
    .from("pages")
    .select(CAFE_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .not("clerk_org_id", "is", null)
    .maybeSingle();
  if (!cafe) return null;

  const { data: table } = await supabase
    .from("tables")
    .select("id, code, label")
    .eq("business_id", (cafe as ScanCafe).id)
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .maybeSingle();
  if (!table) return null;
  return { cafe: cafe as ScanCafe, table: table as ScanTable };
});

export async function logScan(cafeId: string, tableId: string, ua: string | null, referrer: string | null) {
  const { error } = await db()
    .from("scans")
    .insert({ page_id: cafeId, table_id: tableId, device: deviceKind(ua), referrer: referrer?.slice(0, 200) ?? null });
  if (error) console.error("logScan failed", error.message);
}

// ------------------------------------------------------------ device state

/** A prize as the diner may see it. Label/code stay hidden until revealed. */
export type ScanPrize = {
  id: string;
  state: "unscratched" | "active" | "redeemed" | "expired";
  label: string | null; // null while unscratched (outcome stays server-side)
  code: string | null;
  validUntil: string;
  redeemedAt: string | null;
};

type KnownCustomer = { id: string; name: string | null };

export type DeviceState =
  | { kind: "new" }
  | { kind: "returning"; customer: KnownCustomer; prizes: ScanPrize[] }
  | { kind: "checked-in"; customer: KnownCustomer; prizes: ScanPrize[] };

/** The WhatsApp-verified customer this device belongs to at this cafe, if any. */
export async function knownCustomerForDevice(cafeId: string, deviceId: string): Promise<KnownCustomer | null> {
  const supabase = db();
  const { data: member } = await supabase
    .from("session_members")
    .select("customer_id")
    .eq("business_id", cafeId)
    .eq("device_id", deviceId)
    .not("customer_id", "is", null)
    .not("verified_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const customerId = (member as { customer_id: string | null } | null)?.customer_id;
  if (!customerId) return null;
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name")
    .eq("id", customerId)
    .eq("business_id", cafeId)
    .maybeSingle();
  return (customer as { id: string; name: string | null } | null) ?? null;
}

async function findLiveSession(tableId: string): Promise<{ id: string; opened_at: string } | null> {
  const { data } = await db()
    .from("table_sessions")
    .select("id, opened_at")
    .eq("table_id", tableId)
    .in("status", ["open", "billing"])
    .maybeSingle();
  const s = data as { id: string; opened_at: string } | null;
  if (!s) return null;
  if (Date.now() - new Date(s.opened_at).getTime() > SESSION_TTL_MS) {
    // Lazy expiry; cron will also sweep (M2).
    await db()
      .from("table_sessions")
      .update({ status: "expired", closed_at: new Date().toISOString() })
      .eq("id", s.id)
      .in("status", ["open", "billing"]);
    return null;
  }
  return s;
}

const PRIZE_SHOW_DAYS = 7;

/** The diner's recent prizes at this cafe (open ones + recently used/expired). */
export async function prizesForCustomer(cafeId: string, customerId: string): Promise<ScanPrize[]> {
  const since = new Date(Date.now() - PRIZE_SHOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await db()
    .from("prizes")
    .select("id, status, label, code, valid_until, redeemed_at")
    .eq("business_id", cafeId)
    .eq("customer_id", customerId)
    .or(`status.in.(unscratched,active),redeemed_at.gte.${since},valid_until.gte.${since}`)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) {
    console.error("prizesForCustomer failed", error.message);
    return [];
  }
  const now = Date.now();
  return (data ?? []).map((p: { id: string; status: ScanPrize["state"]; label: string; code: string; valid_until: string; redeemed_at: string | null }) => {
    const lapsed = (p.status === "unscratched" || p.status === "active") && new Date(p.valid_until).getTime() < now;
    const state: ScanPrize["state"] = lapsed ? "expired" : p.status;
    const hidden = state === "unscratched";
    return {
      id: p.id,
      state,
      label: hidden ? null : p.label,
      code: hidden ? null : p.code,
      validUntil: p.valid_until,
      redeemedAt: p.redeemed_at,
    };
  });
}

export async function getDeviceState(cafeId: string, tableId: string, deviceId: string | null): Promise<DeviceState> {
  if (!deviceId) return { kind: "new" };
  const [known, session] = await Promise.all([knownCustomerForDevice(cafeId, deviceId), findLiveSession(tableId)]);
  if (!known) return { kind: "new" };

  const [prizes, member] = await Promise.all([
    prizesForCustomer(cafeId, known.id),
    session
      ? db().from("session_members").select("verified_at").eq("session_id", session.id).eq("device_id", deviceId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const checkedIn = Boolean((member.data as { verified_at: string | null } | null)?.verified_at);
  return { kind: checkedIn ? "checked-in" : "returning", customer: known, prizes };
}

/** Reveal (scratch) one of this device's own prizes. Returns what to show. */
export async function revealPrize(input: { prizeId: string; deviceId: string }): Promise<ScanPrize | null> {
  const supabase = db();
  const { data: prize } = await supabase
    .from("prizes")
    .select("id, business_id, customer_id, status, label, code, valid_until, redeemed_at")
    .eq("id", input.prizeId)
    .maybeSingle();
  const p = prize as {
    id: string; business_id: string; customer_id: string; status: ScanPrize["state"];
    label: string; code: string; valid_until: string; redeemed_at: string | null;
  } | null;
  if (!p) return null;

  // Only the customer linked to this signed device at this cafe may reveal it.
  const known = await knownCustomerForDevice(p.business_id, input.deviceId);
  if (!known || known.id !== p.customer_id) return null;

  let state = p.status;
  if (p.status === "unscratched") {
    const { error } = await supabase
      .from("prizes")
      .update({ status: "active", revealed_at: new Date().toISOString() })
      .eq("id", p.id)
      .eq("status", "unscratched");
    if (error) {
      console.error("revealPrize failed", error.message);
      return null;
    }
    state = "active";
  }
  if ((state === "active" || state === "unscratched") && new Date(p.valid_until).getTime() < Date.now()) state = "expired";
  return { id: p.id, state, label: p.label, code: p.code, validUntil: p.valid_until, redeemedAt: p.redeemed_at };
}

/** Diner corrects their own name (device-linked customer at this cafe only). */
export async function setOwnName(input: { cafeId: string; deviceId: string; name: string }): Promise<boolean> {
  const known = await knownCustomerForDevice(input.cafeId, input.deviceId);
  if (!known) return false;
  const name = input.name.trim().slice(0, 40);
  if (name.length < 1) return false;
  const { error } = await db().from("customers").update({ name }).eq("id", known.id).eq("business_id", input.cafeId);
  if (error) console.error("setOwnName failed", error.message);
  return !error;
}

// ---------------------------------------------------------- rate limiting

export async function isRateLimited(deviceId: string, ipHash: string | null): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const supabase = db();
  const [{ count: byDevice }, ipResult] = await Promise.all([
    supabase.from("session_members").select("id", { count: "exact", head: true }).eq("device_id", deviceId).gte("created_at", since),
    ipHash
      ? supabase.from("session_members").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since)
      : Promise.resolve({ count: 0 }),
  ]);
  return (byDevice ?? 0) >= MAX_NEW_MEMBERS_PER_DEVICE || (ipResult.count ?? 0) >= MAX_NEW_MEMBERS_PER_IP;
}

// ------------------------------------------------------- session + codes

function newCode(tableCode: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  let suffix = "";
  for (const b of bytes) suffix += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `${tableCode}-${suffix}`;
}

async function getOrOpenSession(cafeId: string, tableId: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const live = await findLiveSession(tableId);
    if (live) return live.id;
    const { data, error } = await db()
      .from("table_sessions")
      .insert({ business_id: cafeId, table_id: tableId, status: "open" })
      .select("id")
      .single();
    if (!error && data) return (data as { id: string }).id;
    if (error?.code !== "23505") {
      console.error("open session failed", error?.message);
      return null;
    }
    // Another device opened it concurrently — loop and read it.
  }
  return null;
}

export type IssueResult =
  | { kind: "code"; code: string }
  | { kind: "already-verified" }
  | { kind: "error" };

/** Joins (or opens) the table's live session and returns a live verify code for this device. */
export async function joinSessionAndIssueCode(input: {
  cafeId: string;
  table: ScanTable;
  deviceId: string;
  ipHash: string | null;
  wantsOffers: boolean;
}): Promise<IssueResult> {
  const sessionId = await getOrOpenSession(input.cafeId, input.table.id);
  if (!sessionId) return { kind: "error" };
  const supabase = db();

  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: existing } = await supabase
      .from("session_members")
      .select("id, verify_code, verify_expires_at, verified_at")
      .eq("session_id", sessionId)
      .eq("device_id", input.deviceId)
      .maybeSingle();
    const m = existing as
      | { id: string; verify_code: string | null; verify_expires_at: string | null; verified_at: string | null }
      | null;

    if (m?.verified_at) return { kind: "already-verified" };

    const live = m?.verify_code && m.verify_expires_at && new Date(m.verify_expires_at).getTime() > Date.now() + 60_000;
    if (m && live) {
      await supabase.from("session_members").update({ wants_offers: input.wantsOffers }).eq("id", m.id);
      return { kind: "code", code: m.verify_code as string };
    }

    const code = newCode(input.table.code);
    const expires = new Date(Date.now() + CODE_TTL_MS).toISOString();
    const write = m
      ? supabase
          .from("session_members")
          .update({ verify_code: code, verify_expires_at: expires, wants_offers: input.wantsOffers })
          .eq("id", m.id)
      : supabase.from("session_members").insert({
          business_id: input.cafeId,
          session_id: sessionId,
          device_id: input.deviceId,
          verify_code: code,
          verify_expires_at: expires,
          wants_offers: input.wantsOffers,
          ip_hash: input.ipHash,
        });
    const { error } = await write;
    if (!error) return { kind: "code", code };
    if (error.code !== "23505") {
      console.error("issue code failed", error.message);
      return { kind: "error" };
    }
    // Code collision or concurrent insert for this device — retry.
  }
  return { kind: "error" };
}

export type HereResult = { kind: "checked-in" } | { kind: "unknown-device" } | { kind: "error" };

/** Returning, previously WhatsApp-verified device taps "I'm here". */
export async function markHere(input: { cafeId: string; table: ScanTable; deviceId: string; ipHash: string | null }): Promise<HereResult> {
  const known = await knownCustomerForDevice(input.cafeId, input.deviceId);
  if (!known) return { kind: "unknown-device" };

  const sessionId = await getOrOpenSession(input.cafeId, input.table.id);
  if (!sessionId) return { kind: "error" };
  const supabase = db();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("session_members")
    .select("id, verified_at")
    .eq("session_id", sessionId)
    .eq("device_id", input.deviceId)
    .maybeSingle();
  const m = existing as { id: string; verified_at: string | null } | null;
  if (m?.verified_at) return { kind: "checked-in" };

  const { error } = m
    ? await supabase
        .from("session_members")
        .update({ customer_id: known.id, verified_at: now, verify_code: null, verify_expires_at: null })
        .eq("id", m.id)
    : await supabase.from("session_members").insert({
        business_id: input.cafeId,
        session_id: sessionId,
        device_id: input.deviceId,
        customer_id: known.id,
        verified_at: now,
        ip_hash: input.ipHash,
      });

  // 23505 on (session_id, customer_id): this person is already checked in from another phone.
  if (error && error.code !== "23505") {
    console.error("markHere failed", error.message);
    return { kind: "error" };
  }
  if (!error) {
    // Count the visit once per session (migration 0012, idempotent).
    const { error: visitError } = await supabase.rpc("record_visit", { p_customer_id: known.id, p_session_id: sessionId });
    if (visitError) console.error("record_visit failed", visitError.message);
  }
  return { kind: "checked-in" };
}
