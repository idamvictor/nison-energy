-- Admin ▸ Email templates: saved edits to customer email wording.
CREATE TABLE "EmailTemplate" (
    "key" TEXT NOT NULL,
    "fields" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("key")
);
