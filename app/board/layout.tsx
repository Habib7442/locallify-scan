import type { ReactNode } from "react";
import { ClerkShell } from "@/components/owner/ClerkShell";

export default function Layout({ children }: { children: ReactNode }) {
  return <ClerkShell>{children}</ClerkShell>;
}
