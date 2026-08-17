"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { checkSlugAvailable } from "@/app/onboarding/actions";
import { setPageActive, updateProfile, updateSlug } from "./actions";

type SlugState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "invalid"; reason: string };

type SlugCheckResult = { slug: string; available: boolean; reason?: string } | null;

export function SettingsTab({
  savedSlug,
  active,
  displayName,
  tagline,
  onSlugSaved,
  onActiveChange,
  onProfileChange,
}: {
  savedSlug: string;
  active: boolean;
  displayName: string;
  tagline: string;
  onSlugSaved: (slug: string) => void;
  onActiveChange: (active: boolean) => void;
  onProfileChange: (patch: { displayName?: string; tagline?: string }) => void;
}) {
  const [slug, setSlug] = useState(savedSlug);
  const [slugCheck, setSlugCheck] = useState<SlugCheckResult>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSavingSlug, startSavingSlug] = useTransition();
  const [isTogglingActive, startTogglingActive] = useTransition();
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  const [savedDisplayName, setSavedDisplayName] = useState(displayName);
  const [savedTagline, setSavedTagline] = useState(tagline);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSavingProfile, startSavingProfile] = useTransition();

  const profileChanged = displayName !== savedDisplayName || tagline !== savedTagline;

  function handleSaveProfile() {
    setProfileError(null);
    setProfileSaved(false);
    startSavingProfile(async () => {
      const result = await updateProfile({ displayName, tagline });
      if (result.success) {
        setSavedDisplayName(displayName);
        setSavedTagline(tagline);
        setProfileSaved(true);
      } else {
        setProfileError(result.error ?? "Could not save.");
      }
    });
  }

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
        <label className="block text-sm font-medium text-white mb-2">Profile</label>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[#7a7a83] mb-1.5">Name</label>
            <input
              value={displayName}
              onChange={(e) => onProfileChange({ displayName: e.target.value })}
              placeholder="Your name or business"
              className="w-full rounded-[12px] border border-[#33373b] bg-white/[0.02] px-4 py-3 text-white text-[15px] outline-none focus:border-[#54e0ff] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[#7a7a83] mb-1.5">Description</label>
            <textarea
              value={tagline}
              onChange={(e) => onProfileChange({ tagline: e.target.value })}
              placeholder="A short line about you or your business"
              rows={2}
              className="w-full resize-none rounded-[12px] border border-[#33373b] bg-white/[0.02] px-4 py-3 text-white text-[15px] outline-none focus:border-[#54e0ff] transition-colors"
            />
          </div>
        </div>

        {profileError && <p className="mt-2 text-sm text-red-400">{profileError}</p>}
        {profileSaved && !profileChanged && (
          <p className="mt-2 text-sm text-emerald-400 inline-flex items-center gap-1.5">
            <Check className="size-3.5" /> Saved.
          </p>
        )}

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={!profileChanged || isSavingProfile}
          className="mt-4 inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium bg-white text-[#18181a] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSavingProfile && <Loader2 className="size-4 animate-spin" />}
          Save profile
        </button>
      </div>

      <div className="border-t border-[#33373b] pt-8">
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-white mb-1">
              {active ? "Public" : "Private"}
            </h2>
            <p className="text-sm text-[#7a7a83]">
              {active
                ? "Your hub is live and publicly accessible."
                : "Your hub is private — visitors will see a 404."}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-label="Hub visibility"
            onClick={handleToggleActive}
            disabled={isTogglingActive}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              active ? "bg-emerald-500" : "bg-[#33373b]"
            }`}
          >
            <span
              className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
                active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {confirmingDeactivate && (
          <div className="mt-4 flex flex-col gap-3 rounded-[12px] border border-amber-400/30 bg-amber-400/5 p-4">
            <p className="text-[13px] text-amber-400">
              Your hub will stop being publicly accessible immediately. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleToggleActive}
                className="rounded-[8px] px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
              >
                Make private
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
        )}
      </div>
    </div>
  );
}
