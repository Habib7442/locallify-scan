import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pricing — Dobara by Locallify",
  description:
    "Simple monthly plans for cafes and restaurants, with WhatsApp messages included. Free pilot for our first 3 cafes in Silchar.",
  path: "/pricing",
  keywords: ["Dobara pricing", "restaurant loyalty program price", "WhatsApp marketing for restaurants cost"],
});

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main>
        <Pricing asPage />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
