import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import type {
  AdminLead,
  GrantStatus,
  InstallationStage,
  LeadStatus,
} from "@/lib/leads/types";
import type { Lead } from "@/generated/prisma/client";

// ─── DB row → UI shape ──────────────────────────────────────────────────────

function isoDateOnly(date: Date | null): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

export function dbLeadToAdminLead(row: Lead): AdminLead {
  const installation = row.installStage
    ? {
        stage: row.installStage as InstallationStage,
        surveyDate: isoDateOnly(row.surveyDate),
        grantStatus: (row.grantStatus as GrantStatus | null) ?? undefined,
        installDate: isoDateOnly(row.installDate),
        engineer: row.engineer ?? undefined,
      }
    : undefined;

  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    email: row.email,
    jobTitle: row.jobTitle ?? undefined,
    companyName: row.companyName ?? undefined,
    postcode: row.postcode ?? undefined,
    areaOfEnquiry: row.areaOfEnquiry,
    reasonForEnquiry: row.reasonForEnquiry,
    paidServicePlans: row.paidServicePlans ? "Yes" : "No",
    futureCommunications: row.futureCommunications ? "Yes" : "No",
    additionalInformation: row.additionalInformation ?? undefined,
    status: row.status as LeadStatus,
    submittedAt: row.submittedAt.toISOString(),
    installation,
  };
}

// ─── Reads ──────────────────────────────────────────────────────────────────

export const getLeads = cache(async (): Promise<AdminLead[]> => {
  const rows = await prisma.lead.findMany({
    orderBy: { submittedAt: "desc" },
    take: 500,
  });
  return rows.map(dbLeadToAdminLead);
});

export const getLead = cache(async (id: string): Promise<AdminLead | null> => {
  const row = await prisma.lead.findUnique({ where: { id } });
  return row ? dbLeadToAdminLead(row) : null;
});

export const getLeadsForUser = cache(
  async (userId: string, email: string): Promise<AdminLead[]> => {
    const rows = await prisma.lead.findMany({
      where: { OR: [{ userId }, { email }] },
      orderBy: { submittedAt: "desc" },
    });
    return rows.map(dbLeadToAdminLead);
  },
);

export const getNewLeadCount = cache(() =>
  prisma.lead.count({ where: { status: "New" } }),
);

// ─── Create (shared by the contact-form action and POST /api/leads) ──────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateLeadInput = {
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

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string> };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === "Yes" || value === "yes";
}

export async function createLead(
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const firstName = str(input.firstName);
  const lastName = str(input.lastName);
  const phone = str(input.phone);
  const email = str(input.email);
  const areaOfEnquiry = str(input.areaOfEnquiry);
  const reasonForEnquiry = str(input.reasonForEnquiry);

  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "Enter your first name.";
  if (!lastName) errors.lastName = "Enter your last name.";
  if (!phone) errors.phone = "Enter a phone number.";
  if (!email) errors.email = "Enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!areaOfEnquiry) errors.areaOfEnquiry = "Select an area of enquiry.";
  if (!reasonForEnquiry) errors.reasonForEnquiry = "Select a reason for enquiry.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const user = await getCurrentUser();

  const lead = await prisma.lead.create({
    data: {
      firstName,
      lastName,
      phone,
      email,
      areaOfEnquiry,
      reasonForEnquiry,
      jobTitle: str(input.jobTitle) || null,
      companyName: str(input.companyName) || null,
      postcode: str(input.postcode) || null,
      additionalInformation: str(input.additionalInformation) || null,
      paidServicePlans: bool(input.paidServicePlans),
      futureCommunications: bool(input.futureCommunications),
      userId: user?.id ?? null,
    },
    select: { id: true },
  });

  return { ok: true, id: lead.id };
}
