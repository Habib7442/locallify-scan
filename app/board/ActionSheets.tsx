"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { board as copy } from "@/content/board";
import { btn, focusRing } from "@/components/landing/primitives";

// Small modal sheets for staff actions on the Live Board. Every action is an
// RLS/RPC-checked call with the staff member's Clerk JWT, retried up to 3x.

async function withRetry<T>(fn: () => PromiseLike<{ data: T; error: { message: string; code?: string } | null }>) {
  let last: { message: string; code?: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await fn();
    if (!error) return { data, error: null };
    last = error;
    // Business-rule errors (already closed, not next visit…) won't change on retry.
    if (error.code && ["55000", "P0002", "22023", "42501"].includes(error.code)) break;
    await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
  }
  return { data: null, error: last };
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#1e1e20] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[20px] tracking-[-0.03em]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function CloseVisitSheet({
  sessionId,
  tableName,
  onClose,
  onDone,
}: {
  sessionId: string;
  tableName: string;
  onClose: () => void;
  onDone: (issued: number) => void;
}) {
  const supabase = useSupabaseBrowserClient();
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const bill = Number(amount);
    if (!Number.isFinite(bill) || bill < 0 || bill > 100000) {
      setError(copy.billInvalid);
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error: err } = await withRetry(() =>
      supabase.rpc("close_visit", { p_session_id: sessionId, p_bill_amount: Math.round(bill * 100) / 100 }),
    );
    setBusy(false);
    if (err) {
      setError(err.code === "55000" ? copy.alreadyClosed : copy.actionFailed);
      return;
    }
    onDone(typeof data === "number" ? data : 0);
    onClose();
  }

  return (
    <Sheet title={copy.closeTitle(tableName)} onClose={onClose}>
      <form onSubmit={submit} className="mt-4">
        <label htmlFor="bill" className="text-[14px] text-[#9a9aa3]">
          {copy.billLabel}
        </label>
        <div className="mt-2 flex items-center rounded-[12px] border border-[#33373b] bg-[#18181a] focus-within:ring-2 focus-within:ring-[#54e0ff]">
          <span className="pl-4 text-[22px] text-[#9a9aa3]">₹</span>
          <input
            ref={inputRef}
            id="bill"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            className="h-14 min-w-0 flex-1 bg-transparent px-2 text-[24px] text-white outline-none"
          />
        </div>
        <p role="alert" className="mt-2 min-h-5 text-[14px] text-amber-300">
          {error ?? ""}
        </p>
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className={`${btn.secondary} ${btn.sizeMd} flex-1`}>
            {copy.cancel}
          </button>
          <button type="submit" disabled={busy || amount === ""} className={`${btn.primary} ${btn.sizeMd} flex-1 shadow-none disabled:opacity-60`}>
            {busy ? "…" : copy.closeConfirm}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export function NameSheet({
  customerId,
  currentName,
  onClose,
  onSaved,
}: {
  customerId: string;
  currentName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = useSupabaseBrowserClient();
  const [name, setName] = useState(currentName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const { error: err } = await withRetry(() =>
      supabase.rpc("set_customer_name", { p_customer_id: customerId, p_name: name.trim().slice(0, 40) }),
    );
    setBusy(false);
    if (err) {
      setError(true);
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <Sheet title={copy.nameTitle} onClose={onClose}>
      <form onSubmit={submit} className="mt-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          maxLength={40}
          required
          aria-label={copy.nameTitle}
          className={`h-12 w-full rounded-[12px] border border-[#33373b] bg-[#18181a] px-3 text-[16px] text-white ${focusRing}`}
        />
        <p role="alert" className="mt-2 min-h-5 text-[14px] text-amber-300">
          {error ? copy.actionFailed : ""}
        </p>
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={onClose} className={`${btn.secondary} ${btn.sizeMd} flex-1`}>
            {copy.cancel}
          </button>
          <button type="submit" disabled={busy} className={`${btn.primary} ${btn.sizeMd} flex-1 shadow-none disabled:opacity-60`}>
            {busy ? "…" : copy.save}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export { withRetry };
