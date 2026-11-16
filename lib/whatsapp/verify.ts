import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Matches a verify code via the atomic Postgres function (migration 0012).

const CODE_RE = /\b([A-Z0-9]{1,6}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4})\b/i;

export function extractCode(text: string): string | null {
  const m = CODE_RE.exec(text);
  return m ? m[1]!.toUpperCase() : null;
}

/** WhatsApp `from` ("919876543210") → E.164 ("+919876543210"). */
export function toE164(waFrom: string): string | null {
  const digits = waFrom.replace(/\D/g, "");
  return /^[1-9][0-9]{7,14}$/.test(digits) ? `+${digits}` : null;
}

export type VerifyOutcome = {
  status: "verified" | "already" | "expired" | "not_found";
  businessId: string | null;
  cafeName: string | null;
  tableCode: string | null;
  customerId: string | null;
  customerName: string | null;
};

export async function verifyCode(code: string, phoneE164: string, profileName: string | null): Promise<VerifyOutcome> {
  const { data, error } = await createAdminClient()
    .rpc("verify_member_code", { p_code: code, p_phone_e164: phoneE164, p_profile_name: profileName ?? "" })
    .single();
  if (error || !data) {
    if (error) console.error("verify_member_code failed", error.message);
    return { status: "not_found", businessId: null, cafeName: null, tableCode: null, customerId: null, customerName: null };
  }
  const row = data as {
    status: VerifyOutcome["status"];
    business_id: string | null;
    cafe_name: string | null;
    table_code: string | null;
    customer_id: string | null;
    customer_name: string | null;
  };
  return {
    status: row.status,
    businessId: row.business_id,
    cafeName: row.cafe_name,
    tableCode: row.table_code,
    customerId: row.customer_id,
    customerName: row.customer_name,
  };
}

/**
 * For a code that's already been used: is this phone checked in to a live
 * session right now? Lets a re-sent message get "already checked in"
 * instead of the generic help reply.
 */
export async function findLiveCheckIn(phoneE164: string): Promise<{ cafeName: string; tableCode: string } | null> {
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const { data, error } = await createAdminClient()
    .from("session_members")
    .select("verified_at, customers!inner(phone_e164), table_sessions!inner(status, tables(code)), pages(display_name)")
    .eq("customers.phone_e164", phoneE164)
    .in("table_sessions.status", ["open", "billing"])
    .gte("verified_at", since)
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("findLiveCheckIn failed", error.message);
    return null;
  }
  const row = data as {
    table_sessions: { tables: { code: string } | null } | null;
    pages: { display_name: string | null } | null;
  } | null;
  const tableCode = row?.table_sessions?.tables?.code;
  if (!row || !tableCode) return null;
  return { cafeName: row.pages?.display_name ?? "Dobara", tableCode };
}
