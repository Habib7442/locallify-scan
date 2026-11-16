import Link from "next/link";
import { footer } from "@/content/landing";
import { CONTACT_EMAIL, DEMO_WHATSAPP_URL } from "@/lib/site";
import { Container, focusRing } from "./primitives";

const linkClass = `rounded-md text-[15px] font-light text-[#9a9aa3] transition-colors hover:text-white ${focusRing}`;

export function Footer() {
  return (
    <footer className="border-t border-[#33373b]/60 bg-[#1d1d20] py-12">
      <Container className="flex flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-[40ch]">
          <p className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-medium tracking-[-0.04em] text-white">{footer.brand}</span>
            <span className="text-[13px] font-light text-[#8b8b94]">{footer.byline}</span>
          </p>
          <p className="mt-3 text-[15px] leading-[1.5] font-light text-[#9a9aa3]">{footer.line}</p>
          <ul className="mt-5 flex flex-col gap-2">
            <li>
              <a href={DEMO_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {footer.whatsappLabel}: <span className="text-white/90">{footer.whatsappDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
                {footer.emailLabel}: <span className="text-white/90">{CONTACT_EMAIL}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footer.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-[13px] font-light text-[#8b8b94]">{footer.copyright}</p>
        </div>
      </Container>
    </footer>
  );
}
