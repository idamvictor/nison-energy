// In-app notification view types — safe to import from client components.
// Persisted shape is `Notification` in prisma/schema.prisma.

export type NotificationKind = "order" | "enquiry" | "system";

export type NotificationView = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string; // ISO
};

export type NotificationActionResult =
  | { ok: true }
  | { ok: false; error: string };
