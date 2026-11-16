"use client";

import type { FormEvent, InputHTMLAttributes } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { demoMessage, finalCta } from "@/content/landing";
import { DEMO_WHATSAPP_URL, whatsappLink } from "@/lib/site";
import { AccentTitle, Container, Glow, btn, focusRing, h2Class, subtitleClass } from "./primitives";

const inputClass = `h-12 w-full rounded-[12px] border border-[#33373b] bg-[#1e1e20] px-4 text-[15px] text-white placeholder:text-[#8b8b94] transition-colors hover:border-white/20 ${focusRing}`;

function Field({ id, label, ...props }: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label htmlFor={id} className="text-[13px] font-medium text-white/90">
        {label}
      </label>
      <input id={id} name={id} required className={inputClass} {...props} />
    </div>
  );
}

export function FinalCTA() {
  const f = finalCta.form;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const url = whatsappLink(demoMessage(get("name"), get("cafe"), get("phone")));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="demo" aria-labelledby="demo-title" className="relative scroll-mt-24 overflow-hidden bg-[#18181a] py-16 md:py-20">
      <Glow />
      <Container className="relative flex flex-col items-center text-center">
        <h2 id="demo-title" className={`${h2Class} max-w-[18ch]`}>
          <AccentTitle title={finalCta.title} />
        </h2>
        <p className={`${subtitleClass} mt-4 max-w-[60ch]`}>{finalCta.subtitle}</p>

        <form
          onSubmit={onSubmit}
          className="mt-12 grid w-full max-w-[880px] gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:p-6"
        >
          <Field id="name" label={f.name} placeholder={f.namePlaceholder} autoComplete="name" />
          <Field id="cafe" label={f.cafe} placeholder={f.cafePlaceholder} autoComplete="organization" />
          <Field id="phone" label={f.phone} placeholder={f.phonePlaceholder} type="tel" inputMode="tel" autoComplete="tel" pattern="[0-9+ ]{8,16}" />
          <button type="submit" className={`${btn.primary} ${btn.sizeMd} shadow-none`}>
            <FaWhatsapp className="size-5" aria-hidden />
            {f.submit}
          </button>
          <p className="text-left text-[13px] font-light text-[#9a9aa3] md:col-span-4">{f.note}</p>
        </form>

        <p className="my-6 text-sm font-light text-[#8b8b94]">{finalCta.or}</p>

        <a
          href={DEMO_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn.highlight} h-16 w-full px-8 text-lg sm:w-auto md:text-xl`}
        >
          <FaWhatsapp className="size-6" aria-hidden />
          {finalCta.bigCta}
        </a>
      </Container>
    </section>
  );
}
