import fs from "fs";
import path from "path";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LivePreview } from "@/components/landing/LivePreview";
import { WhyUs } from "@/components/landing/WhyUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Verticals } from "@/components/landing/Verticals";
import { Footer } from "@/components/landing/Footer";

function getHeroImageVersion() {
  try {
    const stat = fs.statSync(path.join(process.cwd(), "public/assets/hero_image.webp"));
    return stat.mtimeMs.toString();
  } catch {
    return "0";
  }
}

export default function Home() {
  const heroImageVersion = getHeroImageVersion();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white selection:bg-[#54e0ff] selection:text-[#18181a] font-sans">
      <Navbar />
      <main>
        <Hero heroImageVersion={heroImageVersion} />
        <LivePreview />
        <WhyUs />
        <HowItWorks />
        <Verticals />
      </main>
      <Footer />
    </div>
  );
}
