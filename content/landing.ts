// All copy for the Dobara landing page lives here. Plain owner-friendly words.
// Avoid: CRM, engagement, retention, AI-powered, platform, leverage, seamless.

/** A heading with one accented word (rendered semibold italic + gradient). */
export type AccentHeading = { before: string; accent: string; after?: string };

export const nav = {
  brand: "Dobara",
  byline: "by Locallify",
  links: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  cta: "Book free demo",
  menuLabel: "Open menu",
} as const;

export const hero = {
  eyebrow: "For cafes & restaurants · Silchar",
  // Line 1 + accented line 2; a <br> splits them on md+.
  titleLine1: "Customer aaya?",
  title: { before: "Ab ", accent: "dobara", after: " aayega." } satisfies AccentHeading,
  subtitle:
    "Dobara turns first-time diners into regulars — with a QR on every table, WhatsApp, and rewards that only work on the next visit. Your billing system stays exactly as it is.",
  primaryCta: "Book a free demo on WhatsApp",
  secondaryCta: "See how it works",
  checks: ["No app for customers", "Works with your billing", "We set it up in person"],
} as const;

export const heroPreview = {
  label: "Preview of Dobara screens",
  screenNames: ["Welcome back screen", "Next-visit prize screen", "Thank-you screen"],
  shell: { logo: "BH", place: "Brew House · Table 4" },
  welcome: {
    title: "Welcome back Priya 👋",
    subtitle: "Good to see you again",
    stats: [
      { value: "3rd", label: "visit" },
      { value: "1", label: "prize waiting" },
    ],
    squadTitle: "Table Squad",
    squadCount: "3/4",
    squadInitials: ["P", "R", "A"],
    squadHint: "1 more friend scans → free dessert",
    button: "I'm here",
  },
  prize: {
    header: "Your next-visit prize",
    prize: "☕ Free Cold Coffee",
    validity: "valid 14 days",
    saved: "Saved on your WhatsApp",
    button: "Show at counter",
  },
  thanks: {
    title: "Thanks for visiting!",
    subtitle: "Your prize is saved",
    rows: [
      { label: "Visits", value: "6" },
      { label: "Next prize", value: "Free Dessert" },
      { label: "Last visit", value: "12 Nov" },
    ],
    button: "Open WhatsApp",
  },
} as const;

export const worksWith = {
  label: "Works alongside whatever you use today:",
  items: ["Petpooja", "DotPe", "Vyapar", "Any billing app", "Paper register"],
} as const;

export const features = {
  eyebrow: "Features",
  title: { before: "Four simple ways to bring them ", accent: "back" } satisfies AccentHeading,
  subtitle: "No points to explain. No app to download. Just a QR on the table and WhatsApp.",
  items: [
    {
      key: "squad",
      label: "Table Squad",
      title: "Everyone at the table scans",
      body: "When the whole table scans the QR, the table wins a free dessert. Friends bring friends into your list.",
      visual: { count: "4/4", reward: "free dessert", initials: ["P", "R", "A", "S"] },
    },
    {
      key: "prize",
      label: "Next-Visit Prize",
      title: "A prize they can only use next time",
      body: "After the bill, each diner scratches a card on their phone. The prize only works when they come back.",
      visual: { prize: "Free Cold Coffee", hint: "Use on your next visit" },
    },
    {
      key: "pehchaan",
      label: "Pehchaan",
      title: "Staff greet regulars by name",
      body: "The counter screen dings when a regular scans — with their name, visit count and what they like.",
      visual: { title: "Table 4 — Arjun", meta: "6th visit · kam teekha" },
    },
    {
      key: "fill",
      label: "Fill My Tables",
      title: "Empty tables? One tap.",
      body: "On a slow afternoon, send a short WhatsApp offer to your regulars. You see the cost before you send.",
      visual: { title: "Tables bharo", people: "312 people", cost: "₹290", button: "Send offer" },
    },
  ],
} as const;

export const why = {
  eyebrow: "Why Dobara",
  title: { before: "Built for how local restaurants ", accent: "actually", after: " run" } satisfies AccentHeading,
  subtitle: "Made for a busy counter, not for a tech team.",
  items: [
    { icon: "smartphone", title: "No app for customers", body: "They scan with the phone camera. Nothing to download, no password." },
    { icon: "receipt", title: "Keeps your billing as it is", body: "Keep Petpooja, Vyapar or your register. Dobara sits next to it." },
    { icon: "lock", title: "Your customer list stays yours", body: "Your diners belong to your cafe. Never shared, never sold." },
    { icon: "handshake", title: "Set up in person", body: "We come to your cafe, put up the QRs and train your staff." },
    { icon: "languages", title: "Hindi, Bengali & English", body: "Customers see Dobara in the language they are comfortable with." },
    { icon: "shield", title: "WhatsApp without the spam", body: "Max 4 offers a month per customer. They can reply STOP anytime." },
  ],
} as const;

export const facts = {
  title: "Dobara in numbers",
  items: [
    { value: "0", label: "apps your customers download" },
    { value: "30 sec", label: "to scan & verify" },
    { value: "14 days", label: "prize validity" },
    { value: "1 tap", label: "to fill empty tables" },
  ],
} as const;

