import { LegalPage, LegalSection, legalLink } from "@/components/legal/LegalPage";
import { CONTACT_EMAIL, CONTACT_WHATSAPP_DISPLAY, whatsappLink } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy — Dobara by Locallify",
  description:
    "What Dobara collects from diners and cafe owners, how it is used, who it is shared with, and how to delete your data.",
  path: "/privacy-policy",
  keywords: ["Dobara privacy policy", "restaurant WhatsApp privacy", "DPDP"],
});

const deleteLink = whatsappLink("DELETE");

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          Dobara helps cafes and restaurants bring customers back using a table QR code, WhatsApp and rewards. This
          policy explains what we collect, why, and what you can do about it. We keep it short and in plain words.
        </p>
      }
    >
      <LegalSection title="Who we are">
        <p>
          Dobara is a product of <strong>Locallify Agency</strong> (proprietor: Samrat Nath), Silchar, Assam, India.
          In this policy, &ldquo;we&rdquo; means Locallify Agency, and &ldquo;the cafe&rdquo; means the cafe or
          restaurant whose table QR you scanned.
        </p>
      </LegalSection>

      <LegalSection title="Who this policy covers">
        <ul>
          <li>
            <strong>Diners</strong>: people who scan a Dobara QR code at a cafe.
          </li>
          <li>
            <strong>Cafe owners and staff</strong>: people who sign in to run Dobara for their cafe.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="What we collect from diners">
        <ul>
          <li>Your name and WhatsApp number, when you verify on WhatsApp.</li>
          <li>Your birthday, only if you choose to give it.</li>
          <li>Your visits to that cafe: dates, table, and the bill amount staff enter when you leave.</li>
          <li>Your prizes and offers, and whether you used them.</li>
          <li>
            Short staff notes about food preferences, like &ldquo;kam teekha&rdquo;. Staff are told never to write
            sensitive personal details.
          </li>
          <li>
            A small cookie on your phone that remembers you for up to 180 days, so you don&apos;t have to verify
            every visit.
          </li>
          <li>Basic scan logs (time, which table, device type), used to count scans.</li>
        </ul>
        <p>That is all. We don&apos;t ask for a password, address, payment details or anything else.</p>
      </LegalSection>

      <LegalSection title="What we collect from cafe owners and staff">
        <p>
          Your name, email and phone number when you sign in (handled by our sign-in provider, Clerk), your
          cafe&apos;s details and branding, and a record of actions such as closing a visit or redeeming a prize.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <ul>
          <li>To give you rewards at that cafe: Table Squad, next-visit prizes and offers.</li>
          <li>So the cafe&apos;s staff can recognise you and greet you by name.</li>
          <li>To send you WhatsApp messages about your visit, your prizes and, if you agreed, offers.</li>
          <li>To show the cafe simple numbers, like how many customers came back.</li>
        </ul>
        <p>
          Your data is used <strong>only by the cafe where you shared it</strong>. It is never shared with other
          cafes, and it is never sold.
        </p>
      </LegalSection>

      <LegalSection title="WhatsApp messages">
        <ul>
          <li>Messages come from the shared &ldquo;Dobara by Locallify&rdquo; WhatsApp number and name the cafe.</li>
          <li>
            You only get offers if you tick the box on the scan page. The box is unticked by default, and we record
            when you agreed.
          </li>
          <li>A cafe can send you at most 4 offers a month.</li>
          <li>
            Reply <strong>STOP</strong>, <strong>band karo</strong> or <strong>unsubscribe</strong> at any time and
            offers stop at once.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Who handles the data for us">
        <p>We use a few service providers to run Dobara. They only process data to provide their service to us:</p>
        <ul>
          <li>Meta (WhatsApp Business Platform): sends and receives WhatsApp messages.</li>
          <li>Supabase: our database and file storage.</li>
          {/* TODO: once the database move to the Mumbai region is confirmed, say data is stored in India. */}
          <li>Clerk: sign-in for cafe owners and staff.</li>
          <li>Vercel: hosts the website.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Who is responsible for your data">
        <p>
          The cafe decides how your data is used for its customers. It is the &ldquo;data fiduciary&rdquo; under
          India&apos;s Digital Personal Data Protection Act. We run Dobara and process the data on the cafe&apos;s
          behalf (the &ldquo;data processor&rdquo;).
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your data while the cafe uses Dobara. If you ask us to delete it, or the cafe stops using Dobara,
          we delete it within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <ul>
          <li>Ask what data we hold about you, and have mistakes corrected.</li>
          <li>
            Delete your data: send <strong>DELETE</strong> on WhatsApp (
            <a href={deleteLink} target="_blank" rel="noopener noreferrer" className={legalLink}>
              {CONTACT_WHATSAPP_DISPLAY}
            </a>
            ) or ask the cafe. We delete it within 30 days.
          </li>
          <li>Withdraw your consent to offers at any time by replying STOP.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use one cookie on the scan page to remember your verified phone for up to 180 days, and the cookies our
          sign-in provider needs for owners and staff. We don&apos;t use advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Owner and staff accounts are for adults. Diners under 18 shouldn&apos;t sign up for offers.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Data is sent over encrypted connections. Each cafe can only see its own customers, and staff see only the
          last 4 digits of a phone number. Only the cafe owner can export the customer list.
        </p>
      </LegalSection>

      <LegalSection title="Questions and complaints">
        <p>
          Contact our grievance officer, Samrat Nath, at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>
            {CONTACT_EMAIL}
          </a>{" "}
          or on WhatsApp at{" "}
          <a href={whatsappLink("Hi, I have a privacy question about Dobara.")} target="_blank" rel="noopener noreferrer" className={legalLink}>
            {CONTACT_WHATSAPP_DISPLAY}
          </a>
          . We reply within 7 days and aim to resolve complaints within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>If we change this policy, we&apos;ll update the date at the top. Big changes will also be shared with cafes.</p>
      </LegalSection>
    </LegalPage>
  );
}
