import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { GOOGLE_SITE_VERIFICATION, buildMetadata } from "@/lib/seo";
import "./globals.css";

// The reference (link4coders) specifies "Sharp Grotesk" via a Google Fonts
// @import that doesn't resolve (Google doesn't host that face), so it likely
// renders on a system-sans fallback in practice. Hanken Grotesk is a real,
// self-hosted grotesque sans with the same tight, confident character.
const bodySans = Hanken_Grotesk({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: "Dobara by Locallify — turn first-time diners into regulars",
    description:
      "A QR on every table, WhatsApp, and prizes that only work on the next visit. Dobara brings cafe and restaurant customers back — alongside your existing billing.",
    path: "/",
    keywords: [
      "Dobara",
      "restaurant loyalty program India",
      "cafe customer retention",
      "WhatsApp marketing for restaurants",
      "repeat customers restaurant",
      "table QR code",
    ],
  }),
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} dark h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
