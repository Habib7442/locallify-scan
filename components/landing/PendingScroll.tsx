"use client";

import { useEffect } from "react";
import { scrollToSection, takePendingScroll } from "./ScrollLink";

/** On the home page, finishes a scroll requested from another page. */
export function PendingScroll() {
  useEffect(() => {
    const id = takePendingScroll();
    if (id) requestAnimationFrame(() => scrollToSection(id));
  }, []);
  return null;
}
