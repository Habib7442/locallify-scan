import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// The reference (link4coders) specifies "Sharp Grotesk" via a Google Fonts
// @import that doesn't resolve (Google doesn't host that face), so it likely
// renders on a system-sans fallback in practice. Hanken Grotesk is a real,
// self-hosted grotesque sans with the same tight, confident character.
const bodySans = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Locallify Scan — QR codes that never expire",
  description:
    "Your printed QR code lives on our domain, so it never expires and can't be held hostage.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} dark h-full antialiased`}
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
