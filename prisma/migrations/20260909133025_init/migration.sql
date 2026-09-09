-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('New', 'Contacted', 'Quoted', 'Won', 'Lost');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jobTitle" TEXT,
    "companyName" TEXT,
    "postcode" TEXT,
    "areaOfEnquiry" TEXT NOT NULL,
    "reasonForEnquiry" TEXT NOT NULL,
    "paidServicePlans" BOOLEAN NOT NULL DEFAULT false,
    "futureCommunications" BOOLEAN NOT NULL DEFAULT false,
    "additionalInformation" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'New',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "installStage" TEXT,
    "surveyDate" TIMESTAMP(3),
    "grantStatus" TEXT,
    "installDate" TIMESTAMP(3),
    "engineer" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_submittedAt_idx" ON "Lead"("submittedAt");
