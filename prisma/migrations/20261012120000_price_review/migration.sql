-- Client price review (/price-review): open/closed window, submissions, proposals.
CREATE TYPE "PriceReviewStatus" AS ENUM ('Pending', 'Done');
CREATE TYPE "PriceProposalStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE "PriceReviewWindow" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "open" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    CONSTRAINT "PriceReviewWindow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PriceReviewSubmission" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "note" TEXT,
    "status" "PriceReviewStatus" NOT NULL DEFAULT 'Pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    CONSTRAINT "PriceReviewSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PriceProposal" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "currentPrice" DECIMAL(10,2),
    "proposedExVat" DECIMAL(10,2) NOT NULL,
    "proposedPrice" DECIMAL(10,2) NOT NULL,
    "status" "PriceProposalStatus" NOT NULL DEFAULT 'Pending',
    "decidedAt" TIMESTAMP(3),
    CONSTRAINT "PriceProposal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PriceReviewSubmission_status_submittedAt_idx" ON "PriceReviewSubmission"("status", "submittedAt");
CREATE INDEX "PriceProposal_submissionId_idx" ON "PriceProposal"("submissionId");
CREATE INDEX "PriceProposal_productId_idx" ON "PriceProposal"("productId");

ALTER TABLE "PriceProposal" ADD CONSTRAINT "PriceProposal_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "PriceReviewSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PriceProposal" ADD CONSTRAINT "PriceProposal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
