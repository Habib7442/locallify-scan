// Row types for the Dobara M1 tables (migration 0010). Hand-written to match
// supabase/migrations/0010_dobara_m1_core.sql — keep in sync.

export type BusinessId = string; // public.pages.id

export type TableRow = {
  id: string;
  business_id: BusinessId;
  code: string; // "T4"
  label: string | null;
  is_active: boolean;
  created_at: string;
};

export type Language = "en" | "hi" | "bn";

export type CustomerRow = {
  id: string;
  business_id: BusinessId;
  phone_e164: string; // owners / service role only — never sent to staff
  name: string | null;
  birthday: string | null;
  language: Language;
  opted_in: boolean;
  opted_in_at: string | null;
  opted_out_at: string | null;
  notes: string | null;
  visit_count: number;
  last_visit_at: string | null;
  created_at: string;
};

export type SessionStatus = "open" | "billing" | "closed" | "expired";

export type TableSessionRow = {
  id: string;
  business_id: BusinessId;
  table_id: string;
  declared_size: number | null;
  status: SessionStatus;
  bill_amount: number | null;
  opened_at: string;
  closed_at: string | null;
  closed_by: string | null;
};

export type SessionMemberRow = {
  id: string;
  business_id: BusinessId;
  session_id: string;
  customer_id: string | null;
  device_id: string;
  verify_code: string | null; // service role only
  verify_expires_at: string | null;
  verified_at: string | null;
  wants_offers: boolean; // offers tick before verification (0011); copied to customers on verify
  ip_hash: string | null; // hashed, rate limiting only (0011)
  created_at: string;
};

export type MessageLogRow = {
  id: string;
  business_id: BusinessId | null;
  customer_id: string | null;
  direction: "in" | "out";
  category: "service" | "utility" | "marketing" | "authentication" | null;
  template_name: string | null;
  wa_message_id: string | null;
  status: string | null;
  cost_inr: number | null;
  created_at: string;
};

/** Row returned by public.live_board_feed() — phone already masked. */
export type LiveBoardFeedRow = {
  member_id: string;
  session_id: string;
  session_status: SessionStatus;
  table_code: string;
  table_label: string | null;
  joined_at: string;
  verified_at: string | null;
  customer_id: string | null;
  customer_name: string | null;
  phone_last4: string | null;
  visit_count: number | null;
  last_visit_at: string | null;
  notes: string | null;
};
