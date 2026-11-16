"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

// Scrolls to a home-page section without putting "#id" in the URL.
// From another page it navigates to "/" and scrolls once there.
// The real href ("/#id" or "/") stays as a fallback for new tabs / no JS.

const PENDING_KEY = "dobara:scroll-to";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(id: string) {
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
  if (id === "top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

/** Read and clear a scroll target left by a ScrollLink on another page. */
export function takePendingScroll(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return id;
  } catch {
    return null;
  }
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  /** Section id on the home page, or "top". */
  to: string;
  /** Wait before scrolling, e.g. until a closing menu releases its scroll lock. */
  delayMs?: number;
};

export function ScrollLink({ to, delayMs = 0, onClick, children, ...rest }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const href = to === "top" ? "/" : `/#${to}`;

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    // Let modified clicks (new tab, etc.) use the real href.
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (pathname === "/") {
      if (delayMs > 0) window.setTimeout(() => scrollToSection(to), delayMs);
      else scrollToSection(to);
      return;
    }
    try {
      sessionStorage.setItem(PENDING_KEY, to);
    } catch {
      // Storage blocked: we still land on the home page, just at the top.
    }
    router.push("/");
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
