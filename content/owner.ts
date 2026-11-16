// Copy for sign-up, onboarding, the owner home and the board placeholder.
// English for now; Hindi/Bengali come in M5.

export const auth = {
  brand: "Dobara",
  byline: "by Locallify",
  signUpTitle: "Bring your customers back",
  signUpLine: "Set up your cafe in a few minutes. A QR on every table, WhatsApp, and next-visit rewards.",
  signInTitle: "Welcome back",
  signInLine: "Sign in to your cafe.",
  points: ["No app for your customers", "Works with your billing", "Free pilot in Silchar"],
} as const;

// Clerk UI wording: "organization" → "cafe".
export const clerkLocalization = {
  taskChooseOrganization: {
    title: "Set up your cafe",
    subtitle: "Create your cafe to start using Dobara",
    createOrganization: {
      title: "Create your cafe",
      subtitle: "Use the name your customers know",
      formButtonSubmit: "Create cafe",
      formButtonReset: "Cancel",
      formFieldLabel__name: "Cafe name",
      formFieldInputPlaceholder__name: "e.g. Brew House",
    },
    chooseOrganization: {
      title: "Choose your cafe",
      subtitle: "Join a cafe you were invited to, or create your own",
      action__createOrganization: "Create a new cafe",
      action__invitationAccept: "Join",
      subtitle__createOrganizationDisabled: "Ask your cafe owner to invite you",
    },
    organizationCreationDisabled: {
      title: "You need an invite",
      subtitle: "Ask your cafe owner to invite you to Dobara",
    },
  },
} as const;

export const onboarding = {
  stepOf: (n: number) => `Step ${n} of 2`,
  cafe: {
    title: "Your cafe",
    line: "Check your cafe's name and web address. Customers see these when they scan.",
    nameLabel: "Cafe name",
    slugLabel: "Web address",
    slugHelp: "Only small letters, numbers and dashes. This goes on your printed QR codes, so choose carefully.",
    slugLocked: "Locked because your QR codes are already in use. Contact us to change it.",
    submit: "Save and continue",
  },
  tables: {
    title: "Your tables",
    line: "How many tables do you have? We'll name them T1, T2, T3… You can rename or add more later.",
    countLabel: "Number of tables",
    submit: "Create tables",
    back: "Back",
  },
  errors: {
    name: "Cafe name must be 2 to 60 characters.",
    slugInvalid: "Use 3 to 40 small letters, numbers or dashes (not at the start or end).",
    slugReserved: "That web address is reserved. Please pick another.",
    slugTaken: "Already taken. Please pick another.",
    count: "Enter a number from 1 to 60.",
    notOwner: "Only the cafe owner can do this.",
    generic: "Something went wrong. Please try again.",
  },
} as const;

export const dashboard = {
  title: "Your cafe",
  addressLabel: "Web address",
  tablesTitle: "Tables & QR links",
  tablesLine: "Each table has its own QR code. Print the cards and place one on each table.",
  print: "Print QR cards",
  copy: "Copy",
  copied: "Copied",
  addTitle: "Add more tables",
  addLabel: "Total tables",
  addSubmit: "Update tables",
  board: "Open Live Board",
  noTables: "No tables yet.",
} as const;

export const board = {
  title: "Live Board",
  line: "The counter screen that dings when a regular scans is coming soon.",
  notMember: "You're not part of a cafe yet. Ask your cafe owner to invite you.",
} as const;
