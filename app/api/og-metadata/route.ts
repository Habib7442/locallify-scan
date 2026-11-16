import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    let validUrl: URL;
    try {
      validUrl = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(validUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `HTTP ${res.status}` }, { status: 400 });
    }

    const html = await res.text();

    // Helper regex parser for Open Graph meta tags
    const getMetaContent = (property: string): string | null => {
      const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, "i")) ||
                      html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, "i"));
      if (ogMatch?.[1]) return ogMatch[1].trim();

      const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i")) ||
                        html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i"));
      return nameMatch?.[1]?.trim() ?? null;
    };

    let title = getMetaContent("title");
    if (!title) {
      const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = titleTagMatch?.[1]?.trim() ?? null;
    }

    const description = getMetaContent("description");
    let image = getMetaContent("image");

    // Resolve relative image URLs to full absolute URLs
    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, validUrl.origin).toString();
      } catch {
        // Keep as is
      }
    }

    return NextResponse.json({
      title: title ? title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") : null,
      description: description ? description.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'") : null,
      image: image || null,
      siteName: validUrl.hostname,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