export const howItWorks = {
  eyebrow: "How it works",
  title: { before: "How a visit ", accent: "works" } satisfies AccentHeading,
  subtitle: "Four steps for the customer. Nothing extra for your staff.",
  steps: [
    { n: "01", title: "Scan the table QR", body: "The customer points their camera at the QR on the table." },
    { n: "02", title: "Verify on WhatsApp", body: "One tap sends a WhatsApp message. No forms, no OTP typing." },
    { n: "03", title: "Win a next-visit prize", body: "After the bill, they scratch a card for their next visit." },
    { n: "04", title: "Come back, get greeted", body: "Staff see them on the counter screen and greet them by name." },
  ],
} as const;

export const pricing = {
  eyebrow: "Pricing",
  title: { before: "Simple ", accent: "monthly", after: " pricing" } satisfies AccentHeading,
  subtitle: "One flat plan per outlet. WhatsApp messages included.",
  pilot: {
    text: "Free pilot for our first 3 cafes in Silchar — we set everything up and train your staff.",
    cta: "Join the pilot",
  },
  perMonth: "/month",
  recommended: "Recommended",
  plans: [
    {
      name: "Starter",
      price: "₹1,499",
      blurb: "For a single cafe getting started.",
      features: [
        "1 outlet, up to 10 tables",
        "Table Squad",
        "Next-Visit Prize",
        "Counter screen",
        "500 WhatsApp messages/month",
      ],
      cta: "Choose Starter",
      message: "Hi Dobara, I'm interested in the Starter plan for my cafe.",
      recommended: false,
    },
    {
      name: "Growth",
      price: "₹2,499",
      blurb: "For busy restaurants that want more regulars.",
      features: [
        "Everything in Starter",
        "Fill My Tables",
        "Birthday offers",
        "1,500 WhatsApp messages/month",
        "Customer export",
      ],
      cta: "Choose Growth",
      message: "Hi Dobara, I'm interested in the Growth plan for my restaurant.",
      recommended: true,
    },
  ],
  footnote: "Extra messages ~₹1.2 each · One-time setup ₹2,000–5,000 · Pay yearly, get 2 months free",
} as const;

export const faq = {
  eyebrow: "FAQ",
  title: { before: "Questions owners ", accent: "ask" } satisfies AccentHeading,
  subtitle: "Short answers. Message us if yours isn't here.",
  items: [
    {
      q: "Do my customers need an app?",
      a: "No. They scan the QR with their phone camera and confirm on WhatsApp, which they already have.",
    },
    {
      q: "Does Dobara replace my billing software?",
      a: "No. Keep using Petpooja, Vyapar, DotPe or your paper register. Staff only type the bill amount into Dobara when the table leaves.",
    },
    {
      q: "What if a customer doesn't use WhatsApp?",
      a: "They can still eat and pay as usual. Rewards and offers need WhatsApp, because that's how we send them.",
    },
    {
      q: "Who owns the customer data?",
      a: "You do. Your customer list is only for your cafe. We never share it with other businesses and never sell it.",
    },
    {
      q: "How much do WhatsApp messages cost me?",
      a: "Your plan includes a monthly bundle (500 or 1,500). If you go over, extra messages are about ₹1.2 each. Before every offer you see the cost.",
    },
    {
      q: "Can customers stop the messages?",
      a: "Yes. Replying STOP stops them right away. Even without that, nobody gets more than 4 offers a month.",
    },
    {
      q: "How do we get started?",
      a: "Message us on WhatsApp. We visit your cafe, show a demo on a real table, put up the QRs and train your staff.",
    },
  ],
} as const;

export const finalCta = {
  title: { before: "Give every diner a reason to come ", accent: "dobara", after: "." } satisfies AccentHeading,
  subtitle: "Message us and we'll show you Dobara working on a real table, at your own cafe.",
  form: {
    name: "Your name",
    namePlaceholder: "e.g. Rahul",
    cafe: "Cafe / restaurant name",
    cafePlaceholder: "e.g. Brew House",
    phone: "Phone number",
    phonePlaceholder: "e.g. 98xxxxxx10",
    submit: "Send on WhatsApp",
    note: "This just opens WhatsApp with your message. We don't store anything here.",
  },
  or: "or",
  bigCta: "Book a free demo on WhatsApp",
} as const;

/** Builds the prefilled WhatsApp message for the demo form. */
export function demoMessage(name: string, cafe: string, phone: string) {
  return `Hi Dobara, I'm ${name} from ${cafe}. I'd like a free demo. My number: ${phone}`;
}

export const footer = {
  brand: "Dobara",
  byline: "by Locallify",
  line: "Turns first-time diners into regulars — with a table QR, WhatsApp and next-visit rewards.",
  whatsappLabel: "WhatsApp",
  whatsappDisplay: "+91 97073 70886",
  emailLabel: "Email",
  links: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Contact", href: "/contact-us" },
  ],
  copyright: "© 2026 Locallify",
} as const;
