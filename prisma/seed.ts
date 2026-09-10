import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { sampleLeads } from "./seed-leads";
import { sampleProducts } from "./seed-products";
import { samplePosts } from "./seed-posts";
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
  const leads = await prisma.lead.createMany({
    data: sampleLeads.map(toLeadCreate),
    skipDuplicates: true,
  });
  console.log(`Seeded ${leads.count} lead(s).`);

  const products = await prisma.product.createMany({
    data: sampleProducts,
    skipDuplicates: true,
  });
  console.log(`Seeded ${products.count} product(s).`);

  const posts = await prisma.post.createMany({
    data: samplePosts,
    skipDuplicates: true,
  });
  console.log(`Seeded ${posts.count} post(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
