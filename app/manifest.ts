import type { MetadataRoute } from "next";

// Installable Live Board for the counter tablet/phone (AGENTS.md §5).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dobara Live Board",
    short_name: "Dobara",
    description: "Live Board for your cafe — dings when a regular checks in.",
    start_url: "/board",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#18181a",
    theme_color: "#18181a",
    icons: [
      { src: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
