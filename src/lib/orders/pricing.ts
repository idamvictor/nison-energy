import "server-only";

import { prisma } from "@/lib/db";
import { CHECKOUT_EXTRA_PRODUCT_IDS } from "@/lib/orders/extras";
import { deliveryFeeFor } from "@/lib/orders/delivery";
import type { OrderLineInput } from "@/lib/orders/types";

/** A cart line priced from the database — the only prices ever charged. */
export type PricedLine = {
  productId: string;
  category: OrderLineInput["category"];
  name: string;
  /** GBP inc VAT per unit (product price + install fee); null = quote on request. */
  unitPrice: number | null;
  quantity: number;
  options?: OrderLineInput["options"];
};

export type PricedCart = {
  lines: PricedLine[];
  /** Items total of the priced lines (GBP inc VAT). */
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** True when any line has no fixed price (can't be paid online). */
  hasQuoteOnly: boolean;
};

const MAX_QUANTITY = 20;
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Re-prices a client cart from the database. Prices, names and availability
 * come from Product rows — never from what the browser sent — so a tampered
 * cart can't change what's charged.
 */
export async function priceCart(
  input: OrderLineInput[],
): Promise<{ ok: true; cart: PricedCart } | { ok: false; error: string }> {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "Your cart is empty." };

  for (const line of input) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_QUANTITY) {
      return { ok: false, error: `Please choose a quantity between 1 and ${MAX_QUANTITY}.` };
    }
  }

  const ids = [...new Set(input.map((l) => l.productId))];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, price: true, installFee: true, active: true },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const extraIds = new Set<string>(CHECKOUT_EXTRA_PRODUCT_IDS);

  const lines: PricedLine[] = [];
  for (const line of input) {
    const row = byId.get(line.productId);
    if (!row || !row.active) {
      return { ok: false, error: `“${line.name}” is no longer available — please remove it from your cart.` };
    }
    // The old fake "extra" lines are gone; extras are real accessories, and
    // only the ones offered at checkout may be added as extras.
    if (line.category === "extra" && !extraIds.has(line.productId)) {
      return { ok: false, error: "One of the extras is no longer available." };
    }
    const base = row.price == null ? null : Number(row.price);
    const withInstall =
      base != null && line.options?.installation === "standard"
        ? base + Number(row.installFee ?? 0)
        : base;
    lines.push({
      productId: row.id,
      category: line.category === "extra" ? "accessories" : line.category,
      name: row.name,
      unitPrice: withInstall == null ? null : round2(withInstall),
      quantity: line.quantity,
      // Keep the installation fee alongside the price so summaries, emails and
      // the invoice can show charger and installation separately.
      options:
        base != null && line.options?.installation === "standard"
          ? { ...line.options, installFee: round2(Number(row.installFee ?? 0)) }
          : line.options,
    });
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.quantity, 0));
  const deliveryFee = deliveryFeeFor(subtotal);
  return {
    ok: true,
    cart: {
      lines,
      subtotal,
      deliveryFee,
      total: round2(subtotal + deliveryFee),
      hasQuoteOnly: lines.some((l) => l.unitPrice == null),
    },
  };
}
