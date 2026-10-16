// A product is on sale when it has a "was" price (compareAtPrice) above its
// price. Shared by the product cards and the product-page price block.

export type Sale = { was: number; off: number };

export function saleOf(price: number, compareAtPrice: number | null | undefined): Sale | null {
  if (compareAtPrice == null || !(compareAtPrice > price)) return null;
  return { was: compareAtPrice, off: Math.round((compareAtPrice - price) * 100) / 100 };
}

const whole = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const pence = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** "£43 off" / "£43.50 off". */
export function formatOff(amount: number): string {
  return `${Number.isInteger(amount) ? whole.format(amount) : pence.format(amount)} off`;
}
