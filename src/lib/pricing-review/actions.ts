"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";

import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit/check";
import { getClientIp } from "@/lib/rate-limit/ip";
import { sendEmail } from "@/lib/email/client";
import { getSuperAdminEmails } from "@/lib/email/recipients";
import { staffPriceReviewSubmitted } from "@/lib/email/templates";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { categoryRoute, type ProductCategory } from "@/lib/catalog/types";
import {
  MAX_PRICE,
  resolveChange,
  type AdminActionResult,
  type PriceChange,
  type PriceReviewResult,
} from "@/lib/pricing-review/types";

const isPennies = (n: number) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6;

/** Open or close /price-review (closed = it redirects home). */
export async function setPriceReviewOpen(open: boolean): Promise<AdminActionResult> {
  await requirePermission("prices.manage");
  const now = new Date();
  await prisma.priceReviewWindow.upsert({
    where: { id: "default" },
    create: { id: "default", open, openedAt: open ? now : null, closedAt: open ? null : now },
    update: open ? { open, openedAt: now } : { open, closedAt: now },
  });
  revalidatePath("/admin/prices");
  revalidatePath("/price-review");
  return { ok: true };
}

/**
 * The client's "Submit for approval". Public (no login) — guarded by the
 * open/closed switch, a rate limit and a honeypot. Saves proposals only;
 * nothing on the site changes until an admin approves them.
 */
export async function submitPriceReview(input: {
  reviewerName: string;
  note?: string;
  changes: PriceChange[];
  website?: string;
}): Promise<PriceReviewResult> {
  if ((input.website ?? "").trim() !== "") return { ok: true, count: 0 }; // honeypot

  const window = await prisma.priceReviewWindow.findUnique({ where: { id: "default" } });
  if (!window?.open) return { ok: false, error: "Price review is closed." };

  const ip = await getClientIp();
  if (!(await checkRateLimit(`price-review:${ip}`, { limit: 10, windowMs: 60 * 60_000 }))) {
    return { ok: false, error: "Too many attempts — please try again later." };
  }

  const reviewerName = String(input.reviewerName ?? "").trim().slice(0, 120);
  const note = String(input.note ?? "").trim().slice(0, 2000) || null;
  if (!reviewerName) return { ok: false, error: "Please enter your name." };
  if (!Array.isArray(input.changes) || input.changes.length === 0) {
    return { ok: false, error: "There are no price changes to submit." };
  }
  if (input.changes.length > 1000) return { ok: false, error: "Too many changes in one submission." };

  const validAmount = (n: unknown) => {
    const v = Number(n);
    return Number.isFinite(v) && v > 0 && v <= MAX_PRICE && isPennies(v);
  };
  const cleaned: PriceChange[] = [];
  for (const c of input.changes) {
    if (typeof c?.productId !== "string") return { ok: false, error: "Invalid change." };
    const hasEx = c.exVat !== undefined && c.exVat !== null;
    const hasSale = c.saleExVat !== undefined;
    if (!hasEx && !hasSale) continue;
    if ((hasEx && !validAmount(c.exVat)) || (hasSale && c.saleExVat !== null && !validAmount(c.saleExVat))) {
      return { ok: false, error: "Each new price must be a positive amount in pounds and pence." };
    }
    cleaned.push({
      productId: c.productId,
      ...(hasEx ? { exVat: Number(c.exVat) } : {}),
      ...(hasSale ? { saleExVat: c.saleExVat === null ? null : Number(c.saleExVat) } : {}),
    });
  }

  const ids = [...new Set(cleaned.map((c) => c.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, price: true, compareAtPrice: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Last entry per product wins; skip anything that isn't actually a change.
  const latest = new Map(cleaned.map((c) => [c.productId, c]));
  const proposals = [];
  for (const [productId, change] of latest) {
    const product = byId.get(productId);
    if (!product) continue;
    const row = {
      price: product.price == null ? null : Number(product.price),
      compareAtPrice: product.compareAtPrice == null ? null : Number(product.compareAtPrice),
    };
    const resolved = resolveChange(row, change);
    if ("error" in resolved) return { ok: false, error: `${product.name}: ${resolved.error}` };
    if (!resolved.changed) continue;
    proposals.push({
      productId,
      currentPrice: row.price,
      currentCompareAt: row.compareAtPrice,
      proposedExVat: resolved.regularEx,
      proposedPrice: resolved.regularInc,
      proposedSaleExVat: resolved.saleEx,
      proposedSalePrice: resolved.saleInc,
      includesSale: true,
    });
  }
  if (proposals.length === 0) return { ok: false, error: "None of the prices changed." };

  const submission = await prisma.priceReviewSubmission.create({
    data: { reviewerName, note, proposals: { create: proposals } },
  });
  revalidatePath("/admin/prices");
  revalidatePath("/admin", "layout");

  after(async () => {
    const staff = await getSuperAdminEmails();
    await sendEmail({
      to: staff,
      ...staffPriceReviewSubmitted({
        submissionId: submission.id,
        reviewerName,
        changes: proposals.length,
        note,
      }),
    });
  });

  return { ok: true, count: proposals.length };
}

/**
 * Approve the ticked proposals (their prices go live) and reject the rest;
 * the submission is then done.
 */
export async function decidePriceSubmission(id: string, approveIds: string[]): Promise<AdminActionResult> {
  await requirePermission("prices.manage");
  const submission = await prisma.priceReviewSubmission.findUnique({
    where: { id },
    include: { proposals: { include: { product: { select: { category: true } } } } },
  });
  if (!submission) return { ok: false, error: "Submission not found." };
  if (submission.status !== "Pending") return { ok: false, error: "This submission has already been reviewed." };

  const approve = new Set(Array.isArray(approveIds) ? approveIds : []);
  const now = new Date();
  const touched = new Set<ProductCategory>();

  await prisma.$transaction([
    ...submission.proposals.flatMap((p) => {
      if (p.status !== "Pending") return [];
      if (approve.has(p.id)) {
        touched.add(p.product.category);
        // New-style rows set the whole price state: a sale = price + "was" price.
        const data = p.includesSale
          ? p.proposedSalePrice != null
            ? { price: p.proposedSalePrice, compareAtPrice: p.proposedPrice }
            : { price: p.proposedPrice, compareAtPrice: null }
          : { price: p.proposedPrice };
        return [
          prisma.product.update({ where: { id: p.productId }, data }),
          prisma.priceProposal.update({ where: { id: p.id }, data: { status: "Approved", decidedAt: now } }),
        ];
      }
      return [prisma.priceProposal.update({ where: { id: p.id }, data: { status: "Rejected", decidedAt: now } })];
    }),
    prisma.priceReviewSubmission.update({ where: { id }, data: { status: "Done", decidedAt: now } }),
  ]);

  // Show the new prices straight away (same paths the product editor refreshes).
  for (const category of touched) {
    revalidatePath(categoryRoute[category]);
    revalidatePath(`${categoryRoute[category]}/[slug]`, "page");
  }
  if (touched.size > 0) {
    revalidatePath("/");
    revalidateTag(CACHE_TAGS.products, { expire: 0 });
  }
  revalidatePath("/admin/prices");
  revalidatePath(`/admin/prices/submissions/${id}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
