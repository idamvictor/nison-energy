"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-dal";
import {
  grantStatuses,
  installationStages,
  leadStatuses,
  type GrantStatus,
  type InstallationStage,
  type LeadStatus,
} from "@/lib/admin-leads";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateLead(id: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
  revalidatePath("/account/inbox");
}

export async function updateLeadStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!leadStatuses.includes(status as LeadStatus)) {
    return { ok: false, error: "Unknown status." };
  }
  await prisma.lead.update({ where: { id }, data: { status: status as LeadStatus } });
  revalidateLead(id);
  return { ok: true };
}

export type InstallationInput = {
  stage: string;
  grantStatus?: string;
  surveyDate?: string;
  installDate?: string;
  engineer?: string;
};

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function updateLeadInstallation(
  id: string,
  input: InstallationInput,
): Promise<ActionResult> {
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
