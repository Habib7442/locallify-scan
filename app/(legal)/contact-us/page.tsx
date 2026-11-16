import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { LegalPage, LegalSection, legalLink } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_DISPLAY, DEMO_WHATSAPP_URL } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact — Dobara by Locallify",
  description: "Talk to the Dobara team on WhatsApp or email. Based in Silchar, Assam.",
  path: "/contact-us",
  keywords: ["contact Dobara", "Locallify contact", "Dobara demo"],
});

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact us"
      intro={<p>Dobara is a product of Locallify Agency (proprietor: Samrat Nath), Silchar, Assam, India.</p>}
    >
      <LegalSection title="WhatsApp">
        <p>
          <a href={DEMO_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`${legalLink} inline-flex items-center gap-2`}>
            <FaWhatsapp className="size-4" aria-hidden />
            {CONTACT_WHATSAPP_DISPLAY}
          </a>
        </p>
        <p>The quickest way to reach us: demos, setup, support and questions.</p>
      </LegalSection>

      <LegalSection title="Email">
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`} className={`${legalLink} inline-flex items-center gap-2`}>
            <Mail className="size-4" aria-hidden />
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>Best for billing, cancellations and refunds, and privacy requests.</p>
      </LegalSection>

      <LegalSection title="Location">
        <p className="inline-flex items-center gap-2">
          <MapPin className="size-4 text-[#54e0ff]" aria-hidden />
          Silchar, Assam, India
        </p>
      </LegalSection>

      <LegalSection title="Deleting your data">
        <p>
          Diners can send <strong>DELETE</strong> to our WhatsApp number, or ask the cafe. We delete your data within
          30 days. See our{" "}
          <Link href="/privacy-policy" className={legalLink}>
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
