export const SITE_URL = "https://scan.locallifyagency.com";
// Platform name (QR codes, hosting). The product sold to restaurants is
// PRODUCT_NAME, always shown with "by Locallify" (see PRODUCT.md).
export const SITE_NAME = "Locallify Scan";
export const PRODUCT_NAME = "Dobara";

export const CONTACT_EMAIL = "hello@locallifyagency.com";
// Sales/demo WhatsApp — every "Book a demo" CTA opens a chat here.
export const CONTACT_WHATSAPP = "919707370886";
export const CONTACT_WHATSAPP_DISPLAY = "+91 9707370886";

export function whatsappLink(message: string) {
  return `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export const DEMO_WHATSAPP_URL = whatsappLink("Hi Dobara, I want a demo");

export const PILOT_WHATSAPP_URL = whatsappLink(
  "Hi Locallify 👋 I'd like to join the Dobara free pilot for my cafe/restaurant.",
);
