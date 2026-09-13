import "server-only";

import { prisma } from "@/lib/db";
import { COMPANY } from "@/lib/company";

/** Emails that should receive staff lead/order alerts. */
export async function getStaffEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { email: true },
  });

  const extra = (process.env.STAFF_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const all = [...admins.map((a) => a.email), ...extra]
    .map((e) => e.toLowerCase())
    .filter(Boolean);

  const deduped = [...new Set(all)];
  return deduped.length > 0 ? deduped : [COMPANY.email];
}
