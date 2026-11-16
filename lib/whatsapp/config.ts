import "server-only";

// WhatsApp Cloud API settings. Server-only: these are secrets (AGENTS.md §13).

export type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  appSecret: string;
  verifyToken: string;
  graphBase: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const version = process.env.WHATSAPP_GRAPH_VERSION || "v27.0";
  return {
    accessToken: required("WHATSAPP_ACCESS_TOKEN"),
    phoneNumberId: required("WHATSAPP_PHONE_NUMBER_ID"),
    appSecret: required("WHATSAPP_APP_SECRET"),
    verifyToken: required("WHATSAPP_VERIFY_TOKEN"),
    graphBase: `https://graph.facebook.com/${version}`,
  };
}

/** Last 4 digits only — never log full phone numbers (AGENTS.md §11). */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return "unknown";
  return `…${phone.slice(-4)}`;
}
