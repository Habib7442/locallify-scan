"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Volume2, VolumeX } from "lucide-react";
import { board as copy } from "@/content/board";
import { btn, focusRing } from "@/components/landing/primitives";
import type { LiveBoardFeedRow } from "@/lib/supabase/dobara-types";
import { useLiveFeed, type ConnectionStatus } from "./useLiveFeed";
import { armChime, playChime } from "./chime";
import { NoteSheet } from "./NoteSheet";

const FLASH_MS = 10_000;
const SOUND_KEY = "dobara.board.sound";

type WakeLockSentinelLike = { release: () => Promise<void> };

function readSoundPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true; // Storage blocked — default to sound on.
  }
}

function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

function StatusPill({ status }: { status: ConnectionStatus }) {
  const live = status === "live";
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[14px] ${
        live ? "border-green-400/30 text-green-400" : "border-amber-300/30 text-amber-300"
      }`}
    >
      <span className={`size-2 rounded-full ${live ? "bg-green-400" : "animate-pulse bg-amber-300"}`} aria-hidden />
      {live ? copy.live : status === "connecting" ? copy.connecting : copy.reconnecting}
    </span>
  );
}

export function LiveBoard({ businessId, cafeName }: { businessId: string; cafeName: string }) {
  const [started, setStarted] = useState(false);
  const [sound, setSound] = useState(readSoundPref);
  const [flash, setFlash] = useState<Set<string>>(() => new Set());
  const [now, setNow] = useState(() => Date.now());
  const [noteFor, setNoteFor] = useState<LiveBoardFeedRow | null>(null);
  const wakeLock = useRef<WakeLockSentinelLike | null>(null);
  const soundRef = useRef(sound);
  const flashTimers = useRef<Set<number>>(new Set());

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const onArrivals = useCallback((arrivals: LiveBoardFeedRow[]) => {
    if (soundRef.current) playChime();
    const ids = arrivals.map((a) => a.member_id);
    setFlash((prev) => new Set([...prev, ...ids]));
    const t = window.setTimeout(() => {
      flashTimers.current.delete(t);
      setFlash((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }, FLASH_MS);
    flashTimers.current.add(t);
  }, []);

  const { rows, status, refetch } = useLiveFeed(businessId, onArrivals);

  // Relative times tick every 30 s; timers cleaned up on unmount.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    const timers = flashTimers.current;
    return () => {
      window.clearInterval(id);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Keep the screen awake while the board is running (re-acquire on return).
  useEffect(() => {
    if (!started) return;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> } };
    const acquire = async () => {
      try {
        if (nav.wakeLock && document.visibilityState === "visible") wakeLock.current = await nav.wakeLock.request("screen");
      } catch {
        // Not supported / denied — the board still works.
      }
    };
    void acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void wakeLock.current?.release().catch(() => undefined);
      wakeLock.current = null;
    };
  }, [started]);

  function start() {
    armChime();
    setStarted(true);
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    if (next) armChime();
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      // ignore
    }
  }

  const arrived = useMemo(
    () =>
      rows
        .filter((r) => r.verified_at)
        .sort((a, b) => (b.verified_at ?? "").localeCompare(a.verified_at ?? ""))
        .slice(0, 8),
    [rows],
  );

  const tables = useMemo(() => {
    const map = new Map<string, { code: string; label: string | null; people: LiveBoardFeedRow[]; waiting: number }>();
    for (const r of rows) {
      if (r.session_status !== "open" && r.session_status !== "billing") continue;
      const entry = map.get(r.session_id) ?? { code: r.table_code, label: r.table_label, people: [], waiting: 0 };
      if (r.verified_at) entry.people.push(r);
      else entry.waiting += 1;
      map.set(r.session_id, entry);
    }
    return [...map.values()].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [rows]);

  if (!started) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-white/5">
          <Bell className="size-7 text-[#54e0ff]" aria-hidden />
        </span>
        <h1 className="mt-6 text-[30px] leading-tight tracking-[-0.05em]">{copy.startTitle}</h1>
        <p className="mt-3 max-w-[40ch] text-[16px] leading-relaxed text-[#9a9aa3]">{copy.startLine}</p>
        <button type="button" onClick={start} className={`${btn.highlight} mt-8 h-16 px-10 text-[20px]`}>
          {copy.startButton}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] tracking-[-0.04em]">{copy.title}</h1>
        <div className="flex items-center gap-2">
          <StatusPill status={status} />
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={sound}
            className={`inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-[14px] ${focusRing}`}
          >
            {sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
            {sound ? copy.soundOn : copy.soundOff}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {arrived[0] && flash.has(arrived[0].member_id)
          ? `${copy.table(arrived[0].table_code)}, ${arrived[0].customer_name ?? copy.guest}`
          : ""}
      </p>

      <section aria-labelledby="arrived-title" className="mt-6">
        <h2 id="arrived-title" className="text-[15px] font-medium tracking-wide text-[#9a9aa3] uppercase">
          {copy.justArrived}
        </h2>
        {arrived.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/10 p-5 text-[16px] text-[#9a9aa3]">{copy.nobodyYet}</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {arrived.map((r) => {
              const isNew = flash.has(r.member_id);
              const name = r.customer_name ?? copy.guest;
              const visits = r.visit_count ?? 1;
              return (
                <li key={r.member_id}>
                  <button
                    type="button"
                    onClick={() => r.customer_id && setNoteFor(r)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${focusRing} ${
                      isNew ? "border-[#54e0ff] bg-[#54e0ff]/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[22px] font-medium tracking-[-0.03em]">
                        {isNew ? "🔔 " : ""}
                        {copy.table(r.table_code)} · {name}
                      </span>
                      <span className="shrink-0 text-[13px] text-[#8b8b94]">{copy.ago(minutesSince(r.verified_at ?? r.joined_at, now))}</span>
                    </div>
                    <p className="mt-1 text-[15px] text-[#9a9aa3]">
                      {visits <= 1 ? copy.newCustomer : copy.visit(visits)}
                      {r.phone_last4 ? ` · …${r.phone_last4}` : ""}
                    </p>
                    <p className={`mt-2 text-[15px] ${r.notes ? "text-white" : "text-[#8b8b94]"}`}>
                      {r.notes ? `📝 ${r.notes}` : `+ ${copy.addNote}`}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="tables-title" className="mt-8">
        <h2 id="tables-title" className="text-[15px] font-medium tracking-wide text-[#9a9aa3] uppercase">
          {copy.tablesNow}
        </h2>
        {tables.length === 0 ? (
          <p className="mt-3 text-[16px] text-[#9a9aa3]">{copy.noTables}</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((t) => (
              <li key={t.code} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[18px] font-medium">{copy.table(t.code)}</p>
                <p className="mt-1 text-[15px] text-[#9a9aa3]">
                  {t.people.map((p) => p.customer_name ?? copy.guest).join(", ") || "—"}
                </p>
                {t.waiting > 0 ? <p className="mt-1 text-[14px] text-amber-300">{copy.waiting(t.waiting)}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {noteFor?.customer_id ? (
        <NoteSheet
          customerId={noteFor.customer_id}
          name={noteFor.customer_name ?? copy.guest}
          initialNote={noteFor.notes}
          onClose={() => setNoteFor(null)}
          onSaved={() => void refetch()}
        />
      ) : null}

      <p className="mt-10 text-center text-[13px] text-[#8b8b94]">{cafeName} · Dobara by Locallify</p>
    </div>
  );
}
