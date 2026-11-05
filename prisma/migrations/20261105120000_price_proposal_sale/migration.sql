-- Price review: proposals can also set, change or end a sale (price + compareAtPrice).
ALTER TABLE "PriceProposal" ADD COLUMN "currentCompareAt" DECIMAL(10,2),
ADD COLUMN "proposedSaleExVat" DECIMAL(10,2),
ADD COLUMN "proposedSalePrice" DECIMAL(10,2),
ADD COLUMN "includesSale" BOOLEAN NOT NULL DEFAULT false;
