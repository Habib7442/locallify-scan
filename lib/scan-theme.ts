import { THEMES, type ThemeRecipe } from "@/lib/themes";
import { getPublicAssetUrl } from "@/lib/storage";
import type { ScanCafe } from "@/lib/scan";

// Turns the cafe's existing Locallify Scan branding into the few values the
// scan page needs. Fonts are intentionally NOT applied (page-weight budget).

const LIGHT_THEMES = new Set(["blanc", "pastel"]);
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export type ScanTheme = {
  background: string;
  backgroundImage: string | null;
  overlay: number; // 0–0.9
  text: string;
  muted: string;
  light: boolean;
  buttonBg: string;
  buttonText: string;
  logoUrl: string | null;
};

export function scanTheme(cafe: ScanCafe): ScanTheme {
  const recipe: ThemeRecipe = THEMES[cafe.theme as keyof typeof THEMES] ?? THEMES.midnight;
  const light = LIGHT_THEMES.has(cafe.theme);
  const accent = cafe.accent && HEX_RE.test(cafe.accent) ? cafe.accent : null;
  const image = cafe.bg_type === "image" ? getPublicAssetUrl(cafe.bg_value) : null;
  const solid = cafe.bg_type === "solid" && cafe.bg_value && HEX_RE.test(cafe.bg_value) ? cafe.bg_value : null;

  return {
    background: solid ?? recipe.background,
    backgroundImage: image,
    overlay: Math.min(0.9, Math.max(0.3, (cafe.bg_image_overlay ?? 30) / 100)),
    text: cafe.heading_color && HEX_RE.test(cafe.heading_color) ? cafe.heading_color : (recipe.headingColor ?? "#ffffff"),
    muted: cafe.tagline_color && HEX_RE.test(cafe.tagline_color) ? cafe.tagline_color : recipe.taglineColor,
    light,
    // Primary button: cafe accent if set, else high-contrast neutral.
    buttonBg: accent ?? (light ? "#0a0a0b" : "#ffffff"),
    buttonText: accent ? readableOn(accent) : light ? "#ffffff" : "#0a0a0b",
    logoUrl: getPublicAssetUrl(cafe.logo_path),
  };
}

/** Black or white text, whichever reads better on the given hex colour. */
function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.179 ? "#0a0a0b" : "#ffffff";
}
