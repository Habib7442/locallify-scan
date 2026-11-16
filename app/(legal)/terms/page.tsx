import Link from "next/link";
import { LegalPage, LegalSection, legalLink } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service — Dobara by Locallify",
  description: "The terms for cafes and restaurants using Dobara by Locallify.",
  path: "/terms",
  keywords: ["Dobara terms", "Dobara terms of service"],
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are between your business (&ldquo;you&rdquo;, the cafe or restaurant) and Locallify Agency
          (proprietor: Samrat Nath), Silchar, Assam, India (&ldquo;we&rdquo;). By using Dobara you agree to them.
        </p>
      }
    >
      <LegalSection title="1. The service">
        <p>
          Dobara helps you bring customers back with table QR codes, WhatsApp verification, Table Squad, next-visit
          prizes, a counter screen that recognises regulars, and WhatsApp offers. It works alongside your billing
          software or register. It is not a billing, ordering or POS system and doesn&apos;t replace one.
        </p>
      </LegalSection>

      <LegalSection title="2. Who can use it">
        <p>Dobara is for cafes, restaurants and similar food businesses in India, run by adults who can sign contracts.</p>
      </LegalSection>

      <LegalSection title="3. Accounts and staff">
        <p>
          The owner account controls your cafe&apos;s Dobara. You can add and remove staff. Keep sign-ins private,
          remove staff who leave, and tell us quickly if you think an account is misused. You are responsible for
          what happens under your accounts.
        </p>
      </LegalSection>

      <LegalSection title="4. Your responsibilities">
        <ul>
          <li>Honour the prizes, Table Squad rewards and offers you set up, within their validity.</li>
          <li>Let customers know you use Dobara. The scan page shows a privacy notice for you.</li>
          <li>Keep staff notes to food preferences. Never record sensitive personal details.</li>
          <li>Send only genuine offers from your cafe, and follow WhatsApp&apos;s rules.</li>
          <li>Don&apos;t use customer data for anything other than your own cafe.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. WhatsApp messages and limits">
        <p>
          Your plan includes a monthly number of WhatsApp messages. To protect customers and the shared number, Dobara
          limits offers to 1 campaign per day and at most 4 offers per customer per month, and only sends offers to
          customers who agreed. Customers can reply STOP at any time. WhatsApp is run by Meta, so we can&apos;t
          guarantee every message is delivered.
        </p>
      </LegalSection>

      <LegalSection title="6. Fees">
        <p>
          Plans, setup fees and extra message charges are shown on our{" "}
          <Link href="/" className={legalLink}>
            website
          </Link>{" "}
          or agreed with you in writing. Monthly plans are billed in advance. See our{" "}
          <Link href="/refund-policy" className={legalLink}>
            Refund Policy
          </Link>{" "}
          for cancellations and refunds. Free pilots are free for the period we agree with you.
        </p>
      </LegalSection>

      <LegalSection title="7. Customer data">
        <p>
          Your customer list belongs to your cafe. We process it on your behalf to run Dobara, as described in our{" "}
          <Link href="/privacy-policy" className={legalLink}>
            Privacy Policy
          </Link>
          . We never share it with other businesses or sell it. On plans that include it, you can export it.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>
          Don&apos;t use Dobara to send spam, misleading offers or unlawful content, to collect data you aren&apos;t
          allowed to, or to try to break or misuse the service. We may pause an account that does.
        </p>
      </LegalSection>

      <LegalSection title="9. Availability">
        <p>
          We work to keep Dobara running, but we can&apos;t promise it will always be available or error-free. Parts
          of it depend on other services, such as WhatsApp.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          As far as the law allows, we aren&apos;t liable for indirect losses such as lost profits or lost customers.
          Our total liability is limited to the fees you paid us in the 3 months before the claim.
        </p>
      </LegalSection>

      <LegalSection title="11. Ending the service">
        <p>
          You can stop using Dobara at any time. We may end or pause service if these terms are seriously broken.
          When service ends, we delete your cafe&apos;s customer data within 30 days, after giving you a chance to
          export it if your plan allows.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>These terms are governed by the laws of India. Courts at Silchar, Assam have jurisdiction.</p>
      </LegalSection>

      <LegalSection title="13. Changes">
        <p>If we change these terms, we&apos;ll update the date at the top and tell you about big changes.</p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>
          , or see our{" "}
          <Link href="/contact-us" className={legalLink}>
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
