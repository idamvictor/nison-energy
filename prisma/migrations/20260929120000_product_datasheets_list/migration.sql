-- Product: single `datasheet` → ordered `datasheets` list. Copies the existing
-- value across before dropping the old column, so no datasheet is lost.
ALTER TABLE "Product" ADD COLUMN "datasheets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Product" SET "datasheets" = ARRAY["datasheet"] WHERE "datasheet" IS NOT NULL;

ALTER TABLE "Product" DROP COLUMN "datasheet";
