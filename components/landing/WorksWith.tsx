import { worksWith } from "@/content/landing";
import { Container } from "./primitives";

export function WorksWith() {
  return (
    <section aria-label="Works with your billing" className="border-t border-[#33373b]/60 bg-[#1d1d20] py-7">
      <Container className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center lg:gap-6">
        <p className="text-center text-[15px] font-light text-[#9a9aa3]">{worksWith.label}</p>
        <ul className="flex flex-wrap justify-center gap-2">
          {worksWith.items.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-[13px] tracking-[-0.01em] text-white/80"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
