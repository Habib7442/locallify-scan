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
  editNote: "Edit note",
  notMember: "You're not part of a cafe yet. Ask your cafe owner to invite you.",
} as const;

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}
