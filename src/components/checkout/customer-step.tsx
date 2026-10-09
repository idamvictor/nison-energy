"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { useCheckoutForm } from "@/lib/checkout/form-store";

/**
 * Guest or sign in, as two tiles. Guest is the default (no account needed);
 * signing in fills the form from the account and links the order to it.
 */
export function GuestOrSignIn({ guest, onGuest }: { guest: boolean; onGuest: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        aria-pressed={guest}
        onClick={onGuest}
        className={
          guest
            ? "rounded-[12px] border-2 border-white bg-white/10 px-3.5 py-3 text-left"
            : "rounded-[12px] border border-white/25 px-3.5 py-3 text-left transition-colors hover:border-white/60 hover:bg-white/5"
        }
      >
        <p className="text-sm font-medium text-white">Continue as guest</p>
        <p className="mt-0.5 text-xs text-white/65">No account needed</p>
      </button>
      <Link
        href={withRedirect("/sign-in", "/checkout")}
        className="rounded-[12px] border border-white/25 px-3.5 py-3 transition-colors hover:border-white/60 hover:bg-white/5"
      >
        <p className="text-sm font-medium text-white">Sign in</p>
        <p className="mt-0.5 text-xs text-white/65">Use your saved details</p>
      </Link>
    </div>
  );
}

/**
 * Signed-in customer: avatar initial, email and a ⋮ menu with "Sign out"
 * (which also forgets the saved checkout details on this device).
 */
export function AccountRow({ email }: { email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1a2a35] text-[15px] text-white uppercase">
        {email.charAt(0)}
      </span>
      <span className="flex-1 truncate text-sm text-white">{email}</span>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="More actions for this account"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex size-7 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
        >
          <MoreVertical className="size-4" />
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-[10px] bg-white py-1 shadow-lg ring-1 ring-black/10">
            <button
              type="button"
              disabled={signingOut}
              onClick={() =>
                startSignOut(async () => {
                  await authClient.signOut();
                  useCheckoutForm.getState().clear();
                  router.refresh();
                })
              }
              className="w-full px-3 py-2 text-left text-sm text-black hover:bg-black/5 disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
