import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — Locallify Scan",
  description: "The terms that govern your use of Locallify Scan.",
};

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

export default function TermsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main className="pt-40 sm:pt-52 pb-24 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-[#7a7a83] mb-12">Last updated: {LAST_UPDATED}</p>

          <Section title="1. The service">
            <p>
              Locallify Scan lets you sign up, build a mobile landing page (&quot;hub&quot;)
              with links to your business or profile, and optionally order a physical QR
              code print of that hub. Your account may include a free trial period followed
              by a recurring subscription — the exact trial length, price, and billing cycle
              are shown to you at signup and checkout, and govern over anything general
              stated here.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old to create an account. By signing up, you
              confirm the information you provide is accurate.
            </p>
          </Section>

          <Section title="3. Your account">
            <p>
              You&apos;re responsible for keeping your account credentials secure and for all
              activity under your account. Let us know immediately if you suspect
              unauthorized access.
            </p>
          </Section>

          <Section title="4. Acceptable use">
            <p>
              Your hub must not host or link to illegal content, malware, harassment, or
              anything that infringes someone else&apos;s rights. We may suspend or remove a
              hub that violates this.
            </p>
          </Section>

          <Section title="5. Public visibility">
            <p>
              Anything you add to your hub is publicly visible to anyone who scans your QR
              code or visits your hub URL. That&apos;s the product — don&apos;t add
              information there you don&apos;t want public.
            </p>
          </Section>

          <Section title="6. Trial &amp; subscription">
            <p>
              New accounts may start with a free trial period. Unless you cancel before the
              trial ends, your subscription begins automatically and you&apos;ll be charged
              on a recurring basis at the price and interval shown at signup, processed
              through Razorpay. You can cancel anytime from your account; cancellation takes
              effect at the end of your current billing period. See our{" "}
              <Link href="/refund-policy" className="text-[#54e0ff] hover:underline">
                Cancellation &amp; Refunds Policy
              </Link>{" "}
              for details.
            </p>
          </Section>

          <Section title="7. Printed QR orders">
            <p>
              Ordering a physical QR print is a separate, additional purchase from your
              subscription, processed through Razorpay. See our{" "}
              <Link href="/shipping-policy" className="text-[#54e0ff] hover:underline">
                Shipping Policy
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" className="text-[#54e0ff] hover:underline">
                Cancellation &amp; Refunds Policy
              </Link>{" "}
              for how these orders are fulfilled and refunded.
            </p>
          </Section>

          <Section title="8. Intellectual property">
            <p>
              You own the content you add to your hub. Locallify Scan owns the platform,
              design, and software. Using the service doesn&apos;t transfer ownership of
              either to the other party.
            </p>
          </Section>

          <Section title="9. Limitation of liability">
            <p>
              Locallify Scan is provided &quot;as is.&quot; We aren&apos;t liable for
              indirect or consequential losses arising from your use of the service, to the
              maximum extent permitted by law.
            </p>
          </Section>

          <Section title="10. Governing law">
            <p>These terms are governed by the laws of India.</p>
          </Section>

          <Section title="11. Changes to these terms">
            <p>
              If we update these terms, we&apos;ll update the &quot;Last updated&quot; date
              above.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Questions about these terms:{" "}
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
