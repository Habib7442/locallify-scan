"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPublicAssetUrl } from "@/lib/storage";
import { initials } from "@/components/hub/HubContent";
import { updateLogoPath } from "./actions";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function BrandingTab({
  logoPath,
  onLogoPathChange,
  displayName,
}: {
  logoPath: string | null;
  onLogoPathChange: (path: string | null) => void;
  displayName: string;
}) {
  const { userId } = useAuth();
  const supabase = useSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUrl = getPublicAssetUrl(logoPath);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !userId) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 2MB.");
      return;
    }

    setIsUploading(true);
    const previousPath = logoPath;
    const ext = file.name.split(".").pop() || "png";
    const newPath = `${userId}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("page-assets").upload(newPath, file);
    if (uploadError) {
      setError("Upload failed. Try again.");
      setIsUploading(false);
      return;
    }

    const result = await updateLogoPath(newPath);
    if (!result.success) {
      setError(result.error ?? "Could not save.");
      setIsUploading(false);
      return;
    }

    onLogoPathChange(newPath);
    setIsUploading(false);

    if (previousPath) {
      void supabase.storage.from("page-assets").remove([previousPath]);
    }
  }

  async function handleRemove() {
    const previousPath = logoPath;
    onLogoPathChange(null);

    const result = await updateLogoPath(null);
    if (!result.success) {
      onLogoPathChange(previousPath);
      setError(result.error ?? "Could not remove logo.");
      return;
    }

    if (previousPath) {
      void supabase.storage.from("page-assets").remove([previousPath]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
                  onClick={handleRemove}
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

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
