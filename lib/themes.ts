import type { CSSProperties } from "react";

export type ThemeRecipe = {
  name: string;
  background: string;
  headingColor?: string;
  headingGradient?: string;
  headingTextShadow?: string;
  taglineColor: string;
  linkCardClassName: string;
  linkCardStyle?: CSSProperties;
  footerColor: string;
  radiusClassName: string;
  swatch: string;
  // Guaranteed-legible color for link-type icon glyphs on this theme's
  // link-card background — independent of each icon's own brand color,
  // which some themes (light ones especially) can't safely render at
  // full saturation (e.g. X's near-white glyph vanishes on a white card).
  iconColor: string;
};

export const THEMES = {
  midnight: {
    name: "Midnight",
    background: "#18181a",
    headingColor: "#ffffff",
    taglineColor: "#a1a1aa",
    linkCardClassName: "bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]",
    footerColor: "#c2c2c9",
    radiusClassName: "rounded-[12px]",
    swatch: "linear-gradient(135deg, #18181a, #29292c)",
    iconColor: "#ffffff",
  },
  blanc: {
    name: "Blanc",
    background: "#ffffff",
    headingColor: "#0a0a0b",
    taglineColor: "#6b7280",
    linkCardClassName: "bg-black/[0.03] border-black/10 text-[#0a0a0b] hover:bg-black/[0.06]",
    footerColor: "#374151",
    radiusClassName: "rounded-[12px]",
    swatch: "linear-gradient(135deg, #ffffff, #e5e7eb)",
    iconColor: "#0a0a0b",
  },
  sunset: {
    name: "Sunset",
    background: "linear-gradient(160deg, #ff6b6b 0%, #f06595 35%, #cc5de8 70%, #845ef7 100%)",
    headingColor: "#ffffff",
    headingTextShadow: "0 2px 12px rgba(0,0,0,0.25)",
    taglineColor: "rgba(255,255,255,0.85)",
    linkCardClassName: "bg-white/15 backdrop-blur-md border-white/25 text-white hover:bg-white/25",
    footerColor: "rgba(255,255,255,0.9)",
    radiusClassName: "rounded-[16px]",
    swatch: "linear-gradient(160deg, #ff6b6b, #cc5de8, #845ef7)",
    iconColor: "#ffffff",
  },
  neon: {
    name: "Neon",
    background: "#0a0a0f",
    headingGradient: "linear-gradient(90deg, #ff2fd0, #00f0ff)",
    taglineColor: "#9d9db8",
    linkCardClassName: "bg-white/[0.03] text-white hover:bg-white/[0.06]",
    linkCardStyle: {
      border: "1px solid rgba(0,240,255,0.3)",
      boxShadow: "0 0 20px rgba(255,47,208,0.15)",
    },
    footerColor: "#c9c9e0",
    radiusClassName: "rounded-[10px]",
    swatch: "linear-gradient(135deg, #ff2fd0, #00f0ff)",
    iconColor: "#f0f0fa",
  },
  pastel: {
    name: "Pastel",
    background: "linear-gradient(160deg, #ffd6e8 0%, #e0c3fc 50%, #c3f0ff 100%)",
    headingColor: "#5b4b6f",
    taglineColor: "#8a7a9e",
    linkCardClassName: "bg-white/60 backdrop-blur-sm border-white/80 text-[#5b4b6f] hover:bg-white/80",
    footerColor: "#5b4b6f",
    radiusClassName: "rounded-full",
    swatch: "linear-gradient(160deg, #ffd6e8, #e0c3fc, #c3f0ff)",
    iconColor: "#5b4b6f",
  },
  mono: {
    name: "Mono",
    background: "#000000",
    headingColor: "#ffffff",
    taglineColor: "#a3a3a3",
    linkCardClassName:
      "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black",
    footerColor: "#d4d4d4",
    radiusClassName: "rounded-none",
    swatch: "linear-gradient(135deg, #000000, #404040)",
    iconColor: "#ffffff",
  },
} satisfies Record<string, ThemeRecipe>;

export type ThemeKey = keyof typeof THEMES;

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

export function themeRecipe(key: string | null | undefined): ThemeRecipe {
  return THEMES[key as ThemeKey] ?? THEMES.midnight;
}
