import { formatCurrency } from "@/lib/currency";

/**
 * Standard installation price before the current sale, inc VAT. Shown struck
 * through next to any lower installation fee and advertised in the trust bar.
 * The fee actually charged is each product's `installFee` (set by
 * scripts/installation-sale.ts). Set to null when the sale ends.
 */
export const INSTALL_WAS_PRICE: number | null = 540;

/** The sale's installation price, inc VAT — for the trust-bar advert. */
export const INSTALL_SALE_PRICE = 499;

/** The "was" price to show next to `fee`, or null when it isn't discounted. */
export function installWas(fee: number | null | undefined): number | null {
  if (INSTALL_WAS_PRICE == null || !fee || fee <= 0 || fee >= INSTALL_WAS_PRICE) return null;
  return INSTALL_WAS_PRICE;
}

/** Whole pounds without pence, e.g. "£499". */
export function wholePounds(amount: number): string {
  return formatCurrency(amount).replace(/\.00$/, "");
}
