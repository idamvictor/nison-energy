-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('Residential', 'Commercial', 'Accessory');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "cardImage" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "variantGroup" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "spec" TEXT,
    "connectionType" TEXT,
    "cableLength" TEXT,
    "powerOutput" TEXT,
    "price" INTEGER,
    "cableLengthOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatibleTariffs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "style" TEXT,
    "phase" TEXT,
    "lengthOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tagline" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specs" JSONB,
    "warranty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_category_active_sortOrder_idx" ON "Product"("category", "active", "sortOrder");

-- CreateIndex
CREATE INDEX "Product_variantGroup_idx" ON "Product"("variantGroup");
