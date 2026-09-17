import "server-only";

import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import type { Notification as NotificationRow } from "@/generated/prisma/client";
import type { NotificationKind, NotificationView } from "@/lib/notifications/types";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { CACHE_TTL } from "@/lib/cache/config";

export function dbToNotification(row: NotificationRow): NotificationView {
  return {
    id: row.id,
    kind: row.kind as NotificationKind,
    title: row.title,
    body: row.body,
    href: row.href,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  };
}

export const getNotificationsForUser = cache(
  async (userId: string): Promise<NotificationView[]> => {
    const rows = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(dbToNotification);
  },
);

export const getUnreadCount = cache(
  unstable_cache(
    (userId: string): Promise<number> =>
      prisma.notification.count({ where: { userId, readAt: null } }),
    ["notifications-unread-count"],
    { tags: [CACHE_TAGS.notifications], revalidate: CACHE_TTL.adminMetrics },
  ),
);

/**
 * Write a notification for a user. Plain helper (not a server action) called
 * from the leads / orders modules after their DB writes. No-ops without a userId
 * (guest enquiries / orders have nothing to attach to).
 */
export async function createNotification(input: {
  userId: string | null | undefined;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
}): Promise<void> {
  if (!input.userId) return;
  await prisma.notification.create({
    data: {
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
    },
  });
  revalidateTag(CACHE_TAGS.notifications, { expire: 0 });
}
