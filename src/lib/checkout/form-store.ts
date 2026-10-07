import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * What the customer has typed at checkout, kept in their own browser so a
 * reload or a trip back to the cart doesn't wipe it. `undefined` = not typed
 * yet (so signed-in account details can still prefill). Card details (inside
 * Stripe's frame) and the terms tickbox are never stored. Cleared after an
 * order is placed and on sign-out; dropped after 7 days.
 */
export type CheckoutFormFields = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  postcode?: string;
  city?: string;
  /** The customer typed their own town — the postcode lookup mustn't overwrite it. */
  cityTyped?: boolean;
  address?: string;
  addressLine2?: string;
  billingSame?: boolean;
  billingPostcode?: string;
  billingCity?: string;
  billingCityTyped?: boolean;
  billingAddress?: string;
  billingAddressLine2?: string;
  extraIds?: string[];
};

type CheckoutFormState = CheckoutFormFields & {
  savedAt?: number;
  set: (fields: CheckoutFormFields) => void;
  clear: () => void;
};

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const EMPTY: Record<keyof CheckoutFormFields | "savedAt", undefined> = {
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  phone: undefined,
  company: undefined,
  postcode: undefined,
  city: undefined,
  cityTyped: undefined,
  address: undefined,
  addressLine2: undefined,
  billingSame: undefined,
  billingPostcode: undefined,
  billingCity: undefined,
  billingCityTyped: undefined,
  billingAddress: undefined,
  billingAddressLine2: undefined,
  extraIds: undefined,
  savedAt: undefined,
};

export const useCheckoutForm = create<CheckoutFormState>()(
  persist(
    (set) => ({
      set: (fields) => set({ ...fields, savedAt: Date.now() }),
      clear: () => set(EMPTY),
    }),
    {
      name: "ocunio-checkout-form",
      version: 1,
      skipHydration: true,
      // Only the typed fields — never the set/clear functions.
      partialize: (state) =>
        Object.fromEntries(Object.entries(state).filter(([, value]) => typeof value !== "function")) as CheckoutFormFields & {
          savedAt?: number;
        },
      onRehydrateStorage: () => (state) => {
        if (state?.savedAt && Date.now() - state.savedAt > MAX_AGE_MS) state.clear();
      },
    },
  ),
);
