import { ImageResponse } from "next/og";
import { getHubPage } from "./data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getHubPage(slug);
  const name = page?.display_name || page?.slug || "Locallify Scan";
  const tagline = page?.tagline;
  const accent = page?.accent || "#54e0ff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#18181a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            backgroundColor: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
            color: "#18181a",
            marginBottom: 32,
          }}
        >
          {initials(name)}
        </div>
        <div style={{ fontSize: 56, fontWeight: 600, color: "#ffffff", display: "flex" }}>
          {name}
        </div>
        {tagline && (
          <div style={{ fontSize: 28, color: "#a1a1aa", marginTop: 16, display: "flex" }}>
            {tagline}
          </div>
        )}
        <div style={{ fontSize: 22, color: "#54545a", marginTop: 48, display: "flex" }}>
          Locallify Scan
        </div>
      </div>
    ),
    { ...size }
  );
}
