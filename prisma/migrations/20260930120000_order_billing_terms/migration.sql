-- Checkout: town/city, separate billing address, terms-of-sale acceptance.
ALTER TABLE "Order" ADD COLUMN "city" TEXT,
ADD COLUMN "billingSameAsDelivery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "billingAddress" TEXT,
ADD COLUMN "billingCity" TEXT,
ADD COLUMN "billingPostcode" TEXT,
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
