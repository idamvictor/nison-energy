// Quote-document types + option lists — safe to import from client components.
// Persisted shape is `QuoteDocument` in prisma/schema.prisma; src/lib/quotes/queries.ts
// maps a DB row to `QuoteDocumentView` below.

export type QuoteScheme = "Renters" | "ResidentialLandlords" | "WorkplaceChargingScheme";

export const quoteSchemes: QuoteScheme[] = [
  "Renters",
  "ResidentialLandlords",
  "WorkplaceChargingScheme",
];

export const quoteSchemeLabels: Record<QuoteScheme, string> = {
  Renters: "Renters & flat owners",
  ResidentialLandlords: "Residential landlords",
  WorkplaceChargingScheme: "Workplace charging scheme",
};

// Renters is self-serve (no review needed); the other two go through admin review.
export const schemesRequiringReview: QuoteScheme[] = [
  "ResidentialLandlords",
  "WorkplaceChargingScheme",
];

export type QuoteStatus = "Pending" | "Approved" | "Rejected";

export const quoteStatuses: QuoteStatus[] = ["Pending", "Approved", "Rejected"];

export type QuoteDocumentView = {
  id: string;
  scheme: QuoteScheme;
  status: QuoteStatus;
  reference: string;
  fileName: string;
  rejectionReason: string | null;
  createdAt: string; // ISO
  reviewedAt: string | null; // ISO
};

// Admin list/detail view — adds who it's for.
export type AdminQuoteRow = QuoteDocumentView & {
  userId: string;
  userName: string;
  userEmail: string;
  input: Record<string, unknown>;
};

export type QuoteActionResult = { ok: true } | { ok: false; error: string };
