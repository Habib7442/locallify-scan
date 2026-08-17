import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us — Locallify Scan",
  description: "Get in touch with the Locallify Scan team.",
  path: "/contact-us",
  keywords: ["contact Locallify Scan", "Locallify Scan support"],
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-[-0.02em] mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-[#a1a1aa] text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

export default function ContactUsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main className="pt-40 sm:pt-52 pb-24 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
            Contact Us
          </h1>
          <p className="text-sm text-[#7a7a83] mb-12">
            Locallify Scan, operated by Locallify — Silchar, Assam, India
          </p>

          <Section title="Email">
            <a
              href="mailto:hello@locallifyagency.com"
              className="inline-flex items-center gap-2 text-[#54e0ff] hover:underline"
            >
              <Mail className="size-4" />
              hello@locallifyagency.com
            </a>
            <p>Best for support requests, refund/cancellation requests, and general questions.</p>
          </Section>

          <Section title="WhatsApp">
            <a
              href="https://wa.me/916000163450"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#54e0ff] hover:underline"
            >
              <MessageCircle className="size-4" />
              +91 6000163450
            </a>
            <p>Best for quick questions.</p>
          </Section>

          <Section title="Location">
            <p className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-[#54e0ff]" />
              Silchar, Assam, India
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
