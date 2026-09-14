"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { createLead } from "@/lib/leads/queries";
import { createNotification } from "@/lib/notifications/queries";
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

// ─── On-street parking grant intake (renters guide, "warn" outcome) ───────

function field(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

export async function submitOnStreetParkingIntake(
  formData: FormData,
): Promise<LeadActionResult> {
  const landlordName = field(formData, "landlordName");
  const landlordContact = field(formData, "landlordContact");
  const permissionLabel: Record<string, string> = {
    yes: "Yes, in hand",
    progress: "In progress",
    not_started: "Not started",
    na: "Not applicable",
  };

  const notes = [
    `Tenure: ${field(formData, "tenure") || "—"}`,
    `Third-party permission needed: ${landlordName || landlordContact ? "Yes" : "Not stated"}`,
    landlordName && `Landlord/freeholder/agent: ${landlordName}`,
    landlordContact && `Their contact details: ${landlordContact}`,
    `Written permission status: ${permissionLabel[field(formData, "permissionStatus")] ?? "Not applicable"}`,
    `On-street parking location: ${field(formData, "parkingLocation") || "—"}`,
    `Confirms no private off-street parking: Yes`,
    `Vehicle: ${field(formData, "vehicleModel") || "—"}${field(formData, "vehicleReg") ? ` (${field(formData, "vehicleReg")})` : ""}`,
    `Vehicle held as: ${field(formData, "vehicleOwnership") || "—"}`,
    field(formData, "deliveryDate") && `Expected delivery date: ${field(formData, "deliveryDate")}`,
    `Local highways authority: ${field(formData, "lhaName") || "—"}`,
    `LHA consent status: ${field(formData, "lhaStatus") || "—"}`,
    field(formData, "lhaReference") && `LHA consent reference: ${field(formData, "lhaReference")}`,
    field(formData, "notes") && `Additional notes: ${field(formData, "notes")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await createLead({
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    phone: field(formData, "phone"),
    email: field(formData, "email"),
    areaOfEnquiry: "On-street parking grant",
    reasonForEnquiry: "On-street parking grant intake",
    additionalInformation: notes,
    futureCommunications: true,
  });

  if (!result.ok) {
    const firstError = Object.values(result.errors)[0];
    return { ok: false, error: firstError ?? "Please check the form and try again." };
  }
  return { ok: true };
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
  const lead = await prisma.lead.update({
    where: { id },
    data: { status: status as LeadStatus },
  });
  if (status !== "New") {
    await createNotification({
      userId: lead.userId,
      kind: "enquiry",
      title: `Your enquiry is now ${status}`,
      body: `Enquiry about ${lead.areaOfEnquiry}.`,
      href: "/account/inbox",
    });
  }
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

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      installStage: stage,
      grantStatus,
      surveyDate: parseDate(input.surveyDate),
      installDate: parseDate(input.installDate),
      engineer: input.engineer?.trim() || null,
    },
  });
  await createNotification({
    userId: lead.userId,
    kind: "enquiry",
    title: `Installation update — ${stage}`,
    body: grantStatus ? `OZEV grant: ${grantStatus}` : undefined,
    href: "/account/inbox",
  });
  revalidateLead(id);
  return { ok: true };
}
