"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { board as copy } from "@/content/board";
import { btn, focusRing } from "@/components/landing/primitives";

type Props = {
  customerId: string;
  name: string;
  initialNote: string | null;
  onClose: () => void;
  onSaved: () => void;
};

const MAX = 280;

/** Staff note editor. Saves via the RLS-checked set_customer_note RPC, retrying up to 3 times. */
export function NoteSheet({ customerId, name, initialNote, onClose, onSaved }: Props) {
  const supabase = useSupabaseBrowserClient();
  const [note, setNote] = useState(initialNote ?? "");
  const [state, setState] = useState<"idle" | "saving" | "retrying" | "failed">("idle");
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    areaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save() {
    setState("saving");
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase.rpc("set_customer_note", { p_customer_id: customerId, p_note: note.slice(0, MAX) });
      if (!error) {
        onSaved();
        onClose();
        return;
      }
      console.error("set_customer_note failed", error.message);
      setState("retrying");
      await new Promise((r) => setTimeout(r, 1_000 * 2 ** attempt));
    }
    setState("failed");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
        className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[#1e1e20] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="note-title" className="text-[20px] tracking-[-0.03em]">
          {copy.noteTitle(name)}
        </h2>
        <p className="mt-1 text-[14px] text-[#9a9aa3]">{copy.noteHelp}</p>
        <textarea
          ref={areaRef}
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX))}
          rows={3}
          maxLength={MAX}
          aria-label={copy.noteTitle(name)}
          className={`mt-4 w-full resize-none rounded-[12px] border border-[#33373b] bg-[#18181a] p-3 text-[16px] text-white ${focusRing}`}
        />
        <p className="mt-1 text-right text-[13px] text-[#8b8b94]">
          {note.length}/{MAX}
        </p>
        <p role="status" className="min-h-5 text-[14px] text-amber-300">
          {state === "retrying" ? copy.noteRetry : state === "failed" ? copy.noteFailed : ""}
        </p>
        <div className="mt-3 flex gap-3">
          <button type="button" onClick={onClose} className={`${btn.secondary} ${btn.sizeMd} flex-1`}>
            {copy.noteCancel}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={state === "saving" || state === "retrying"}
            className={`${btn.primary} ${btn.sizeMd} flex-1 shadow-none disabled:opacity-60`}
          >
            {state === "saving" || state === "retrying" ? "…" : copy.noteSave}
          </button>
        </div>
      </div>
    </div>
  );
}
