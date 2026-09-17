"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import type { NotificationActionResult } from "@/lib/notifications/types";
import { CACHE_TAGS } from "@/lib/cache/tags";

function revalidate() {
  revalidatePath("/account/inbox");
  revalidatePath("/account");
  revalidateTag(CACHE_TAGS.notifications, { expire: 0 });
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
