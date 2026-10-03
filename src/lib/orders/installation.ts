/**
 * True when any line was bought with standard installation — those orders
 * need the customer's virtual survey before installation can be booked.
 */
export function includesInstallation(items: { options?: unknown }[]): boolean {
  return items.some(
    (item) => (item.options as { installation?: string } | null | undefined)?.installation === "standard",
  );
}
