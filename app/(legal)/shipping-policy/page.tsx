import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Shipping & Delivery Policy — Locallify Scan",
  description: "How printed QR code orders are fulfilled and shipped.",
  path: "/shipping-policy",
  keywords: ["Locallify Scan shipping policy", "printed QR code delivery"],
});

const LAST_UPDATED = new Date().toLocaleDateString("en-IN", {
  year: "numeric",
  month: "long",
  day: "numeric",
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

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main className="pt-40 sm:pt-52 pb-24 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-sm text-[#7a7a83] mb-12">Last updated: {LAST_UPDATED}</p>

          <Section title="What this policy covers">
            <p>
              This policy applies only to physical &quot;Order Printed QR&quot; purchases.
              Your free digital hub and QR download have nothing to ship — they&apos;re
              available instantly in your account.
            </p>
          </Section>

          <Section title="Where we ship">
            <p>
              We currently ship within India only. If this changes, we&apos;ll update this
              page and let you know at checkout before you order.
            </p>
          </Section>

          <Section title="How orders are fulfilled">
            <p>
              Printed QR orders are reviewed and fulfilled manually by our team. Once your
              payment is confirmed, your order is typically dispatched within{" "}
              <span className="text-white">7–10 business days</span>. This is a current
              estimate, not a guaranteed SLA, and may vary with order volume.
            </p>
          </Section>

          <Section title="Order status">
            <p>
              We don&apos;t yet have automated shipment tracking or notifications. If you
              want an update on your order, contact us directly and we&apos;ll check on it.
            </p>
          </Section>

          <Section title="If your order doesn't arrive">
            <p>
              Contact us with your order details and we&apos;ll investigate with our
              shipping partner and make it right — reprint, replace, or refund, depending on
              what happened.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Shipping questions:{" "}
              <a href="mailto:hello@locallifyagency.com" className="text-[#54e0ff] hover:underline">
                hello@locallifyagency.com
              </a>
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
