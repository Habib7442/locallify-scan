"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { rewards as copy } from "@/content/owner";
import { btn, focusRing } from "@/components/landing/primitives";
import { inputClass, labelClass, panelClass } from "@/components/owner/OwnerShell";
import type { PrizeOption } from "@/lib/supabase/dobara-types";
import { saveRewards, type RewardsState } from "./actions";

type Props = {
  scratchEnabled: boolean;
  allMembers: boolean;
  minBill: number;
  validityDays: number;
  prizes: PrizeOption[];
};

export function RewardsForm(props: Props) {
  const [state, action, pending] = useActionState(saveRewards, { ok: false } as RewardsState);
  const [rows, setRows] = useState<PrizeOption[]>(props.prizes.length ? props.prizes : [{ label: "", weight: 100 }]);
  const total = rows.reduce((sum, r) => sum + (Number(r.weight) > 0 ? Number(r.weight) : 0), 0);

  function update(i: number, patch: Partial<PrizeOption>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <section className={`${panelClass} flex flex-col gap-5`}>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-[16px]">{copy.enabled}</span>
            <span className="block text-[14px] text-[#9a9aa3]">{copy.enabledHelp}</span>
          </span>
          <input type="checkbox" name="scratch_enabled" defaultChecked={props.scratchEnabled} className="size-6 accent-[#54e0ff]" />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-[16px]">{copy.allMembers}</span>
            <span className="block text-[14px] text-[#9a9aa3]">{copy.allMembersHelp}</span>
          </span>
          <input type="checkbox" name="all_members" defaultChecked={props.allMembers} className="size-6 accent-[#54e0ff]" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="min_bill" className={labelClass}>
              {copy.minBill}
            </label>
            <input id="min_bill" name="min_bill" type="number" inputMode="decimal" min={0} max={100000} step="1" defaultValue={props.minBill} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="validity_days" className={labelClass}>
              {copy.validity}
            </label>
            <input id="validity_days" name="validity_days" type="number" inputMode="numeric" min={1} max={90} defaultValue={props.validityDays} className={inputClass} />
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-[18px] tracking-[-0.03em]">{copy.prizesTitle}</h2>
        <p className="mt-1 text-[14px] text-[#9a9aa3]">{copy.prizesHelp}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((r, i) => {
            const pct = total > 0 && r.weight > 0 ? Math.round((r.weight / total) * 100) : 0;
            return (
              <li key={i} className="flex items-end gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {i === 0 ? <span className="text-[13px] text-[#8b8b94]">{copy.prizeLabel}</span> : null}
                  <input
                    name="prize_label"
                    value={r.label}
                    onChange={(e) => update(i, { label: e.target.value.slice(0, 40) })}
                    maxLength={40}
                    required
                    placeholder={copy.prizePlaceholder}
                    aria-label={`${copy.prizeLabel} ${i + 1}`}
                    className={inputClass}
                  />
                </div>
                <div className="flex w-[92px] flex-col gap-1">
                  {i === 0 ? <span className="text-[13px] text-[#8b8b94]">{copy.weight}</span> : null}
                  <input
                    name="prize_weight"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={100}
                    value={r.weight}
                    onChange={(e) => update(i, { weight: Number(e.target.value) })}
                    aria-label={`${copy.weight} ${i + 1}`}
                    className={inputClass}
                  />
                </div>
                <span className="w-12 pb-3 text-right text-[14px] text-[#9a9aa3]" aria-label={copy.chance}>
                  {pct}%
                </span>
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                  disabled={rows.length <= 1}
                  aria-label={copy.remove}
                  className={`mb-1 inline-flex size-10 items-center justify-center rounded-[10px] text-[#9a9aa3] hover:text-white disabled:opacity-30 ${focusRing}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
        {rows.length < 8 ? (
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { label: "", weight: 10 }])}
            className={`${btn.secondary} mt-4 h-11 px-4 text-[15px]`}
          >
            <Plus className="size-4" aria-hidden /> {copy.add}
          </button>
        ) : null}
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={`${btn.primary} ${btn.sizeMd} shadow-none disabled:opacity-60`}>
          {pending ? "…" : copy.save}
        </button>
        <p role="status" className="text-[15px]">
          {state.ok ? <span className="text-green-400">{copy.saved}</span> : state.error ? <span className="text-red-400">{state.error}</span> : null}
        </p>
      </div>
    </form>
  );
}
