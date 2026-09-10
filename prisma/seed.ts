import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { sampleLeads } from "./seed-leads";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toLeadCreate(lead: (typeof sampleLeads)[number]): Prisma.LeadCreateManyInput {
  return {
    id: lead.id,
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phone,
    email: lead.email,
    jobTitle: lead.jobTitle ?? null,
    companyName: lead.companyName ?? null,
    postcode: lead.postcode ?? null,
    areaOfEnquiry: lead.areaOfEnquiry,
    reasonForEnquiry: lead.reasonForEnquiry,
    paidServicePlans: lead.paidServicePlans === "Yes",
    futureCommunications: lead.futureCommunications === "Yes",
    additionalInformation: lead.additionalInformation ?? null,
    status: lead.status,
    submittedAt: new Date(lead.submittedAt),
    installStage: lead.installation?.stage ?? null,
    surveyDate: lead.installation?.surveyDate
      ? new Date(lead.installation.surveyDate)
      : null,
    grantStatus: lead.installation?.grantStatus ?? null,
    installDate: lead.installation?.installDate
      ? new Date(lead.installation.installDate)
      : null,
    engineer: lead.installation?.engineer ?? null,
  };
}

async function main() {
  const data = sampleLeads.map(toLeadCreate);
  const result = await prisma.lead.createMany({ data, skipDuplicates: true });
  console.log(`Seeded ${result.count} lead(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
