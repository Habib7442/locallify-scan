"use client";

import Image from "next/image";
import { useUser, SignUpButton } from "@clerk/nextjs";
import { ChevronRight, User } from "lucide-react";

export function Hero({ heroImageVersion }: { heroImageVersion?: string }) {
  const { user, isSignedIn } = useUser();

  const handleScrollToPreview = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("live-preview");
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative w-full h-auto min-h-[600px] sm:h-[879px] bg-[#18181a] overflow-x-hidden overflow-y-visible sm:overflow-hidden"
      style={{
        backgroundImage: "url(/background-grid.svg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative w-full max-w-[1440px] h-auto min-h-[600px] sm:h-[879px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Mobile Layout (below 640px) */}
        <div className="sm:hidden flex flex-col items-center text-center px-4 pt-24 pb-10">
          {isSignedIn && (
            <div className="mb-4">
              <div className="flex items-center gap-2 glassmorphic rounded-[12px] px-3 py-2 shadow-[0px_8px_16px_rgba(0,0,0,0.20)]">
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt="" width={20} height={20} className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#18181a]" />
                  </div>
                )}
                <span className="text-[12px] font-medium tracking-[-0.36px] text-white">
                  Signed in as {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h1 className="text-[36px] leading-[42px] font-normal tracking-[-1.8px] text-white">
              A QR code{" "}
              <span className="inline-flex items-center rotate-12">
                <Image src="/logo-icon.png" alt="" width={38} height={38} className="relative top-[2px]" />
              </span>{" "}
              that
              <br />
              can&apos;t be{" "}
              <span className="font-semibold italic text-[#54E0FF]">held hostage.</span>
            </h1>
          </div>

          <div className="mb-6 max-w-sm">
            <p className="text-[14px] font-light leading-[20px] tracking-[-0.28px] text-[#7a7a83]">
              Printed once, on our domain. Edit it anytime — it never expires.
            </p>
          </div>

          <div className="w-full max-w-xs mb-8">
            <SignUpButton>
              <button className="font-medium text-[14px] tracking-[-0.42px] rounded-[12px] shadow-[0px_8px_20px_rgba(0,0,0,0.30)] h-[44px] w-full flex items-center justify-center bg-white text-[#18181a] hover:bg-gray-100 transition-all duration-300 cursor-pointer">
                Create Your Profile
              </button>
            </SignUpButton>
          </div>

          {/* Preview image */}
          <div
            className="relative w-full max-w-[300px]"
            style={{ aspectRatio: "1122 / 1402" }}
          >
            <Image
              src={`/assets/hero_image.webp${heroImageVersion ? `?v=${heroImageVersion}` : ""}`}
              alt="Locallify Scan hub page: WhatsApp ordering, Google reviews, live scan stats, and a permanent QR code"
              fill
              unoptimized
              sizes="300px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Desktop Layout (640px and above) */}
        <div className="hidden sm:block">
          {isSignedIn && (
            <div className="absolute" style={{ left: "clamp(1rem, 10.3vw, 149px)", top: "235px" }}>
              <div className="flex items-center gap-2 glassmorphic rounded-[12px] px-4 py-2 shadow-[0px_8px_16px_rgba(0,0,0,0.20)]">
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#54E0FF] to-[#29ADFF] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#18181a]" />
                  </div>
                )}
                <span className="text-[14px] font-medium tracking-[-0.42px] text-white">
                  Signed in as {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          )}

          {/* Main Headline Text */}
          <div
            className="absolute"
            style={{ left: "clamp(1rem, 10.3vw, 149px)", top: "275px", width: "min(457px, 32vw)", height: "158px" }}
          >
            <h1 className="text-[66.22px] font-normal leading-[78.80px] tracking-[-3.97px] text-white whitespace-nowrap">
              A QR code{" "}
              <span className="inline-flex items-center rotate-12">
                <Image src="/logo-icon.png" alt="" width={64} height={64} className="relative top-[4px]" />
              </span>{" "}
              that
              <br />
              can&apos;t be{" "}
              <span className="font-semibold italic text-[#54E0FF]">held hostage.</span>
            </h1>
          </div>

          {/* Description */}
          <div
            className="absolute"
            style={{ left: "clamp(1rem, 10.3vw, 149px)", top: "456px", width: "min(630px, 44vw)", height: "74px" }}
          >
            <p className="text-[24.85px] font-light leading-[36.54px] tracking-[-0.75px] text-[#7a7a83]">
              Printed once, on our domain. Edit it anytime — it never expires.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="absolute flex items-center gap-4"
            style={{ left: "clamp(1rem, 10.4vw, 150px)", top: "575px", height: "60px" }}
          >
            <SignUpButton>
              <button className="font-medium text-[20px] tracking-[-0.6px] rounded-[15px] shadow-[0px_12px_32px_rgba(0,0,0,0.40)] h-full px-8 flex items-center justify-center bg-white text-[#18181a] hover:bg-gray-100 transition-all duration-300 cursor-pointer whitespace-nowrap">
                Create Your Profile
              </button>
            </SignUpButton>
            <a
              href="#live-preview"
              onClick={handleScrollToPreview}
              className="font-medium text-[20px] tracking-[-0.6px] rounded-[15px] h-full px-6 flex items-center justify-center gap-1.5 text-white bg-transparent hover:bg-white/5 border border-[#33373b] transition-all duration-300 whitespace-nowrap"
            >
              Live Preview
              <ChevronRight className="size-4 stroke-[2.5]" />
            </a>
          </div>

          {/* Right Side Preview Container */}
          <div
            className="absolute"
            style={{
              left: "clamp(calc(100% - 444px - 2rem), 58.8vw, 846px)",
              top: "195px",
              width: "min(444px, 31vw)",
              height: "536px",
            }}
          >
            <Image
              src={`/assets/hero_image.webp${heroImageVersion ? `?v=${heroImageVersion}` : ""}`}
              alt="Locallify Scan hub page: WhatsApp ordering, Google reviews, live scan stats, and a permanent QR code"
              fill
              priority
              unoptimized
              sizes="444px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
