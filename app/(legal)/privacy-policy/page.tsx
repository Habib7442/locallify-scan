import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Locallify Scan",
  description:
    "How Locallify Scan collects, uses, and protects data for hub owners and hub visitors.",
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#18181a] text-white font-sans">
      <Navbar />
      <main className="pt-40 sm:pt-52 pb-24 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#7a7a83] mb-12">Last updated: {LAST_UPDATED}</p>

          <Section title="Overview">
            <p>
              Locallify Scan is a link-in-bio hub builder: anyone can sign up free, build a
              mobile landing page (&quot;hub&quot;), and optionally pay to have a QR code of
              that hub printed and shipped. This policy covers two kinds of people: hub
              owners (people who sign up and build a hub) and hub visitors (the public who
              scan a QR code or visit a hub URL).
            </p>
          </Section>

          <Section title="Information we collect">
            <p>
              <span className="text-white font-medium">From hub owners: </span>
              your name and email address (via Clerk, when you sign up), the profile content
              you create — links, branding, background image, logo — stored in our database
              and file storage, and, if you order a printed QR code, your shipping address
              and a payment reference from Razorpay.
            </p>
            <p>
              <span className="text-white font-medium">From hub visitors: </span>
              non-identifying scan and tap logs — device type, country, and referrer —
              recorded when a public hub is viewed or a link is tapped. No account or
              personal information is required to view a hub.
            </p>
          </Section>

          <Section title="How we use it">
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate your hub editor and the public hub page.</li>
              <li>To automatically set up your account and hub when you sign up.</li>
              <li>To process and fulfill printed QR code orders.</li>
              <li>To show you scan and tap analytics for your own hub.</li>
              <li>To respond to support requests.</li>
            </ul>
          </Section>

          <Section title="Third parties we work with">
            <p>
              We use a small number of trusted service providers to run Locallify Scan, each
              of which processes data under their own privacy policy:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-white font-medium">Clerk</span> — authentication and
                account sessions.
              </li>
              <li>
                <span className="text-white font-medium">Supabase</span> — database and file
                storage for your hub content.
              </li>
              <li>
                <span className="text-white font-medium">Razorpay</span> — payment processing
                for printed QR orders. Locallify Scan never stores your card, UPI, or bank
                details — Razorpay handles that directly.
              </li>
            </ul>
          </Section>

          <Section title="Public visibility">
            <p>
              Anything you add to your hub — your business name, logo, background, and links
              — is publicly visible to anyone who scans your QR code or visits your hub URL.
              That&apos;s the product: your hub is meant to be shared. Don&apos;t add
              information there that you don&apos;t want public.
            </p>
          </Section>

          <Section title="Data retention & deletion">
            <p>
              If you delete your account through Clerk, your profile record is removed from
              our systems. Your hub, links, and order history are not automatically deleted
              alongside it, so that printed-QR order records and previously shared hub URLs
              remain intact. If you want your hub content fully removed as well, contact us
              and we&apos;ll handle it manually.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use Clerk&apos;s session cookies to keep you signed in. We don&apos;t use
              third-party advertising or cross-site tracking cookies.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You can request access to, correction of, or deletion of your data at any time
              by contacting us at{" "}
              <a href="mailto:hello@locallifyagency.com" className="text-[#54e0ff] hover:underline">
                hello@locallifyagency.com
              </a>
              .
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>Locallify Scan is not directed at, and should not be used by, children under 18.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we make changes to this policy, we&apos;ll update the &quot;Last
              updated&quot; date at the top of this page.
            </p>
          </Section>

          <Section title="Contact & grievance">
            <p>
              Locallify Scan
              <br />
              Operated by Locallify — Silchar, Assam, India
              <br />
              Email:{" "}
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
