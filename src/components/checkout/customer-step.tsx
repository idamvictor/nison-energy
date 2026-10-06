"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { withRedirect } from "@/lib/auth/redirect";
import { useCheckoutForm } from "@/lib/checkout/form-store";

const TILE = "flex flex-col gap-1 rounded-lg border px-5 py-4 text-left";

/**
 * Guest or sign in, as two tiles side by side. Guests pay straight away (no
 * account needed); signing in fills the form from the account and links the order.
 */
export function CustomerStep({ signedInEmail }: { signedInEmail: string | null }) {
  const router = useRouter();
  const [signingOut, startSignOut] = useTransition();

  if (signedInEmail) {
    return (
      <div className={`${TILE} border-2 border-accent`}>
        <p className="font-heading text-base font-semibold text-foreground">Signed in</p>
        <p className="text-sm text-muted-foreground">
          Checking out as <span className="font-medium text-foreground">{signedInEmail}</span> ·{" "}
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
            className="font-medium text-primary-ink underline underline-offset-2 hover:text-foreground disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : "Not you? Sign out"}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className={`${TILE} border-2 border-accent`} aria-current="true">
        <p className="font-heading text-base font-semibold text-foreground">Guest checkout</p>
        <p className="text-sm text-muted-foreground">Enter your details below to continue without an account.</p>
      </div>
      <Link
        href={withRedirect("/sign-in", "/checkout")}
        className={`${TILE} border-foreground/15 transition-colors hover:border-foreground/35 hover:bg-secondary/50`}
      >
        <p className="font-heading text-base font-semibold text-foreground">Already have an account?</p>
        <p className="text-sm text-muted-foreground">Sign in to use your saved details and check out faster.</p>
      </Link>
    </div>
  );
}
