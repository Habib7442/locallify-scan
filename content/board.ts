// Live Board (Pehchaan) copy. English for now; Hindi/Bengali in M5.

export const board = {
  title: "Live Board",
  startTitle: "Start Live Board",
  startLine: "Tap once to turn on the sound and keep this screen awake. Leave this page open at the counter.",
  startButton: "Start Live Board",
  live: "Live",
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  soundOn: "Sound on",
  soundOff: "Sound off",
  justArrived: "Just arrived",
  tablesNow: "Tables now",
  nobodyYet: "No check-ins yet today. When a customer verifies at a table, it shows here with a ding.",
  noTables: "No open tables right now.",
  waiting: (n: number) => (n === 1 ? "1 waiting for WhatsApp" : `${n} waiting for WhatsApp`),
  table: (code: string) => `Table ${code.replace(/^T/, "")}`,
  guest: "Guest",
  newCustomer: "New customer",
  visit: (n: number) => `${ordinal(n)} visit`,
  ago: (mins: number) => (mins < 1 ? "just now" : mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} h ago`),
  noteTitle: (name: string) => `Note for ${name}`,
  noteHelp: "Only food preferences, like “kam teekha” or “no onion”. Never personal details.",
  noteSave: "Save note",
  noteCancel: "Cancel",
  noteSaved: "Saved",
  noteRetry: "Couldn't save — retrying…",
  noteFailed: "Couldn't save. Check the internet and try again.",
  addNote: "Add note",
  noteAbout: (name: string) => `Note about ${name.split(" ")[0]}`,
  tapForSound: "🔊 Tap anywhere to turn on sound",
  editNote: "Edit note",
  notMember: "You're not part of a cafe yet. Ask your cafe owner to invite you.",
  closeVisit: "Close visit",
  closeTitle: (table: string) => `Close visit · ${table}`,
  billLabel: "Bill amount",
  billInvalid: "Enter the bill amount in rupees.",
  closeConfirm: "Close visit",
  alreadyClosed: "This visit is already closed.",
  actionFailed: "Couldn't save. Check the internet and try again.",
  cancel: "Cancel",
  save: "Save",
  nameTitle: "Customer's name",
  cardsSent: (n: number, table: string) =>
    n === 0 ? `${table} closed. No scratch card (bill below minimum or cards off).` : `${table} closed. ${n} scratch card${n === 1 ? "" : "s"} sent 🎁`,
  hasPrize: (label: string, until: string) => `🎟️ Has: ${label} (till ${until})`,
  redeem: "Redeem",
  redeemed: "Redeemed ✓",
  redeemSameVisit: "Can be used from the next visit",
  redeemFailed: (reason: string) => `Couldn't redeem: ${reason}`,
} as const;

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
