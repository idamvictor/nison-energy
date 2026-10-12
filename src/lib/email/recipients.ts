import "server-only";

import { prisma } from "@/lib/db";
import { COMPANY } from "@/lib/company";
import { rolesWith } from "@/lib/auth/permissions";

async function emailsForRoles(roles: string[]): Promise<string[]> {
  const users = await prisma.user.findMany({
    // banned is nullable — `not: true` alone would also skip NULL rows.
    where: { role: { in: roles }, OR: [{ banned: false }, { banned: null }] },
    select: { email: true },
  });
  return users.map((u) => u.email.toLowerCase()).filter(Boolean);
}

/** Emails that receive staff lead/order/quote alerts: the whole team + STAFF_NOTIFICATION_EMAIL. */
export async function getStaffEmails(): Promise<string[]> {
  const extra = (process.env.STAFF_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const deduped = [...new Set([...(await emailsForRoles(rolesWith("alerts.staff"))), ...extra])];
  return deduped.length > 0 ? deduped : [COMPANY.email];
}

/** Price-review alerts — the Super admin only (nobody else can see the price list). */
export async function getSuperAdminEmails(): Promise<string[]> {
  const emails = await emailsForRoles(rolesWith("alerts.pricing"));
  return emails.length > 0 ? emails : [COMPANY.email];
}
