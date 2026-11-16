// Customer scan page strings (AGENTS.md §10: never hard-code UI text).
// Hindi + Bengali are filled in M5; they fall back to English until then.

export type ScanLang = "en" | "hi" | "bn";

const en = {
  table: (code: string) => `Table ${code.replace(/^T/, "")}`,
  newTitle: "Get rewards for this visit",
  newLine: "Verify on WhatsApp in one tap. Your table can unlock treats, and you get a prize for your next visit.",
  offers: "Send me offers from this cafe on WhatsApp (max 4 a month, reply STOP anytime)",
  verify: "Verify on WhatsApp",
  verifyHint: "WhatsApp opens with a short message — just tap send.",
  welcomeBack: (name: string | null) => (name ? `Welcome back, ${name} 👋` : "Welcome back 👋"),
  returningLine: "Tap below so the team knows you're here.",
  here: "I'm here",
  notYou: "Not you? Verify with WhatsApp",
  checkedInTitle: "You're checked in ✓",
  checkedInLine: (table: string) => `Enjoy your time at ${table}. Show this screen if staff ask.`,
  privacy: (cafe: string) =>
    `We save your name, WhatsApp number and visits at ${cafe} to give you rewards. Only ${cafe} sees them. Reply STOP anytime.`,
  privacyLink: "Privacy policy",
  poweredBy: "Dobara by Locallify",
  waMessage: (cafe: string, code: string) => `Hi ${cafe} 👋 (code: ${code})`,
  errorTitle: "Something went wrong",
  errorLine: "Please go back and try again.",
  slowTitle: "Please wait a minute",
  slowLine: "Too many tries from this phone. Try again in a few minutes.",
  back: "Go back",
  prizeWonTitle: "🎁 You won a prize for your next visit",
  prizeWonLine: "Scratch the card to see what you got.",
  scratchHint: "Scratch here with your finger",
  tapToReveal: "Tap to reveal",
  revealing: "Revealing…",
  validTill: (date: string) => `valid till ${date}`,
  prizeCode: (code: string) => `Code ${code}`,
  showAtCounter: "Show this at the counter on your next visit.",
  yourPrizes: "Your prizes",
  prizeUsed: (date: string) => `Used on ${date}`,
  prizeExpired: "Expired",
  prizeRevealFailed: "Couldn't reveal right now. Please try again.",
  notYourName: (name: string) => `Not ${name}? Change name`,
  askName: "What should we call you?",
  nameLabel: "Your name",
  nameSave: "Save",
  notFoundTitle: "This table isn't active",
  notFoundLine: "Please ask the staff for help.",
};

export type ScanMessages = typeof en;

const messages: Record<ScanLang, ScanMessages> = { en, hi: en, bn: en };

export function scanMessages(lang: ScanLang = "en"): ScanMessages {
  return messages[lang] ?? en;
}
