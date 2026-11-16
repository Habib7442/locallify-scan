"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LiveBoardFeedRow } from "@/lib/supabase/dobara-types";

// Live Board data: Supabase Realtime (RLS-scoped by the staff member's Clerk
// JWT) tells us *that* something changed; the masked RPC live_board_feed()
// tells us *what*. Payloads are never trusted for display (AGENTS.md §5).
// The Realtime client refreshes the Clerk token from the accessToken callback
// on every heartbeat, so the board keeps working all day.

export type ConnectionStatus = "connecting" | "live" | "reconnecting";

const FEED_WINDOW_MS = 12 * 60 * 60 * 1000;
const SAFETY_REFETCH_MS = 60_000;
const MAX_BACKOFF_MS = 30_000;

export function useLiveFeed(businessId: string, onArrivals: (rows: LiveBoardFeedRow[]) => void) {
  const supabase = useSupabaseBrowserClient();
  const [rows, setRows] = useState<LiveBoardFeedRow[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const knownVerified = useRef<Set<string> | null>(null); // null until first load (no ding on load)
  const onArrivalsRef = useRef(onArrivals);
  useEffect(() => {
    onArrivalsRef.current = onArrivals;
  }, [onArrivals]);
  const fetchTimer = useRef<number | null>(null);

  const fetchFeed = useCallback(async () => {
    const since = new Date(Date.now() - FEED_WINDOW_MS).toISOString();
    const { data, error } = await supabase.rpc("live_board_feed", { p_since: since });
    if (error) {
      console.error("live_board_feed failed", error.message);
      return;
    }
    const next = (data ?? []) as LiveBoardFeedRow[];

    const verified = next.filter((r) => r.verified_at);
    const seen = knownVerified.current;
    if (seen) {
      const arrivals = verified.filter((r) => !seen.has(r.member_id));
      if (arrivals.length > 0) onArrivalsRef.current(arrivals);
    }
    knownVerified.current = new Set(verified.map((r) => r.member_id));
    setRows(next);
  }, [supabase]);

  // Coalesce bursts of change events into one fetch.
  const scheduleFetch = useCallback(() => {
    if (fetchTimer.current) window.clearTimeout(fetchTimer.current);
    fetchTimer.current = window.setTimeout(() => void fetchFeed(), 150);
  }, [fetchFeed]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let retryTimer: number | null = null;
    let backoff = 1_000;
    let disposed = false;
    let attempt = 0;

    const subscribe = () => {
      if (disposed) return;
      attempt += 1;
      channel = supabase
        .channel(`board:${businessId}:${attempt}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "session_members", filter: `business_id=eq.${businessId}` },
          scheduleFetch,
        )
        .subscribe((s) => {
          if (disposed) return;
          if (s === "SUBSCRIBED") {
            setStatus("live");
            backoff = 1_000;
            void fetchFeed(); // catch anything missed while disconnected
          } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") {
            setStatus("reconnecting");
            const dead = channel;
            channel = null;
            if (dead) void supabase.removeChannel(dead);
            if (retryTimer) window.clearTimeout(retryTimer);
            retryTimer = window.setTimeout(subscribe, backoff);
            backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
          }
        });
    };

    // First load + subscribe on the next tick (keeps state updates out of the effect body).
    const boot = window.setTimeout(() => {
      void fetchFeed();
      subscribe();
    }, 0);

    const interval = window.setInterval(() => void fetchFeed(), SAFETY_REFETCH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchFeed();
    };
    const onOnline = () => void fetchFeed();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      window.clearTimeout(boot);
      window.clearInterval(interval);
      if (retryTimer) window.clearTimeout(retryTimer);
      if (fetchTimer.current) window.clearTimeout(fetchTimer.current);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [businessId, supabase, fetchFeed, scheduleFetch]);

  return { rows, status, refetch: fetchFeed };
}
