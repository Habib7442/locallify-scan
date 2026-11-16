// WhatsApp reply copy (service messages inside the 24 h window).
// Every cafe-specific message names the cafe (AGENTS.md §9).

const tableName = (code: string) => `Table ${code.replace(/^T/, "")}`;

export const wa = {
  verified: (cafe: string, name: string | null, table: string) =>
    `${cafe}: Welcome${name ? `, ${name}` : ""}! ✓ You're checked in at ${tableName(table)}. Go back to the page to see your rewards.`,
  already: (cafe: string, table: string) => `${cafe}: You're already checked in at ${tableName(table)} ✓`,
  expired: "That code has expired. Please scan the QR code on your table again.",
  help: "Hi! 👋 To get rewards, scan the QR code on your table and tap “Verify on WhatsApp”.",
  stopped: "You won't get any more offers from Dobara cafes. Your rewards still work.",
  deleteConfirm: "Reply DELETE YES within 10 minutes to erase your data from all Dobara cafes.",
  deleted: "Your data has been deleted from all Dobara cafes.",
  deleteNothing: "We don't have any data saved for this number.",
} as const;
