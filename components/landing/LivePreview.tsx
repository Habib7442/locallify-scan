import { HeroCanvas } from "./HeroCanvas";

export function LivePreview() {
  return (
    <section className="py-20 sm:py-28 px-4 bg-[#18181a]">
      <div className="mx-auto max-w-5xl flex flex-col items-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 text-balance text-center">
          See it in action
        </h2>
        <p className="text-[#7a7a83] max-w-xl text-center mb-12 text-sm sm:text-base">
          A live look at what a customer sees, and how you manage it.
        </p>
        <HeroCanvas />
      </div>
    </section>
  );
}
