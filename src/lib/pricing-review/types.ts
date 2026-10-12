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
};

/** One product on the price list (admin + the client review page). */
export type PriceRow = {
  id: string;
  category: ProductCategory;
  name: string;
  sku: string | null;
  active: boolean;
  /** Inc VAT; null = price on request. */
  price: number | null;
};

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
  proposedExVat: number;
  proposedPrice: number;
  status: "Pending" | "Approved" | "Rejected";
};

export type SubmissionDetail = SubmissionSummary & {
  status: "Pending" | "Done";
  proposals: ProposalRow[];
};

export type PriceChange = { productId: string; exVat: number };

export type PriceReviewResult = { ok: true; count: number } | { ok: false; error: string };
export type AdminActionResult = { ok: true } | { ok: false; error: string };
