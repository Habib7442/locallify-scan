"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { nav } from "@/content/landing";
import { DEMO_WHATSAPP_URL } from "@/lib/site";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { btn, focusRing } from "./primitives";
import { ScrollLink } from "./ScrollLink";

function Logo() {
  return (
    <ScrollLink to="top" className={`flex items-baseline gap-1.5 rounded-md ${focusRing}`}>
      <span className="text-[17px] font-medium tracking-[-0.04em] text-white">{nav.brand}</span>
      <span className="text-[13px] font-light text-[#8b8b94]">{nav.byline}</span>
    </ScrollLink>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <div className="glassmorphic mx-auto flex h-14 max-w-[1200px] items-center justify-between rounded-[20px] pr-2 pl-5 shadow-[0_16px_30.7px_rgba(0,0,0,0.3)]">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {nav.links.map((link) => (
              <li key={link.to}>
                <ScrollLink
                  to={link.to}
                  className={`rounded-md text-[15px] font-light tracking-[-0.03em] text-[#9a9aa3] transition-colors hover:text-white ${focusRing}`}
                >
                  {link.label}
                </ScrollLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={DEMO_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btn.primary} hidden h-10 px-4 text-sm shadow-none sm:inline-flex`}
          >
            {nav.cta}
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label={nav.menuLabel}
              className={`inline-flex size-10 items-center justify-center rounded-[12px] border border-[#33373b] text-[#9a9aa3] transition-colors hover:border-[#54e0ff] hover:text-white md:hidden ${focusRing}`}
            >
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="w-[82%] border-[#33373b] bg-[#1e1e20] p-6 pt-14">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <nav aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {nav.links.map((link) => (
                    <li key={link.to}>
                      <ScrollLink
                        to={link.to}
                        delayMs={300}
                        onClick={() => setOpen(false)}
                        className={`block rounded-[12px] px-3 py-3 text-lg font-light tracking-[-0.03em] text-white hover:bg-white/5 ${focusRing}`}
                      >
                        {link.label}
                      </ScrollLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <a
                href={DEMO_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`${btn.primary} ${btn.sizeMd} mt-4 w-full`}
              >
                {nav.cta}
              </a>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
