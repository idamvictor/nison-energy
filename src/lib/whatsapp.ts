import { COMPANY } from "@/lib/company";

// Client-safe helpers for "chat with us on WhatsApp" links (wa.me click-to-chat).

export const DEFAULT_WHATSAPP_MESSAGE = `Hi ${COMPANY.tradingName} 👋 I'd like some help with an EV charger.`;

/** wa.me link that opens a chat with us, with `message` pre-filled. */
export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled message naming the page the customer is on, so the team has context. */
export function contextualMessage(pageTitle?: string): string {
  const page = pageTitle?.split("|")[0].trim();
  return page
    ? `Hi ${COMPANY.tradingName} 👋 I'm looking at "${page}" on your website and have a question:`
    : DEFAULT_WHATSAPP_MESSAGE;
}
