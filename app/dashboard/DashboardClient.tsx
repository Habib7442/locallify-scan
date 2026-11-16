"use client";

import { useActionState, useState } from "react";
import { Check, Copy } from "lucide-react";
import { dashboard as copy } from "@/content/owner";
import { btn, focusRing } from "@/components/landing/primitives";
import { inputClass, labelClass } from "@/components/owner/OwnerShell";
import { addTables, type AddTablesState } from "./actions";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked: the URL is visible to copy by hand.
        }
      }}
      aria-label={`${copied ? copy.copied : copy.copy} ${label}`}
      className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/5 px-3 text-[14px] text-white hover:bg-white/10 ${focusRing}`}
    >
      {copied ? <Check className="size-4 text-green-400" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? copy.copied : copy.copy}
    </button>
  );
}

export function AddTablesForm({ current }: { current: number }) {
  const [state, action, pending] = useActionState(addTables, { ok: false } as AddTablesState);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-2">
        <label htmlFor="count" className={labelClass}>
          {copy.addLabel}
        </label>
        <input
          id="count"
          name="count"
          type="number"
          inputMode="numeric"
          min={1}
          max={60}
          required
          defaultValue={Math.min(60, current + 1)}
          className={`${inputClass} w-[140px]`}
        />
      </div>
      <button type="submit" disabled={pending} className={`${btn.secondary} ${btn.sizeMd} disabled:opacity-60`}>
        {pending ? "…" : copy.addSubmit}
      </button>
      <p role="status" className="text-[14px] text-[#9a9aa3] sm:pb-3">
        {state.ok ? `+${state.added ?? 0}` : state.error ? <span className="text-red-400">{state.error}</span> : null}
      </p>
    </form>
  );
}
