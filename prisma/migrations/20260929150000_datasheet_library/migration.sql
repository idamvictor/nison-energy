-- Datasheet library: per-file metadata (dedupe hash, original name, size)
-- plus a staging table for chunked uploads.
ALTER TABLE "DatasheetFile" ADD COLUMN "sha256" TEXT;
ALTER TABLE "DatasheetFile" ADD COLUMN "fileName" TEXT;
ALTER TABLE "DatasheetFile" ADD COLUMN "size" INTEGER;

-- Backfill existing rows.
UPDATE "DatasheetFile" SET "size" = octet_length("bytes");
UPDATE "DatasheetFile"
SET "sha256" = encode(sha256("bytes"), 'hex'),
    "fileName" = regexp_replace("key", '^.*/', '')
WHERE "key" LIKE '%.pdf';

CREATE UNIQUE INDEX "DatasheetFile_sha256_key" ON "DatasheetFile"("sha256");

CREATE TABLE "DatasheetUploadPart" (
    "uploadId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasheetUploadPart_pkey" PRIMARY KEY ("uploadId","index")
);

CREATE INDEX "DatasheetUploadPart_createdAt_idx" ON "DatasheetUploadPart"("createdAt");
