import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { clerkLocalization } from "@/content/owner";

// Clerk's browser SDK is only loaded on the pages that use Clerk UI (sign-in,
// onboarding, dashboard, board) — not on the landing, legal or customer scan
// pages (page-weight budget, AGENTS.md §10). Server-side auth() works
// everywhere via clerkMiddleware in proxy.ts.
export function ClerkShell({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
        variables: {
          colorPrimary: "#54e0ff",
          colorPrimaryForeground: "#18181a",
          colorBackground: "#1e1e20",
          colorForeground: "#ffffff",
          colorMutedForeground: "#9a9aa3",
          colorInput: "#18181a",
          colorInputForeground: "#ffffff",
          colorBorder: "#33373b",
          borderRadius: "12px",
          fontFamily: "var(--font-body)",
        },
      }}
      localization={clerkLocalization}
      taskUrls={{ "choose-organization": "/onboarding/create-cafe" }}
    >
      {children}
    </ClerkProvider>
  );
}
