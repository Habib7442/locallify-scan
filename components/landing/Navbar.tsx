"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DobaraWordmark } from "@/components/brand/DobaraWordmark";
import { DEMO_WHATSAPP_URL } from "@/lib/site";

const NAV_ITEMS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
] as const;

export function Navbar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  // On the home page, smooth-scroll to the section. Elsewhere (legal pages,
  // /pricing) let the browser navigate to /#id.
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = onHome ? document.getElementById(id) : null;
    setIsSheetOpen(false);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  };

  const linkClass = "whitespace-nowrap text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors";

  return (
    <header className="relative w-full">
      <div className="absolute top-4 sm:top-[40px] left-1/2 -translate-x-1/2 z-30 w-full px-4 sm:w-auto sm:px-0">
        <nav
          aria-label="Main"
          className="bg-[#18181a]/90 backdrop-blur-md rounded-[20px] px-4 sm:px-6 py-3 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] w-full sm:w-auto border border-[#33373b]"
        >
          <div className="flex items-center justify-between gap-4 sm:gap-8 w-full">
            <Link href="/" aria-label="Dobara by Locallify — home" className="shrink-0">
              <DobaraWordmark size="md" />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`/#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={linkClass}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Show when="signed-out">
                <SignInButton forceRedirectUrl="/dashboard">
                  <button className="hidden sm:inline-flex whitespace-nowrap text-[#c7c7cc] hover:text-white text-[14px] font-medium tracking-[-0.3px] px-2 py-2 transition-colors cursor-pointer">
                    Owner login
                  </button>
                </SignInButton>
                <a
                  href={DEMO_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[14px] tracking-[-0.3px] rounded-[10px] px-4 py-2 transition-colors"
                >
                  <MessageCircle className="size-4" />
                  Book a demo
                </a>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex text-[#c7c7cc] hover:text-white text-[14px] font-medium px-2 py-2 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton />
              </Show>

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setIsSheetOpen(true)}
                  className="md:hidden bg-transparent border border-[#33373b] text-[#a1a1aa] hover:text-white hover:border-[#54E0FF] p-2 rounded-md transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <SheetContent side="right" className="bg-[#18181a] border-[#33373b] w-3/4 sm:max-w-xs flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="text-white">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 px-4">
                    {NAV_ITEMS.map((item) => (
                      <a
                        key={item.id}
                        href={`/#${item.id}`}
                        onClick={(e) => handleNavClick(e, item.id)}
                        className={`${linkClass} py-3 px-3 rounded-lg hover:bg-white/5`}
                      >
                        {item.label}
                      </a>
                    ))}
                    <a
                      href={DEMO_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsSheetOpen(false)}
                      className="mt-3 inline-flex items-center justify-center gap-2 bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[15px] rounded-[10px] px-4 py-2.5 transition-colors"
                    >
                      <MessageCircle className="size-4" />
                      Book a free demo
                    </a>
                    <Show when="signed-out">
                      <SignInButton forceRedirectUrl="/dashboard">
                        <button
                          type="button"
                          onClick={() => setIsSheetOpen(false)}
                          className="mt-1 text-[#c7c7cc] hover:text-white font-medium text-[15px] rounded-[10px] px-4 py-2.5 border border-[#33373b] transition-colors cursor-pointer"
                        >
                          Owner login
                        </button>
                      </SignInButton>
                    </Show>
                    <Show when="signed-in">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsSheetOpen(false)}
                        className="mt-1 text-center text-[#c7c7cc] hover:text-white font-medium text-[15px] rounded-[10px] px-4 py-2.5 border border-[#33373b] transition-colors"
                      >
                        Dashboard
                      </Link>
                    </Show>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
