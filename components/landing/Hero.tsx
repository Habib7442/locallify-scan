import { Check } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { hero } from "@/content/landing";
import { DEMO_WHATSAPP_URL } from "@/lib/site";
import { AccentTitle, Container, Eyebrow, Glow, btn } from "./primitives";
import { HeroPreview } from "./HeroPreview";
import { ScrollLink } from "./ScrollLink";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-[#18181a] pt-28 pb-14 md:pt-36 md:pb-16">
      <div aria-hidden className="bg-pixel-grid pointer-events-none absolute inset-0 opacity-10" />
      <Glow />

      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start">
          <Eyebrow className="fade-up">{hero.eyebrow}</Eyebrow>

          <h1
            id="hero-title"
            className="fade-up mt-6 text-[38px] leading-[1.15] font-normal tracking-[-0.05em] text-balance text-white sm:text-[52px] lg:text-[66px] lg:tracking-[-0.06em]"
            style={delay(80)}
          >
            {hero.titleLine1}{" "}
            <br className="hidden md:inline" />
            <AccentTitle title={hero.title} />
          </h1>

          <p
            className="fade-up mt-6 max-w-[56ch] text-base leading-[1.5] font-light text-[#9a9aa3] md:text-[20px]"
            style={delay(160)}
          >
            {hero.subtitle}
          </p>

          <div className="fade-up mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row" style={delay(240)}>
            <a
              href={DEMO_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn.primary} ${btn.sizeLg} rounded-[15px]`}
            >
              <FaWhatsapp className="size-5" aria-hidden />
              {hero.primaryCta}
            </a>
            <ScrollLink to="how-it-works" className={`${btn.secondary} ${btn.sizeLg}`}>
              {hero.secondaryCta}
            </ScrollLink>
          </div>

          <ul className="fade-up mt-8 flex flex-wrap gap-x-5 gap-y-2" style={delay(300)}>
            {hero.checks.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[15px] font-light text-[#9a9aa3]">
                <Check className="size-4 text-green-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="fade-up flex justify-center lg:justify-end" style={delay(200)}>
          <HeroPreview />
        </div>
      </Container>
    </section>
  );
}
