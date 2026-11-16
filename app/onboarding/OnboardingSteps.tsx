"use client";

import { useActionState, useState } from "react";
import { onboarding as copy } from "@/content/owner";
import { btn } from "@/components/landing/primitives";
import { inputClass, labelClass, panelClass } from "@/components/owner/OwnerShell";
import { createTablesAndFinish, saveCafeDetails, type ActionState } from "./actions";

const initial: ActionState = { ok: false };

type Props = {
  name: string;
  slug: string;
  slugLocked: boolean;
  host: string;
  existingTables: number;
};

function FieldError({ id, state, field }: { id: string; state: ActionState; field: ActionState["field"] }) {
  if (state.ok || !state.error || state.field !== field) return null;
  return (
    <p id={id} role="alert" className="text-[14px] text-red-400">
      {state.error}
    </p>
  );
}

function FormError({ state }: { state: ActionState }) {
  if (state.ok || !state.error || state.field) return null;
  return (
    <p role="alert" className="text-[14px] text-red-400">
      {state.error}
    </p>
  );
}

export function OnboardingSteps({ name, slug, slugLocked, host, existingTables }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cafeState, cafeAction, cafePending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await saveCafeDetails(prev, formData);
    if (result.ok) setStep(2);
    return result;
  }, initial);
  const [tableState, tableAction, tablePending] = useActionState(createTablesAndFinish, initial);
  const [slugValue, setSlugValue] = useState(slug);

  return (
    <div>
      <p className="text-[14px] font-medium text-[#54e0ff]">{copy.stepOf(step)}</p>

      {step === 1 ? (
        <section aria-labelledby="cafe-title" className="mt-3">
          <h1 id="cafe-title" className="text-[30px] leading-[1.15] tracking-[-0.05em] md:text-[38px]">
            {copy.cafe.title}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.5] font-light text-[#9a9aa3]">{copy.cafe.line}</p>

          <form action={cafeAction} className={`${panelClass} mt-8 flex flex-col gap-6`}>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className={labelClass}>
                {copy.cafe.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                defaultValue={name}
                required
                minLength={2}
                maxLength={60}
                autoComplete="organization"
                aria-describedby="name-error"
                className={inputClass}
              />
              <FieldError id="name-error" state={cafeState} field="name" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="slug" className={labelClass}>
                {copy.cafe.slugLabel}
              </label>
              <div className="flex items-stretch overflow-hidden rounded-[12px] border border-[#33373b] bg-[#1e1e20] focus-within:ring-2 focus-within:ring-[#54e0ff]">
                <span className="flex items-center border-r border-[#33373b] px-3 text-[14px] text-[#8b8b94] select-none">
                  {host}/r/
                </span>
                <input
                  id="slug"
                  name="slug"
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  disabled={slugLocked}
                  required
                  minLength={3}
                  maxLength={40}
                  inputMode="url"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-describedby="slug-help slug-error"
                  className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[16px] text-white outline-none disabled:opacity-60"
                />
              </div>
              <p id="slug-help" className="text-[14px] font-light text-[#9a9aa3]">
                {slugLocked ? copy.cafe.slugLocked : copy.cafe.slugHelp}
              </p>
              <FieldError id="slug-error" state={cafeState} field="slug" />
            </div>

            <FormError state={cafeState} />
            <button type="submit" disabled={cafePending} className={`${btn.primary} ${btn.sizeMd} w-full shadow-none disabled:opacity-60`}>
              {cafePending ? "…" : copy.cafe.submit}
            </button>
          </form>
        </section>
      ) : (
        <section aria-labelledby="tables-title" className="mt-3">
          <h1 id="tables-title" className="text-[30px] leading-[1.15] tracking-[-0.05em] md:text-[38px]">
            {copy.tables.title}
          </h1>
          <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.5] font-light text-[#9a9aa3]">{copy.tables.line}</p>

          <form action={tableAction} className={`${panelClass} mt-8 flex flex-col gap-6`}>
            <div className="flex flex-col gap-2">
              <label htmlFor="count" className={labelClass}>
                {copy.tables.countLabel}
              </label>
              <input
                id="count"
                name="count"
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                required
                defaultValue={existingTables > 0 ? existingTables : 8}
                aria-describedby="count-error"
                className={`${inputClass} max-w-[160px] text-[20px]`}
              />
              <FieldError id="count-error" state={tableState} field="count" />
            </div>

            <FormError state={tableState} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button type="button" onClick={() => setStep(1)} className={`${btn.secondary} ${btn.sizeMd} sm:w-auto`}>
                {copy.tables.back}
              </button>
              <button type="submit" disabled={tablePending} className={`${btn.primary} ${btn.sizeMd} flex-1 shadow-none disabled:opacity-60`}>
                {tablePending ? "…" : copy.tables.submit}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
