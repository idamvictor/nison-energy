import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  isSignedIn: boolean;
  signIn: () => void;
  signOut: () => void;
};

// There's no real auth in this app — this just tracks whether the header
// should show the "Get Started" CTA or the signed-in avatar, so the two
// states can actually be demonstrated. Signing in doesn't gate anything;
// /account stays reachable either way.
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isSignedIn: false,
      signIn: () => set({ isSignedIn: true }),
      signOut: () => set({ isSignedIn: false }),
    }),
    { name: "ocunio-auth", skipHydration: true }
  )
);
