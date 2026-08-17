import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LivePreview } from "@/components/landing/LivePreview";
import { WhyUs } from "@/components/landing/WhyUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Verticals } from "@/components/landing/Verticals";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white selection:bg-[#54e0ff] selection:text-[#18181a] font-sans">
      <Navbar />
      <main>
        <Hero />
        <LivePreview />
        <WhyUs />
        <HowItWorks />
        <Verticals />
      </main>
      <Footer />
    </div>
  );
}
