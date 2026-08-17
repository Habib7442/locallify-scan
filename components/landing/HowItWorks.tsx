export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "You build your hub",
      desc: "Sign up free and add your logo, links, and branding — live on our own domain in minutes.",
    },
    {
      step: "02",
      title: "You order your QR",
      desc: "Pay once, we print and ship it. One code, printed once — it never needs reprinting.",
    },
    {
      step: "03",
      title: "You edit anytime",
      desc: "Change links or details whenever you need — the code stays the same.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-[#18181a]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="hero-card p-8 rounded-2xl relative flex flex-col justify-between"
            >
              <span className="text-4xl font-black gradient-text-accent mb-4 block">
                {item.step}
              </span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[#7a7a83] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
