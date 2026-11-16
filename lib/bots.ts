// Link-preview crawlers and bots must not count as scans (and never create sessions).
const BOT_RE =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|whatsapp|telegram|discord|slack|twitter|linkedin|embedly|quora|pinterest|vkshare|skype|headless|lighthouse|curl|wget|python-requests|httpclient/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return BOT_RE.test(ua);
}

export function deviceKind(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}
