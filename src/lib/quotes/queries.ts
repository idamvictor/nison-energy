import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import type { QuoteDocument as QuoteDocumentRow } from "@/generated/prisma/client";
import type { AdminQuoteRow, QuoteDocumentView } from "@/lib/quotes/types";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { CACHE_TTL } from "@/lib/cache/config";

function toView(row: QuoteDocumentRow): QuoteDocumentView {
  return {
    id: row.id,
    scheme: row.scheme,
    status: row.status,
    reference: row.reference,
    fileName: row.fileName,
    rejectionReason: row.rejectionReason ?? null,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  };
}

export const getQuotesForUser = cache(
  async (userId: string): Promise<QuoteDocumentView[]> => {
    const rows = await prisma.quoteDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toView);
  },
);

export const getQuote = cache(async (id: string): Promise<AdminQuoteRow | null> => {
  const row = await prisma.quoteDocument.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!row) return null;
  return {
    ...toView(row),
    userId: row.userId,
    userName: row.user.name,
    userEmail: row.user.email,
    input: row.input as Record<string, unknown>,
  };
});

export const getAllQuotes = cache(
  async (opts?: { status?: "Pending" | "Approved" | "Rejected" }): Promise<AdminQuoteRow[]> => {
    const rows = await prisma.quoteDocument.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
    return rows.map((row) => ({
      ...toView(row),
      userId: row.userId,
      userName: row.user.name,
      userEmail: row.user.email,
      input: row.input as Record<string, unknown>,
    }));
  },
);

export const getPendingQuoteCount = cache(
  unstable_cache(
    async () => prisma.quoteDocument.count({ where: { status: "Pending" } }),
    ["quotes-pending-count"],
    { tags: [CACHE_TAGS.quotes], revalidate: CACHE_TTL.adminMetrics },
  ),
);
