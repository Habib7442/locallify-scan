import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/device";
import { getDeviceState, logScan, resolveCafeTable } from "@/lib/scan";
import { scanTheme } from "@/lib/scan-theme";
import { isBotUserAgent } from "@/lib/bots";
import { scanMessages } from "@/messages/scan";
import { ScratchCard } from "./ScratchCard";

// Customer scan page (PRD §7.2). Server-rendered, no client JS of its own,
// plain HTML forms. No login. Writes on GET: one scan-log row (non-bots).

type Params = Promise<{ business: string; table: string }>;

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#18181a", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { business, table } = await params;
  const found = await resolveCafeTable(business, table);
  const t = scanMessages();
  return {
    title: found ? `${found.cafe.display_name ?? "Cafe"} · ${t.table(found.table.code)}` : "Dobara",
    robots: { index: false, follow: false },
  };
}

export default async function ScanPage({ params }: { params: Params }) {
  const { business, table: tableCode } = await params;
  const found = await resolveCafeTable(business, tableCode);
  if (!found) notFound();
  const { cafe, table } = found;

  const [cookieStore, h] = await Promise.all([cookies(), headers()]);
  const ua = h.get("user-agent");
  const deviceId = await verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);
  const [state] = await Promise.all([
    getDeviceState(cafe.id, table.id, deviceId),
    isBotUserAgent(ua) ? Promise.resolve() : logScan(cafe.id, table.id, ua, h.get("referer")),
  ]);

  const t = scanMessages();
  const theme = scanTheme(cafe);
  const cafeName = cafe.display_name ?? "this cafe";
  const tableName = t.table(table.code);

  const prizes = state.kind === "new" ? [] : state.prizes;
  const newPrize = prizes.find((p) => p.state === "unscratched") ?? null;
  const shownPrizes = prizes.filter((p) => p.state !== "unscratched" && p.label);

  const buttonStyle = { backgroundColor: theme.buttonBg, color: theme.buttonText };
  const cardBg = theme.light ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.35)";
  const cardBorder = theme.light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)";

  return (
    <main
      lang="en"
      className="relative flex min-h-[100svh] flex-col"
      style={{ background: theme.background, color: theme.text }}
    >
      {theme.backgroundImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote branding image, sized by CSS */}
          <img src={theme.backgroundImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${theme.overlay})` }} />
        </>
      ) : null}

      <div className="relative mx-auto flex w-full max-w-[440px] flex-1 flex-col px-5 pt-10 pb-6">
        <header className="flex flex-col items-center text-center">
          {theme.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- tiny logo; avoids image optimizer round trip
            <img src={theme.logoUrl} alt="" width={72} height={72} className="size-[72px] rounded-full object-cover" />
          ) : (
            <span
              aria-hidden
              className="flex size-[72px] items-center justify-center rounded-full text-[28px] font-semibold"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
            >
              {cafeName.charAt(0).toUpperCase()}
            </span>
          )}
          <h1 className="mt-4 text-[26px] leading-tight font-semibold tracking-[-0.03em]">{cafeName}</h1>
          <p className="mt-1 text-[16px]" style={{ color: theme.muted }}>
            {tableName}
          </p>
        </header>

        <section className="mt-8 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          {state.kind === "checked-in" ? (
            <>
              <h2 className="text-[22px] leading-snug font-semibold">{t.checkedInTitle}</h2>
              <p className="mt-2 text-[16px] leading-relaxed" style={{ color: theme.muted }}>
                {t.checkedInLine(tableName)}
              </p>
            </>
          ) : state.kind === "returning" ? (
            <>
              <h2 className="text-[22px] leading-snug font-semibold">{t.welcomeBack(state.customer.name)}</h2>
              <p className="mt-2 text-[16px] leading-relaxed" style={{ color: theme.muted }}>
                {t.returningLine}
              </p>
              <form method="post" action="/api/scan/here" className="mt-5">
                <input type="hidden" name="business" value={cafe.slug} />
                <input type="hidden" name="table" value={table.code} />
                <button
                  type="submit"
                  className="h-14 w-full rounded-[14px] text-[18px] font-semibold focus-visible:ring-4 focus-visible:ring-[#54e0ff] focus-visible:outline-none"
                  style={buttonStyle}
                >
                  {t.here}
                </button>
              </form>
              <form method="post" action="/api/scan/verify" className="mt-3 text-center">
                <input type="hidden" name="business" value={cafe.slug} />
                <input type="hidden" name="table" value={table.code} />
                <button type="submit" className="min-h-12 px-2 text-[15px] underline underline-offset-4" style={{ color: theme.muted }}>
                  {t.notYou}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-[22px] leading-snug font-semibold">{t.newTitle}</h2>
              <p className="mt-2 text-[16px] leading-relaxed" style={{ color: theme.muted }}>
                {t.newLine}
              </p>
              <form method="post" action="/api/scan/verify" className="mt-5">
                <input type="hidden" name="business" value={cafe.slug} />
                <input type="hidden" name="table" value={table.code} />
                <label className="flex cursor-pointer items-start gap-3 py-2 text-[15px] leading-snug">
                  <input type="checkbox" name="offers" value="1" className="mt-0.5 size-6 shrink-0 accent-current" />
                  <span>{t.offers}</span>
                </label>
                <button
                  type="submit"
                  className="mt-4 h-14 w-full rounded-[14px] text-[18px] font-semibold focus-visible:ring-4 focus-visible:ring-[#54e0ff] focus-visible:outline-none"
                  style={buttonStyle}
                >
                  {t.verify}
                </button>
                <p className="mt-3 text-center text-[14px]" style={{ color: theme.muted }}>
                  {t.verifyHint}
                </p>
              </form>
            </>
          )}
        </section>

        {state.kind !== "new" ? (
          <>
            {newPrize ? (
              <section className="mt-4 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                <h2 className="text-[20px] leading-snug font-semibold">{t.prizeWonTitle}</h2>
                <p className="mt-1 mb-4 text-[15px]" style={{ color: theme.muted }}>
                  {t.prizeWonLine}
                </p>
                <ScratchCard
                  prizeId={newPrize.id}
                  accent={theme.buttonBg}
                  accentText={theme.buttonText}
                  labels={{
                    scratchHint: t.scratchHint,
                    tapToReveal: t.tapToReveal,
                    revealing: t.revealing,
                    validTill: t.validTill("").trim(),
                    prizeCode: t.prizeCode("").trim(),
                    showAtCounter: t.showAtCounter,
                    failed: t.prizeRevealFailed,
                  }}
                />
              </section>
            ) : null}

            {shownPrizes.length > 0 ? (
              <section className="mt-4 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                <h2 className="text-[18px] font-semibold">{t.yourPrizes}</h2>
                <ul className="mt-3 space-y-3">
                  {shownPrizes.map((p) => (
                    <li key={p.id} className="text-[16px]">
                      <span className="font-medium">🎟️ {p.label}</span>
                      <span className="block text-[14px]" style={{ color: theme.muted }}>
                        {p.state === "active"
                          ? `${t.validTill(formatDay(p.validUntil))} · ${t.prizeCode(p.code ?? "")} · ${t.showAtCounter}`
                          : p.state === "redeemed"
                            ? t.prizeUsed(formatDay(p.redeemedAt ?? p.validUntil))
                            : t.prizeExpired}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <details className="mt-4 text-[15px]" open={!state.customer.name}>
              <summary className="min-h-12 cursor-pointer py-3" style={{ color: theme.muted }}>
                {state.customer.name ? t.notYourName(state.customer.name.split(" ")[0] ?? "") : t.askName}
              </summary>
              <form method="post" action="/api/scan/name" className="flex gap-2">
                <input type="hidden" name="business" value={cafe.slug} />
                <input type="hidden" name="table" value={table.code} />
                <label className="sr-only" htmlFor="diner-name">
                  {t.nameLabel}
                </label>
                <input
                  id="diner-name"
                  name="name"
                  required
                  maxLength={40}
                  autoComplete="given-name"
                  defaultValue={state.customer.name ?? ""}
                  className="h-12 min-w-0 flex-1 rounded-[12px] border px-3 text-[16px] text-[#18181a]"
                  style={{ borderColor: cardBorder }}
                />
                <button type="submit" className="h-12 rounded-[12px] px-4 font-semibold" style={buttonStyle}>
                  {t.nameSave}
                </button>
              </form>
            </details>
          </>
        ) : null}

        {state.kind !== "checked-in" ? (
          // Back from WhatsApp → reload once so "You're checked in ✓" shows (no polling, no anon DB access).
          <script
            dangerouslySetInnerHTML={{
              __html:
                "document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){window.__dl=1}else if(window.__dl){location.reload()}});",
            }}
          />
        ) : null}

        <footer className="mt-auto pt-8 text-center text-[13px] leading-relaxed" style={{ color: theme.muted }}>
          <p>{t.privacy(cafeName)}</p>
          <p className="mt-2">
            <a href="/privacy-policy" className="underline underline-offset-4">
              {t.privacyLink}
            </a>{" "}
            · {t.poweredBy}
          </p>
        </footer>
      </div>
    </main>
  );
}
