import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import type { ProductCategory } from "@/lib/catalog/types";
import type {
  PriceRow,
  ProposalRow,
  ReviewWindow,
  SubmissionDetail,
  SubmissionSummary,
} from "@/lib/pricing-review/types";

const num = (d: { toString(): string } | null | undefined) => (d == null ? null : Number(d));
const categoryOrder: ProductCategory[] = ["Residential", "Commercial", "Accessory", "Solar"];

/** Every product (active and inactive), grouped by category then shop order. */
export const getPriceList = cache(async (): Promise<PriceRow[]> => {
  const rows = await prisma.product.findMany({
    select: { id: true, category: true, name: true, sku: true, active: true, price: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows
    .map((r) => ({ ...r, price: num(r.price) }))
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category));
});

/** Whether /price-review is open. No row yet = closed. */
export async function getReviewWindow(): Promise<ReviewWindow> {
  const row = await prisma.priceReviewWindow.findUnique({ where: { id: "default" } });
  return {
    open: row?.open ?? false,
    openedAt: row?.openedAt?.toISOString() ?? null,
    closedAt: row?.closedAt?.toISOString() ?? null,
  };
}

export async function getPendingSubmissions(): Promise<SubmissionSummary[]> {
  const rows = await prisma.priceReviewSubmission.findMany({
    where: { status: "Pending" },
    orderBy: { submittedAt: "desc" },
    include: { _count: { select: { proposals: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    reviewerName: r.reviewerName,
    note: r.note,
    submittedAt: r.submittedAt.toISOString(),
    changes: r._count.proposals,
  }));
}

export async function getPendingPriceReviewCount(): Promise<number> {
  return prisma.priceReviewSubmission.count({ where: { status: "Pending" } });
}

export async function getSubmission(id: string): Promise<SubmissionDetail | null> {
  const r = await prisma.priceReviewSubmission.findUnique({
    where: { id },
    include: {
      proposals: {
        include: { product: { select: { name: true, category: true, sku: true, price: true } } },
      },
    },
  });
  if (!r) return null;
  const proposals: ProposalRow[] = r.proposals
    .map((p) => ({
      id: p.id,
      productId: p.productId,
      name: p.product.name,
      category: p.product.category,
      sku: p.product.sku,
      currentPrice: num(p.currentPrice),
      livePrice: num(p.product.price),
      proposedExVat: Number(p.proposedExVat),
      proposedPrice: Number(p.proposedPrice),
      status: p.status,
    }))
    .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.name.localeCompare(b.name));
  return {
    id: r.id,
    reviewerName: r.reviewerName,
    note: r.note,
    submittedAt: r.submittedAt.toISOString(),
    changes: proposals.length,
    status: r.status,
    proposals,
  };
}
