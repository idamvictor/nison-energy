-- CreateEnum
CREATE TYPE "QuoteScheme" AS ENUM ('Renters', 'ResidentialLandlords', 'WorkplaceChargingScheme');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "QuoteDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheme" "QuoteScheme" NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'Pending',
    "reference" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteDocument_userId_idx" ON "QuoteDocument"("userId");

-- CreateIndex
CREATE INDEX "QuoteDocument_status_idx" ON "QuoteDocument"("status");

-- AddForeignKey
ALTER TABLE "QuoteDocument" ADD CONSTRAINT "QuoteDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteDocument" ADD CONSTRAINT "QuoteDocument_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
