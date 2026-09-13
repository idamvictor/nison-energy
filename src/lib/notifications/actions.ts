"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import type { NotificationActionResult } from "@/lib/notifications/types";

function revalidate() {
  revalidatePath("/account/inbox");
  revalidatePath("/account");
}

export async function markNotificationRead(
  id: string,
): Promise<NotificationActionResult> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidate();
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidate();
  return { ok: true };
}
