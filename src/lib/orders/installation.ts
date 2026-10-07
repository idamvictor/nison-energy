/**
 * True when any line was bought with standard installation — those orders
 * need the customer's virtual survey before installation can be booked.
 */
export function includesInstallation(items: { options?: unknown }[]): boolean {
  return items.some(
    (item) => (item.options as { installation?: string } | null | undefined)?.installation === "standard",
  );
}

/**
 * Splits a line into charger and installation amounts (line totals, × qty)
 * when its price includes a known installation fee. `install` is 0 otherwise.
 */
export function installSplit(
  unitPrice: number | null,
  quantity: number,
  options?: unknown,
  /** Fee looked up from the DB, for lines saved without one. */
  fallbackFee?: number,
): { product: number; install: number } {
  const o = options as { installation?: string; installFee?: number } | null | undefined;
  const known = typeof o?.installFee === "number" ? o.installFee : fallbackFee;
  const fee = o?.installation === "standard" && typeof known === "number" ? known : 0;
  if (unitPrice == null) return { product: 0, install: 0 };
  const round = (n: number) => Math.round(n * 100) / 100;
  return { product: round((unitPrice - fee) * quantity), install: round(fee * quantity) };
}
