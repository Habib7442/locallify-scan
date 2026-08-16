"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { checkSlugAvailable } from "@/app/onboarding/actions";
import { setPageActive, updateSlug } from "./actions";

type SlugState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "invalid"; reason: string };

type SlugCheckResult = { slug: string; available: boolean; reason?: string } | null;

export function SettingsTab({
  savedSlug,
  active,
  onSlugSaved,
  onActiveChange,
}: {
  savedSlug: string;
  active: boolean;
  onSlugSaved: (slug: string) => void;
  onActiveChange: (active: boolean) => void;
}) {
  const [slug, setSlug] = useState(savedSlug);
  const [slugCheck, setSlugCheck] = useState<SlugCheckResult>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSavingSlug, startSavingSlug] = useTransition();
  const [isTogglingActive, startTogglingActive] = useTransition();
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  useEffect(() => {
    if (slug === savedSlug) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      const result = await checkSlugAvailable(slug);
      if (!cancelled) setSlugCheck({ slug, available: result.available, reason: result.reason });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [slug, savedSlug]);

  const displaySlugState: SlugState =
    slug === savedSlug
      ? { status: "idle" }
      : slugCheck && slugCheck.slug === slug
        ? slugCheck.available
          ? { status: "available" }
          : { status: "invalid", reason: slugCheck.reason ?? "Unavailable." }
        : { status: "checking" };

  const slugChanged = slug !== savedSlug;
  const slugIsBlocking =
    displaySlugState.status === "checking" || displaySlugState.status === "invalid";

  function handleSaveSlug() {
    setSaveError(null);
    setSaved(false);
    startSavingSlug(async () => {
      const result = await updateSlug(slug);
      if (result.success) {
        onSlugSaved(slug);
        setSaved(true);
      } else {
        setSaveError(result.error ?? "Could not save.");
      }
    });
  }

  function handleToggleActive() {
    const next = !active;
    if (active && !confirmingDeactivate) {
      setConfirmingDeactivate(true);
      return;
    }
    setConfirmingDeactivate(false);
    startTogglingActive(async () => {
      const result = await setPageActive(next);
      if (result.success) onActiveChange(next);
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Your hub link</label>
        <div className="flex items-center rounded-[12px] border border-[#33373b] bg-white/[0.02] px-4 py-3 focus-within:border-[#54e0ff] transition-colors">
          <span className="text-[#7a7a83] text-[15px] whitespace-nowrap">
            scan.locallifyagency.com/
          </span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="flex-1 bg-transparent text-white text-[15px] outline-none min-w-0"
            spellCheck={false}
            autoCapitalize="off"
          />
        </div>
        <div className="mt-2 text-sm h-5">
          {displaySlugState.status === "checking" && (
            <span className="inline-flex items-center gap-1.5 text-[#7a7a83]">
              <Loader2 className="size-3.5 animate-spin" /> Checking availability…
            </span>
          )}
          {displaySlugState.status === "available" && (
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <Check className="size-3.5" /> Available
            </span>
          )}
          {displaySlugState.status === "invalid" && (
            <span className="inline-flex items-center gap-1.5 text-red-400">
              <X className="size-3.5" /> {displaySlugState.reason}
            </span>
          )}
        </div>

        {slugChanged && (
          <p className="mt-2 flex items-start gap-2 text-[13px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-[8px] px-3 py-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            If you&apos;ve already had a QR code printed, it will need to be reprinted to match
            your new link.
          </p>
        )}

        {saveError && <p className="mt-2 text-sm text-red-400">{saveError}</p>}
        {saved && (
          <p className="mt-2 text-sm text-emerald-400 inline-flex items-center gap-1.5">
            <Check className="size-3.5" /> Saved.
          </p>
        )}

        <button
          type="button"
          onClick={handleSaveSlug}
          disabled={!slugChanged || slugIsBlocking || isSavingSlug}
          className="mt-4 inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium bg-white text-[#18181a] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSavingSlug && <Loader2 className="size-4 animate-spin" />}
          Save link
        </button>
      </div>

      <div className="border-t border-[#33373b] pt-8">
        <h2 className="text-sm font-medium text-white mb-2">Hub visibility</h2>
        <p className="text-sm text-[#7a7a83] mb-4">
          {active
            ? "Your hub is live and publicly accessible."
            : "Your hub is deactivated — visitors will see a 404."}
        </p>

        {confirmingDeactivate ? (
          <div className="flex flex-col gap-3 rounded-[12px] border border-amber-400/30 bg-amber-400/5 p-4">
            <p className="text-[13px] text-amber-400">
              Your hub will stop being publicly accessible immediately. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleToggleActive}
                className="rounded-[8px] px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
              >
                Deactivate hub
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDeactivate(false)}
                className="rounded-[8px] px-4 py-2 text-sm font-medium border border-[#33373b] text-[#a1a1aa] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isTogglingActive}
            className={`inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium border transition-colors cursor-pointer disabled:opacity-50 ${
              active
                ? "border-[#33373b] text-[#a1a1aa] hover:text-white"
                : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {isTogglingActive && <Loader2 className="size-4 animate-spin" />}
            {active ? "Deactivate hub" : "Reactivate hub"}
          </button>
        )}
      </div>
    </div>
  );
}
