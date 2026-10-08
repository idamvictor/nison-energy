// Delivery pricing — one rule for the checkout summary (client) and the
// Stripe session / Order (server). Amounts are GBP inc VAT.
// Policy: DPD Tracked Delivery, free on orders of £120 or more, £11.99 under.

export const DELIVERY_FEE = 11.99;
export const FREE_DELIVERY_THRESHOLD = 120;

/** "£120" — for promos ("Free delivery over £120"). */
export const FREE_DELIVERY_FROM = `£${FREE_DELIVERY_THRESHOLD.toLocaleString("en-GB")}`;

/** £11.99 DPD tracked delivery under £120 (items total inc VAT), free from £120. */
export function deliveryFeeFor(itemsTotal: number): number {
  return itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export const DELIVERY_LABEL = "DPD Tracked Delivery";
/** Dispatched in 1–3 working days, then 1–2 days with DPD. */
export const DELIVERY_ESTIMATE = "Dispatched in 1–3 working days";
