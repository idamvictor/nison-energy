// A product is on sale when it has a "was" price (compareAtPrice) above its
// price. Shared by the product cards and the product-page price block.

export type Sale = { was: number; off: number };

export function saleOf(price: number, compareAtPrice: number | null | undefined): Sale | null {
  if (compareAtPrice == null || !(compareAtPrice > price)) return null;
  return { was: compareAtPrice, off: Math.round((compareAtPrice - price) * 100) / 100 };
}

/** "16% off" — the saving as a whole percent of the "was" price (never below 1%). */
export function formatPercentOff(was: number, price: number): string {
  const percent = Math.max(1, Math.round(((was - price) / was) * 100));
  return `${percent}% off`;
}
