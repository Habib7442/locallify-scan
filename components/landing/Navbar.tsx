"use client";

import Image from "next/image";
import Link from "next/link";
import { SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsSheetOpen(false);
  };

  return (
    <header className="relative w-full">
      <div className="absolute top-4 sm:top-[62px] left-1/2 transform -translate-x-1/2 z-10 w-full px-4 sm:w-auto sm:px-0">
        <nav className="bg-[#18181a] rounded-[20px] px-4 sm:px-6 py-3 sm:py-4 shadow-[0px_16px_30.7px_rgba(0,0,0,0.30)] w-full sm:w-auto sm:min-w-0">
          <div className="flex items-center justify-between gap-4 sm:gap-8 w-full">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative w-[32px] h-[32px] sm:w-[44px] sm:h-[44px] shrink-0">
                <Image src="/logo-icon.png" alt="" fill sizes="44px" className="object-contain" />
              </div>
              <span className="text-white text-[13px] sm:text-[15px] font-medium tracking-[-0.39px] sm:tracking-[-0.45px] whitespace-nowrap">
                Locallify Scan
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-6">
              <a
                href="#why-us"
                onClick={(e) => handleNavClick(e, "why-us")}
                className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors"
              >
                Why Us
              </a>
              <a
                href="#verticals"
                onClick={(e) => handleNavClick(e, "verticals")}
                className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors"
              >
                Verticals
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleNavClick(e, "how-it-works")}
                className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors"
              >
                How it Works
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Show when="signed-out">
                <SignUpButton>
                  <button className="hidden sm:inline-flex bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[13px] sm:text-[15px] tracking-[-0.39px] sm:tracking-[-0.45px] rounded-[10px] px-3 sm:px-4 py-2 transition-colors cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>

              {/* Mobile Menu Trigger */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="sm:hidden bg-transparent border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54E0FF] p-2 rounded-md transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <SheetContent
                  side="right"
                  className="bg-[#18181a] border-[#33373b] w-3/4 sm:max-w-xs flex flex-col"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 px-4">
                    <a
                      href="#why-us"
                      onClick={(e) => handleNavClick(e, "why-us")}
                      className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-white/5"
                    >
                      Why Us
                    </a>
                    <a
                      href="#verticals"
                      onClick={(e) => handleNavClick(e, "verticals")}
                      className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-white/5"
                    >
                      Verticals
                    </a>
                    <a
                      href="#how-it-works"
                      onClick={(e) => handleNavClick(e, "how-it-works")}
                      className="text-[#7a7a83] text-[15px] font-light tracking-[-0.45px] hover:text-white transition-colors py-3 px-3 rounded-lg hover:bg-white/5"
                    >
                      How it Works
                    </a>
                    <Show when="signed-out">
                      <SignUpButton>
                        <button
                          onClick={() => setIsSheetOpen(false)}
                          className="mt-3 bg-white text-[#18181a] hover:bg-gray-100 font-medium text-[15px] tracking-[-0.45px] rounded-[10px] px-4 py-2.5 transition-colors cursor-pointer"
                        >
                          Sign Up
                        </button>
                      </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                      <div className="mt-3 px-3">
                        <UserButton />
                      </div>
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
