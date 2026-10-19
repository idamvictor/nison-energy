// Delivery pricing — one rule for the checkout summary (client) and the
// Stripe session / Order (server). Amounts are GBP inc VAT.
// Policy: Tracked Delivery (1–3 days), free on orders of £120 or more, £11.99 under.
// Any order with a solar kit goes by pallet instead: a flat £40 per order.

export const DELIVERY_FEE = 11.99;
export const FREE_DELIVERY_THRESHOLD = 120;
export const PALLET_DELIVERY_FEE = 40;

/** "£120" — for promos ("Free delivery over £120"). */
export const FREE_DELIVERY_FROM = `£${FREE_DELIVERY_THRESHOLD.toLocaleString("en-GB")}`;

/**
 * £11.99 tracked delivery under £120 (items total inc VAT), free from
 * £120 — or a flat £40 pallet delivery when the order contains a solar kit.
 */
export function deliveryFeeFor(itemsTotal: number, pallet = false): number {
  if (pallet) return PALLET_DELIVERY_FEE;
  return itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export const DELIVERY_LABEL = "Tracked Delivery";
/** Chargers and accessories: 1 to 3 days. */
export const DELIVERY_ESTIMATE = "Estimated delivery 1 to 3 days";

export const PALLET_DELIVERY_LABEL = "Specialist Delivery";
/** From the delivery policy: plug-in solar may take 5 to 7 days via specialist delivery. */
export const PALLET_DELIVERY_ESTIMATE = "Estimated delivery 5 to 7 days";

/** The delivery name for an order (solar kits ship by pallet). */
export function deliveryLabelFor(pallet: boolean): string {
  return pallet ? PALLET_DELIVERY_LABEL : DELIVERY_LABEL;
}

/** True when any line is a solar kit — those orders ship by pallet. */
export function needsPallet(lines: { category?: string | null }[]): boolean {
  return lines.some((l) => l.category === "solar");
}
