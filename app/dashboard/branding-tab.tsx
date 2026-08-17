"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { Ban, Check, ChevronDown, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicAssetUrl } from "@/lib/storage";
import { initials } from "@/components/hub/HubContent";
import { FONTS, FONT_LABELS, fontClassName, type FontKey } from "@/lib/fonts";
import { THEMES, THEME_KEYS, type ThemeKey } from "@/lib/themes";
import { updateBranding, updateLogoPath } from "./actions";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function validateImageFile(file: File): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Promise.resolve("Please upload a PNG, JPEG, or WebP image.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    return Promise.resolve("Image must be under 2MB.");
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const probe = new window.Image();
    probe.onload = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("That file doesn't look like a valid image.");
    };
    probe.src = url;
  });
}

const ACCENT_SWATCHES = [
  "#54e0ff",
  "#845ef7",
  "#f06595",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#38bdf8",
  "#fb923c",
];

function FontPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (key: FontKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = (value in FONTS ? value : "hanken") as FontKey;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between rounded-[10px] border border-[#33373b] bg-[#18181a] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#54e0ff] cursor-pointer ${fontClassName(selected)}`}
      >
        {FONT_LABELS[selected]}
        <ChevronDown className="size-4 text-[#7a7a83]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 bottom-full mb-1.5 w-full rounded-[10px] border border-[#33373b] bg-[#18181a] shadow-[0px_16px_40px_rgba(0,0,0,0.4)] overflow-hidden">
            {(Object.keys(FONTS) as FontKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between ${fontClassName(key)} ${
                  key === selected ? "text-[#54e0ff]" : "text-white"
                }`}
              >
                {FONT_LABELS[key]}
                {key === selected && <Check className="size-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function BrandingTab({
  logoPath,
  onLogoPathChange,
  displayName,
  theme,
  accent,
  headingFont,
  linkFont,
  bgType,
  bgValue,
  bgImageBrightness,
  bgImageContrast,
  bgImageOverlay,
  headingColor,
  taglineColor,
  linkBgColor,
  linkTextColor,
  onBrandingChange,
}: {
  logoPath: string | null;
  onLogoPathChange: (path: string | null) => void;
  displayName: string;
  theme: string;
  accent: string | null;
  headingFont: string;
  linkFont: string;
  bgType: string;
  bgValue: string | null;
  bgImageBrightness: number;
  bgImageContrast: number;
  bgImageOverlay: number;
  headingColor: string | null;
  taglineColor: string | null;
  linkBgColor: string | null;
  linkTextColor: string | null;
  onBrandingChange: (patch: {
    theme?: string;
    accent?: string | null;
    headingFont?: string;
    linkFont?: string;
    bgType?: string;
    bgValue?: string | null;
    bgImageBrightness?: number;
    bgImageContrast?: number;
    bgImageOverlay?: number;
    headingColor?: string | null;
    taglineColor?: string | null;
    linkBgColor?: string | null;
    linkTextColor?: string | null;
  }) => void;
}) {
  const { userId } = useAuth();
  const supabase = useSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [bgError, setBgError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<"solid" | "image">(bgType === "image" ? "image" : "solid");

  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const currentUrl = getPublicAssetUrl(logoPath);
  const bgImageUrl = bgType === "image" ? getPublicAssetUrl(bgValue) : null;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;

    setLogoError(null);

    const validationError = await validateImageFile(file);
    if (validationError) {
      setLogoError(validationError);
      return;
    }

    setIsUploading(true);
    const previousPath = logoPath;
    const ext = file.name.split(".").pop() || "png";
    const newPath = `${userId}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("page-assets").upload(newPath, file);
    if (uploadError) {
      setLogoError("Upload failed. Try again.");
      setIsUploading(false);
      return;
    }

    const result = await updateLogoPath(newPath);
    if (!result.success) {
      setLogoError(result.error ?? "Could not save.");
      setIsUploading(false);
      return;
    }

    onLogoPathChange(newPath);
    setIsUploading(false);

    if (previousPath) {
      void supabase.storage.from("page-assets").remove([previousPath]);
    }
  }

  async function handleRemoveLogo() {
    const previousPath = logoPath;
    onLogoPathChange(null);

    const result = await updateLogoPath(null);
    if (!result.success) {
      onLogoPathChange(previousPath);
      setLogoError(result.error ?? "Could not remove logo.");
      return;
    }

    if (previousPath) {
      void supabase.storage.from("page-assets").remove([previousPath]);
    }
  }

  async function handleBgFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;

    setBgError(null);

    const validationError = await validateImageFile(file);
    if (validationError) {
      setBgError(validationError);
      return;
    }

    setIsUploadingBg(true);
    const previousPath = bgType === "image" ? bgValue : null;
    const ext = file.name.split(".").pop() || "png";
    const newPath = `${userId}/bg-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("page-assets").upload(newPath, file);
    if (uploadError) {
      setBgError("Upload failed. Try again.");
      setIsUploadingBg(false);
      return;
    }

    onBrandingChange({ bgType: "image", bgValue: newPath });
    setIsUploadingBg(false);

    if (previousPath) {
      void supabase.storage.from("page-assets").remove([previousPath]);
    }
  }

  function handleRemoveBgImage() {
    const previousPath = bgType === "image" ? bgValue : null;
    onBrandingChange({ bgType: "solid", bgValue: null });
    if (previousPath) {
      void supabase.storage.from("page-assets").remove([previousPath]);
    }
  }

  function handleSaveBranding() {
    setSaveError(null);
    setSaved(false);
    startSaving(async () => {
      const result = await updateBranding({
        theme,
        accent,
        headingFont,
        linkFont,
        bgType,
        bgValue,
        bgImageBrightness,
        bgImageContrast,
        bgImageOverlay,
        headingColor,
        taglineColor,
        linkBgColor,
        linkTextColor,
      });
      if (result.success) {
        setSaved(true);
      } else {
        setSaveError(result.error ?? "Could not save.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <label className="block text-sm font-medium text-white mb-3">Logo / photo</label>
        <div className="flex items-center gap-5">
          {currentUrl ? (
            <div className="relative size-20 rounded-full overflow-hidden border border-[#33373b] shrink-0">
              <Image src={currentUrl} alt="Logo" fill sizes="80px" unoptimized className="object-cover" />
            </div>
          ) : (
            <div className="size-20 rounded-full flex items-center justify-center text-xl font-semibold text-[#18181a] bg-[#54e0ff] shrink-0">
              {initials(displayName || "?")}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#33373b] px-4 py-2 text-sm font-medium text-white hover:border-[#54e0ff]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                {currentUrl ? "Change" : "Upload"}
              </button>
              {currentUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#33373b] px-3 py-2 text-sm text-[#7a7a83] hover:text-red-400 hover:border-red-400/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-[#7a7a83]">PNG, JPEG, or WebP. Max 2MB.</p>
          </div>
        </div>
        {logoError && <p className="mt-3 text-sm text-red-400">{logoError}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="border-t border-[#33373b] pt-8">
        <label className="block text-sm font-medium text-white mb-3">Theme</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {THEME_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onBrandingChange({ theme: key, bgType: "solid", bgValue: null })}
              className="flex flex-col items-center gap-2 cursor-pointer"
            >
              <span
                className={`block size-14 rounded-2xl border-2 transition-colors ${
                  theme === key ? "border-[#54e0ff]" : "border-transparent"
                }`}
                style={{ background: THEMES[key as ThemeKey].swatch }}
              />
              <span className={`text-[11px] ${theme === key ? "text-white" : "text-[#7a7a83]"}`}>
                {THEMES[key as ThemeKey].name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#33373b] pt-8">
        <label className="block text-sm font-medium text-white mb-3">
          Background <span className="text-[#7a7a83] font-normal">(overrides theme)</span>
        </label>

        <div className="inline-flex gap-1 mb-4 p-1 rounded-[10px] bg-white/[0.03] border border-[#33373b]">
          {(["solid", "image"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                if (mode === "solid" && bgType === "image") {
                  onBrandingChange({ bgType: "solid", bgValue: null });
                }
                setBgMode(mode);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-[7px] transition-all cursor-pointer ${
                bgMode === mode
                  ? "bg-[#54e0ff] text-[#18181a]"
                  : "text-[#7a7a83] hover:text-white"
              }`}
            >
              {mode === "solid" ? "Color" : "Image"}
            </button>
          ))}
        </div>

        {bgMode === "solid" ? (
          <>
            <div className="flex items-center gap-3">
              <label className="relative size-10 rounded-full border border-[#33373b] cursor-pointer overflow-hidden shrink-0">
                <input
                  type="color"
                  value={bgType === "solid" ? (bgValue ?? "#18181a") : "#18181a"}
                  onChange={(e) => onBrandingChange({ bgType: "solid", bgValue: e.target.value })}
                  className="absolute -inset-2 cursor-pointer"
                />
              </label>
              <span className="text-sm text-[#a1a1aa]">
                {bgType === "solid" && bgValue ? bgValue : "Using theme's default background"}
              </span>
              {bgType === "solid" && bgValue && (
                <button
                  type="button"
                  onClick={() => onBrandingChange({ bgValue: null })}
                  className="text-xs text-[#54e0ff] hover:underline cursor-pointer"
                >
                  Reset to theme
                </button>
              )}
            </div>
            {bgType === "solid" && bgValue && !headingColor && (
              <p className="mt-3 text-[13px] text-amber-400">
                With a custom background, check your heading/tagline colors below still read
                clearly against it.
              </p>
            )}
          </>
        ) : (
          <div>
            {bgImageUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative size-16 rounded-[10px] overflow-hidden border border-[#33373b] shrink-0">
                  <Image src={bgImageUrl} alt="Background" fill unoptimized className="object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => bgFileInputRef.current?.click()}
                      disabled={isUploadingBg}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[#33373b] px-4 py-2 text-sm font-medium text-white hover:border-[#54e0ff]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      {isUploadingBg ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ImagePlus className="size-4" />
                      )}
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveBgImage}
                      disabled={isUploadingBg}
                      className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#33373b] px-3 py-2 text-sm text-[#7a7a83] hover:text-red-400 hover:border-red-400/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-[#7a7a83]">PNG, JPEG, or WebP. Max 2MB.</p>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  disabled={isUploadingBg}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[#33373b] px-4 py-2 text-sm font-medium text-white hover:border-[#54e0ff]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {isUploadingBg ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  Upload image
                </button>
                <p className="mt-2 text-xs text-[#7a7a83]">PNG, JPEG, or WebP. Max 2MB.</p>
              </div>
            )}
            {bgError && <p className="mt-3 text-sm text-red-400">{bgError}</p>}
            <input
              ref={bgFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleBgFileSelect}
              className="hidden"
            />

            {bgType === "image" && bgImageUrl && (
              <div className="flex flex-col gap-4 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#7a7a83]">Brightness</label>
                    <span className="text-xs text-[#a1a1aa]">{bgImageBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={5}
                    value={bgImageBrightness}
                    onChange={(e) => onBrandingChange({ bgImageBrightness: Number(e.target.value) })}
                    className="w-full accent-[#54e0ff] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#7a7a83]">Contrast</label>
                    <span className="text-xs text-[#a1a1aa]">{bgImageContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={5}
                    value={bgImageContrast}
                    onChange={(e) => onBrandingChange({ bgImageContrast: Number(e.target.value) })}
                    className="w-full accent-[#54e0ff] cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[#7a7a83]">Fade (dark overlay)</label>
                    <span className="text-xs text-[#a1a1aa]">{bgImageOverlay}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={bgImageOverlay}
                    onChange={(e) => onBrandingChange({ bgImageOverlay: Number(e.target.value) })}
                    className="w-full accent-[#54e0ff] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[#33373b] pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">Heading color</label>
            {headingColor && (
              <button
                type="button"
                onClick={() => onBrandingChange({ headingColor: null })}
                className="text-xs text-[#54e0ff] hover:underline cursor-pointer"
              >
                Reset to theme
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="relative size-10 rounded-full border border-[#33373b] cursor-pointer overflow-hidden shrink-0">
              <input
                type="color"
                value={headingColor ?? "#ffffff"}
                onChange={(e) => onBrandingChange({ headingColor: e.target.value })}
                className="absolute -inset-2 cursor-pointer"
              />
            </label>
            <span className="text-sm text-[#a1a1aa]">
              {headingColor ? headingColor : "Using theme's default"}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">Tagline color</label>
            {taglineColor && (
              <button
                type="button"
                onClick={() => onBrandingChange({ taglineColor: null })}
                className="text-xs text-[#54e0ff] hover:underline cursor-pointer"
              >
                Reset to theme
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="relative size-10 rounded-full border border-[#33373b] cursor-pointer overflow-hidden shrink-0">
              <input
                type="color"
                value={taglineColor ?? "#a1a1aa"}
                onChange={(e) => onBrandingChange({ taglineColor: e.target.value })}
                className="absolute -inset-2 cursor-pointer"
              />
            </label>
            <span className="text-sm text-[#a1a1aa]">
              {taglineColor ? taglineColor : "Using theme's default"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#33373b] pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">Link card color</label>
            {linkBgColor && (
              <button
                type="button"
                onClick={() => onBrandingChange({ linkBgColor: null })}
                className="text-xs text-[#54e0ff] hover:underline cursor-pointer"
              >
                Reset to theme
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="relative size-10 rounded-full border border-[#33373b] cursor-pointer overflow-hidden shrink-0">
              <input
                type="color"
                value={linkBgColor ?? "#18181a"}
                onChange={(e) => onBrandingChange({ linkBgColor: e.target.value })}
                className="absolute -inset-2 cursor-pointer"
              />
            </label>
            <span className="text-sm text-[#a1a1aa]">
              {linkBgColor ? linkBgColor : "Using theme's default"}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-white">
              Link text &amp; icon color
            </label>
            {linkTextColor && (
              <button
                type="button"
                onClick={() => onBrandingChange({ linkTextColor: null })}
                className="text-xs text-[#54e0ff] hover:underline cursor-pointer"
              >
                Reset to theme
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="relative size-10 rounded-full border border-[#33373b] cursor-pointer overflow-hidden shrink-0">
              <input
                type="color"
                value={linkTextColor ?? "#ffffff"}
                onChange={(e) => onBrandingChange({ linkTextColor: e.target.value })}
                className="absolute -inset-2 cursor-pointer"
              />
            </label>
            <span className="text-sm text-[#a1a1aa]">
              {linkTextColor ? linkTextColor : "Using theme's default"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#33373b] pt-8">
        <label className="block text-sm font-medium text-white mb-3">Accent color</label>
        <div className="flex flex-wrap gap-3">
          {ACCENT_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onBrandingChange({ accent: color })}
              className="relative size-9 rounded-full cursor-pointer"
              style={{ backgroundColor: color }}
              aria-label={color}
            >
              {accent === color && (
                <span className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-[#18181a]" />
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onBrandingChange({ accent: null })}
            className="relative size-9 rounded-full border border-[#33373b] flex items-center justify-center text-[#7a7a83] hover:text-white cursor-pointer"
            aria-label="None"
          >
            <Ban className="size-4" />
            {accent === null && (
              <span className="absolute inset-0 rounded-full ring-2 ring-white ring-offset-2 ring-offset-[#18181a]" />
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-[#33373b] pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FontPicker
          label="Heading font"
          value={headingFont}
          onChange={(key) => onBrandingChange({ headingFont: key })}
        />
        <FontPicker
          label="Link font"
          value={linkFont}
          onChange={(key) => onBrandingChange({ linkFont: key })}
        />
      </div>

      <div className="border-t border-[#33373b] pt-8">
        {saveError && <p className="mb-3 text-sm text-red-400">{saveError}</p>}
        {saved && (
          <p className="mb-3 text-sm text-emerald-400 inline-flex items-center gap-1.5">
            <Check className="size-3.5" /> Saved.
          </p>
        )}
        <button
          type="button"
          onClick={handleSaveBranding}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-medium bg-white text-[#18181a] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Save branding
        </button>
      </div>
    </div>
  );
}
