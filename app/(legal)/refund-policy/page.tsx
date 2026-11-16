import { LegalPage, LegalSection, legalLink } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Refund & Cancellation Policy — Dobara by Locallify",
  description: "How cancellations and refunds work for Dobara plans and setup.",
  path: "/refund-policy",
  keywords: ["Dobara refund policy", "Dobara cancellation policy"],
});

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      intro={<p>Simple rules for cancelling Dobara and getting money back.</p>}
    >
      <LegalSection title="Monthly plans">
        <p>
          Monthly plans are paid in advance. You can cancel at any time. Your plan keeps working until the end of the
          month you&apos;ve paid for, and it won&apos;t renew. We don&apos;t refund part of a month.
        </p>
      </LegalSection>

      <LegalSection title="Yearly plans">
        <p>
          If you cancel a yearly plan, we refund the full months you haven&apos;t used yet, minus the value of the 2
          free months that came with paying yearly.
        </p>
      </LegalSection>

      <LegalSection title="One-time setup fee">
        <p>
          If you cancel before our setup visit, we refund the setup fee in full. Once we&apos;ve set up your cafe (QR
          codes made, staff trained), the setup fee isn&apos;t refundable.
        </p>
      </LegalSection>

      <LegalSection title="Extra WhatsApp messages">
        <p>Messages that have already been sent can&apos;t be refunded.</p>
      </LegalSection>

      <LegalSection title="Free pilot">
        <p>The free pilot costs nothing, so there is nothing to refund. You can stop at any time.</p>
      </LegalSection>

      <LegalSection title="If something goes wrong on our side">
        <p>
          If you were charged twice or charged by mistake, tell us and we&apos;ll refund the extra amount in full.
        </p>
      </LegalSection>

      <LegalSection title="How to cancel or ask for a refund">
        <p>
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>{" "}
          or message us on WhatsApp at{" "}
          <a href={whatsappLink("Hi, I'd like to cancel / ask about a refund for Dobara.")} target="_blank" rel="noopener noreferrer" className={legalLink}>
            {CONTACT_WHATSAPP_DISPLAY}
          </a>
          , with your cafe name. We reply within 7 days. Approved refunds are paid back to the way you paid, usually
          within 5–7 business days.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
