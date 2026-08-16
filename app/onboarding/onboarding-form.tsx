"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { checkSlugAvailable, saveOnboarding } from "./actions";

type PageData = {
  slug: string;
  display_name: string | null;
  tagline: string | null;
  vertical: string | null;
};

type VerticalTemplate = {
  vertical: string;
  signature_feature: string | null;
};

const VERTICAL_LABELS: Record<string, string> = {
  restaurant: "Restaurant / cafe",
  clinic: "Clinic / doctor",
};

type SlugState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "invalid"; reason: string };

type SlugCheckResult = { slug: string; available: boolean; reason?: string } | null;

export function OnboardingForm({
  page,
  verticals,
}: {
  page: PageData;
  verticals: VerticalTemplate[];
}) {
  const [slug, setSlug] = useState(page.slug);
  const [displayName, setDisplayName] = useState(page.display_name ?? "");
  const [tagline, setTagline] = useState(page.tagline ?? "");
  const [vertical, setVertical] = useState<string | null>(page.vertical);
  const [slugCheck, setSlugCheck] = useState<SlugCheckResult>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (slug === page.slug) {
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      const result = await checkSlugAvailable(slug);
      if (!active) return;
      setSlugCheck({ slug, available: result.available, reason: result.reason });
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [slug, page.slug]);

  const displaySlugState: SlugState =
    slug === page.slug
      ? { status: "idle" }
      : slugCheck && slugCheck.slug === slug
        ? slugCheck.available
          ? { status: "available" }
          : { status: "invalid", reason: slugCheck.reason ?? "Unavailable." }
        : { status: "checking" };
  const slugIsBlocking =
    displaySlugState.status === "checking" || displaySlugState.status === "invalid";

  function handleSave() {
    setSaveError(null);
    setSavedSlug(null);
    startTransition(async () => {
      const result = await saveOnboarding({
        slug,
        displayName,
        tagline,
        vertical: vertical as "restaurant" | "clinic" | null,
      });
      if (result.success) {
        setSavedSlug(slug);
      } else {
        setSaveError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Grand Cafe & Bakery"
          className="w-full rounded-[12px] border border-[#33373b] bg-white/[0.02] px-4 py-3 text-white text-[15px] outline-none focus:border-[#54e0ff] transition-colors placeholder:text-[#54545a]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Tagline (optional)</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Fresh coffee, made daily"
          className="w-full rounded-[12px] border border-[#33373b] bg-white/[0.02] px-4 py-3 text-white text-[15px] outline-none focus:border-[#54e0ff] transition-colors placeholder:text-[#54545a]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Starting point (optional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVertical(null)}
            className={`text-left rounded-[12px] border px-4 py-3 transition-colors cursor-pointer ${
              vertical === null
                ? "border-[#54e0ff] bg-[#54e0ff]/[0.06]"
                : "border-[#33373b] bg-white/[0.02] hover:border-[#54545a]"
            }`}
          >
            <p className="text-white text-[15px] font-medium">Skip — generic profile</p>
            <p className="text-[#7a7a83] text-[13px] mt-0.5">Start with an empty link list.</p>
          </button>
          {verticals.map((v) => (
            <button
              key={v.vertical}
              type="button"
              onClick={() => setVertical(v.vertical)}
              className={`text-left rounded-[12px] border px-4 py-3 transition-colors cursor-pointer ${
                vertical === v.vertical
                  ? "border-[#54e0ff] bg-[#54e0ff]/[0.06]"
                  : "border-[#33373b] bg-white/[0.02] hover:border-[#54545a]"
              }`}
            >
              <p className="text-white text-[15px] font-medium">
                {VERTICAL_LABELS[v.vertical] ?? v.vertical}
              </p>
              {v.signature_feature && (
                <p className="text-[#7a7a83] text-[13px] mt-0.5">{v.signature_feature}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {saveError && <p className="text-sm text-red-400">{saveError}</p>}
      {savedSlug && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-emerald-400 inline-flex items-center gap-1.5">
            <Check className="size-3.5" /> Saved.
          </p>
          <Link
            href="/dashboard"
            className="text-sm text-[#54e0ff] hover:underline inline-flex items-center gap-1.5"
          >
            Go to your dashboard
          </Link>
          <Link
            href={`/${savedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#54e0ff] hover:underline inline-flex items-center gap-1.5"
          >
            View your live hub
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={slugIsBlocking || isPending}
        className="inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-medium text-[#18181a] bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Save
      </button>
    </div>
  );
}
