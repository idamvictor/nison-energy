import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GrantApplicationStatus = "waiting" | "approved" | "rejected";

export type GrantApplicationRecord = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postcode: string;
  chargerId: string;
  hasApplied: boolean;
  status: GrantApplicationStatus | null;
  authCode: string;
  rejectionReason: string;
  notes: string;
  updatedAt: string;
};

type GrantApplicationState = {
  record: GrantApplicationRecord | null;
  save: (record: Omit<GrantApplicationRecord, "updatedAt">) => void;
  clear: () => void;
};

// Lets a signed-in visitor create, then come back and edit, a single record
// of where they're at with their OZEV application — same persisted-Zustand
// shape as useCart/useWishlist/useAuth so it survives a reload.
export const useGrantApplication = create<GrantApplicationState>()(
  persist(
    (set) => ({
      record: null,
      save: (record) =>
        set({ record: { ...record, updatedAt: new Date().toISOString() } }),
      clear: () => set({ record: null }),
    }),
    {
      name: "nison-grant-application",
      skipHydration: true,
    }
  )
);
