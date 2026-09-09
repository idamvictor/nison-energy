import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

// Reads/writes a real database, so never statically cache this route.
export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(leads);
}

type LeadPayload = {
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  email?: unknown;
  areaOfEnquiry?: unknown;
  reasonForEnquiry?: unknown;
  jobTitle?: unknown;
  companyName?: unknown;
  postcode?: unknown;
  additionalInformation?: unknown;
  paidServicePlans?: unknown;
  futureCommunications?: unknown;
};

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "areaOfEnquiry",
  "reasonForEnquiry",
] as const;

function asBool(value: unknown): boolean {
  return value === true || value === "Yes" || value === "yes";
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter(
    (field) => typeof body[field] !== "string" || !(body[field] as string).trim(),
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    );
  }

  const lead = await prisma.lead.create({
    data: {
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email).trim(),
      areaOfEnquiry: String(body.areaOfEnquiry).trim(),
      reasonForEnquiry: String(body.reasonForEnquiry).trim(),
      jobTitle: typeof body.jobTitle === "string" ? body.jobTitle.trim() || null : null,
      companyName:
        typeof body.companyName === "string" ? body.companyName.trim() || null : null,
      postcode: typeof body.postcode === "string" ? body.postcode.trim() || null : null,
      additionalInformation:
        typeof body.additionalInformation === "string"
          ? body.additionalInformation.trim() || null
          : null,
      paidServicePlans: asBool(body.paidServicePlans),
      futureCommunications: asBool(body.futureCommunications),
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
