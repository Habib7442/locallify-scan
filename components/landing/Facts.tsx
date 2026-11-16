import { facts } from "@/content/landing";
import { Container, Section } from "./primitives";

export function Facts() {
  return (
    <Section labelledBy="facts-title" className="py-14 md:py-16">
      <Container>
        <h2 id="facts-title" className="sr-only">
          {facts.title}
        </h2>
        <dl className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {facts.items.map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center px-4 text-center ${i > 0 ? "lg:border-l lg:border-[#33373b]" : ""}`}
            >
              <dt className="order-2 mt-2 text-[15px] font-light text-[#9a9aa3] md:text-base">{item.label}</dt>
              <dd className="order-1 text-[40px] leading-none font-light tracking-[-0.06em] text-white md:text-[60px]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
