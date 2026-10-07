import "server-only";

import type Stripe from "stripe";

import { stripe } from "@/lib/stripe/client";
import type { OrderWithItems } from "@/lib/orders/types";
import { formatCurrency } from "@/lib/currency";

/** UK standard rate. Catalogue prices and the delivery fee are VAT-inclusive. */
export const VAT_RATE = 0.2;

export type InvoiceLine = {
  description: string;
  detail: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  number: string;
  date: Date;
  orderReference: string;
  paymentMethod: string;
  billTo: string[];
  deliverTo: string[];
  lines: InvoiceLine[];
  deliveryFee: number;
  /** Gross (inc VAT) = net + vat. */
  net: number;
  vat: number;
  gross: number;
};

const round = (n: number) => Math.round(n * 100) / 100;

/** "ORD-914870" → "INV-914870" — one invoice per paid order, no extra column. */
export function invoiceNumber(reference: string): string {
  return reference.replace(/^ORD-/, "INV-");
}

/** "5m cable · Standard installation · SW1A 2AA" from an order line's options. */
export function lineDetail(options: unknown, unitPrice: number | null = null): string | null {
  if (!options || typeof options !== "object") return null;
  const o = options as { cableLength?: string; installation?: string; postcode?: string; installFee?: number };
  const parts: string[] = [];
  if (o.cableLength) parts.push(`${o.cableLength} cable`);
  if (o.installation === "standard" && typeof o.installFee === "number" && unitPrice != null) {
    // Charger and installation shown separately (per unit).
    parts.push(`Charger ${formatCurrency(unitPrice - o.installFee)} + standard installation ${formatCurrency(o.installFee)}`);
  } else if (o.installation) {
    parts.push(o.installation === "standard" ? "Standard installation" : "No installation");
  }
  if (o.installation === "standard" && o.postcode) parts.push(o.postcode);
  return parts.length ? parts.join(" · ") : null;
}

export function invoiceFor(order: OrderWithItems, paymentMethod: string): Invoice {
  const name = `${order.firstName} ${order.lastName}`.trim();
  const company = order.company ?? "";
  const deliverTo = [name, company, order.address, order.addressLine2 ?? "", order.city ?? "", order.postcode].filter(
    Boolean,
  );
  const billTo = order.billingSameAsDelivery
    ? deliverTo
    : [
        name,
        company,
        order.billingAddress ?? "",
        order.billingAddressLine2 ?? "",
        order.billingCity ?? "",
        order.billingPostcode ?? "",
      ].filter(Boolean);
  const lines = order.items.map((item) => ({
    description: item.name,
    detail: lineDetail(item.options, item.unitPrice),
    quantity: item.quantity,
    unitPrice: item.unitPrice ?? 0,
    total: round((item.unitPrice ?? 0) * item.quantity),
  }));
  const gross = order.total ?? round(order.subtotal + order.deliveryFee);
  // VAT-inclusive prices: VAT = gross × 20/120. Stripe's figure wins if it computed tax.
  const vat = order.taxAmount && order.taxAmount > 0 ? order.taxAmount : round((gross * VAT_RATE) / (1 + VAT_RATE));
  return {
    number: invoiceNumber(order.reference),
    date: order.createdAt,
    orderReference: order.reference,
    paymentMethod,
    billTo,
    deliverTo,
    lines,
    deliveryFee: order.deliveryFee,
    net: round(gross - vat),
    vat,
    gross,
  };
}

const WALLET_LABEL: Record<string, string> = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  link: "Link",
  samsung_pay: "Samsung Pay",
};

const METHOD_LABEL: Record<string, string> = {
  paypal: "PayPal",
  amazon_pay: "Amazon Pay",
  klarna: "Klarna",
  revolut_pay: "Revolut Pay",
  link: "Link",
};

function brand(b: string | null | undefined): string {
  if (!b) return "Card";
  if (b === "amex") return "American Express";
  return b.charAt(0).toUpperCase() + b.slice(1);
}

/** "Visa •••• 4242", "Apple Pay (Visa •••• 4242)", "PayPal" … Never throws. */
export async function paymentMethodLabel(paymentIntentId: string | null): Promise<string> {
  const fallback = "Card / online payment";
  if (!paymentIntentId) return fallback;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
    const details = (intent.latest_charge as Stripe.Charge | null)?.payment_method_details;
    if (!details) return fallback;
    if (details.type === "card" && details.card) {
      const card = `${brand(details.card.brand)} •••• ${details.card.last4}`;
      const wallet = details.card.wallet?.type;
      return wallet ? `${WALLET_LABEL[wallet] ?? brand(wallet)} (${card})` : card;
    }
    return METHOD_LABEL[details.type] ?? brand(details.type.replace(/_/g, " "));
  } catch {
    return fallback;
  }
}
