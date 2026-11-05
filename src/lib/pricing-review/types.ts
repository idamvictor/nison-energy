// Client price review — view types and VAT helpers, safe for client components.
// Product.price is stored inc VAT; the client proposes ex-VAT prices and the
// inc-VAT price is always derived (× 1.2, penny-rounded).

import type { ProductCategory } from "@/lib/catalog/types";

export const VAT_MULTIPLIER = 1.2;
export const MAX_PRICE = 100_000;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Inc-VAT price for an ex-VAT price. */
export const incVatOf = (exVat: number) => round2(exVat * VAT_MULTIPLIER);
/** Ex-VAT price for a stored (inc-VAT) price. */
export const exVatOf = (incVat: number) => round2(incVat / VAT_MULTIPLIER);

export const categoryLabels: Record<ProductCategory, string> = {
  Residential: "Residential chargers",
  Commercial: "Commercial chargers",
  Accessory: "Accessories",
  Solar: "Solar panels",
  CircuitProtection: "Circuit protectors",
  Cable: "Cables",
};

/** One product on the price list (admin + the client review page). */
export type PriceRow = {
  id: string;
  category: ProductCategory;
  name: string;
  sku: string | null;
  active: boolean;
  /** Inc VAT; null = price on request. On sale, this is the sale price. */
  price: number | null;
  /** Inc VAT "was" price; a sale when it's above `price`. */
  compareAtPrice: number | null;
};

/** The normal (non-sale) inc-VAT price: the "was" price when on sale. */
export function regularOf(row: Pick<PriceRow, "price" | "compareAtPrice">): number | null {
  if (row.price != null && row.compareAtPrice != null && row.compareAtPrice > row.price) return row.compareAtPrice;
  return row.price;
}

/** The current inc-VAT sale price, or null when not on sale. */
export function saleOfRow(row: Pick<PriceRow, "price" | "compareAtPrice">): number | null {
  if (row.price != null && row.compareAtPrice != null && row.compareAtPrice > row.price) return row.price;
  return null;
}

/** Final state of a product once a change is applied. */
export type ResolvedChange = {
  regularEx: number;
  regularInc: number;
  saleEx: number | null;
  saleInc: number | null;
  /** True when the regular or sale price differs from today's. */
  changed: boolean;
};

/**
 * Work out the final regular + sale price for a proposed change.
 * `exVat` omitted = keep the regular price; `saleExVat` omitted = keep the
 * current sale, null = end it. The sale must be below the regular price.
 */
export function resolveChange(
  row: Pick<PriceRow, "price" | "compareAtPrice">,
  change: Pick<PriceChange, "exVat" | "saleExVat">,
): ResolvedChange | { error: string } {
  const currentRegular = regularOf(row);
  const currentSale = saleOfRow(row);

  let regularEx: number;
  if (change.exVat != null) regularEx = change.exVat;
  else if (currentRegular != null) regularEx = exVatOf(currentRegular);
  else return { error: "Add a normal price before setting a sale price." };
  const regularInc = change.exVat != null ? incVatOf(regularEx) : (currentRegular as number);

  let saleEx: number | null;
  let saleInc: number | null;
  if (change.saleExVat === undefined) {
    saleInc = currentSale;
    saleEx = currentSale == null ? null : exVatOf(currentSale);
  } else if (change.saleExVat === null) {
    saleEx = saleInc = null;
  } else {
    saleEx = change.saleExVat;
    saleInc = incVatOf(saleEx);
  }
  if (saleInc != null && saleInc >= regularInc) return { error: "The sale price must be lower than the normal price." };

  const same = (a: number | null, b: number | null) => (a == null ? b == null : b != null && Math.abs(a - b) < 0.005);
  const changed = !same(regularInc, currentRegular) || !same(saleInc, currentSale);
  return { regularEx, regularInc, saleEx, saleInc, changed };
}

export type ReviewWindow = { open: boolean; openedAt: string | null; closedAt: string | null };

export type SubmissionSummary = {
  id: string;
  reviewerName: string;
  note: string | null;
  submittedAt: string;
  changes: number;
};

export type ProposalRow = {
  id: string;
  productId: string;
  name: string;
  category: ProductCategory;
  sku: string | null;
  /** Inc VAT when the client submitted. */
  currentPrice: number | null;
  /** Inc VAT right now — differs from currentPrice if edited in admin since. */
  livePrice: number | null;
  /** Inc VAT "was" price when the client submitted / right now. */
  currentCompareAt: number | null;
  liveCompareAt: number | null;
  /** New regular price. */
  proposedExVat: number;
  proposedPrice: number;
  /** New sale price (inc/ex VAT); null = no sale. Only meaningful when includesSale. */
  proposedSaleExVat: number | null;
  proposedSalePrice: number | null;
  includesSale: boolean;
  status: "Pending" | "Approved" | "Rejected";
};

export type SubmissionDetail = SubmissionSummary & {
  status: "Pending" | "Done";
  proposals: ProposalRow[];
};

/** exVat = new regular ex-VAT price (omit to keep); saleExVat = new sale ex-VAT price (omit to keep, null to end). */
export type PriceChange = { productId: string; exVat?: number; saleExVat?: number | null };

export type PriceReviewResult = { ok: true; count: number } | { ok: false; error: string };
export type AdminActionResult = { ok: true } | { ok: false; error: string };
