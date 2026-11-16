import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { WorksWith } from "@/components/landing/WorksWith";
import { Features } from "@/components/landing/Features";
import { WhyDobara } from "@/components/landing/WhyDobara";
import { Facts } from "@/components/landing/Facts";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { PendingScroll } from "@/components/landing/PendingScroll";

export default function Home() {
  return (
    <>
      <Header />
      <PendingScroll />
      <main className="flex-1">
        <Hero />
        <WorksWith />
        <Features />
        <WhyDobara />
        <Facts />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
