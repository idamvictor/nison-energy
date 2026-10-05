// Delivery pricing — one rule for the checkout summary (client) and the
// Stripe session / Order (server). Amounts are GBP inc VAT.

export const DELIVERY_FEE = 10;
export const FREE_DELIVERY_THRESHOLD = 1000;

/** £10 standard UK delivery under £1,000 (items total inc VAT), free from £1,000. */
export function deliveryFeeFor(itemsTotal: number): number {
  return itemsTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export const DELIVERY_LABEL = "Standard UK delivery (1–3 working days)";
