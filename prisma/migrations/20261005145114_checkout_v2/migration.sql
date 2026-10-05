-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CheckoutDraft" (
    "id" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "userId" TEXT,
    "lines" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutDraft_stripeCheckoutSessionId_key" ON "CheckoutDraft"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "CheckoutDraft_createdAt_idx" ON "CheckoutDraft"("createdAt");
