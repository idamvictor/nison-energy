import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationKind = "order" | "grant";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  description?: string;
  createdAt: string;
  read: boolean;
};

type NotificationsState = {
  items: NotificationItem[];
  push: (kind: NotificationKind, title: string, description?: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

// The account Inbox's live feed — pushed to at real event sources only
// (checkout completion, grant-application status transitions), same
// persisted-Zustand shape as useCart/useGrantApplication.
export const useNotifications = create<NotificationsState>()(
  persist(
    (set) => ({
      items: [],
      push: (kind, title, description) =>
        set((state) => ({
          items: [
            {
              id: crypto.randomUUID(),
              kind,
              title,
              description,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.items,
          ],
        })),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, read: true })),
        })),
    }),
    {
      name: "nison-notifications",
      skipHydration: true,
    }
  )
);
