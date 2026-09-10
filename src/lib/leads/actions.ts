"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createLead } from "@/lib/leads/queries";
import {
  grantStatuses,
  installationStages,
  leadStatuses,
  type EnquiryFormState,
  type GrantStatus,
  type InstallationInput,
  type InstallationStage,
  type LeadActionResult,
  type LeadStatus,
} from "@/lib/leads/types";

// ─── Public enquiry form (contact-us) ──────────────────────────────────────

export async function submitEnquiry(
  _prev: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  // Honeypot — bots fill hidden fields. Pretend it worked, store nothing.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { status: "success" };
  }

  const result = await createLead({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    jobTitle: formData.get("jobTitle"),
    companyName: formData.get("companyName"),
    postcode: formData.get("postcode"),
    areaOfEnquiry: formData.get("areaOfEnquiry"),
    reasonForEnquiry: formData.get("reasonForEnquiry"),
    additionalInformation: formData.get("additionalInformation"),
    futureCommunications: formData.get("futureCommunications"),
  });

  if (!result.ok) {
    return {
      status: "error",
      errors: result.errors,
      message: "Please check the highlighted fields.",
    };
  }

  return { status: "success" };
}

// ─── Admin CRM mutations ───────────────────────────────────────────────────

function revalidateLead(id: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  revalidatePath("/account/inbox");
}

export async function updateLeadStatus(
  id: string,
  status: string,
): Promise<LeadActionResult> {
  await requireAdmin();
  if (!leadStatuses.includes(status as LeadStatus)) {
    return { ok: false, error: "Unknown status." };
  }
  await prisma.lead.update({ where: { id }, data: { status: status as LeadStatus } });
  revalidateLead(id);
  return { ok: true };
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function updateLeadInstallation(
  id: string,
  input: InstallationInput,
): Promise<LeadActionResult> {
  await requireAdmin();

  const stage = input.stage;
  if (!installationStages.includes(stage as InstallationStage)) {
    return { ok: false, error: "Unknown installation stage." };
  }
  const grantStatus = input.grantStatus?.trim() || null;
  if (grantStatus && !grantStatuses.includes(grantStatus as GrantStatus)) {
    return { ok: false, error: "Unknown grant status." };
  }

  await prisma.lead.update({
    where: { id },
    data: {
      installStage: stage,
      grantStatus,
      surveyDate: parseDate(input.surveyDate),
      installDate: parseDate(input.installDate),
      engineer: input.engineer?.trim() || null,
    },
  });
  revalidateLead(id);
  return { ok: true };
}
