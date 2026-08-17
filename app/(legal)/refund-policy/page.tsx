import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cancellation & Refunds Policy — Locallify Scan",
  description: "Refund and cancellation terms for printed QR orders and subscriptions.",
  path: "/refund-policy",
  keywords: ["Locallify Scan refund policy", "Locallify Scan cancellation policy"],
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

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main className="pt-40 sm:pt-52 pb-24 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
            Cancellation &amp; Refunds Policy
          </h1>
          <p className="text-sm text-[#7a7a83] mb-12">Last updated: {LAST_UPDATED}</p>

          <Section title="Printed QR orders">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-white font-medium">Before printing starts: </span>
                cancel for a full refund.
              </li>
              <li>
                <span className="text-white font-medium">After printing starts: </span>
                we can&apos;t offer a refund, since each print is custom-made for your hub.
              </li>
              <li>
                <span className="text-white font-medium">Damaged or defective on arrival: </span>
                contact us with photos and we&apos;ll reprint and reship at no extra cost.
              </li>
            </ul>
            <p>
              To cancel a printed QR order, contact us as soon as possible — we can only
              honor a cancellation if printing hasn&apos;t started yet.
            </p>
          </Section>

          <Section title="Subscription">
            <p>
              You can cancel your subscription anytime from your account. Cancellation stops
              future billing but takes effect at the end of your current billing period —
              you keep access until then, and we don&apos;t refund the unused portion of a
              period already paid for. If you cancel during a free trial before it ends,
              you won&apos;t be charged at all.
            </p>
          </Section>

          <Section title="How refunds are paid">
            <p>
              Approved refunds are issued to your original Razorpay payment method and
              typically reflect within 5–7 business days, depending on your bank.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Refund or cancellation requests:{" "}
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
